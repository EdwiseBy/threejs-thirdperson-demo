import { CollsionGroup, CollsionType } from "../../enum/collsion";

/** 获取默认的组碰撞类型，默认全都为block，阻挡 */
export const getDefaultGroupCollsionTypes = () => {
    let groupCollsionTypes: { [key: string]: CollsionType } = {};
    for (let key in CollsionGroup) {
        groupCollsionTypes[`${CollsionGroup[key]}`] = CollsionType.Block;
    }
    return groupCollsionTypes;
}