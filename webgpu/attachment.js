class Attachment {

}
export class ColorAttachment extends Attachment {
    constructor(parameter) {
        this.view = parameter.view || undefined;
        this.clearValue = parameter.clear_value || { r: 0.5, g: 0.5, b: 0.5, a: 1.0 };
        this.loadOp = parameter.load_op || 'clear';
        this.storeOp = parameter.store_op || 'store';
    }
}

export class DepthStencilAttachment extends Attachment {
    constructor(parameter) {
        this.view = parameter.depthTexture ? parameter.depthTexture.createView() : undefined;
        this.depthClearValue = parameter.depth_clear_value || 1.0;
        this.depthLoadOp = parameter.depth_load_op || 'clear';
        this.depthStoreOp = parameter.depth_store_op || 'store';
        this.stencilClearValue = parameter.stencil_clear_value || 0;
        this.stencilLoadOp = parameter.stencil_load_op || 'clear';
        this.stencilStoreOp = parameter.stencil_store_op || 'store';
    }
}