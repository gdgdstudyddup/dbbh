import { Mesh } from "../../3d/Mesh";
import { Vector3 } from "../../math/Vector3";
export type ClusterStruct = {
    sampleIndexOfInstanceMap: number;
    sampleIndexOfTransform: number;
    box3: Vector3[]; // 8 vec3
}
export class ClusterMaintainer {

    vertexBuffer = new Float32Array(268435456); // 1G = 1073741824 = 4 * 268435456
    uboBuffer = new Float32Array();
    clusters: ClusterStruct[] = [];
    oldMesh = new Set<Mesh>();
    maintain(meshes: Mesh[]) {
        const vertexBuffer = this.vertexBuffer;
        const clusters = this.clusters;
        let currentOffset = 0;
        let instanceIDMap = [];
        let instanceCount = 0;
        let outOfMemoryObjects = []; // this objects will use normal way to draw.
        const isFirst = clusters.length === 0;
        // ********* todo check out of memory *********
        if (isFirst) {
            for (let i = 0; i < meshes.length; i++) {
                const mesh = meshes[i];
                // mesh.updateWorldMatrix() // already updated
                const stride = mesh.geometry.stride;
                const meshClusterInfo = mesh.getOrGenerateClusterInformation();
                for (let level = 0; level < meshClusterInfo.length; level++) {
                    const vertices = meshClusterInfo[level];
                    vertexBuffer.set(vertices, currentOffset);
                    // record cluster info
                    const clusterCount = vertices.length / stride / Mesh.CLUSTER_SIZE;

                    for (let count = 0; count < clusterCount; count++) {
                        clusters.push({
                            sampleIndexOfInstanceMap: instanceCount,
                            sampleIndexOfTransform: i,
                            box3: mesh.geometry.box3.getCorners()
                        });
                        instanceIDMap[instanceCount++] = currentOffset + count * Mesh.CLUSTER_SIZE * stride;
                    }
                    // update offset
                    currentOffset += vertices.length;
                }
                this.oldMesh.add(mesh);
            }
        } else {
            // add new or alter old
        }
        return { clusters, vertexBuffer, outOfMemoryObjects }
    }
}