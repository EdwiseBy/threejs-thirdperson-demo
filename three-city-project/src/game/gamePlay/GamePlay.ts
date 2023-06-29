/** GamePlay类，里面放着当前游戏玩法的一些东西 */
export class GamePlay {
    /** 全局重力加速度 */
    private _gravity: number = 3;
    constructor() {
        this.init();
    }
    init() {
        this._gravity = 3;
    }

    set gravity(value: number) {
        this._gravity = value;
    }

    get gravity(): number {
        return this._gravity;
    }
}