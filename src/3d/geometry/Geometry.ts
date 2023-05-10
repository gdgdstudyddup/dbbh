import { Box3 } from "../../math/Box3";

export class Geometry {
    vertices: Float32Array;
    index?: Uint16Array;
    /**
     * stride of vertices
     */
    stride: number;
    box3:Box3;
}