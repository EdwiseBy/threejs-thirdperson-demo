import { BaseCollsionComponent } from "../../component/collsionComponent/baseCollsionComponent";
import { CapsuleCollsionComponent } from "../../component/collsionComponent/capsuleCollsionComponent";
import { OctreeCollsionComponent } from "../../component/collsionComponent/octreeCollsionComponent";
import { RayCollsionComponent } from "../../component/collsionComponent/rayCollsionComponent";
import { SphereCollsionComponent } from "../../component/collsionComponent/sphereCollsionComponent";
import { CollsionGroup, CollsionShapeType, CollsionType } from "../../enum/collsion";
import { CollsionResult } from "../../interface/component";
import { Three } from "../../module";
import { baseManager } from "../baseManager";
import { gameMgr } from "../gameManager";
import { collsionMapping, generateCollsionMapping } from "./collsionMapping";

class CollsionManager extends baseManager {
    public static _ins: CollsionManager;
    public static get Ins() {
        !this._ins && (this._ins = new CollsionManager());
        return this._ins;
    }

    /** 所有碰撞组件 */
    collsionComponents: BaseCollsionComponent[][] = [];
    /** 已经检测过了碰撞的 */
    collsionCheckeds: { [key: string]: { [key: string]: boolean } } = {};

    constructor() {
        super();
        gameMgr?.addUpdateCall(this.updateCollsion.bind(this), this);
    }

    /** 添加碰撞组件 */
    addCollsionComponent(component: BaseCollsionComponent) {
        const groupType = component.group;
        if (!this.collsionComponents[groupType]) this.collsionComponents[groupType] = [];
        this.collsionComponents[groupType].push(component);
    }

    /** 检查一个collider的碰撞 */
    checkCollsion(collider: BaseCollsionComponent) {
        let i = 0, m = 0,
            collider1 = collider,
            length = this.collsionComponents.length,
            group: BaseCollsionComponent[] = [];
        let results: CollsionResult[] = [];
        for (i = 0; i <= length - 1; i++) {
            group = this.collsionComponents[i];
            if (!group) continue;
            for (m = 0; m < group.length; m++) {
                const collider2 = group[m];
                const id1 = collider.id;
                const id2 = collider2.id;
                if (collider === collider2) continue;
                // 如果有静态物体，判断是否碰撞过
                if (collider1.group === CollsionGroup.Static || collider2.group === CollsionGroup.Static) {
                    if (this.judgeChecked(id1, id2)) continue;
                    if (!this.collsionCheckeds[`${id1}`]) this.collsionCheckeds[`${id1}`] = {};
                    this.collsionCheckeds[`${id1}`][`${id2}`] = true;
                }
                const collider1To2CollionType = collider1.groupCollsionTypes[`${collider2.group}`];
                const collider2To1CollionType = collider2.groupCollsionTypes[`${collider1.group}`];
                // 如果不是无视碰撞，检测
                if (collider1To2CollionType && collider2To1CollionType && collider1To2CollionType !== CollsionType.None && collider2To1CollionType !== CollsionType.None) {
                    const result = this.collsionTest(collider1, collider2)
                    if (result) {
                        if (collider1To2CollionType === CollsionType.Block && collider2To1CollionType === CollsionType.Block) {
                            collider1.collsionBlock(result);
                        }
                        if (collider1To2CollionType === CollsionType.Overlap && collider2To1CollionType === CollsionType.Overlap) {
                            collider1.collsionOverlap(result);
                        }
                        results.push(result);
                    }
                }
            }
        }
        // console.info(results);
        return results;
    }

    /** 判断是否已经碰撞过了 */
    judgeChecked(id1: number, id2: number): boolean {
        const c1 = this.collsionCheckeds[`${id1}`];
        const c2 = this.collsionCheckeds[`${id2}`]
        if (c1 && c1[`${id2}`]) return true;
        if (c2 && c2[`${id1}`]) return true;
        return false;
    }

