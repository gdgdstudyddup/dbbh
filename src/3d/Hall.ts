import { Camera } from "./camera/Camera";
import { Object3D } from "./Object3D";

// put Object3D in the Hall then the assistant take the painter to the correspond camera place to do paint job
export class Hall extends Object3D {
    isActive = false; // true means draw.
    cameras: Camera[] = [];
    mainCamera: Camera;
    constructor(active: boolean) {
        super();
        this.isActive = active;
    }
    setMainCamera(camera: Camera, autoPush = true) {
        this.mainCamera = camera;
        if (autoPush) {
            this.cameras.push(camera);
        }
    }

    hasCamera() {
        return this.cameras.length > 0;
    }
}