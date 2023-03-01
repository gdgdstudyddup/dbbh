export class TextureDescriptor {
    constructor(parameter) {
        this.size = parameter.size; // depthSize;
        this.arrayLayerCount = parameter.arrayLayerCount; // 1;
        this.mipLevelCount = parameter.mipLevelCount; // 1;
        this.sampleCount = parameter.sampleCount; // 1
        this.dimension = parameter.dimension; // "2d";
        this.format = parameter.format; // depthFormat;
        this.usage = parameter.usage; // GPUTextureUsage.RENDER_ATTACHMENT
    }
}

export class Texture {
    constructor(descriptor) {
        this.descriptor = descriptor;
    }
    create_resource(device) {
        const desc = this.descriptor;
        this.resource = device.createTexture({
            size: desc.size,
            arrayLayerCount: desc.arrayLayerCount,
            mipLevelCount: desc.mipLevelCount,
            sampleCount: desc.sampleCount,
            dimension: desc.dimension,
            format: desc.format,
            usage: desc.usage

        });
    }
    destroy() {
        this.resource.destroy();
    }
}

class TextureFactor {
    constructor(device) {
        this.device = device;
    }
    create_descriptor(parameter) {
        return new TextureDescriptor(parameter);
    }
    create_texture_by_descriptor(descriptor) {
        return new Texture(descriptor);
    }
}
export const texture_factor = (device) => new TextureFactor(device);