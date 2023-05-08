import { Drawable } from "./Drawable";
import { Geometry } from "./geometry/Geometry";
import { Material } from "./material/Material";


// Mesh means triangle stuff
export class Mesh extends Drawable {
    static CLUSTER_SIZE = 128;
    LOD: Mesh[] = [];
    clusters: Array<Float32Array>;
    /**
     * {
            name: 'position',
            size: 3,
            type: 'f32'
        },
        {
            name: 'uv',
            size: 2,
            type: 'f32'

        }
     */
    verticesInfo = [];
    constructor(geometry: Geometry, material: Material | Material[], cluster = true) {
        super(geometry, material);
        if (cluster) {
            this.tag = 'cluster';
        }
        this.setLODMesh(this);
    }

    setLODMesh(mesh: Mesh, level = 0) {
        this.LOD[level] = mesh;
    }

    setVertices(name: string, size: number, type: string, newData: Float32Array) {
        const data = [];
        const oldStride = this.geometry.stride;
        if (oldStride === 0) {
            this.geometry.stride = size;
            this.geometry.vertices = newData;
            this.verticesInfo.push({
                name,
                size,
                type
            })
        } else {
            let index = 0;
            for (let i = 0; i < this.geometry.vertices.length; i++) {
                data.push(this.geometry.vertices[i]);
                if (i % oldStride === (oldStride - 1)) {
                    data.push(newData[index++]);
                }
            }
            this.geometry.stride = oldStride + size;
            this.geometry.vertices = new Float32Array(data);
            this.verticesInfo.push({
                name,
                size,
                type
            })
        }

    }


    removeVertices(name: string) {
        const oldIndex = this.verticesInfo.findIndex(v => v.name === name);
        if (oldIndex !== -1) {
            const info = this.verticesInfo[oldIndex];
            let stride = info.size;
            let start = 0;
            for (let i = 0; i < oldIndex; i++) {
                start += this.verticesInfo[i].size;
            }
            const data = [];
            const oldStride = this.geometry.stride;
            let temp;
            for (let i = 0; i < this.geometry.vertices.length; i++) {
                temp = i % oldStride;
                if (!(start < temp && temp < start + stride)) {
                    data.push(this.geometry.vertices[i]);
                }
            }
            this.geometry.stride = oldStride - info.size;
            this.geometry.vertices = new Float32Array(data);
            this.verticesInfo.splice(oldIndex, 1);
        }
    }

    setIndex(index: Uint16Array) {
        this.geometry.index = index;
    }

    removeIndex() {
        this.geometry.index = undefined;
    }

    getOrGenerateClusterInformation() {
        if (this.clusters) { return this.clusters; }
        this.generateClusterInformation();
        return this.clusters;
    }

    generateClusterInformation() {
        // need a prepare op add material id into vertices
        const clusters: Array<Float32Array> = []
        for (let level = 0; level < this.LOD.length; level++) {
            const lodMesh = this.LOD[level];
            const { geometry, material } = lodMesh;
            if (material instanceof Array) {
                // todo
            }
            else {
                // vertices [xyzuv xyzuv xyzuv  xyzuv xyzuv xyzuv] index [0 1 2  3 4 5] index * stride + offset
                const vertices = geometry.vertices;
                const lodCluster: number[] = [];
                let triangleCounts = 0;
                if (geometry.index) {
                    for (let i = 0; i < geometry.index.length; i++) {
                        for (let offset = 0; offset < geometry.stride; offset++) {
                            lodCluster.push(vertices[i * geometry.stride + offset]); // float32
                        }
                        if (i % 3 === 0) {
                            triangleCounts++;
                        }
                    }
                } else {
                    for (let i = 0; i < vertices.length; i++) {
                        lodCluster.push(vertices[i]);
                    }
                    triangleCounts = vertices.length / geometry.stride / 3;
                }
                const needVerticesCounts = (Mesh.CLUSTER_SIZE - triangleCounts % Mesh.CLUSTER_SIZE) * 3;
                for (let i = 0; i < needVerticesCounts; i++) {
                    for (let offset = 0; offset < geometry.stride; offset++) { lodCluster.push(0.0); }
                }
                clusters[level] = new Float32Array(lodCluster);
            }
        }
        return clusters;
    }
}