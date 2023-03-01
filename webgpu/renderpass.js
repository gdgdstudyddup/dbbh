
class RenderPassDescriptor {
    constructor(colorAttachments, depthStencilAttachment) {
        this.colorAttachments = colorAttachments;
        this.depthStencilAttachment = depthStencilAttachment;
    }
}
export class RenderPass {
    constructor(descriptor) {
        this.resource = descriptor;
    }
}
export class RenderPassFactor {
    constructor(device) {
        this.device = device;
    }
    create_descriptor(parameter) {
        return new RenderPassDescriptor(parameter.colorAttachments, parameter.depthStencilAttachment);
    }
    create_render_pass(descriptor){
        return new RenderPass(descriptor);
    }
}
export const pass_factor = (device) => new RenderPassFactor(device);