import { bunny_buffer_geometry } from '../assets/bunny.js'
class DataFlowCenter {
    constructor() {

    }
    get_data(gpu) { // get the formality format data.
        const colorOffset = 4 * 4;
        const vertexSize = 4 * 8;
        let verticesArray = new Float32Array([
            // float32x4 position, float32x4 color
            1, -1, 1, 1, 1, 0, 1, 1,
            -1, -1, 1, 1, 0, 0, 1, 1,
            -1, -1, -1, 1, 0, 0, 0, 1,
            1, -1, -1, 1, 1, 0, 0, 1,
            1, -1, 1, 1, 1, 0, 1, 1,
            -1, -1, -1, 1, 0, 0, 0, 1,

            1, 1, 1, 1, 1, 1, 1, 1,
            1, -1, 1, 1, 1, 0, 1, 1,
            1, -1, -1, 1, 1, 0, 0, 1,
            1, 1, -1, 1, 1, 1, 0, 1,
            1, 1, 1, 1, 1, 1, 1, 1,
            1, -1, -1, 1, 1, 0, 0, 1,

            -1, 1, 1, 1, 0, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, -1, 1, 1, 1, 0, 1,
            -1, 1, -1, 1, 0, 1, 0, 1,
            -1, 1, 1, 1, 0, 1, 1, 1,
            1, 1, -1, 1, 1, 1, 0, 1,

            -1, -1, 1, 1, 0, 0, 1, 1,
            -1, 1, 1, 1, 0, 1, 1, 1,
            -1, 1, -1, 1, 0, 1, 0, 1,
            -1, -1, -1, 1, 0, 0, 0, 1,
            -1, -1, 1, 1, 0, 0, 1, 1,
            -1, 1, -1, 1, 0, 1, 0, 1,

            1, 1, 1, 1, 1, 1, 1, 1,
            -1, 1, 1, 1, 0, 1, 1, 1,
            -1, -1, 1, 1, 0, 0, 1, 1,
            -1, -1, 1, 1, 0, 0, 1, 1,
            1, -1, 1, 1, 1, 0, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1,

            1, -1, -1, 1, 1, 0, 0, 1,
            -1, -1, -1, 1, 0, 0, 0, 1,
            -1, 1, -1, 1, 0, 1, 0, 1,
            1, 1, -1, 1, 1, 1, 0, 1,
            1, -1, -1, 1, 1, 0, 0, 1,
            -1, 1, -1, 1, 0, 1, 0, 1,
            //
            // float32x4 position, float32x4 color
            1, -1, 1, 1, 1, 0, 1, 1,
            -1, -1, 1, 1, 0, 0, 1, 1,
            -1, -1, -1, 1, 0, 0, 0, 1,
            1, -1, -1, 1, 1, 0, 0, 1,
            1, -1, 1, 1, 1, 0, 1, 1,
            -1, -1, -1, 1, 0, 0, 0, 1,

            1, 1, 1, 1, 1, 1, 1, 1,
            1, -1, 1, 1, 1, 0, 1, 1,
            1, -1, -1, 1, 1, 0, 0, 1,
            1, 1, -1, 1, 1, 1, 0, 1,
            1, 1, 1, 1, 1, 1, 1, 1,
            1, -1, -1, 1, 1, 0, 0, 1,

            -1, 1, 1, 1, 0, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, -1, 1, 1, 1, 0, 1,
            -1, 1, -1, 1, 0, 1, 0, 1,
            -1, 1, 1, 1, 0, 1, 1, 1,
            1, 1, -1, 1, 1, 1, 0, 1,

            -1, -1, 1, 1, 0, 0, 1, 1,
            -1, 1, 1, 1, 0, 1, 1, 1,
            -1, 1, -1, 1, 0, 1, 0, 1,
            -1, -1, -1, 1, 0, 0, 0, 1,
            -1, -1, 1, 1, 0, 0, 1, 1,
            -1, 1, -1, 1, 0, 1, 0, 1,

            1, 1, 1, 1, 1, 1, 1, 1,
            -1, 1, 1, 1, 0, 1, 1, 1,
            -1, -1, 1, 1, 0, 0, 1, 1,
            -1, -1, 1, 1, 0, 0, 1, 1,
            1, -1, 1, 1, 1, 0, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1,

            1, -1, -1, 1, 1, 0, 0, 1,
            -1, -1, -1, 1, 0, 0, 0, 1,
            -1, 1, -1, 1, 0, 1, 0, 1,
            1, 1, -1, 1, 1, 1, 0, 1,
            1, -1, -1, 1, 1, 0, 0, 1,
            -1, 1, -1, 1, 0, 1, 0, 1,
        ]);
        
        for (let index = 0; index < 36*8; index+=8) {
            verticesArray[index]  -=1.2;

        }
        for (let index = 36*8; index < 72*8; index+=8) {
            verticesArray[index]  +=1.2;
            verticesArray[index+1]  += 0.3;
            verticesArray[index+2]  += 0.1;

        }
        const indicesArray = new Uint16Array(72);
        const verticesBufferDescriptor = {
            size: verticesArray.byteLength,
            usage: GPUBufferUsage.VERTEX,
            mappedAtCreation: true,
        };
        const verticesBuffer = gpu.device.createBuffer(verticesBufferDescriptor)
        const verticesArrayBuffer = verticesBuffer.getMappedRange();

        const verticesWriteArray = new Float32Array(verticesArrayBuffer);
        verticesWriteArray.set(verticesArray);
        verticesBuffer.unmap();
        //
        console.log(indicesArray.byteLength, GPUBufferUsage.INDEX)
        const indicesBufferDescriptor = {
            size: indicesArray.byteLength,
            usage: GPUBufferUsage.INDEX,
            mappedAtCreation: true,

        }
        const indicesBuffer = gpu.device.createBuffer(indicesBufferDescriptor)
        const indicesArrayBuffer = indicesBuffer.getMappedRange();

        const indicesWriteArray = new Uint16Array(indicesArrayBuffer);
        indicesWriteArray.set(indicesArray);
        indicesBuffer.unmap();
        return {
            position: verticesBuffer,
            index:indicesBuffer
        }

        // const data = {
        //     position: new Float32Array(bunny_buffer_geometry.data.attributes.position.array),
        //     index: new Uint32Array(bunny_buffer_geometry.data.index.array),
        // }
        // const vertices_descriptor = {
        //     size: data.position.byteLength,
        //     usage: GPUBufferUsage.VERTEX,
        //     mappedAtCreation: true,
        // };
        // const vertices_buffer = gpu.device.createBuffer(vertices_descriptor)
        // const vertices_array_buffer = vertices_buffer.getMappedRange();

        // const vertices_write_array = new Float32Array(vertices_array_buffer);
        // vertices_write_array.set(data.position);
        // vertices_buffer.unmap();

        // const indices_descriptor = {
        //     size: data.index.byteLength,
        //     usage: GPUBufferUsage.INDEX,
        //     mappedAtCreation: true,
        // }
        // const indices_buffer = gpu.device.createBuffer(indices_descriptor)
        // const indices_array_buffer = indices_buffer.getMappedRange();

        // const indices_write_array = new Uint16Array(indices_array_buffer);
        // indices_write_array.set(data.index);
        // indices_buffer.unmap();
        // data.position = vertices_buffer;
        // data.index = indices_buffer;
        // return data;
    }
    // get_shadow_data() maybe only set some parameter is enough just like main camera lod level 
}
export const data_flow_center = new DataFlowCenter();