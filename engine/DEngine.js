import { GPU } from "../gpu/GPU.js";
import { ClusterRenderer } from "../renderer/ClusterRenderer.js";

class DEngine {
    constructor() {

    }
    async init() {
        const adapter = await navigator.gpu.requestAdapter();
        const device = await adapter.requestDevice();
        // Canvas
        const canvas = document.querySelector('canvas');
        const canvasSize = canvas.getBoundingClientRect();
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;

        const context = canvas.getContext('webgpu');
        const contextConfiguration = {
            device: device,
            format: "bgra8unorm",
            alphaMode: 'opaque', // here will be change
        };
        context.configure(contextConfiguration);
        this.device = device;
        this.adapter = adapter;
        this.context = context;
        this.canvas = canvas;
        this.gpu = new GPU(canvas, context, adapter, device);
        this.clusterRenderer = new ClusterRenderer(gpu);
    }
    loop() {
        const gpu = this.gpu;
        gpu.begin();
        /* -----------demo-----------------
         const gBufferPass = commandEncoder.beginRenderPass(
            writeGBufferPassDescriptor
        );
        gBufferPass.setPipeline(writeGBuffersPipeline);
        gBufferPass.setBindGroup(0, sceneUniformBindGroup);
        gBufferPass.setVertexBuffer(0, vertexBuffer);
        gBufferPass.setIndexBuffer(indexBuffer, 'uint16');
        gBufferPass.drawIndexed(indexCount);
        gBufferPass.end();
        
        const lightPass = commandEncoder.beginComputePass();
        lightPass.setPipeline(lightUpdateComputePipeline);
        lightPass.setBindGroup(0, lightsBufferComputeBindGroup);
        lightPass.dispatchWorkgroups(Math.ceil(kMaxNumLights / 64));
        lightPass.end();
        -----------demo-----------------*/


        // do cull oc  construct the buffer pass
        gpu.beginCompute();
        gpu.setPipeline();
        gpu.setBindGroup();
        gpu.dispatch(1000/64);
        gpu.endCompute();
        // to be continue~

        // render vBuffer pass
        this.clusterRenderer.setEncoder(gpu);
        this.clusterRenderer.setCurrentPass();
        this.clusterRenderer.beginCurrentPass();
        this.clusterRenderer.setPipeline();
        this.clusterRenderer.setBindGroup();
        this.clusterRenderer.setVertexBuffer();
        this.clusterRenderer.setIndexBuffer();
        this.clusterRenderer.drawIndexedIndirect();
        this.clusterRenderer.endCurrentPass();
        // render compute pass

        // render gBuffer pass
        // combine pass
        // render opacity thing
        gpu.end();
        requestAnimationFrame(this.loop.bind(this));
    }
}
export const dbbh = new DEngine();