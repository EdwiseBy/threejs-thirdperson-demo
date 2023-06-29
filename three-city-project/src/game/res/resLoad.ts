import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { GLTFLoader } from "../module";

export const gltfLoader: GLTFLoader = new GLTFLoader();
export const loadGltf = (url: string, onProgress?: (event: ProgressEvent<EventTarget>) => void):Promise<GLTF> => {
    return new Promise((r, j) => {
        gltfLoader.load(url, (gltf) => {
            r(gltf);
        }, onProgress, (e) => {
            j(e);
        })
    })
}