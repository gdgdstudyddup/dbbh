import { data_flow_center } from '../data_flow_center.js';
export class ClusterRenderer {
    constructor(parameter) {
        const { webgpu, camera } = parameter;
        console.log(webgpu, camera);
        this.camera = camera;
        this.gpu = webgpu;
    }
    update_camera_and_get_vp() {
        const camera = this.camera;
        const gpu = this.gpu;
        camera.update();
        const viewProjectionMatrix = mat4.create();
        const viewMatrix = mat4.create();
        mat4.invert(viewMatrix, camera.matrixWorldElements);
        mat4.multiply(viewProjectionMatrix, camera.projectionMatrixElements, viewMatrix);
        gpu.device.queue.writeBuffer(gpu.static_bind_group.bind_buffer, 0, viewProjectionMatrix);
        // return viewProjectionMatrix;
    }
    render() {
        const gpu = this.gpu;
        // pure data
        const data = data_flow_center.get_data();
        this.update_camera_and_get_vp();

        {// const commandEncoder = gpu.device.createCommandEncoder();
        // renderPassDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView();
        // const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

        // // Encode drawing commands

        // passEncoder.setPipeline(renderPipeline);
        // // Vertex attributes
        // passEncoder.setVertexBuffer(0, data.position);
        // passEncoder.setIndexBuffer(data.index, 'uint16');
        // // Bind groups
        // passEncoder.setBindGroup(0, gpu.static_bind_group.bind_group);
        }
        let testDraw = new Uint32Array(5);
            testDraw[0] = data.index.length;
            testDraw[1] = 1;
            testDraw[2] = 0;
            testDraw[3] = 0;
            testDraw[4] = 0;
        let testBuffer = gpu.device.createBuffer({
            size: testDraw.byteLength,
            usage: GPUBufferUsage.INDIRECT | GPUBufferUsage.COPY_DST
        });
        gpu.device.queue.writeBuffer(testBuffer, 0, testDraw);
        // passEncoder.drawIndexedIndirect(testBuffer, 0);


        // compute stuff occlusion cull re-sort choose lod
        // device.queue.writeBuffer(transformBuffer, 0, modelViewProjectionMatrix);
        // render stuff
        // taa maybe next time? no, do it this time
        // record stuff maybe next time~
    }
}