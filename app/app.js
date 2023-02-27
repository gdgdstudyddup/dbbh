import { ClusterRenderer } from "../renderer/cluster-renderer/renderer.js";
import { WebGPU } from "../webgpu/webgpu.js";
import { PerspectiveCamera } from "../camera/camera.js";
import { BindGroup } from "../webgpu/bind-group.js";

export class ContextConfig {
    constructor(format, alphaMode) {
        this.format = format;
        this.alphaMode = alphaMode;
    }
}
class DEngine {
    stop = true;
    firstFrame = true;
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
        const camera = new PerspectiveCamera(canvas, (2 * Math.PI) / 5, 0.1, 10000);
        const buffer_bind_group_layout_entry = {
            binding: 0, // @group(0) @binding(0)
            visibility: GPUShaderStage.VERTEX,
            buffer: { type: "uniform" },
        };
        const bind_group_layout_descriptor = { entries: [buffer_bind_group_layout_entry] };
        const bind_group_layout = device.createBindGroupLayout(bind_group_layout_descriptor);

        const buffer_size = 64; // 4 * 16
        const static_bind_group = new BindGroup(device, {
            buffer_descriptor: {
                size: buffer_size,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            },
            bind_group_layout,
            offset: 0,
            size: buffer_size,
            binding: 0
        });
        const context = canvas.getContext('webgpu');
        const base_context_configuration = new ContextConfig('bgra8unorm', 'opaque');
        const webgpu = new WebGPU(canvas, context, adapter, device, static_bind_group, base_context_configuration);
        this.cluster_renderer = new ClusterRenderer({ webgpu, camera });
        if (this.firstFrame) {
            this.cluster_renderer.render();
            // do some taa init thing
            this.run(); // all things start here
        }

    }
    run() {
        if (!this.stop) {
            // this.cluster_renderer.render();
            requestAnimationFrame(this.run.bind(this));
        }
        this.firstFrame = false;
    }
}
export const engine = new DEngine();
