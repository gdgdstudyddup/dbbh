import { ClusterRenderer } from "../renderer/cluster-renderer/renderer.js";
import { WebGPU } from "../webgpu/webgpu.js";
export class ContextConfig {
    constructor(format,alphaMode) {
        this.format = format;
        this.alphaMode = alphaMode;
    }
}
class DEngine {
    stop = false;
    constructor() { // we just run and change some config later maybe its ok
        this.init_and_run();
    }
    async init_and_run() {
        const adapter = await navigator.gpu.requestAdapter();
        const device = await adapter.requestDevice();
        const canvas = document.querySelector('canvas');
        const canvasSize = canvas.getBoundingClientRect();
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;
        const context = canvas.getContext('webgpu');
        const base_context_configuration = new ContextConfig('bgra8unorm','opaque');
        const webgpu = new WebGPU(canvas, context, adapter, device, base_context_configuration);
        this.cluster_renderer = new ClusterRenderer(webgpu);
        this.run(); // all things start here
    }
    run() {
        if (!this.stop) {
            // this.cluster_renderer.render();
            requestAnimationFrame(this.run.bind(this));
        }
    }
}
export const engine = new DEngine();
