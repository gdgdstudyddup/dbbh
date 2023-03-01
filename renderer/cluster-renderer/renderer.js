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
            colorAttachments: [{
                // attachment is acquired in render loop.
                clearValue: { r: 0.5, g: 1.0, b: 1.0, a: 1.0 }, // GPUColor
                loadOp: "clear",
                storeOp: "store",
            }],
            depthStencilAttachment: {
                view: gpu.depthTexture.createView(),
                depthClearValue: 1.0,
                depthLoadOp: "clear",
                depthStoreOp: "store",
                stencilClearValue: 0,
                stencilLoadOp: "load",
                stencilStoreOp: "store",
            }
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

        gpu.encoder.create(); // const commandEncoder = gpu.device.createCommandEncoder();
        gpu.create_view(); // renderPassDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView();
        gpu.encoder.begin_render_pass(this.pass); // const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        gpu.encoder.set_pipeline(this.render_pipeline); // passEncoder.setPipeline(renderPipeline);
        gpu.encoder.set_vertex_buffer(0, data.position);
        gpu.encoder.set_index_buffer(data.index, 'uint16');
        gpu.encoder.set_bind_group(0, gpu.static_bind_group.resource);
        let indirect_struct = new Uint32Array(5);
        indirect_struct[0] = data.index.length;
        indirect_struct[1] = 1;
        indirect_struct[2] = 0;
        indirect_struct[3] = 0;
        indirect_struct[4] = 0;
        let indirect_struct_buffer = gpu.device.createBuffer({
            size: indirect_struct.byteLength,
            usage: GPUBufferUsage.INDIRECT | GPUBufferUsage.COPY_DST
        });
        gpu.device.queue.writeBuffer(indirect_struct_buffer, 0, indirect_struct);
        gpu.encoder.indirect_draw(indirect_struct_buffer, 0);
        gpu.encoder.end_pass();
        gpu.encoder.finish();


        // compute stuff occlusion cull re-sort choose lod
        // device.queue.writeBuffer(transformBuffer, 0, modelViewProjectionMatrix);
        // render stuff
        // taa maybe next time? no, do it this time
        // record stuff maybe next time~
    }
}