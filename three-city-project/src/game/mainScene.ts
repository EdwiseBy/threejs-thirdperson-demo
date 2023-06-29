import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { Capsule } from 'three/examples/jsm/math/Capsule';
import { loadGltf } from "./res/resLoad";
import { gameMgr } from "./manager/gameManager";
import { managerPool } from "./manager/managerPool";
import { RoleCharacter } from "./actor/character/roleCharacter";
import { Three } from "./module";
import { AutoFollowCamera } from "./camera/autoFollowCamera";
import * as TWEEN from "@tweenjs/tween.js"
import { StaticActor } from "./actor/staticActor";
import { OctreeCollsionComponent } from "./component/collsionComponent/octreeCollsionComponent";
import { collsionMgr } from "./manager/colllsion/collsionManager";
import { SphereActor } from "./actor/sphereActor";
import { generateCollsionMapping } from "./manager/colllsion/collsionMapping";
export class MainScene {
    frameId: number | null = null;
    scene!: THREE.Scene;
    camera!: AutoFollowCamera;
    renderer!: THREE.WebGLRenderer;
    ambientLight!: THREE.AmbientLight;
    roleCollider!: Capsule;
    clock!: THREE.Clock;
    raycaster!: THREE.Raycaster;
    mouse!: THREE.Vector2;
    mouseClient!: Three.Vector2;
    sceneObjects: THREE.Object3D[] = [];
    controls!: OrbitControls;
    dirLight!: THREE.DirectionalLight;
    lookAtObject!: THREE.Object3D;
    targetPoint!: THREE.Vector3 | null;
    mouseDown: boolean = false;
    stats!: Stats;
    map!: StaticActor;

    player!: RoleCharacter;

    mouseDownTime: number = 0;

    /** 是否处于移动到目标状态 */
    moveTarget: boolean = false;
    // imde
    constructor(container: any) {
        managerPool?.registerAllManager();
        generateCollsionMapping();
        setTimeout(() => {
            this.init(container);
        })
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
        this.mouseClient = new Three.Vector2();
        this.lookAtObject = new THREE.Object3D();
        this.initOther();
        this.initScene();
        for (let i = 0; i < 1; i++) {
            await this.initMap(i);
        }

        await this.initRole();
        this.initSomething();
        this.setRenderer(container);
        this.setCamera();
        // const mesh = new THREE.BoxGeometry(0.5, 2);
        // const mater = new THREE.MeshLambertMaterial({ color: 0xffffff });
        // const box = new THREE.Mesh(mesh, mater);
        // this.scene.add(box);
        this.animate();
        if (navigator.userAgent.indexOf('Mobile') >= 0) {
            document.body.addEventListener('touchstart', this.mouseMove, false);
            document.body.addEventListener('touchmove', this.mouseMove, false);
            document.body.addEventListener('touchend', this.mouseUp, false);
        } else {
            document.body.addEventListener('mousedown', this.mouseMove, false);
            document.body.addEventListener('mousemove', this.mouseMove, false);
            document.body.addEventListener('mouseup', this.mouseUp, false);
        }


    }

