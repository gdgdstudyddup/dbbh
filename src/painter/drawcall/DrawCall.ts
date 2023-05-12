import { Mesh } from "../../3d/Mesh";
// import { Box3 } from "../../math/Box3";
import { ClusterStruct } from "../maintainer/ClusterMaintainer";
//
// enum RenderType {
//     OpaqueNormal,
//     Transparent
// }
// enum Strategy {
//     LODByObject,
//     LODByCluster
// }

// export class DrawCall {
//     renderType: RenderType;
//     lodLevel: number;
//     vertices: [];
//     indices: [];
//     materialId: number;
//     textureId: number;
// }

export class DrawCallList {
    vertexBuffer: Float32Array;
    clusters: ClusterStruct[] = [];
    clustersBuffer: GPUBuffer;
    opaque: Mesh[] = [];
    transparent: Mesh[] = [];
}