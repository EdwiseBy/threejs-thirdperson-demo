import { SphereCollsionComponent } from "../component/collsionComponent/sphereCollsionComponent";
import { collsionMgr } from "../manager/colllsion/collsionManager";
import { Three } from "../module";
import { BaseActor } from "./baseActor";

export class SphereActor extends BaseActor {
    model!: Three.Mesh;
    collider!: SphereCollsionComponent;
    constructor(radius: number, color: number) {
        super();
        this.init(radius, color);
    }
    init(radius: number, color: number) {
        const geometry = new Three.SphereGeometry(radius);
        const material = new Three.MeshLambertMaterial({ color });
        this.model = new Three.Mesh(geometry, material);
        this.add(this.model);

        this.collider = new SphereCollsionComponent({ centerPoint: this.position.clone(), radius: radius });
        this.collider.setOwner(this);
        this.collider.setUpdateComponent(this);
        collsionMgr?.addCollsionComponent(this.collider);
    }

    setPosition(vector: Three.Vector3) {
        this.collider.translate(vector.clone().sub(this.position));
    }
    
}