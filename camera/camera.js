// const aspect = Math.abs(canvas.width / canvas.height);
// mat4.perspective(projectionMatrix, (2 * Math.PI) / 5, aspect, 1, 100.0);
class CameraMeta {
    constructor(canvas, fov, near, far) {
        this.matrixWorldElements = [];
        this.projectionMatrixElements = [];
        const aspect = Math.abs(canvas.width / canvas.height);
        mat4.lookAt(this.matrixWorldElements, [0, 0, 1], [0, 0, 0], [0, 1, 0]);
        mat4.perspective(this.projectionMatrixElements, fov, aspect, near, far); // (2 * Math.PI) / 5, aspect, 1, 100.0
        this.init();

    }
    init() {
    }
    update() {
        // jitter
    }
}
export class PerspectiveCamera extends CameraMeta {
    constructor(canvas, fov, near, far) {
        super(canvas, fov, near, far);
    }
}