import { RoleCharacter } from "../../actor/character/roleCharacter";
import { RoleAnim } from "../../enum/anim";
import { AnimationMachine } from "../animationMachine";

export class RoleAnimMachine extends AnimationMachine {

    setRoleAnimNodes() {
        this.createNode(RoleAnim.idle, RoleAnim.idle, 1);
        this.createNode(RoleAnim.walk, RoleAnim.walk, 1);
        this.createNode(RoleAnim.run, RoleAnim.run, 1);
        console.info(this.nodes);
        this.addNodeBranch2Node(RoleAnim.idle, RoleAnim.walk, this.idleToWalk.bind(this), 0.2);
        this.addNodeBranch2Node(RoleAnim.walk, RoleAnim.idle, this.walkToIdle.bind(this), 0.2);
        this.addNodeBranch2Node(RoleAnim.walk, RoleAnim.run, this.walkToRun.bind(this), 0.2);
        this.addNodeBranch2Node(RoleAnim.run, RoleAnim.walk, this.runToWalk.bind(this), 0.2);
        this.addNodeBranch2Node(RoleAnim.run, RoleAnim.idle, this.runToIdle.bind(this), 0.3);
    }

    idleToWalk() {
        const speed = this.getRoleSpeed();
        if (speed > 0 && speed < 0.04) {
            return true;
        }
        return false;
    }

    walkToIdle() {
        const speed = this.getRoleSpeed();
        if (speed < 0.01) {
            return true;
        }
        return false;
    }

    walkToRun() {
        const speed = this.getRoleSpeed();
        if (speed > 0.04) {
            return true;
        }
        return false;
    }
    runToWalk() {
        const speed = this.getRoleSpeed();
        if (speed <= 0.04 && speed > 0.01) {
            return true;
        }
        return false;
    }
    runToIdle() {
        const speed = this.getRoleSpeed();
        if (speed < 0.01) {
            return true;
        }
        return false;
    }

    getRoleSpeed() {
        const role = this.owner as RoleCharacter;
        if (!role) return 0;
        const speed = role.moveComponent.speed.x;
        return speed;
    }

    update(delta: number, clockDelta: number): void {
        super.update(delta, clockDelta);
    }
}