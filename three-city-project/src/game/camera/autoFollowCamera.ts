import * as TWEEN from "@tweenjs/tween.js";
import * as THREE from "three";
import { Matrix4, Object3D, Vector3 } from "three";
import { BaseCharacter } from "../actor/character/baseCharacter";
import { Three } from "../module";
import { isInfinity, nlerp } from "../utils";
/**
 * 自动跟随摄像机，设置好owner之后，相机会自动跟随设置，还有弹簧臂，平滑过渡，很吊！
 * @param [fov=50] Camera frustum vertical field of view. Default value is 50.
 * @param [aspect=1] Camera frustum aspect ratio. Default value is 1.
 * @param [near=0.1] Camera frustum near plane. Default value is 0.1.
 * @param [far=2000] Camera frustum far plane. Default value is 2000.
 */
export class AutoFollowCamera extends THREE.PerspectiveCamera {
    /** 跟随者 */
    owner!: BaseCharacter;
    /** 跟随者的目标便宜 */
    targetOffset: Three.Vector3 = new Three.Vector3(0, 2, 0);
    /** 摇臂距离 */
    armLength = 5.3;
    /** 输入旋转，后面细分的时候拆到controller里！ */
    inputRotate: Three.Euler = new Three.Euler();
    /**用来防止lookat的，只是用于数据存放，不涉及渲染等等 */
    lookAtObject: Three.Camera = new Three.Camera();
    /** 旋转平滑速度 */
    rotateLagSpeed: number = 1;
    /** 摇臂长度平滑速度 */
    armLengthLagSpeed: number = 4;

    // constructor(fov?: number, aspect?: number, near?: number, far?: number) {
    //     super(fov, aspect, near, far);
    // }

    update(delta: number, clockDelta: number) {
        if (!this.owner) return;

        // 相机的世界坐标
        let cameraWorldPos = this.position.clone();
        // 目标的世界坐标
        let targetWordPos = new Three.Vector3();
        targetWordPos = this.owner.position.clone().add(this.targetOffset);

        // 查询旋转向量：从相机指向目标
        this.lookAtObject.position.copy(cameraWorldPos);
        this.lookAtObject.lookAt(targetWordPos)
        // 设置旋转向量
        let targetR = new Three.Quaternion().copy(this.lookAtObject.quaternion.clone());
        // 获取控制旋转向量，从输入欧拉角获取
        let controlR = new Three.Quaternion().setFromEuler(this.inputRotate.clone());
        // 利用差值平滑过渡
        const inputQ = targetR.clone().slerp(controlR, clockDelta * this.rotateLagSpeed);
        // 对于three来说，朝前向量为0,0,1，根据旋转向量获取旋转向量所对应的朝前向量
        const vector = new Three.Vector3(0, 0, 1).applyQuaternion(inputQ);

        // clone一下，保证对象唯一
        const deltaVector = vector.clone()
        // 计算目标与相机距离
        let dis = targetWordPos.distanceTo(cameraWorldPos);
        // 差值获取摇臂长度，根据距离与定义好的摇臂长度
        let armLength = nlerp(dis, this.armLength, clockDelta * 4 * this.armLengthLagSpeed);
        // 用clamp限制摇臂最大最小长度
        armLength = Three.MathUtils.clamp(armLength, 4.4, 7.4);
        // 位置偏移量为控制旋转向量的朝前向量乘摇臂长度
        const deltaPos = deltaVector.multiplyScalar(armLength).clone();
        // 赋值！
        this.position.copy(new Three.Vector3(targetWordPos.x + deltaPos.x, targetWordPos.y + deltaPos.y, targetWordPos.z + deltaPos.z));
        // lookAt也要插值一下，就先小小差值一下，3D的封装实在是太多太杂了,后面加油细分
        this.lookAtObject.position.copy(this.position);
        this.lookAtObject.lookAt(targetWordPos);
        this.quaternion.rotateTowards(this.lookAtObject.quaternion, clockDelta * 10);
    }
}