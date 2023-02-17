export class WebGPU {
    constructor(canvas, context, adapter, device, context_config) {
        this.canvas = canvas;
        this.context = context;
        this.adapter = adapter;
        this.device = device;
        this.context_config = context_config;
        // init
        context.configure({
            device: device,
            format: context_config.format,
            alphaMode: context_config.alphaMode,

        });
    }
}