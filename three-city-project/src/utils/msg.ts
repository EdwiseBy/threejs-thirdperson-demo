export const msg = (suc: boolean, option: { code?: any, msg?: any, data?: any }) => {
    const { code, msg, data } = option
    return { suc: suc, code: code, msg: msg, data: data };
}