import { Box3 } from "../../math/Box3";
import { Matrix4 } from "../../math/Matrix4";
import { Vector3 } from "../../math/Vector3";
export type Attribute_Info = {
    name: string;
    size: number;
    type: string;
}

export class Geometry {
    vertices: Float32Array;
    index?: Uint16Array;
    /**
     * stride of vertices
     */
    stride: number;
    box3: Box3;
    wBox3: Box3;
    verticesInfo: Attribute_Info[] = [];
    constructor() {
        this.stride = 0;
        this.box3 = new Box3();
        this.wBox3 = new Box3();
    }

    computeBoundingBox() {
        const positionIndex = this.verticesInfo.findIndex(v => v.name === 'position');
        let position = new Vector3();
        if (positionIndex !== -1) {
            const info = this.verticesInfo[positionIndex];
            let stride = info.size;
            let start = 0;
            for (let i = 0; i < positionIndex; i++) {
                start += this.verticesInfo[i].size;
            }
            for (let i = start; i < this.vertices.length; i += stride) {
                position.set(this.vertices[i], this.vertices[i + 1], this.vertices[i + 2]);
                this.box3.expandByPoint(position);
            }
        }
    }

    computeWorldBox(matrix: Matrix4) {
        this.computeBoundingBox();
        this.wBox3 = this.box3.clone().applyMatrix4(matrix);
    }
}