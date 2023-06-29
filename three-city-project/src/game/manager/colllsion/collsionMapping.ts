import { CollsionShapeType } from "../../enum/collsion"
import { collsionMgr } from "./collsionManager"

/** 注册碰撞映射 */
export const generateCollsionMapping = () => {
    collsionMapping = {
        [CollsionShapeType.Capsule]: {
            [CollsionShapeType.Capsule]: {
                collsionFun: collsionMgr?.capsuleTestCapsule
            },
            [CollsionShapeType.Sphere]: {
                collsionFun: collsionMgr?.capsuleTestSphere
            },
            [CollsionShapeType.Octree]: {
                collsionFun: collsionMgr?.capsuleTestOctree
            }
        },
        [CollsionShapeType.Sphere]: {
            [CollsionShapeType.Capsule]: {
                collsionFun: collsionMgr?.capsuleTestSphere
            }
        },
        [CollsionShapeType.Octree]: {
            [CollsionShapeType.Capsule]: {
                collsionFun: collsionMgr?.capsuleTestOctree
            },
            [CollsionShapeType.Ray]: {
                collsionFun: collsionMgr?.rayTestOctree
            }
        },
        [CollsionShapeType.Ray]: {
            [CollsionShapeType.Octree]: {
                collsionFun: collsionMgr?.rayTestOctree
            }
        },
    }
}
export let collsionMapping: { [key: string]: { [key: string]: { collsionFun: Function | undefined } } };