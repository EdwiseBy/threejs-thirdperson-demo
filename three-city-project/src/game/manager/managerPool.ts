import { baseManager } from "./baseManager";
import { collsionMgr } from "./colllsion/collsionManager";
import { gameMgr } from "./gameManager";

class ManagerPool {
    static _ins: ManagerPool;
    static get Ins() {
        !this._ins && (this._ins = new ManagerPool());
        return this._ins;
    }

    pool: baseManager[] = [];
    registerAllManager() {
        this.registerManager(gameMgr);
        this.registerManager(collsionMgr);
    }
    registerManager(mgr: baseManager | null) {
        if (!mgr) return;
        !this.pool && (this.pool = []);
        if (this.pool.indexOf(mgr) >= 0) {
            console.error('已经注册过该管理器，请勿重复注册', mgr)
        }
        this.pool.push(mgr);
    }

    cancelManager(mgr: baseManager) {
        if (!this.pool || this.pool.length <= 0) return;
        const idx = this.pool.indexOf(mgr);
        if (idx >= 0) this.pool.splice(idx, 1)[0].destroy();
    }

    destory() {
        this.pool.forEach((itm) => {
            this.cancelManager(itm);
        })
        managerPool = null;
    }
}

export let managerPool: ManagerPool | null = ManagerPool.Ins;