import { CollsionGroup, CollsionShapeType } from "../../enum/collsion";
import { CollsionComProp } from "../../interface/component";
import { Octree } from "../../module";
import { BaseCollsionComponent } from "./baseCollsionComponent";
import { CapsuleCollsionComponent } from "./capsuleCollsionComponent";
import { getDefaultGroupCollsionTypes } from "./utils";

/** 八叉树碰撞组件 */
export class OctreeCollsionComponent extends BaseCollsionComponent {
    collider!: Octree;
    constructor(prop: CollsionComProp) {
        super();
        this.init(prop);
    }

    init(prop?: CollsionComProp): void {
        this.group = CollsionGroup.Static;
        this.collider = new Octree();
        this.groupCollsionTypes = getDefaultGroupCollsionTypes();
        this.shapeType = CollsionShapeType.Octree;
        prop && this.setProp(prop);
    }

    setProp(prop: CollsionComProp): void {
        const { group } = prop;
        group && this.collider.fromGraphNode(group);
    }

}