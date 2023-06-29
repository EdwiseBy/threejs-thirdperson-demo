import { AnimMachineNode, NodeBranch } from "../interface/animation";
import { Three } from "../module";

/** 动画状态机 */
export class AnimationMachine {
    mixer!: Three.AnimationMixer;
    nodes: { [key: string]: AnimMachineNode } = {};
    animActions!: { [key: string]: Three.AnimationAction };
    curNodesName!: string;
    owner!: Three.Group;

    /** 设置动画混合器 */
    setMixer(animClips: Three.AnimationClip[], animModel: Three.Group, owner: Three.Group) {
        if (this.mixer) {
            console.error('重复创建动画状态机，请检查！');
        }
        this.mixer = new Three.AnimationMixer(animModel);
        this.owner = owner;
        for (let i = 0; i < animClips.length; i++) {
            if (!this.animActions) this.animActions = {};
            this.animActions[`${animClips[i].name}`] = this.mixer.clipAction(animClips[i]);
        }
    }

    update(delta: number, clockDelta: number) {
        if (this.owner && this.curNodesName) {
            this.mixer.update(clockDelta);
            const node = this.nodes[`${this.curNodesName}`];
            if (!node.nodeBranch) return;
            for (let i = 0; i < node.nodeBranch.length; i++) {
                const { targetNodeName, conditionHandle, blendTime } = node.nodeBranch[i];
                if (conditionHandle()) {
                    const targetNode = this.nodes[`${targetNodeName}`];
                    this.curNodesName = targetNode.nodeName;
                    this.prepareCrossFade(node.animAction, targetNode.animAction, blendTime);
                    this.modifyTimeScale(targetNode.timeScale);
                }
            }
        }
    }

    /** 添加一个节点 */
    createNode(nodeName: string, animActionName: string, timeScale: number) {
        const node: AnimMachineNode = {
            nodeName, animAction: this.animActions[`${animActionName}`], timeScale, nodeBranch: null
        }
        this.nodes[`${nodeName}`] = node;
        if (Object.keys(this.nodes).length === 1) {
            this.curNodesName = node.nodeName;
            this.activateBaseAction(node, 1);
        } else {
            this.activateBaseAction(node, 0);
        }
    }

    /** 向节点添加节点分支 */
    addNodeBranch2Node(nodeName: string, targetNodeName: string, conditionHandle: Function, blendTime: number) {
        const nodeBranch: NodeBranch = {
            targetNodeName, conditionHandle, blendTime
        }
        if (!this.nodes[`${nodeName}`].nodeBranch) {
            this.nodes[`${nodeName}`].nodeBranch = [nodeBranch];
        } else {
            this.nodes[`${nodeName}`].nodeBranch?.push(nodeBranch);
        }
    }

    /** 激活基础动画 */
    activateBaseAction(node: AnimMachineNode, weight: number) {
        this.setWeight(node.animAction, weight);
        this.modifyTimeScale(node.timeScale)
        node.animAction.play();
    }

    /** 设置时间缩放，可以用来改变动画速率 */
    modifyTimeScale(speed: number) {
        this.mixer.timeScale = speed;
    }

    /** 准备进入动画混合，先设置一下当前的action */
    prepareCrossFade(startAction: THREE.AnimationAction, endAction: THREE.AnimationAction, duration: number) {
        console.info('进入动画混合', startAction.getClip().name, endAction.getClip().name, duration)
        this.executeCrossFade(startAction, endAction, duration);
    }

    /** 动画混合，两段动画片段根据时间过度，设置权重先 */
    executeCrossFade(startAction: THREE.AnimationAction, endAction: THREE.AnimationAction, duration: number) {
        this.setWeight(endAction, 1);
        endAction.time = 0;
        if (startAction) {
            startAction.crossFadeTo(endAction, duration, true);
        } else {
            endAction.fadeIn(duration);
        }
    }

    /** 设置权重 */
    setWeight(action: THREE.AnimationAction, weight: number) {
        action.enabled = true;
        action.setEffectiveTimeScale(1);
        action.setEffectiveWeight(weight);
    }
}