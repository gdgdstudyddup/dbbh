import { DEG2RAD } from "../../math/MathUtils";
import { Matrix4 } from "../../math/Matrix4";
import { Object3D } from "../Object3D";

export class Camera extends Object3D { // post precess may be set on camera.
    modelViewMatrix: Matrix4;
    worldMatrixInverse: Matrix4;
    useOutline = false;
    useBloom = false;
    useTaa = true;
    useSSAO = false;
    useSSR = false;


    constructor(){
        super();
        this.worldMatrixInverse = new Matrix4();
    }
    updateWorldMatrix(force) {

        super.updateWorldMatrix(force);

        this.worldMatrixInverse.copy(this.worldMatrix).invert();

    }

    manuallyUpdateMatrix(updateParents, updateChildren) {

        super.manuallyUpdateMatrix(updateParents, updateChildren);

        this.worldMatrixInverse.copy(this.worldMatrix).invert();

    }
}

export class PerspectiveCamera extends Camera {
    near: number;
    far: number;
    fov: number;
    aspect: number;
    zoom: number;
    projectionMatrix: Matrix4;
    projectionMatrixInverse: Matrix4;
    // 1000 = 1m
    constructor(fov = 50, aspect = 1, near = 10, far = 500000) {
        super();
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.projectionMatrix = new Matrix4();
        this.projectionMatrixInverse = new Matrix4();
        this.updateProjectionMatrix();
    }

    updateProjectionMatrix() { // jitter to be continue;

        this.projectionMatrix.makePerspective(DEG2RAD * this.fov, this.aspect, this.near, this.far);

        this.projectionMatrixInverse.copy(this.projectionMatrix).invert();

    }
}

export class OrthoCamera extends Camera {

}