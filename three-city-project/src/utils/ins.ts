export class Ins {
    private static _ins: Ins;
    public static get ins() {
        !this._ins && (this._ins = new Ins());
        return this._ins;
    }
    assFolder = null;
}
