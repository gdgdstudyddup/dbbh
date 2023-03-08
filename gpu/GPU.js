export class GPU {
    constructor(canvas, context, adapter, device) {
        this.canvas = canvas;
        this.context = context;
        this.adapter = adapter;
        this.device = device;
    }
    begin() { this.commandEncoder = this.device.createCommandEncoder(); }
    end() { this.device.queue.submit([this.commandEncoder.finish()]); }
    beginCompute() { this.computePass = this.commandEncoder.beginComputePass(); }
    setPipeline(computePipeline) { this.computePass.setPipeline(computePipeline); }
    setBindGroup(bindGroupIndex, computeBindGroup) { this.computePass.setBindGroup(bindGroupIndex, computeBindGroup); }
    dispatch(number) { this.computePass.dispatchWorkgroups(number); }
    endCompute() { this.computePass.end(); }
    getContextView() {
        return this.context.getCurrentTexture().createView();
    }
}