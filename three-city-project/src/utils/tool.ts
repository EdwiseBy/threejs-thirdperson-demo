/**
 * @description: 函数节流，普通防连点
 * @param {(Function, number?)}
 * @return {Function}
 */
export const _throttle = (fun: Function, delay = 2000) => {
    let last: any, deferTimer: any;
    return function () {
        let now = +new Date();
        if (last && now < last + delay) {
            clearTimeout(deferTimer);
            deferTimer = setTimeout(() => {
                last = now;
            }, delay);
        } else {
            last = now;
            //@ts-ignore
            return fun.apply(this, arguments);
        }
    };
};

export const wait = (time: number) => {
    return new Promise((r) => {
        setTimeout(() => {
            r(null);
        }, time)
    })
}