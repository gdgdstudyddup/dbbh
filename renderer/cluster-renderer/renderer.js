import { data_flow_center } from '../data_flow_center.js';
export class ClusterRenderer {
    constructor(parameter) {
        const { gpu } = parameter;
        this.gpu = gpu;
        const default_shader = gpu.pipeline_factor.create_shader_module();
        const default_layout = gpu.pipeline_factor.create_pipeline_layout();
        const default_render_descriptor = gpu.pipeline_factor.create_descriptor({
            shader_module: default_shader,
            layout: default_layout
        });
        this.render_pipeline = gpu.pipeline_factor.create_render_pipeline(default_render_descriptor);
        this.pass = gpu.pass_factor.create_descriptor({
            colorAttachments: [new ColorAttachment()],
            depthStencilAttachment: new DepthStencilAttachment()
        })
    }

    update_camera_and_get_vp(camera) {
        const gpu = this.gpu;
        camera.update();
        const viewProjectionMatrix = mat4.create();
        const viewMatrix = mat4.create();
        mat4.invert(viewMatrix, camera.matrixWorldElements);
        mat4.multiply(viewProjectionMatrix, camera.projectionMatrixElements, viewMatrix);
        gpu.device.queue.writeBuffer(gpu.static_bind_group.bind_buffer, 0, viewProjectionMatrix);
        // return viewProjectionMatrix;
    }

    render(camera) {
        const gpu = this.gpu;
        this.update_camera_and_get_vp(camera);
        // pure data
        const data = data_flow_center.get_data();

        gpu.encoder.create();
        gpu.create_view();
        // gpu.encoder.begin_render_pass()
        {// const commandEncoder = gpu.device.createCommandEncoder();
            // renderPassDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView();
            // const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

            // // Encode drawing commands

            // passEncoder.setPipeline(renderPipeline);
            // // Vertex attributes
            // passEncoder.setVertexBuffer(0, data.position);
            // passEncoder.setIndexBuffer(data.index, 'uint16');
            // // Bind groups
            // passEncoder.setBindGroup(0, gpu.static_bind_group.resource);
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