    updateAllCollsion(collider?: BaseCollsionComponent) {
        // //查找所有碰撞
        // let i = 0,
        //     j = 0,
        //     m = 0,
        //     n = 0,
        //     length = this.collsionComponents.length,
        //     group1: BaseCollsionComponent[] = [],
        //     group2: BaseCollsionComponent[] = [];
        // for (i = 0; i <= length - 1; i++) {
        //     for (j = i + 1; j <= length - 1; j++) {
        //         group1 = this.collsionComponents[i];
        //         group2 = this.collsionComponents[j];
        //         if (!group1 || !group2) continue;
        //         for (m = 0; m <= group1.length - 1; m++) {
        //             for (n = 0; n <= group2.length - 1; n++) {
        //                 const collider1 = group1[m];
        //                 const collider2 = group2[n];
        //                 const collider1To2CollionType = collider1.groupCollsionTypes[`${collider2.group}`];
        //                 const collider2To1CollionType = collider2.groupCollsionTypes[`${collider1.group}`];
        //                 if (collider1To2CollionType !== CollsionType.None && collider2To1CollionType !== CollsionType.None) {
        //                     const result = this.collsionTest(collider1, collider2)
        //                     if (result) {
        //                         if (collider1To2CollionType === CollsionType.Block && collider2To1CollionType === CollsionType.Block) {
        //                             collider1.blockHandle();
        //                         }
        //                         if (collider1To2CollionType === CollsionType.Overlap && collider2To1CollionType === CollsionType.Overlap) {
        //                             collider1.overlapHandle();
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }
    }

    collsionTest(collider1: BaseCollsionComponent, collider2: BaseCollsionComponent) {
        const shape1 = collider1.shapeType;
        const shape2 = collider2.shapeType;
        //@ts-ignore
        const fun = collsionMapping[`${shape1}`][`${shape2}`]?.collsionFun;
        if (fun) return fun(collider1, collider2);
    }

    /** 胶囊体与胶囊体碰撞 */
    capsuleTestCapsule(capsule1: BaseCollsionComponent, capsule2: BaseCollsionComponent) {
        const _capsule1 = capsule1 as CapsuleCollsionComponent;
        const _capsule2 = capsule2 as CapsuleCollsionComponent;
        const startP1 = _capsule1.getStartP();
        const endP1 = _capsule1.getEndP();
        const startP2 = _capsule2.getStartP();
        const endP2 = _capsule2.getEndP();
        const vector1 = new Three.Vector3();
        const vector2 = new Three.Vector3();
        const center1 = vector1.addVectors(startP1, endP1).multiplyScalar(0.5);
        const center2 = vector2.addVectors(startP2, endP2).multiplyScalar(0.5);

        const r = _capsule1.collider.radius + _capsule2.collider.radius;
        const r2 = r * r;

        for (const point1 of [startP1, endP1, center1]) {
            for (const point2 of [startP2, endP2, center2]) {
                const d2 = point1.distanceToSquared(point2);

                if (d2 < r2) {

                    const normal = vector1.subVectors(point1, point2).normalize();
                    const depth = Math.abs(Math.sqrt(d2) - r);
                    return { normal, depth }
                }
            }
        }
    }

    /** 胶囊体与球体碰撞 */
    capsuleTestSphere(collider1: BaseCollsionComponent, collider2: BaseCollsionComponent) {
        let _capsule: CapsuleCollsionComponent, _sphere: SphereCollsionComponent;
        if (collider1 instanceof CapsuleCollsionComponent) {
            _capsule = collider1;
            _sphere = collider2;
        } else if (collider2 instanceof CapsuleCollsionComponent) {
            _capsule = collider2;
            _sphere = collider1;
        } else {
            console.error('胶囊体与球体碰撞传入的参数不对')
            return;
        }
        const startP = _capsule.getStartP();
        const endP = _capsule.getEndP();
        const vector1 = new Three.Vector3();
        const center = vector1.addVectors(startP, endP).multiplyScalar(0.5);

        const sphere_center = _sphere.collider.center;

        const r = _capsule.collider.radius + _sphere.collider.radius;
        const r2 = r * r;

        for (const point of [startP, endP, center]) {

            const d2 = point.distanceToSquared(sphere_center);

            if (d2 < r2) {

                const normal = vector1.subVectors(point, sphere_center).normalize();
                const depth = Math.abs(Math.sqrt(d2) - r);
                return { normal, depth }
            }

        }
    }

    /** 胶囊体与八叉树碰撞 */
    capsuleTestOctree(collider1: BaseCollsionComponent, collider2: BaseCollsionComponent) {
        let _capsule: CapsuleCollsionComponent, _octree: OctreeCollsionComponent;
        if (collider1 instanceof CapsuleCollsionComponent) {
            _capsule = collider1;
            _octree = collider2;
        } else if (collider2 instanceof CapsuleCollsionComponent) {
            _capsule = collider2;
            _octree = collider1;
        } else {
            console.error('胶囊体与八叉树碰撞传入参数错误');
            return;
        }
        const result = _octree.collider.capsuleIntersect(_capsule.collider);
        return result;
    }

    /** 射线与八叉树碰撞 */
    rayTestOctree(collider1: BaseCollsionComponent, collider2: BaseCollsionComponent) {
        let _ray: RayCollsionComponent, _octree: OctreeCollsionComponent;
        if (collider1 instanceof RayCollsionComponent) {
            _ray = collider1;
            _octree = collider2;
        } else if (collider2 instanceof RayCollsionComponent) {
            _ray = collider2;
            _octree = collider1;
        } else {
            return;
        }
        const result = _octree.collider.rayIntersect(_ray.collider);
        return result;
    }

    updateCollsion() {
        this.updateAllCollsion();
    }

    destroy(): void {
        super.destroy();
        gameMgr?.removeUpdateCall(this.updateCollsion.bind(this), this);
        collsionMgr = null;
        collsionInstanceId = 0;
    }
}

export let collsionMgr: CollsionManager | null = CollsionManager.Ins;
export let collsionInstanceId: number = 0;
export const updateCollsionInstanceId = (value: number) => {
    collsionInstanceId = value;
}