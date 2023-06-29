/** @Author: Edwise
  * @Date: 2022-11-14 14:48:03
  **/
import { CollsionGroup, CollsionShapeType, CollsionType } from "../../enum/collsion";
import { CollsionComProp, CollsionResult } from "../../interface/component";
import { collsionInstanceId, collsionMgr, updateCollsionInstanceId } from "../../manager/colllsion/collsionManager";
import { Three } from "../../module";
import { BaseComponent } from "../baseComponent";

/** 基础碰撞组件 */
export class BaseCollsionComponent implements BaseComponent {
  id!: number;
  /** 碰撞组 */
  group!: CollsionGroup;
  /** 与别的碰撞组对应的碰撞类型 */
  groupCollsionTypes!: { [key: string]: CollsionType };
  /** 形状类型 */
  shapeType!: CollsionShapeType;
  /** 阻挡碰撞的句柄 */
  blockHandle!: Function;
  /** 穿过碰撞的句柄 */
  overlapHandle!: Function;
  /** 无碰撞的句柄 */
  noCollsionHandle!: Function;
  owner!: Three.Object3D;
  updateComponent!: Three.Object3D;
  collider: any;
  constructor() {
    this.id = collsionInstanceId + 1;
    updateCollsionInstanceId(this.id);
  }

  init(prop: CollsionComProp) { };

  setGroup(group: CollsionGroup) { this.group = group; };

  setProp(prop: CollsionComProp) { };

  setOwner(owner: any) { this.owner = owner; };


  translate(value: Three.Vector3): void {
  }

  setUpdateComponent(owner: Three.Object3D) {
    this.updateComponent = owner;
  }

  /** 阻挡碰撞的响应方法 */
  collsionBlock(result: CollsionResult): void {
    this.blockHandle && this.blockHandle(result);
  }
  /** 穿过碰撞的响应方法 */
  collsionOverlap(result: CollsionResult): void {
    this.overlapHandle && this.collsionOverlap(result);
  }
  /** 没有碰撞 */
  noCollsion(): void {
    this.noCollsionHandle && this.noCollsion();
  }

  destroy() { }
}