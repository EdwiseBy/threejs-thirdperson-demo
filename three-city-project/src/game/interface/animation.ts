import { Three } from "../module";

/** 动画机节点数据结构 */
export interface AnimMachineNode {
    /** 节点名称 */
    nodeName: string;
    /** 当前节点的动画片段 */
    animAction: Three.AnimationAction;
    /** 
     * 节点分支
     * targetNodeName:目标节点名称
     * conditionHandle:条件句柄，传入一个方法，返回布尔值，当满足这个条件的时候切换到目标节点
     * blendTime:到目标节点动画的混合时间
     */
    nodeBranch: null | [NodeBranch];
    /** 播放倍速 */
    timeScale: number;
}

/** 节点分支 */
export interface NodeBranch {
    /** 目标节点名称 */
    targetNodeName: string,
    /** 条件句柄，传入一个方法，返回布尔值，当满足这个条件的时候切换到目标节点 */
    conditionHandle: Function,
    /** 到目标节点动画的混合时间 */
    blendTime: number
}