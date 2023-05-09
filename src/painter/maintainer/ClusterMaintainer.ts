import { Mesh } from "../../3d/Mesh";

export class ClusterMaintainer { 

    vertexBuffer = new Float32Array();
    uboBuffer = new Float32Array();
    maintain(meshes: Mesh[]){
        for (let i = 0; i < meshes.length; i++) {
            const mesh = meshes[i];
            // mesh.updateWorldMatrix() // already updated
            const meshClusterInfo = mesh.getOrGenerateClusterInformation();
        }
    }
}