import { CollsionGroup, CollsionShapeType } from "../../enum/collsion";
import { CollsionComProp } from "../../interface/component";
import { Capsule, Three } from "../../module";
import { BaseCollsionComponent } from "./baseCollsionComponent";
import { getDefaultGroupCollsionTypes } from "./utils";

/** 胶囊碰撞体 */
export class CapsuleCollsionComponent extends BaseCollsionComponent {
    /** 胶囊体 */
    collider!: Capsule;
    colliderHelper!: Three.CapsuleGeometry;
    /** 更新的目标点以胶囊体的哪个点位基准更新，start还是end */
    updateBasePoint!: string;
    /** 更新的偏移值 */
    updateOffset!: Three.Vector3;

    constructor(prop?: CollsionComProp) {
        super();
        this.init(prop);
    }

    init(prop?: CollsionComProp) {
        this.collider = new Capsule();
        this.updateOffset = new Three.Vector3();
        this.updateBasePoint = 'start';
        // 获取默认的碰撞组类型
        this.groupCollsionTypes = getDefaultGroupCollsionTypes();
        this.group = CollsionGroup.Character;
        this.shapeType = CollsionShapeType.Capsule;
        prop && this.setProp(prop);
    }

    setProp(prop: CollsionComProp) {
        const { startPoint, endPoint, radius, updateBasePoint, updateOffset } = prop;
        if (!startPoint || !endPoint || !radius) {
            console.error('胶囊碰撞体设置属性失败，请检查', this.owner, prop);
            return;
        }
        this.collider.set(startPoint.clone(), endPoint.clone(), radius);
        if (updateBasePoint) this.updateBasePoint = updateBasePoint;
        if (updateOffset) this.updateOffset.copy(updateOffset.clone());
    }
    translate(value: Three.Vector3): void {
        this.collider.translate(value);
        if (this.updateComponent) {
            this.updateComponentPoisiton();
        }
    }

    /** 更新组件位置 */
    updateComponentPoisiton() {
        let baseP;
        if (this.updateBasePoint === 'start') {
            baseP = this.getStartP();
        } else {
            baseP = this.getEndP();
        }
        this.updateComponent.position.copy(baseP.clone().add(this.updateOffset.clone()))
    }

    getStartP() {
        return this.collider.start;
    }

    getEndP() {
        return this.collider.end;
    }
}