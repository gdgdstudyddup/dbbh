import { Drawable } from "./Drawable";
import { Geometry } from "./geometry/Geometry";
import { Material } from "./material/Material";

// Mesh means triangle stuff
export class Mesh extends Drawable {
    constructor(geometry: Geometry, material: Material | Material[]) {
        super(geometry, material);
    }
}