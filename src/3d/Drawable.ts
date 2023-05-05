import { Geometry } from "./geometry/geometry";
import { Material } from "./material/Material";
import { Object3D } from "./Object3D";

class Drawable extends Object3D {
    geometry: Geometry;
    material: Material;
    constructor(geometry: Geometry, material: Material | Material[]) {
        super();
    }

    convertToCluster(){
        
    }
}