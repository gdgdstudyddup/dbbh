export class Encoder {
    constructor(device) {
        this.device = device;
    }

    create() {
        this.commandEncoder = this.device.createCommandEncoder();
    }

    finish() {
        this.device.queue.submit([this.commandEncoder.finish()]);
    }

    begin_render_pass(pass_descriptor) {
        this.passEncoder = this.commandEncoder.beginRenderPass(pass_descriptor);
    }
    begin_compute_pass(pass_descriptor){
        this.passEncoder = this.commandEncoder.beginComputePass(pass_descriptor);
    }
    end_pass() {
        this.passEncoder.end();
    }

    set_pipeline(pipeline) {
        this.passEncoder.setPipeline(pipeline.resource);
    }

    set_bind_group(groupIndex, group) {
        this.passEncoder.setBindGroup(groupIndex, group.resource);
    }

    set_vertex_buffer(slot, buffer, offset = 0) {
        this.passEncoder.setVertexBuffer(slot, buffer, offset);
    }

    set_index_buffer(buffer, indexFormat, offset = 0) {
        this.passEncoder.setIndexBuffer(buffer, indexFormat, offset);
    }


    drawArray(indexCount, instanceCount, firstIndex, baseVertex, firstInstance) {
        this.passEncoder.draw(indexCount, instanceCount, firstIndex, baseVertex, firstInstance)
    }

    drawIndexed(indexCount, instanceCount, firstIndex, baseVertex, firstInstance) {
        this.passEncoder.drawIndexed(indexCount, instanceCount, firstIndex, baseVertex, firstInstance);
    }

    indirect_draw(buffer, offset = 0) {
        this.passEncoder.drawIndexedIndirect(buffer, offset);
    }
}