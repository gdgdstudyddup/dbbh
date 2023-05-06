import { Camera } from "./camera/Camera";
import { Object3D } from "./Object3D";

// put Object3D in the Hall then the assistant take the painter to the correspond camera place to do paint job
export class Hall extends Object3D {
    isActive = false; // true means draw.
    cameras: [];
    mainCamera: Camera;
    hasCamera() {
        return this.cameras.length > 0;
    }
}