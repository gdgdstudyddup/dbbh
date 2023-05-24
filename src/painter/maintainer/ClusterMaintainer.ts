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
/**
 * InputBuffer Clusters  there need a anotherBuffer 
 * globalCluserIndex, transformMatrixInformationIndex, materialId, level
 * min Box3.toVec4
 * max Box3.toVec4
 * custom vec4
 * 
 * ReTestBuffer used to hold re-culling-test results
 * globalCluserIndex transformMatrixInformation,materialId, level
 * min Box3.toVec4
 * max Box3.toVec4
 * custom vec4
 * 
 * CullPassedBuffer same size as inputBuffer 
 * its constructed by the clusters which pass the culling test.
 *
 * 
 * MeshBuffer f32*16
 * lod0 x y[clusterIndexStart clusterIndexEnd]  z w lod1 [clusterIndexStart clusterIndexEnd]
 * lod2 x y[clusterIndexStart clusterIndexEnd]  z w lod3 [clusterIndexStart clusterIndexEnd]
 * min Box3.toVec4
 * max Box3.toVec4
 * 
 * CullFailedBuffer
 * its constructed by the mesh which fail the culling test, it will re-culling-test later.
 */
export class ClusterMaintainer {

    // init ssbo. may be can read it from json config file.
    // 134217728
    // 67108863
    // 33554431
    vertexBuffer = new Float32Array(33554431); // max buffer size limit (268435456).
    uboBuffer: number[] = [];
    clusters: ClusterStruct[] = [];
    meshBuffer = new Float32Array(); // 
    meshClusterOffset: number[] = [];
    inputBuffer = new Float32Array();
    reTestBuffer = new Float32Array();
    cullPassedBuffer = new Float32Array();
    cullFailedBuffer = new Float32Array(); // it is mesh, its not cluster 
    oldMesh = new Set<Mesh>();
    maintain(meshes: Mesh[]) {
        const vertexBuffer = this.vertexBuffer;
        const clusters = this.clusters;
        const tempBuffer: number[] = [];
        let cullPassedBuffer = this.cullPassedBuffer;
        let meshBuffer = [];
        let currentOffset = 0;
        let instanceCount = 0;
        let instanceIDMap: number[] = [];
        let outOfMemoryObjects = []; // this objects will use normal way to draw.
        const isFirst = clusters.length === 0;
        // ********* TODO check out of memory *********
        if (isFirst) {
            //stride = 4 * 2 + 4 + 4  4level*2 + bbx min + bbx max
            meshBuffer = new Array(16 * meshes.length);
            for (let i = 0; i < meshes.length; i++) {
                const mesh = meshes[i];
                this.uboBuffer.push(...mesh.worldMatrix.elements);
                // mesh.updateWorldMatrix() // already updated
                mesh.geometry.computeWorldBox(mesh.worldMatrix);
                // if(mesh.material instanceof Array){
                // const subMeshs = mesh.getSubMeshs();
                // for(let idx =0;idx<subMeshs.length;idx++)subMeshs[i].do stuff like follow
                // }
                // we only support material which is not an array now 
                const stride = mesh.geometry.stride;
                const meshClusterInfo = mesh.getOrGenerateClusterInformation();
                // we just assume every mesh have same lod levels 4. need to optimize in the future. because they needn't have same number of lod levels.
                meshBuffer[i * 16 + 8] = mesh.geometry.wBox3.min.x;
                meshBuffer[i * 16 + 9] = mesh.geometry.wBox3.min.y;
                meshBuffer[i * 16 + 10] = mesh.geometry.wBox3.min.z;
                meshBuffer[i * 16 + 11] = 1
                meshBuffer[i * 16 + 12] = mesh.geometry.wBox3.max.x;
                meshBuffer[i * 16 + 13] = mesh.geometry.wBox3.max.y;
                meshBuffer[i * 16 + 14] = mesh.geometry.wBox3.max.z;
                meshBuffer[i * 16 + 15] = 1

                for (let level = 0; level < meshClusterInfo.length; level++) {
                    const vertices = meshClusterInfo[level];
                    vertexBuffer.set(vertices, currentOffset);
                    // record cluster info
                    const clusterCount = vertices.length / stride / 3 / Mesh.CLUSTER_SIZE;
                    mesh.clusterInfo[level * 2] = instanceCount;
                    mesh.clusterInfo[level * 2 + 1] = instanceCount + clusterCount - 1;
                    meshBuffer[i * 16 + level * 2] = instanceCount; // cluster index;
                    meshBuffer[i * 16 + level * 2 + 1] = instanceCount + clusterCount - 1;
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
            this.inputBuffer = Float32Array.from(tempBuffer);
            this.cullPassedBuffer = new Float32Array(tempBuffer.length);
            this.reTestBuffer = new Float32Array(tempBuffer.length);
            this.meshBuffer = Float32Array.from(meshBuffer);
            this.cullFailedBuffer = Float32Array.from(meshBuffer);
            console.log('meshBuffer',meshBuffer)
            // for (let i = 0; i < tempBuffer.length; i += 16) {
            //     console.log(i/16, tempBuffer[i], tempBuffer[i + 1]);
            // }
        } else {
            // add new or alter old...... maintain
        }
        return {
            instanceIDMap,
            clusters,
            meshBuffer: this.meshBuffer,
            inputBuffer: this.inputBuffer,
            reTestBuffer: this.reTestBuffer,
            cullPassedBuffer: this.cullPassedBuffer,
            cullFailedBuffer: this.cullFailedBuffer,
            vertexBuffer,
            uboBuffer: this.uboBuffer,
            outOfMemoryObjects
        }

    }
}