/** @Author: Edwise
  * @Date: 2022-11-14 11:26:05
  **/
import { MoveComProp } from "../interface/component";
import { gameMgr } from "../manager/gameManager";
import { Three } from "../module";
import { safeValue } from "../utils";
import { BaseComponent } from "./baseComponent";

/** 移动组件 */
export class MoveComponent implements BaseComponent {
    /** 速度大小矢量 */
    speed!: Three.Vector3;
    /** 速度方向矢量 */
    speedVector!: Three.Vector3;
    /** 重力加速度缩放，用缩放乘全局重力加速度得到当前组件的重力加速度，默认1 */
    gravityScale!: number;
    /** 重力加速度 */
    gravity!: number
    maxSpeedY!: number;
    /** 运动加速度，xz轴的,默认0.01*/
    acceleration!: number;
    /** 最大速度,默认0.03 */
    maxSpeed!: number;
    /** 转向速度,默认12 */
    rotateSpeed!: number;
    /** 当前的转向四元素 */
    curQuaternion!: Three.Quaternion;
    /** 转向的目标四元素 */
    targetQuaternion!: Three.Quaternion | null;
    /** 是否在移动中 */
    moveing!: boolean;
    /** 帧间隔的position */
    deltaPosition!: Three.Vector3;
    /** 位置信息 */
    position!: Three.Vector3;
    /** 是否在地板上 */
    onFloor!: boolean;
    lookAtObject!: Three.Object3D;
    owner!: Three.Group;

    constructor(prop?: MoveComProp) {
        this.init(prop);
    }

    init(prop?: MoveComProp) {
        console.info("hahajha")
        this.speed = new Three.Vector3(0, 0, 0);
        this.speedVector = new Three.Vector3(0, -1, 0);
        this.deltaPosition = new Three.Vector3();
        this.curQuaternion = new Three.Quaternion();
        this.lookAtObject = new Three.Object3D();
        this.maxSpeed = 0.03;
        this.maxSpeedY = 0.1;
        this.acceleration = 0.01;
        this.rotateSpeed = 12;
        this.onFloor = true;
        this.gravityScale = 1;
        console.info('ha', Date.now(), gameMgr?.gamePlay)
        gameMgr?.gamePlay.gravity && (this.gravity = gameMgr?.gamePlay.gravity * this.gravityScale);
        prop && this.setProp(prop);
    }

    setOwner(owner: Three.Group) { this.owner = owner; }

    /** 属性设置,理论上无法设置为null，undefined，NaN，infinity的数值会经过安全检查，注意 */
    setProp(prop: MoveComProp) {
        const { speed, speedVector, gravityScale, acceleration, maxSpeed, rotateSpeed } = prop;
        safeValue(speed) && (this.speed = speed.clone());
        safeValue(speedVector) && (this.speedVector = speedVector.clone());
        safeValue(acceleration) && (this.acceleration = acceleration);
        safeValue(maxSpeed) && (this.maxSpeed = maxSpeed);
        safeValue(rotateSpeed) && (this.rotateSpeed = rotateSpeed);
        if (safeValue(gravityScale) && gameMgr?.gamePlay.gravity) {
            this.gravityScale = gravityScale;
            this.gravity = gameMgr?.gamePlay.gravity * this.gravityScale;
            console.info(this.gravity)
        }
        this.speedVector.y = -1;
    }

    update(delta: number) {
        if (this.targetQuaternion) {
            if (!this.curQuaternion.equals(this.targetQuaternion)) {
                const step = this.rotateSpeed * delta;
                this.curQuaternion.rotateTowards(this.targetQuaternion, step);
            } else {
                this.targetQuaternion = null;
            }
        } else {
            const targetPoint = new Three.Vector3(this.owner.position.x + this.speedVector.x, 0, this.owner.position.z + this.speedVector.z);
            // 计算目标四元数
            this.lookAtObject.position.set(this.owner.position.x, 0, this.owner.position.z);
            this.lookAtObject.quaternion.copy(this.curQuaternion.clone());
            this.lookAtObject.lookAt(targetPoint);
            this.targetQuaternion = this.lookAtObject.quaternion.clone();
        }
        let speed = this.speed.x;
        // 变速运动
        if (this.moveing) {

            if (speed < this.maxSpeed) {
                speed += this.acceleration;
            }
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
        // 兜底设置
        if (speed < 0) {
            this.speed.set(0, this.speed.y, 0);
        } else if (speed >= this.maxSpeed) {
            this.speed.set(this.maxSpeed, this.speed.y, this.maxSpeed);
        } else {
            this.speed.set(speed, this.speed.y, speed);
        }
        if (!this.onFloor) {
            this.speed.y += this.gravity * delta;
            if (this.speed.y >= this.maxSpeedY) this.speed.y = this.maxSpeedY;
        }
        // 设置当前的帧位置
        this.deltaPosition = new Three.Vector3(this.speed.x * this.speedVector.x, this.speed.y * this.speedVector.y, this.speed.z * this.speedVector.z)
        // if (this.deltaPosition.x !== 0 || this.deltaPosition.y !== 0 || this.deltaPosition.z !== 0) {
        //     this.moveing = true;
        // } else {
        //     this.moveing = false;
        // }
    }

    /** 四元素到target */
    quaternionToTarget(targetQuaternion: Three.Quaternion) {
        this.targetQuaternion = targetQuaternion.clone();
    }

    /** 在给定的轴向量上移动，其实就是speedVector,速度方向 */
    moveOnAxis(axis: Three.Vector3) {
        this.speedVector.x = axis.x;
        this.speedVector.z = axis.z;
        this.moveing = true;
    }

    /** 立即停下 */
    stopImmediately() {
        this.speed.set(0, 0, 0);
        this.moveing = false;
    }

    destroy() {

    }
}