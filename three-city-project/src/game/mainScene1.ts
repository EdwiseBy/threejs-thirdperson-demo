import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { Octree } from 'three/examples/jsm/math/Octree'
import { Capsule } from 'three/examples/jsm/math/Capsule';
import { OctreeHelper } from 'three/examples/jsm/helpers/OctreeHelper';
import { isInfinity } from "./utils";
import { loadGltf } from "./res/resLoad";
import { gameMgr } from "./manager/gameManager";
import { managerPool } from "./manager/managerPool";
import { Three } from "./module";
export class MainScene1 {
    frameId: number | null = null;
    scene!: THREE.Scene;
    camera!: THREE.PerspectiveCamera;
    cameraTargtQ!: THREE.Quaternion;
    renderer!: THREE.WebGLRenderer;
    ambientLight!: THREE.AmbientLight;
    roleCollider!: Capsule;
    playerOnFloor: boolean = false;
    model!: THREE.Group;
    skeleton!: THREE.SkeletonHelper;
    mixer!: THREE.AnimationMixer;
    allActions: THREE.AnimationAction[] = [];
    clock!: THREE.Clock;
    raycaster!: THREE.Raycaster;
    mouse!: THREE.Vector2;
    sceneObjects: THREE.Object3D[] = [];
    baseActions: any = {
        'idle': { weight: 1 },
        'walk': { weight: 0 },
        'run': { weight: 0 }
    }
    currentBaseAction: string = 'idle';
    controls!: OrbitControls;
    speedVector!: THREE.Vector3;
    speed!: THREE.Vector3;
    rotateSpeed: number = 12;
    dirLight!: THREE.DirectionalLight;
    lookAtObject!: THREE.Object3D;
    targetQuaternion!: THREE.Quaternion | null;
    targetPoint!: THREE.Vector3 | null;
    lastMovePoint!: THREE.Vector3;
    nextMovePoint!: THREE.Vector3;
    gravity: number = 20;
    acceleration: number = 0.01;
    maxSpeed: number = 0;
    minSpeed: number = 0;
    moveState: boolean = false;
    mouseDown: boolean = false;
    originDis: number = 0;
    stats!: Stats;

    map!: THREE.Group;

    worldOctree!: Octree;

    box!: THREE.Mesh;
    // imde
    constructor(container: any) {
        this.init(container);
    }

    async init(container: any) {
        //@ts-ignore
        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.top = '0px';
        container.appendChild(this.stats.domElement);
        // 第一步新建一个场景
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.speed = new THREE.Vector3(0, 0, 0);
        this.speedVector = new THREE.Vector3(0, -1, 0);
        this.lookAtObject = new THREE.Object3D();
        this.worldOctree = new Octree();
        this.setCamera();
        this.setRenderer(container);
        this.initOther();
        this.initScene();
        await this.initMap();
        await this.initRole();
        const mesh = new THREE.BoxGeometry(0.5, 2);
        const mater = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const box = new THREE.Mesh(mesh, mater);
        this.scene.add(box);
        this.box = box;
        this.box.visible = false;
        this.animate();
        document.addEventListener('mousedown', this.mouseMove, false);
        document.addEventListener('mousemove', this.mouseMove, false);
        document.addEventListener('mouseup', this.mouseUp, false);
        gameMgr?.addUpdateCall(this.updatePlayer.bind(this), this);
        gameMgr?.addUpdateCall(this.cameraTick.bind(this), this);
    }

    initOther() {
        const axes = new THREE.AxesHelper(10);
        this.scene?.add(axes)
    }

