import { BaseCollsionComponent } from "../component/collsionComponent/baseCollsionComponent";
import { Three,OrbitControls } from "../module";
import { BaseActor } from "./baseActor";

/** 静态actor，用于场景中的静态元素，例如一些场景模型 */
export class StaticActor extends BaseActor {
    /** 模型 */
    model!: Three.Group;
    /** 碰撞器 */
    collider!: BaseCollsionComponent;

    setModel(model: Three.Group) {
        this.model = model;
        this.add(this.model);   
    }

    /** 设置碰撞器 */
    setCollider(collider: BaseCollsionComponent) {
        this.collider = collider;
    }
}