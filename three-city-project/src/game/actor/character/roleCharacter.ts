import { RoleAnimMachine } from "../../animation/animMachines/roleAnimMachine";
import { CharacterProp } from "../../interface/character";
import { gameMgr } from "../../manager/gameManager";
import { BaseCharacter } from "./baseCharacter";

export class RoleCharacter extends BaseCharacter {

    init(): void {
        super.init();
        gameMgr?.addUpdateCall(this.update, this);
        // setInterval( () => { this.moveComponent.speed.y = -1 },2000)
    }

    setProp(prop: CharacterProp) {
        const { model } = prop;
        model && this.setModel(model);
    }

    setAnimMachine(prop: CharacterProp) {
        const { animations } = prop;
        if (!animations) return;
        const animMachine = new RoleAnimMachine();
        animMachine.setMixer(animations, this.model, this);
        animMachine.setRoleAnimNodes();
        this.animtionMachine = animMachine;
    }

    _update(delta: number, clockDelta: number): void {
        super._update(delta, clockDelta);
    }

}