    initSomething() {
        const sphere = new SphereActor(1, 0x66ccff);
        this.scene.add(sphere);
        sphere.setPosition(new Three.Vector3(2, -1, 2))
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
        const dirLight = new THREE.DirectionalLight(0x666666);
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

        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshPhongMaterial({ opacity: 0, color: 0x66ccff, depthWrite: false }));
        mesh.rotation.x = - Math.PI / 2;
        mesh.position.y = -1;
        mesh.visible = false;
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        // this.sceneObjects.push(mesh);
    }

    /** 创建场景，先随便搞点 */
    async initMap(i: number) {
        const gltf = await loadGltf('https://yun.duiba.com.cn/db_games/activity/Edwise/three-city-project/dev/collision-world.glb');
        // const gltf = await loadGltf('https://yun.duiba.com.cn/db_games/activity/Edwise/map1.glb')
        const map = new StaticActor();
        map.setModel(gltf.scene);

        map.model.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
                obj.receiveShadow = true;
                if (obj.material && obj.material.map) {
                    obj.material.map.anisotropy = 4;

                }
            }

        })
        map.position.set(i * 40, -0.4, i * 40);
        map.model.scale.set(1.5, 0.7, 1.5);
        const octree = new OctreeCollsionComponent({ group: map.model });
        collsionMgr?.addCollsionComponent(octree);
        octree.setOwner(map);

        this.scene.add(map);
        this.sceneObjects.push(map);
    }

    /** 创建角色，demo就先偷个懒了，要不3D的东西封装的真的需要太多东西了 */
    async initRole() {
        const gltf1 = await loadGltf('https://yun.duiba.com.cn/db_games/activity/Edwise/Xbot.glb')
        gltf1.scene.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
                obj.castShadow = true;
            }
        })
        const npc = new RoleCharacter();
        this.scene.add(npc);
        npc.setProp({ model: gltf1.scene });
        npc.setAnimMachine({ animations: gltf1.animations });
        npc.collider.translate(new Three.Vector3(2, 0, 6));

        const gltf2 = await loadGltf('https://yun.duiba.com.cn/db_games/activity/Edwise/Xbot.glb')
        gltf2.scene.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
                obj.castShadow = true;
            }
        })
        const npc1 = new RoleCharacter();
        this.scene.add(npc1);
        npc1.setProp({ model: gltf2.scene });
        npc1.setAnimMachine({ animations: gltf2.animations });
        npc1.collider.translate(new Three.Vector3(5, 0, 8));
        npc1.moveComponent.maxSpeed = 0.06;
        setTimeout(() => {
            npc1.moveComponent.moveOnAxis(new Three.Vector3(1, 0, 0));
        })
        setInterval(() => {
            const vector = npc1.moveComponent.speedVector.clone();
            npc1.moveComponent.moveOnAxis(new Three.Vector3(-1 * vector.x, 0, 0));
        }, 4000)

        const gltf = await loadGltf('https://yun.duiba.com.cn/db_games/activity/Edwise/Xbot.glb')
        gltf.scene.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
                obj.castShadow = true;
            }
        })
        this.player = new RoleCharacter();
        this.scene.add(this.player);
        this.player.setProp({ model: gltf.scene });
        this.player.setAnimMachine({ animations: gltf.animations })
        this.dirLight.target = this.player;
    }
    mouseUp = (event: any) => {
        event.preventDefault();
        this.mouseDown = false;
        console.info(event);
        const x = event?.clientX || event?.changedTouches[0].clientX;
        const y = event?.clientY || event?.changedTouches[0].clientY;
        const nowTime = Date.now();
        // 点击时间就在这里处理好了，如果距离小于20并且时间差小于300毫秒，点击，否则抬起重置
        if ((nowTime - this.mouseDownTime) <= 300 && Math.abs(x - this.mouseClient.x) < 20 && Math.abs(y - this.mouseClient.y) < 20) {
            this.moveTarget = true;
        } else {
            this.resetPlayer();
        }
    }

    resetPlayer() {
        // 重置运动状态
        this.targetPoint = null;
        this.player.moveComponent.stopImmediately();
        // 相机归位
        const targetQ = this.camera.owner.moveComponent.curQuaternion.clone();
        const targetR = new Three.Euler().setFromQuaternion(targetQ, 'YXZ');
        this.camera.inputRotate.y = targetR.y + 3.14;
        this.camera.rotateLagSpeed = 0.8;
    }

    mouseMove = (event: any) => {
        event.preventDefault();
        if (event.type === 'touchstart' || event.type === 'mousedown') {
            this.mouseDown = true;
            this.moveTarget = false;
            this.mouseDownTime = Date.now();
        }
        if ((event.type === 'touchmove' || event.type === 'mousemove') && !this.mouseDown) return;
        const x = event?.clientX || event?.touches[0].clientX;
        const y = event?.clientY || event?.touches[0].clientY;
        this.mouseClient.set(x, y);
        this.mouse.set((x / window.innerWidth) * 2 - 1, - (y / window.innerHeight) * 2 + 1);
    }

    /** 这一部分update，可以直接放到单一的控制类中，后面再搞 */
    update() {
        if (!this.mouseDown && !this.moveTarget) return;
        if (!this.moveTarget) {
            // 射线检测鼠标点击与3D平面位置
            this.raycaster.setFromCamera(this.mouse, this.camera);
            var intersects;
            let targetPoint!: Three.Vector3;
            intersects = this.raycaster.intersectObjects(this.sceneObjects);
            if (intersects.length > 0) {
                var intersect = intersects[0];
                targetPoint = new Three.Vector3(intersect.point.x, 0, intersect.point.z);
                this.targetPoint = targetPoint;
            }
        }
        if (!this.targetPoint) return;
        //设置目标点，目标旋转四元素，目标速度向量
        const speedVector = new THREE.Vector3(
            this.targetPoint.x - this.player.position.x,
            -1,
            this.targetPoint.z - this.player.position.z)
            .normalize();
        // 计算目标四元数
        this.lookAtObject.position.set(this.player.position.x, 0, this.player.position.z);
        this.lookAtObject.rotation.copy(this.player.rotation.clone());
        this.lookAtObject.quaternion.copy(this.player.quaternion.clone());
        this.lookAtObject.lookAt(this.targetPoint);
        const targetQuaternion = this.lookAtObject.quaternion.clone();
        this.player.moveComponent.moveOnAxis(speedVector);
        this.player.moveComponent.quaternionToTarget(targetQuaternion);
        const dis = this.lookAtObject.position.distanceTo(this.targetPoint);
        this.camera.rotateLagSpeed = 1;
        if (this.moveTarget) this.camera.rotateLagSpeed = 0.6
        // 如果不是在移动到目标点的模式下，那么跟随旋转
        if (!this.moveTarget) {
            const allHeight = window.innerHeight;
            let rotateSpeed = 0;
            const scale = this.mouseClient.y / allHeight;
            const cnt = Math.floor(scale / 0.05);
            rotateSpeed = cnt * 0.002;
            if (this.mouse.x > 0) {
                rotateSpeed *= -1;
            } else if (this.mouse.x < 0) {
                rotateSpeed *= 1;
            }
            this.camera.inputRotate.y += rotateSpeed;
        }

        else {
            const targetQ = this.camera.owner.moveComponent.curQuaternion.clone();
            const targetR = new Three.Euler().setFromQuaternion(targetQ, 'YXZ');
            this.camera.inputRotate.y = targetR.y + 3.14
        }
        //根据距离设置最大最小速度
        if (dis <= 0.1) {
            this.player.moveComponent.maxSpeed = 0;
        }
        if (dis > 0.1 && dis <= 1.6) {
            this.player.moveComponent.maxSpeed = 0.03;
        }
        if (dis > 1.6) {
            this.player.moveComponent.maxSpeed = 0.06;
        }
        // 移动到目标点了，停下
        if (this.moveTarget && dis < 0.5) {
            this.moveTarget = false;
            this.resetPlayer();
        }
    }


    // 新建透视相机
    setCamera(): void {
        // 第二参数就是 长度和宽度比 默认采用浏览器  返回以像素为单位的窗口的内部宽度和高度
        this.camera = new AutoFollowCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.2,
            1300
        );
        // 初始化个位置
        this.camera.position.z = -5;
        this.camera.position.y = 4;
        this.camera.lookAt(this.player.position.clone().add(new Three.Vector3(0, 2, 0)));
        // 为了跟随相机计算朝前向量，设置order为YXZ
        this.camera.rotation.reorder('YXZ')
        this.camera.owner = this.player;
        this.player.setCamera(this.camera);
        this.camera.inputRotate.copy(this.camera.rotation.clone());
    }

    // 设置渲染器
    setRenderer(container: any): void {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        // 设置画布的大小
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0xffffff);
        // 设置颜色模式等等
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.shadowMap.enabled = true;
        this.renderer.toneMapping = Three.ACESFilmicToneMapping;
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
        this.update();
        gameMgr?.updateCall.forEach((itm) => {
            itm.fun.call(itm.obj, deltaTime, clockDelta)
        })
        collsionMgr && (collsionMgr.collsionCheckeds = {});
        this.camera && this.camera.update(deltaTime, clockDelta);
        TWEEN.update(time);
        this.stats.update();
        this.render();
    }

    destroy() {
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
        for (let i = 0; i < this.scene.children.length; i++) {
            this.scene.remove(this.scene.children[i]);
            i--;
        }
        managerPool?.destory();
    }
}