import { Three } from "../module";

/** 移动组件的属性值 */
export interface MoveComProp {
    /** 速度大小矢量 */
    speed: Three.Vector3;
    /** 速度方向矢量 */
    speedVector: Three.Vector3;
    /** 重力加速度缩放，用缩放乘全局重力加速度得到当前组件的重力加速度 */
    gravityScale: number;
    /** 运动加速度，xz轴的 */
    acceleration: number;
    /** 最大速度 */
    maxSpeed: number;
    /** 转向速度 */
    rotateSpeed: number;
}

/** 碰撞组件属性值 */
export interface CollsionComProp {

    /** 胶囊体的起点 */
    startPoint?: Three.Vector3;
    /** 胶囊体的终点 */
    endPoint?: Three.Vector3;
    /** 更新的目标点以胶囊体的哪个点位基准更新，start还是end */
    updateBasePoint?: string;
    /** 更新的偏移值 */
    updateOffset?: Three.Vector3;
    /** 球体的中点 */
    centerPoint?: Three.Vector3;
    /** 胶囊体与球体的半径 */
    radius?: number;
    /** 传入的3D物体 */
    group?: Three.Object3D;
    /** 射线的起点 */
    rayStartP?: Three.Vector3;
    /** 射线的方向 */
    rayDirection?: Three.Vector3;
    /** 射线的最近距离，默认0 */
    rayNear?: number;
    /** 射线的最远距离，默认无限 */
    rayFar?: number;
}

/** 碰撞结果 */
export interface CollsionResult {
    /** 碰撞点法线 */
    normal?: Three.Vector3;
    /** 碰撞点深度 */
    depth?: number,
    distance?: number,
    triangle?: Three.Triangle,
    position?: Three.Vector3
}