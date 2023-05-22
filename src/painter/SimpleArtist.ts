import { Artist } from "./Artist";
import { DrawCallList } from "./drawcall/DrawCall";
import { Hall } from "../3d/Hall";
import { RenderPaper } from "./RenderPaper";
// for editor
export class SimpleArtist extends Artist {
    gBufferPipeline: GPURenderPipeline;
    gBufferPrimitive: GPUPrimitiveState;
    gBufferPaper: RenderPaper;
    gBufferUBOBindGroup: GPUBindGroup;
    async beginWork(hall: Hall) {
        await this.artistHelper.process(hall, this);
    }

    prepare(device: GPUDevice): void {
        if (this.gBufferPipeline === undefined) {
            this.gBufferPrimitive = {
                topology: 'triangle-list',
                cullMode: 'back',
            };
            const { vert, frag } = this.gBufferShader();
            this.gBufferPipeline = device.createRenderPipeline({
                layout: 'auto',
                vertex: {
                    module: device.createShaderModule({
                        code: vert,
                    }),
                    entryPoint: 'main',
                },
                fragment: {
                    module: device.createShaderModule({
                        code: frag,
                    }),
                    entryPoint: 'main',
                    targets: [
                        // position
                        { format: 'rgba32float' },
                        // normal
                        { format: 'rgba16float' },
                        // albedo
                        { format: 'bgra8unorm' },
                    ],
                },
                primitive: {
                    topology: 'triangle-list',
                },
            });

            this.gBufferPaper = new RenderPaper(device, this.canvas.width, this.canvas.height);
            this.gBufferPaper.generateGBufferPaper();
        }
    }

    gBufferShader() {
        const vert = `
        // struct VertexStruct{
        //     position: vec3f,
        //     normal: vec3f,
        //     uv: vec2f,
        // };

        // struct ClusterStruct
        // {
        //   ssml: vec4f,
        //   min: vec4f,
        //   max: vec4f,
        //   custom: vec4f,
        // };

        struct TransformUniforms {
           // modelMatrix : mat4x4<f32>,
           // normalModelMatrix : mat4x4<f32>,
           modelMatrix : array<mat4x4<f32>, xxxxx>,
        };

        struct Camera {
            viewProjectionMatrix : mat4x4<f32>,
        };
        @group(0) @binding(0) var<storage, read> vertexBuffer: array<f32, yyyyyy>
        @group(0) @binding(1) var<storage, read> clusterBuffer: array<f32, zzzzz>;
        @group(0) @binding(2) var<storage, read> uboBuffer: TransformUniforms;
        @group(0) @binding(3) var<storage, read> cameraBuffer: Camera;`;

        const frag = `
        struct GBufferOutput {
            @location(0) position : vec4<f32>,
            @location(1) normal : vec4<f32>,
          
            // Textures: diffuse color, specular color, smoothness, emissive etc. could go here
            @location(2) albedo : vec4<f32>,
          }
          
          @fragment
          fn main(
            @location(0) fragPosition: vec3<f32>,
            @location(1) fragNormal: vec3<f32>,
            @location(2) fragUV : vec2<f32>
          ) -> GBufferOutput {
            
            let uv = floor(30.0 * fragUV);
            let c = 0.2 + 0.5 * ((uv.x + uv.y) - 2.0 * floor((uv.x + uv.y) / 2.0));
          
            var output : GBufferOutput;
            output.position = vec4(fragPosition, 1.0);
            output.normal = vec4(fragNormal, 1.0);
            output.albedo = vec4(c, c, c, 1.0);
          
            return output;
          }`;
        return { vert, frag };
    }

    drawClusters(drawCallList: DrawCallList, clusterCount: number, update = false) {
        const device = this.device;
        const commandEncoder = device.createCommandEncoder();
        const gBufferPass = commandEncoder.beginRenderPass(this.gBufferPaper.descriptor);
        {
            gBufferPass.setPipeline(this.gBufferPipeline);
            if (this.gBufferUBOBindGroup === undefined || update) {
                this.gBufferUBOBindGroup = device.createBindGroup({
                    layout: this.gBufferPipeline.getBindGroupLayout(0),
                    entries: [
                        {
                            binding: 0,
                            resource: {
                                buffer: drawCallList.vertexGPUBuffer,
                            },
                        },
                        {
                            binding: 1,
                            resource: {
                                buffer: drawCallList.clustersGPUBuffer,
                            },
                        },
                        {
                            binding: 2,
                            resource: {
                                buffer: drawCallList.UBOGPUBuffer,
                            },
                        },
                        {
                            binding: 3,
                            resource: {
                                buffer: drawCallList.cameraGPUBuffer,
                            },
                        },
                    ],
                });
            }
            gBufferPass.draw(384, clusterCount, 0, 0);
        }
        gBufferPass.end();

        device.queue.submit([commandEncoder.finish()]);
    }

    draw(drawCallList: DrawCallList): void {

    }
}