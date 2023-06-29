import { configure, makeAutoObservable } from 'mobx';
configure({
    enforceActions: "never",
    useProxies: "always",
});
const store = makeAutoObservable({
    curLabel:''
});
export default store;
