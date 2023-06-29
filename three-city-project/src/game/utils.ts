export const isInfinity = (value: number) => {
    return Math.abs(value) === Infinity
}

/** 安全值，检查value是一个安全的数值或对象 */
export const safeValue = (value: any) => {
    if (typeof (value) === 'number') return !isNaN(value) && !isInfinity(value);
    return value !== null && value !== undefined;
}

/** number型的插值 */
export const nlerp = (curNumber: number, targetNumber: number, alpha: number) => {
    return curNumber + (targetNumber - curNumber) * alpha
}