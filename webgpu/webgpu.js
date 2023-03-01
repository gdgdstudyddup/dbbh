
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
        const depth_size = {
            width: canvas.width,
            height: canvas.height,
            depthOrArrayLayers: 1
        };

        const depth_texture_descriptor = {
            size: depth_size,
            arrayLayerCount: 1,
            mipLevelCount: 1,
            sampleCount: 1,
            dimension: "2d",
            format: "depth24plus",
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        };

        this.depth_texture = device.createTexture(depth_texture_descriptor);
    }
    create_view() {
        this.pass_factor.resource.colorAttachments[0].view = this.context.getCurrentTexture().createView();
    }
    set_depth_texture(depth_texture) {
        this.depth_texture = depth_texture;
    }
    set_encoder(encoder) {
        this.encoder = encoder;
    }

    set_pass_factor(factor) {
        this.pass_factor = factor;
    }

    set_pipeline_factor(factor) {
        this.pipeline_factor = factor;
    }

    set_texture_factor(factor) {
        this.texture_factor = factor;
    }
}