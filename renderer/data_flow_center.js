import { bunny_buffer_geometry } from '../assets/bunny.js'
class DataFlowCenter {
    constructor() {

    }
    get_data(gpu) { // get the formality format data.
        const data = {
            position: new Float32Array(bunny_buffer_geometry.data.attributes.position.array),
            index: new Uint32Array(bunny_buffer_geometry.data.index.array),
        }
        const vertices_descriptor = {
            size: data.position.byteLength,
            usage: GPUBufferUsage.VERTEX,
            mappedAtCreation: true,
        };
        const vertices_buffer = gpu.device.createBuffer(vertices_descriptor)
        const vertices_array_buffer = vertices_buffer.getMappedRange();

        const vertices_write_array = new Float32Array(vertices_array_buffer);
        vertices_write_array.set(data.position);
        vertices_buffer.unmap();

        const indices_descriptor = {
            size: data.index.byteLength,
            usage: GPUBufferUsage.INDEX,
            mappedAtCreation: true,
        }
        const indices_buffer = gpu.device.createBuffer(indices_descriptor)
        const indices_array_buffer = indices_buffer.getMappedRange();

        const indices_write_array = new Uint16Array(indices_array_buffer);
        indices_write_array.set(data.index);
        indices_buffer.unmap();
        data.position = vertices_buffer;
        data.index = indices_buffer;
        return data;
    }
    // get_shadow_data() maybe only set some parameter is enough just like main camera lod level 
}
export const data_flow_center = new DataFlowCenter();