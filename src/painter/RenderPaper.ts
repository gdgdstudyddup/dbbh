export class RenderPaper {
    device: GPUDevice;
    width: number;
    height: number;
    colors: GPUTextureView[] = [];
    depth: GPUTextureView;
    descriptor: GPURenderPassDescriptor;
    backupDescriptor?: GPURenderPassDescriptor;
    bindGroup: GPUBindGroup;
    constructor(device: GPUDevice, width, height) {
        this.width = width;
        this.height = height;
        this.device = device;
    }

    generateGBufferPaper() {
        const { device, width, height } = this;
        const gBufferTexture2DFloat32 = device.createTexture({
            size: [width, height],
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
            format: 'rgba32float',
        });
        const gBufferTexture2DFloat16 = device.createTexture({
            size: [width, height],
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
            format: 'rgba16float',
        });
        const gBufferTextureAlbedo = device.createTexture({
            size: [width, height],
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
            format: 'bgra8unorm',
        });
        const gBufferTextureViews = [
            gBufferTexture2DFloat32.createView(),
            gBufferTexture2DFloat16.createView(),
            gBufferTextureAlbedo.createView(),
        ];
        const depthTexture = device.createTexture({
            size: [width, height],
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
        const depthView = depthTexture.createView();
        const descriptor: GPURenderPassDescriptor = {
            colorAttachments: [
                {
                    view: gBufferTextureViews[0],

                    clearValue: {
                        r: Number.MAX_VALUE,
                        g: Number.MAX_VALUE,
                        b: Number.MAX_VALUE,
                        a: 1.0,
                    },
                    loadOp: 'clear',
                    storeOp: 'store',
                },
                {
                    view: gBufferTextureViews[1],

                    clearValue: { r: 0.0, g: 0.0, b: 1.0, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                },
                {
                    view: gBufferTextureViews[2],

                    clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                },
            ],
            depthStencilAttachment: {
                view: depthView,

                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
            },
        };
        const backupDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [
                {
                    view: gBufferTextureViews[0],

                    clearValue: {
                        r: Number.MAX_VALUE,
                        g: Number.MAX_VALUE,
                        b: Number.MAX_VALUE,
                        a: 1.0,
                    },
                    loadOp: 'load',
                    storeOp: 'store',
                },
                {
                    view: gBufferTextureViews[1],

                    clearValue: { r: 0.0, g: 0.0, b: 1.0, a: 1.0 },
                    loadOp: 'load',
                    storeOp: 'store',
                },
                {
                    view: gBufferTextureViews[2],

                    clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                    loadOp: 'load',
                    storeOp: 'store',
                },
            ],
            depthStencilAttachment: {
                view: depthView,

                depthClearValue: 1.0,
                depthLoadOp: 'load',
                depthStoreOp: 'store',
            },
        };
        this.depth = depthView;
        this.colors = gBufferTextureViews;
        this.descriptor = descriptor;
        this.backupDescriptor = backupDescriptor;

        
    }
}