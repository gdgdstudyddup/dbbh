import { Box3 } from "../../math/Box3";

enum RenderType {
    OpaqueNormal,
    Transparent
}
enum Strategy {
    LODByObject,
    LODByCluster
}

export class DrawCall {
    renderType: RenderType;
    lodLevel: number;
    vertices: [];
    indices: [];
    materialId: number;
    textureId: number;
}

export class Cluster  {
    strategy = Strategy.LODByObject;
    offset: number;
    Box3: Box3;
}

export class DrawCallList {
    clusters: Cluster[] = [];
    opaque: DrawCall[] = [];
    transparent: DrawCall[] = [];
}