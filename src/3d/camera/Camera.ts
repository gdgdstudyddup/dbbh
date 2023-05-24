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
    isCamera = true;


    constructor() {
        super();
        this.worldMatrixInverse = new Matrix4();
    }

    updateWorldMatrix(force = true) {

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
    zoom = 1;
    filmOffset = 0;
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

        // this.projectionMatrix.makePerspective((Math.PI) / 180 * this.fov, this.aspect, this.near, this.far);
        const near = this.near;
        let top = near * Math.tan(DEG2RAD * 0.5 * this.fov) / this.zoom;
        let height = 2 * top;
        let width = this.aspect * height;
        let left = - 0.5 * width;
        // const view = this.view;

        // if ( this.view !== null && this.view.enabled ) {

        // 	const fullWidth = view.fullWidth,
        // 		fullHeight = view.fullHeight;

        // 	left += view.offsetX * width / fullWidth;
        // 	top -= view.offsetY * height / fullHeight;
        // 	width *= view.width / fullWidth;
        // 	height *= view.height / fullHeight;

        // }

        // const skew = this.filmOffset;
        // if ( skew !== 0 ) left += near * skew / this.getFilmWidth();

        this.projectionMatrix.makePerspective(left, left + width, top, top - height, near, this.far);

        this.projectionMatrixInverse.copy(this.projectionMatrix).invert();

    }
}

export class OrthoCamera extends Camera {

}