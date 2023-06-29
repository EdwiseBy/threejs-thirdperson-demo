import { CollsionGroup, CollsionShapeType } from "../../enum/collsion";
import { CollsionComProp } from "../../interface/component";
import { Three } from "../../module";
import { BaseCollsionComponent } from "./baseCollsionComponent";
import { getDefaultGroupCollsionTypes } from "./utils";

/** 射线碰撞组件 */
export class RayCollsionComponent extends BaseCollsionComponent {
    collider!: Three.Ray;
    constructor(prop: CollsionComProp) {
        super();
        this.init(prop);
    }

    init(prop: CollsionComProp): void {
        super.init(prop);
        this.collider = new Three.Ray();
        this.group = CollsionGroup.Dynamic;
        this.groupCollsionTypes = getDefaultGroupCollsionTypes();
        this.shapeType = CollsionShapeType.Ray;
        prop && (this.setProp(prop));

    }

    setProp(prop: CollsionComProp): void {
        const { rayStartP, rayDirection } = prop;
        if (rayStartP) this.collider.origin.copy(rayStartP.clone());
        if (rayDirection) this.collider.direction.copy(rayDirection.clone());

        // if (rayFar) this.collider.far = rayFar;
        // if (rayNear && rayNear >= 0) this.collider.near = rayNear;
    }
}