import { SkeletonHelper } from "three";
import { AnimationMachine } from "../../animation/animationMachine";
import { CapsuleCollsionComponent } from "../../component/collsionComponent/capsuleCollsionComponent";
import { RayCollsionComponent } from "../../component/collsionComponent/rayCollsionComponent";
import { MoveComponent } from "../../component/moveComponent";
import { CollsionGroup, CollsionType } from "../../enum/collsion";
import { collsionMgr } from "../../manager/colllsion/collsionManager";
import { Three } from "../../module";
import { BaseActor } from "../baseActor";

/** 基础角色类，这里的角色指的是，可以移动的，有碰撞体的 */
export class BaseCharacter extends BaseActor {
    /** 模型，自带一个变量 */
    model!: Three.Group;
    /** 基础碰撞类 */
    collider!: CapsuleCollsionComponent;
    /** 地板碰撞类，射线碰撞 */
    floorCollider!: RayCollsionComponent;
    /** 上一帧的位置 */
    lastFramePosition!: Three.Vector3;
    /** 当前帧的位置 */
    curFramePostion!: Three.Vector3;
    /** 骨骼显示器 */
    skeleton: Three.SkeletonHelper | null | undefined;
    /** 移动组件 */
    moveComponent!: MoveComponent;
    /** 动画机 */
    animtionMachine!: AnimationMachine;
    /** 相机 */
    camera!: Three.PerspectiveCamera;


    constructor() {
        super();
        this.init();
    }

    init() {
        this.moveComponent = new MoveComponent();
        this.moveComponent.setOwner(this);
        this.collider = new CapsuleCollsionComponent({
            startPoint: new Three.Vector3(0, 0, 0),
            endPoint: new Three.Vector3(0, 1.5, 0),
            radius: 0.35,
            updateOffset: new Three.Vector3(0, -0.35, 0)
        });
        this.collider.setOwner(this);
        this.collider.setUpdateComponent(this);
        collsionMgr?.addCollsionComponent(this.collider);
        this.floorCollider = new RayCollsionComponent({
            rayStartP: this.position.clone(),
            rayDirection: new Three.Vector3(0, -1, 0)
        })
        this.floorCollider.groupCollsionTypes[CollsionGroup.Character] = CollsionType.None;
        this.floorCollider.groupCollsionTypes[CollsionGroup.Dynamic] = CollsionType.None;
        this.floorCollider.setOwner(this);
    }

    setModel(model: Three.Group) {
        this.model = model;
        this.add(this.model);
    }

    setCamera(camera: Three.PerspectiveCamera) {
        this.camera = camera;
    }

    showSkeleton() {
        if (this.skeleton) return;
        this.skeleton = new SkeletonHelper(this.model);
        this.skeleton.visible = true;
        this.add(this.skeleton);
    }

    hideSkeleton() {
        if (this.skeleton) {
            this.remove(this.skeleton);
            this.skeleton = null;
        }
    }
    _update(delta: number, clockDelta: number): void {
        this.lastFramePosition = this.position.clone();
        this.moveComponent && this.moveComponent.update(delta);
        this.quaternion.copy(this.moveComponent.curQuaternion.clone());
        this.animtionMachine && this.animtionMachine.update(delta, clockDelta);
        this.collider.translate(this.moveComponent.deltaPosition);
    }

    checkCollsion() {
        const result = collsionMgr?.checkCollsion(this.collider);
        this.moveComponent.onFloor = true;
        if (result && result.length > 0) {
            let sumV: Three.Vector3 = new Three.Vector3();
            let sumR: Three.Vector3 = new Three.Vector3();
            let sumD: number = 0;
            for (let i = 0; i < result.length; i++) {
                const _result = result[i];
                if (_result.depth && _result.normal) {
                    sumV.add(_result.normal.clone());
                    sumD += _result.depth;
                    sumR.add(_result.normal.multiplyScalar(_result.depth));
                }
            }
            if (sumV.y < 0) {
                this.moveComponent.onFloor = false;
            }
            let deltaVector = sumR.clone()
            if (Math.abs(deltaVector.y) > 0.35) {
                deltaVector.copy(this.moveComponent.deltaPosition.clone().multiplyScalar(-1).multiplyScalar(1.2));
            }
            if (this.moveComponent.moveing) {
                this.collider.translate(new Three.Vector3(deltaVector.x, deltaVector.y, deltaVector.z));
            } else {
                if (Math.abs(deltaVector.y) > 1.e-12) {
                    this.collider.translate(new Three.Vector3(deltaVector.x, deltaVector.y, deltaVector.z));
                }
            }
        } else {
            this.moveComponent.onFloor = false;
        }
        if (this.moveComponent.onFloor) {
            this.moveComponent.speed.y = 0;
        }
    }

    /** 检查地板 */
    checkFloor() {
        if (!this.moveComponent.moveing) return;
        this.floorCollider.setProp({ rayStartP: this.collider.getStartP() });
        const result = collsionMgr?.checkCollsion(this.floorCollider);
        if (result && result.length > 0 && result[0].position && result[0].distance && result[0].distance > 0.35 && result[0].distance <= 0.4) {
            // const deltaP = result[0].position?.clone().sub(this.collider.getStartP());
            const deltaY = result[0].position.y - this.position.y;
            if (deltaY < 0 && Math.abs(deltaY) <= 0.035) {
                this.collider.translate(new Three.Vector3(0, deltaY, 0));
                this.moveComponent.onFloor = true;
                this.moveComponent.speed.y = 0;
            }
        }
    }

    update(delta: number, clockDelta: number) {
        this._update(delta, clockDelta);
        this.checkCollsion();
        this.checkFloor();
        // this.position.copy(this.collider.getStartP().clone().sub(new Three.Vector3(0, 0.35, 0)));
        this.curFramePostion = this.position.clone();
    }
}