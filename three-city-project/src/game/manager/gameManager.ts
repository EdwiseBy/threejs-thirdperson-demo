import { GamePlay } from "../gamePlay/GamePlay";
import { baseManager } from "./baseManager";
class GameManager extends baseManager {
    public static _ins: GameManager;
    public static get Ins() {
        !this._ins && (this._ins = new GameManager());
        return this._ins;
    }

    updateCall: { fun: Function, obj: Object }[] = [];
    gamePlay: GamePlay = new GamePlay();

    managerInit(): void {
        super.managerInit();
    }

    addUpdateCall(fun: Function, obj: Object) {
        if (!this.updateCall) this.updateCall = [];
        this.updateCall.push({ fun, obj });
    }

    removeUpdateCall(fun: Function, obj: object) {
        for (let i = 0; i < this.updateCall.length; i++) {
            if (this.updateCall[i].fun === fun && this.updateCall[i].obj === obj) {
                this.updateCall.splice(i, 1);
                return;
            }
        }
    }
    removeAllUpdateCall() {
        this.updateCall = [];
    }

    destroy(): void {
        super.destroy();
        this.removeAllUpdateCall();
        gameMgr = null;
    }
}
export let gameMgr: GameManager | null = GameManager.Ins;