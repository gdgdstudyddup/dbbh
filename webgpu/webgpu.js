
export class WebGPU {
    constructor(canvas, context, adapter, device, static_bind_group, context_config) {
        this.canvas = canvas;
        this.context = context;
        this.adapter = adapter;
        this.device = device;
        this.context_config = context_config;
        this.static_bind_group = static_bind_group;
        // init
        context.configure({
            device: device,
            format: context_config.format,
            alphaMode: context_config.alphaMode,

        });
    }
    drawStatic() {
    }
}