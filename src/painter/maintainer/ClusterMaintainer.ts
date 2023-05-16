import { Mesh } from "../../3d/Mesh";
import { Material } from "../../DBBH";
import { Vector4 } from "../../math/Vector4";

export type ClusterStruct = {
    // sampleIndexOfInstanceMap: number; // u32
    // sampleIndexOfTransform: number; // u32
    // materialId: number; // u32
    // level: number;   //u32
    // box3: Vector3[]; //  max min  vec3[2]
    // write down as vec4*4 now we have 6 custom value
    min: Vector4;
    max: Vector4;
    custom: Vector4;
    ssml: Vector4;

}

export class ClusterMaintainer {

    // init ssbo. may be can read it from json config file.
    vertexBuffer = new Float32Array(268435456); // 1G = 1073741824 = 4 * 268435456
    uboBuffer = new Float32Array();
    clusters: ClusterStruct[] = [];
    inputBuffer = new Float32Array();
    outputBuffer = new Float32Array();
    oldMesh = new Set<Mesh>();
    maintain(meshes: Mesh[]) {
        const vertexBuffer = this.vertexBuffer;
        const clusters = this.clusters;
        const tempBuffer: number[] = [];
        let inputBuffer = this.inputBuffer;
        let outputBuffer = this.outputBuffer;
        let currentOffset = 0;
        let instanceCount = 0;
        let instanceIDMap = [];
        let outOfMemoryObjects = []; // this objects will use normal way to draw.
        const isFirst = clusters.length === 0;
        // ********* todo check out of memory *********
        if (isFirst) {
            for (let i = 0; i < meshes.length; i++) {
                const mesh = meshes[i];
                // mesh.updateWorldMatrix() // already updated
                mesh.geometry.computeWorldBox(mesh.worldMatrix);
                // if(mesh.material instanceof Array){
                // const subMeshs = mesh.getSubMeshs();
                // for(let idx =0;idx<subMeshs.length;idx++)subMeshs[i].do stuff like follow
                // }
                // we only support material which is not an array now 
                const stride = mesh.geometry.stride;
                const meshClusterInfo = mesh.getOrGenerateClusterInformation();

                for (let level = 0; level < meshClusterInfo.length; level++) {
                    const vertices = meshClusterInfo[level];
                    vertexBuffer.set(vertices, currentOffset);
                    // record cluster info
                    const clusterCount = vertices.length / stride / 3 / Mesh.CLUSTER_SIZE;
                    mesh.clusterInfo[level] = [instanceCount, instanceCount + clusterCount];

                    /*
                    Mesh{
                        clusterInfo0:[instanceCount, instanceCount + clusterCount],
                        ...,
                        clusterInfoN:[instanceCount, instanceCount + clusterCount]
                    }
                    */

                    for (let count = 0; count < clusterCount; count++) {
                        clusters.push({
                            ssml: new Vector4(instanceCount, i, (mesh.material as Material).id, level),
                            min: mesh.geometry.wBox3.min.toVector4(),
                            max: mesh.geometry.wBox3.max.toVector4(),
                            custom: new Vector4()
                        });
                        tempBuffer.push(instanceCount, i, (mesh.material as Material).id, level,
                            ...mesh.geometry.wBox3.min.toVector4().toArray(),
                            ...mesh.geometry.wBox3.max.toVector4().toArray(),
                            1, 1, 1, 1
                        )
                        instanceIDMap[instanceCount++] = currentOffset + count * Mesh.CLUSTER_SIZE * stride;
                    }
                    // update offset
                    currentOffset += vertices.length;
                }

                this.oldMesh.add(mesh);
            }
            inputBuffer = Float32Array.from(tempBuffer);
            outputBuffer = new Float32Array(tempBuffer.length);
        } else {
            // add new or alter old...... maintain
        }
        return { instanceIDMap, clusters, inputBuffer, outputBuffer, vertexBuffer, outOfMemoryObjects }

    }
}