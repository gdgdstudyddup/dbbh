import { generateUUID } from "../math/MathUtils";
import { Vector3 } from "../math/Vector3";

export class Object3D {
    static DefaultUp = new Vector3(0, 0, 1);
    uuid = generateUUID();
    tag: string;
    children: Object3D[];

    addObject(object: Object3D) {
        this.children.push(object);
        // object.updateSomeInformation
    }

    removeObject(object: Object3D) {
        // do something such as follow
        // transform = object.getWorldTransform
        // remove from this.children
        // object.setTransform(transform)
    }
}