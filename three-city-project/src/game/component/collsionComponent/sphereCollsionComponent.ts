import { CollsionGroup, CollsionShapeType } from "../../enum/collsion";
import { CollsionComProp } from "../../interface/component";
import { Three } from "../../module";
import { BaseCollsionComponent } from "./baseCollsionComponent";
import { getDefaultGroupCollsionTypes } from "./utils";

/** 八叉树碰撞组件 */
export class SphereCollsionComponent extends BaseCollsionComponent {
    collider!: Three.Sphere;
    constructor(prop: CollsionComProp) {
        super();
        this.init(prop);
    }

    init(prop?: CollsionComProp): void {
        this.group = CollsionGroup.Static;
        this.groupCollsionTypes = getDefaultGroupCollsionTypes();
        this.shapeType = CollsionShapeType.Sphere;
        this.collider = new Three.Sphere();
        prop && this.setProp(prop);
    }

    setProp(prop: CollsionComProp): void {
        const { centerPoint, radius } = prop;
        if (centerPoint && radius)
            this.collider.set(centerPoint?.clone(), radius);
    }
    translate(value: Three.Vector3): void {
        this.collider.translate(value);
        this.updateComponent && this.updateComponent.position.copy(this.collider.center.clone())
    }


}