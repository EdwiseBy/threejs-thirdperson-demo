/** @Author: Edwise
  * @Date: 2022-11-14 14:43:53
  **/

/** 碰撞组 */
export enum CollsionGroup {
  /** 静态的 */
  Static = 0,
  /** 动态的 */
  Dynamic = 1,
  /** 人物 */
  Character = 2,
}

/** 碰撞类型 */
export enum CollsionType {
  /** 阻挡 */
  Block = 'Block',
  /** 穿过 */
  Overlap = 'Overlap',
  /** 无碰撞 */
  None = 'None',
}

/** 碰撞形状 */
export enum CollsionShapeType {
  Box = 'Box',
  Octree = 'Octree',
  Sphere = 'Sphere',
  Capsule = 'Capsule',
  Ray = 'Ray'
}