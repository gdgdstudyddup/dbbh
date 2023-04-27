import { BBox } from "../../math/BBox";

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
    bbox: BBox;
}

export class DrawCallList {
    clusters: Cluster[] = [];
    opaque: DrawCall[] = [];
    transparent: DrawCall[] = [];
}