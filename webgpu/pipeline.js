import { shader_string } from "../shader/simple_test";
// depth stencil alpha pipeline_layout shader_content
class PipelineDescriptor {
    constructor(parameter) {
        this.layout = parameter.layout;
        this.shader_module = parameter.shader_module;
        this.depth_stencil = parameter.depth_stencil || {
            format: "depth24plus",
            depthWriteEnabled: true,
            depthCompare: "less"
        };
        this.vertex = {
            vertex_buffer_state: parameter.vertex_buffer_state || {
                arrayStride: 4 * 4, // x y z w byte==char float = 4char 4float=4*4
                stepMode: "vertex",
                attributes: [{
                    format: "float32x4",
                    offset: 0,
                    shaderLocation: 0,  // @attribute(0)
                }]
            }
        };
        this.fragment = {
            targets: parameter.color_target_state || {
                format: "bgra8unorm",
                blend: {
                    alpha: {
                        srcFactor: "src-alpha",
                        dstFactor: "one-minus-src-alpha",
                        operation: "add"
                    },
                    color: {
                        srcFactor: "src-alpha",
                        dstFactor: "one-minus-src-alpha",
                        operation: "add"
                    },
                },
                writeMask: GPUColorWrite.ALL,
            }
        }
    }
}

class PipeLine {
    create_resource(device, descriptor) { }
    destroy() {
        this.resource.destroy();
    }
}

class RenderPipeline extends PipeLine {
    create_resource(device, descriptor) {
        this.resource = device.createRenderPipeline({
            layout: descriptor.layout,
            vertex: {
                buffers: descriptor.vertex.vertex_buffer_state,
                module: descriptor.shader_module,
                entryPoint: "vertex_main"
            },
            depthStencil: descriptor.depth_stencil,
            fragment: {
                module: descriptor.shader_module,
                entryPoint: "fragment_main",
                targets: descriptor.fragment.color_target_state,
            },
        });
    }
}

class ComputePipeline extends PipeLine {

}

class PipelineFactor {
    constructor(device) {
        this.device = device;
    }

    create_descriptor(parameter) {
        return new PipelineDescriptor(parameter);
    }

    create_compute_pipeline(descriptor) {
        const pipeline = new ComputePipeline().create_resource(this.device, descriptor);
        return pipeline;
    }

    create_render_pipeline(descriptor) {
        const pipeline = new RenderPipeline().create_resource(this.device, descriptor);
        return pipeline;
    }

    create_pipeline_layout(descriptor) {
        const entry = {
            binding: 0,
            visibility: GPUShaderStage.VERTEX,
            buffer: { type: "uniform" },
        };
        const bind_group_layout_descriptor = { entries: [entry] };
        const bind_group_layout = device.createBindGroupLayout(bind_group_layout_descriptor);
        const default_descriptor = { bindGroupLayouts: [bind_group_layout] };
        return device.createPipelineLayout(descriptor || default_descriptor);
    }

    create_shader_module(code) {
        return this.device.createShaderModule({ code: code || shader_string });
    }
}

export const pipeline_factor = (device) => new PipelineFactor(device);