    initScene() {
        this.scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);
        const hemiLight = new THREE.HemisphereLight(0x7f7f7f, 0x7f7f7f);
        hemiLight.position.set(0, 20, 0);
        this.scene.add(hemiLight);
        const dirLight = new THREE.DirectionalLight(0x7f7f7f);
        dirLight.position.set(- 5, 25, - 1);
        dirLight.castShadow = true;
        dirLight.shadow.camera.near = 0.01;
        dirLight.shadow.camera.far = 2000;
        dirLight.shadow.camera.right = 3;
        dirLight.shadow.camera.left = - 3;
        dirLight.shadow.camera.top = 3;
        dirLight.shadow.camera.bottom = - 3;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        this.dirLight = dirLight;
        this.scene.add(dirLight);

        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshPhongMaterial({ color: 0x66ccff, depthWrite: false }));
        mesh.rotation.x = - Math.PI / 2;
        mesh.position.y = -10
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        this.sceneObjects.push(mesh);
    }

    async initMap() {
        // const gltf = await loadGltf('https://yun.duiba.com.cn/db_games/activity/Edwise/Checkerboard.glb');
        // loader.load('https://yun.duiba.com.cn/db_games/activity/Edwise/map.glb', (gltf) => {
        const gltf = await loadGltf('https://yun.duiba.com.cn/db_games/activity/Edwise/three-city-project/dev/collision-world.glb')
        this.map = gltf.scene;
        this.map.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
                obj.receiveShadow = true;
                if (obj.material && obj.material.map) {
                    obj.material.map.anisotropy = 4;
                }
            }
        })
        // this.map.scale.set(1.7, 1.7, 1.7)
        this.map.scale.set(1.5, 0.8, 1.5);
        this.scene.add(this.map);
        this.worldOctree.fromGraphNode(gltf.scene);
        const helper = new OctreeHelper(this.worldOctree, 0xd0ef5b);
        helper.visible = false;
        this.scene.add(helper);
    }

    async initRole() {
        const gltf = await loadGltf('https://yun.duiba.com.cn/db_games/activity/Edwise/Xbot.glb')
        console.info(gltf);
        const animations = gltf.animations;
        this.model = gltf.scene;
        const box = new THREE.Box3().expandByObject(gltf.scene);
        this.scene.add(new THREE.Box3Helper(box, new THREE.Color(255, 0, 0)));
        this.roleCollider = new Capsule(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 2, 0), 0.25);
        this.roleCollider.translate(new THREE.Vector3(0, 2, 0))
        this.scene.add(this.model);
        this.model.traverse((obj) => {
            if (obj.isObject3D) obj.castShadow = true;
        });
        this.skeleton = new THREE.SkeletonHelper(this.model);
        this.skeleton.visible = false;
        this.scene.add(this.skeleton);
        this.mixer = new THREE.AnimationMixer(this.model);
        let numAnimtions = animations.length;
        for (let i = 0; i < numAnimtions; i++) {
            let clip = animations[i];
            const name = clip.name;

            if (this.baseActions[`${name}`]) {
                // console.info(name)
                const action = this.mixer.clipAction(clip);
                this.activateAction(action);
                this.baseActions[name].action = action;
                this.allActions.push(action);
            }
        }
        this.dirLight.target = this.model;
    }
    mouseUp = (event: any) => {
        this.mouseDown = false;
        this.maxSpeed = 0;
        this.minSpeed = 0;
        this.moveState = false;
        this.targetPoint = null;
        this.targetQuaternion = null;
    }
    mouseMove = (event: any) => {
        event.preventDefault();
        if (event.type === 'mousedown') {
            this.mouseDown = true;
        }
        if (event.type === 'mousemove' && !this.mouseDown) return;
        this.mouse.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
    }

    update() {
        if (!this.mouseDown) return;
        // 射线检测
        this.raycaster.setFromCamera(this.mouse, this.camera);
        var intersects = this.raycaster.intersectObjects(this.sceneObjects);
        if (intersects.length > 0) {
            var intersect = intersects[0];
            const targetPoint = intersect.point;
            this.targetPoint = targetPoint;
            const speedVector = new THREE.Vector3(targetPoint.x - this.model.position.x, -1, targetPoint.z - this.model.position.z).normalize();
            // 计算目标四元数
            this.lookAtObject.position.set(this.model.position.x, -10, this.model.position.z);
            this.lookAtObject.rotation.copy(this.model.rotation.clone());
            this.lookAtObject.quaternion.copy(this.model.quaternion.clone());
            this.lookAtObject.lookAt(targetPoint);
            const targetQuaternion = this.lookAtObject.quaternion.clone();
            this.speedVector.copy(speedVector);
            this.targetQuaternion = targetQuaternion;
            const dis = this.model.position.distanceTo(targetPoint);
            //根据距离设置最大最小速度
            if (dis <= 0.1) {
                this.maxSpeed = 0;
                this.minSpeed = 0;
            }
            if (dis > 0.1 && dis <= 1.6) {
                this.maxSpeed = 0.04;
                this.minSpeed = 0.04;
            }
            if (dis > 1.6) {
                this.maxSpeed = 0.06;
                this.minSpeed = 0.06;
            }
        }
    }

    playerCollsion() {
        // return
        const result = this.worldOctree.capsuleIntersect(this.roleCollider);
        this.playerOnFloor = false;
        if (result) {
            this.playerOnFloor = result.normal.y >= 0;

            if (!this.playerOnFloor) {
                this.speedVector.addScaledVector(result.normal, - result.normal.dot(this.speedVector));
            }
            const deltaPostion = result.normal.multiplyScalar(result.depth);
            this.roleCollider.translate(deltaPostion);
        }
        if (this.playerOnFloor) this.speed.y = 0;
    }
    logtime = 0;
    updatePlayer(delta: number) {
        // 记录上一帧数值
        this.lastMovePoint = this.model.position.clone();
        if (this.model && this.targetQuaternion) {
            if (!this.model.quaternion.equals(this.targetQuaternion)) {
                const step = this.rotateSpeed * delta;
                this.model.quaternion.rotateTowards(this.targetQuaternion, step);
            }
        }
        let speed = this.speed.x;
        // 变速运动，前期先这么写，后面要封装成characterMoveComponent
        if (this.moveState) {
            if (speed < this.maxSpeed) speed += this.acceleration;
            if (speed >= this.maxSpeed) {
                const diffSpeed = speed - this.maxSpeed;
                if (diffSpeed >= this.acceleration) {
                    speed -= this.acceleration;
                }
            }
        } else {
            if (speed > 0) {
                speed -= this.acceleration;
            }
        }
        if (speed <= this.minSpeed) {
            this.speed.set(this.minSpeed, 0, this.minSpeed);
        } else if (this.speed.x >= this.maxSpeed) {
            this.speed.set(this.maxSpeed, 0, this.maxSpeed);
        }
        if (!this.playerOnFloor) {
            this.speed.y += this.gravity * delta;
        }
        // 向model的position添加
        const deltaPostion = new THREE.Vector3(this.speed.x * this.speedVector.x, this.speed.y * this.speedVector.y, this.speed.z * this.speedVector.z)
        this.roleCollider.translate(deltaPostion);
        this.animMachine();
        this.playerCollsion();
        this.model.position.set(this.roleCollider.start.x, this.roleCollider.start.y - 0.25, this.roleCollider.start.z);
        this.nextMovePoint = this.model.position.clone();
        this.logtime++;
    }
    // 动画机，很简单，后面也要封装成一个animStateMachine,考虑向ue看齐，curState->nextState链表保存
    animMachine() {
        if (this.speed.x > 0 && this.speed.x < 0.06 && this.currentBaseAction !== 'walk') {
            this.prepareCrossFade(this.baseActions[`${this.currentBaseAction}`].action, this.baseActions['walk'].action, 0.3);
        }
        if (this.speed.x <= 0 && this.currentBaseAction !== 'idle') {
            this.prepareCrossFade(this.baseActions[`${this.currentBaseAction}`].action, this.baseActions['idle'].action, 0.3);
        }
        if (this.speed.x >= 0.06 && this.currentBaseAction !== 'run') {
            this.prepareCrossFade(this.baseActions[`${this.currentBaseAction}`].action, this.baseActions['run'].action, 0.3);
        }
    }

    /** 设置时间缩放，可以用来改变动画速率 */
    modifyTimeScale(speed: number) {
        this.mixer.timeScale = speed;
    }

    /** 准备进入动画混合，先设置一下当前的action */
    prepareCrossFade(startAction: THREE.AnimationAction, endAction: THREE.AnimationAction, duration: number) {
        console.info('进入动画混合', startAction.getClip().name, endAction.getClip().name)
        const clip = endAction.getClip();
        this.currentBaseAction = clip.name;
        this.executeCrossFade(startAction, endAction, duration);

    }

    /** 动画混合，两段动画片段根据时间过度，设置权重先 */
    executeCrossFade(startAction: THREE.AnimationAction, endAction: THREE.AnimationAction, duration: number) {
        this.setWeight(endAction, 1);
        endAction.time = 0;
        if (startAction) {
            startAction.crossFadeTo(endAction, duration, true);
        } else {
            endAction.fadeIn(duration);
        }
    }

    /** 目前的相机跟随，这里采用的是计算轴对称图形，达到相机位置的相对变化，
     * 再使用lookAt指向玩家模型
     */
    cameraTick() {
        if (this.nextMovePoint && this.lastMovePoint && !this.nextMovePoint.equals(this.lastMovePoint)) {
            const playerOriginP = new THREE.Vector3(this.lastMovePoint.x, 0, this.lastMovePoint.z);
            const playerTargetP = new THREE.Vector3(this.nextMovePoint.x, 0, this.nextMovePoint.z);
            const cameraOriginP = new THREE.Vector3(this.camera.position.x, 0, this.camera.position.z);
            let cameraTargetP = new THREE.Vector3();
            /** 玩家两点连线的斜率 */
            const kp = (playerOriginP.z - playerTargetP.z) / (playerOriginP.x - playerTargetP.x);
            /** 玩家起始点与相机起始点连线的斜率 */
            const kopc = (cameraOriginP.z - playerOriginP.z) / (cameraOriginP.x - playerOriginP.x);
            // 如果运动在一条直线，直接加
            if ((kp === kopc) || (isInfinity(kp) && isInfinity(kopc))) {
                cameraTargetP.set(cameraOriginP.x, 0, cameraOriginP.z).add(new THREE.Vector3(this.speed.x * this.speedVector.x, 0, this.speed.z * this.speedVector.z));
            } else {
                let cameraCenterP = new THREE.Vector3();
                /** 直线1是玩家目标点与摄像机起始点的直线方程 */
                let k1 = (playerTargetP.z - cameraOriginP.z) / (playerTargetP.x - cameraOriginP.x);
                /** 直线2是直线1的垂直平分线 */
                let centerP = new THREE.Vector3((playerTargetP.x + cameraOriginP.x) / 2, 0, (playerTargetP.z + cameraOriginP.z) / 2);
                let k2 = isInfinity(k1) ? 0 : k1 === 0 ? Infinity : 1 / k1 * -1;
                let b2: number | null = centerP.z - k2 * centerP.x;
                if (isInfinity(k2)) b2 = null;
                /** 直线3是平行于直线1的玩家起始点与相机目标点的连线 */
                let k3 = k1;
                let b3: number | null = playerOriginP.z - k3 * playerOriginP.x;
                if (isInfinity(k3)) b3 = null;
                if (b2 == null && b3 != null) {
                    cameraCenterP.set(centerP.x, 0, playerOriginP.z);
                }
                else if (b3 == null && b2 != null) {
                    cameraCenterP.set(playerOriginP.x, 0, centerP.z);
                }
                else if (b3 != null && b2 != null) {
                    // 求直线3与直线2的交点，其实就是中点，再根据中点算出摄像机目标点
                    let crossP = new THREE.Vector3();
                    crossP.x = (b3 - b2) / (k2 - k3);
                    crossP.z = k3 * crossP.x + b3;
                    cameraCenterP.set(crossP.x, 0, crossP.z);
                }
                cameraTargetP.set(2 * cameraCenterP.x - playerOriginP.x, 0, (2 * cameraCenterP.z - playerOriginP.z));
            }
            this.camera.position.set(cameraTargetP.x, this.model.position.y + 4, cameraTargetP.z);
        }
        this.camera.lookAt(this.model.position.clone().add(new Three.Vector3(0, 2, 0)))
    }
    activateAction(action: any) {
        const clip = action.getClip();
        const settings = this.baseActions[clip.name]
        this.setWeight(action, settings.weight);
        action.play();
    }
    setWeight(action: THREE.AnimationAction, weight: number) {
        action.enabled = true;
        action.setEffectiveTimeScale(1);
        action.setEffectiveWeight(weight);
    }
    // 新建透视相机
    setCamera(): void {
        // 第二参数就是 长度和宽度比 默认采用浏览器  返回以像素为单位的窗口的内部宽度和高度
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        // 初始化个位置
        this.camera.position.z = -4;
        this.camera.position.y = 4;
    }

    // 设置渲染器
    setRenderer(container: any): void {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        // 设置画布的大小
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0xffffff);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.shadowMap.enabled = true;
        //这里 其实就是canvas 画布  renderer.domElement
        container.appendChild(this.renderer.domElement);
    }

    // 设置环境光
    setLight(): void {
        if (this.scene) {
            this.ambientLight = new THREE.AmbientLight(0xffffff); // 环境光
            this.scene.add(this.ambientLight);
        }
    }

    // 渲染
    render(): void {
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    // 动画
    animate(time?: any): void {
        // if (this.mesh) {
        this.frameId = requestAnimationFrame(this.animate.bind(this));
        const clockDelta = this.clock.getDelta();
        const deltaTime = Math.min(0.05, clockDelta);

        // // 为了防止速度原因使碰撞失效，这里使用循环分片来进行更新
        // // 后面看性能在修改
        // for (let i = 0; i < 5; i++) {
        //     this.updatePlayer(deltaTime);
        //     this.cameraTick();
        // }
        // 1,
        this.update();
        gameMgr?.updateCall.forEach((itm) => {
            itm.fun.call(itm.obj, deltaTime, clockDelta)
        })
        this.mixer.update(clockDelta)
        this.stats.update();
        this.render();
    }

    destroy() {
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
        managerPool?.destory();
    }
}