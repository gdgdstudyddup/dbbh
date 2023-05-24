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
                primitive: this.gBufferPrimitive,
                depthStencil: {
                    depthWriteEnabled: true,
                    depthCompare: 'less',
                    format: 'depth24plus',
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
           modelMatrix : array<mat4x4<f32>, 100>,
        };

        struct Camera {
            viewProjectionMatrix : mat4x4<f32>,
        };

        struct VertexOutput {
            @builtin(position) Position : vec4<f32>,
            @location(0) fragPosition: vec3<f32>,  // position in world space
            @location(1) fragNormal: vec3<f32>,    // normal in world space
            @location(2) fragUV: vec2<f32>,
        };
        @group(0) @binding(0) var<storage, read> vertexBuffer:  array<f32>;
        @group(0) @binding(1) var<storage, read> clusterBuffer: array<f32>;
        @group(0) @binding(2) var<uniform> ubo: TransformUniforms;
        @group(0) @binding(3) var<uniform> camera: Camera;
        @vertex
        fn main(
            @builtin(vertex_index) vertexIdx : u32,
            @builtin(instance_index) instanceIdx : u32,
        ) -> VertexOutput {
            let vertexStride: u32 = 8;
            let instanceStride: u32 = 384 * vertexStride;
            let clusterStride: u32 = 16;
            let clusterIndex = u32(clusterBuffer[instanceIdx * clusterStride]);
            let baseOffset = clusterIndex * instanceStride + vertexIdx * vertexStride;
            let position = vec4(vertexBuffer[baseOffset], vertexBuffer[baseOffset + 1], vertexBuffer[baseOffset + 2], 1.0);
            var output : VertexOutput;
            let uboIndex = u32(clusterBuffer[instanceIdx * clusterStride + 1]);
            output.fragPosition = (ubo.modelMatrix[uboIndex] * position).xyz;
            output.Position = camera.viewProjectionMatrix * vec4(output.fragPosition, 1.0);
            output.fragNormal = vec3(vertexBuffer[baseOffset + 3], vertexBuffer[baseOffset + 4], vertexBuffer[baseOffset + 5]);
            output.fragUV = vec2(vertexBuffer[baseOffset + 6], vertexBuffer[baseOffset + 7]);
            return output;
        }
        `;

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
            output.albedo = vec4(1.0, 0.0, 0.0, 1.0);
          
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
                                buffer: drawCallList.uboGPUBuffer,
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
            gBufferPass.setBindGroup(0, this.gBufferUBOBindGroup);
            gBufferPass.draw(384, clusterCount, 0, 0);
        }
        gBufferPass.end();
        device.queue.submit([commandEncoder.finish()]);
    }

    draw(drawCallList: DrawCallList): void {

    }

    debugClusters(drawCallList: DrawCallList, clusterCount: number) {
        const primitive: GPUPrimitiveState = {
            topology: 'triangle-list',
            // cullMode: 'back',
        };
        const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
        const device = this.device;
        const gPipeline = device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: device.createShaderModule({
                    code: `
                    struct TransformUniforms {
                        // modelMatrix : mat4x4<f32>,
                        // normalModelMatrix : mat4x4<f32>,
                        modelMatrix : array<mat4x4<f32>, 100>,
                     };
             
                     struct Camera {
                         viewProjectionMatrix : mat4x4<f32>,
                     };
             
                     struct VertexOutput {
                         @builtin(position) Position : vec4<f32>
                     };
                     @group(0) @binding(0) var<storage, read> vertexBuffer:  array<f32>;
                     @group(0) @binding(1) var<storage, read> clusterBuffer: array<f32>;
                     @group(0) @binding(2) var<uniform> ubo: TransformUniforms;
                     @group(0) @binding(3) var<uniform> camera: Camera;
                     @vertex
                     fn main(
                         @builtin(vertex_index) vertexIdx : u32,
                         @builtin(instance_index) instanceIdx : u32,
                     ) -> VertexOutput {
                         let vertexStride: u32 = 8;
                         let instanceStride: u32 = 384 * vertexStride;
                         let clusterStride: u32 = 16;
                         let baseOffset = instanceIdx * instanceStride + vertexIdx * vertexStride;
                         let position1 = vec4(vertexBuffer[baseOffset], vertexBuffer[baseOffset + 1], vertexBuffer[baseOffset + 2], 1.0);
                         const pos = array(
                            vec3(100.0, -100.0, 100.0), vec3(100.0, 100.0, 0.0), vec3(100.0, 100.0, 0.0),
                            vec3(-0.0, 0.0, -0.0), vec3(0.0, 0.0, -100.0), vec3(100.0, 0.0, 0.0),
                            // vec3(1.0, -1.0, 1.0), vec3(1.0, 1.0, 0.0), vec3(1.0, 1.0, 0.0),
                            // vec3(-0.0, 0.0, -0.0), vec3(0.0, 0.0, -1.0), vec3(1.0, 0.0, 0.0),
                            vec3(-1.0, 1.0, 0.0), vec3(1.0, -1.0, 0.0), vec3(1.0, 1.0, 0.0),
                          );
                         var position = vec4(pos[vertexIdx], 1.0);
                        //  if(vertexIdx>10){
                        //     position.x *= 0.5;
                        //  }
                         var output : VertexOutput;
                         let uboIndex = u32(clusterBuffer[instanceIdx * clusterStride + 1]);
                         let test = camera.viewProjectionMatrix * ubo.modelMatrix[uboIndex] * position1;
                         output.Position = test;
                         return output;
                     }
                     `,
                }),
                entryPoint: 'main',
            },
            fragment: {
                module: device.createShaderModule({
                    code: `
                    @fragment
                    fn main(
                    ) -> @location(0) vec4<f32> {
                        return vec4<f32>(1.0);
                    }`,
                }),
                entryPoint: 'main',
                targets: [
                    {
                        format: presentationFormat,
                    },
                ],
            },
            primitive: primitive,
        });
        const gBindGroup = device.createBindGroup({
            layout: gPipeline.getBindGroupLayout(0),
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
                        buffer: drawCallList.uboGPUBuffer,
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

        const commandEncoder = device.createCommandEncoder();
        const debugPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [
                {
                    // view is acquired and set in render loop.
                    view: undefined,

                    clearValue: { r: 0.1, g: 0.5, b: 1.0, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                },
            ],
        };
        debugPassDescriptor.colorAttachments[0].view = this.context
            .getCurrentTexture()
            .createView();
        const debugViewPass = commandEncoder.beginRenderPass(
            debugPassDescriptor
        );
        debugViewPass.setPipeline(gPipeline);
        debugViewPass.setBindGroup(0, gBindGroup);
        debugViewPass.draw(384, clusterCount, 0, 0);
        // debugViewPass.draw(6, 1, 0, 0);
        debugViewPass.end();
        console.log('gg')
        device.queue.submit([commandEncoder.finish()]);
    }
    debug() {
        const primitive: GPUPrimitiveState = {
            topology: 'triangle-list',
            cullMode: 'back',
        };
        const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
        const device = this.device;
        const gBufferTexturesBindGroupLayout = device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {
                        sampleType: 'unfilterable-float',
                    },
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {
                        sampleType: 'unfilterable-float',
                    },
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {
                        sampleType: 'unfilterable-float',
                    },
                },
            ],
        });
        const gBuffersDebugViewPipeline = device.createRenderPipeline({
            layout: device.createPipelineLayout({
                bindGroupLayouts: [gBufferTexturesBindGroupLayout],
            }),
            vertex: {
                module: device.createShaderModule({
                    code: `
                    @vertex
                    fn main(
                      @builtin(vertex_index) VertexIndex : u32
                    ) -> @builtin(position) vec4<f32> {
                      const pos = array(
                        vec2(-1.0, -1.0), vec2(1.0, -1.0), vec2(-1.0, 1.0),
                        vec2(-1.0, 1.0), vec2(1.0, -1.0), vec2(1.0, 1.0),
                      );
                    
                      return vec4<f32>(pos[VertexIndex], 0.0, 1.0);
                    }`,
                }),
                entryPoint: 'main',
            },
            fragment: {
                module: device.createShaderModule({
                    code: `
                    @group(0) @binding(0) var gBufferPosition: texture_2d<f32>;
                    @group(0) @binding(1) var gBufferNormal: texture_2d<f32>;
                    @group(0) @binding(2) var gBufferAlbedo: texture_2d<f32>;
                    
                    override canvasSizeWidth: f32;
                    override canvasSizeHeight: f32;
                    
                    @fragment
                    fn main(
                      @builtin(position) coord : vec4<f32>
                    ) -> @location(0) vec4<f32> {
                      var result : vec4<f32>;
                      let c = coord.xy / vec2<f32>(canvasSizeWidth, canvasSizeHeight);
                    //   if (c.x < 0.33333) {
                    //     result = textureLoad(
                    //       gBufferPosition,
                    //       vec2<i32>(floor(coord.xy)),
                    //       0
                    //     );
                    //   } else if (c.x < 0.66667) {
                    //     result = textureLoad(
                    //       gBufferNormal,
                    //       vec2<i32>(floor(coord.xy)),
                    //       0
                    //     );
                    //     result.x = (result.x + 1.0) * 0.5;
                    //     result.y = (result.y + 1.0) * 0.5;
                    //     result.z = (result.z + 1.0) * 0.5;
                    //   } else {
                    //     result = textureLoad(
                    //       gBufferAlbedo,
                    //       vec2<i32>(floor(coord.xy)),
                    //       0
                    //     );
                    //   }
                      result = textureLoad(
                        gBufferNormal,
                        vec2<i32>(floor(coord.xy)),
                        0
                      ) + 0.1;
                      return result;
                    }
                    `,
                }),
                entryPoint: 'main',
                targets: [
                    {
                        format: presentationFormat,
                    },
                ],
                constants: {
                    canvasSizeWidth: this.canvas.width,
                    canvasSizeHeight: this.canvas.height,
                },
            },
            primitive,
        });
        console.log(this.canvas.width, this.canvas.height, 'canvas')
        const gBufferTexturesBindGroup = device.createBindGroup({
            layout: gBufferTexturesBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: this.gBufferPaper.colors[0],
                },
                {
                    binding: 1,
                    resource: this.gBufferPaper.colors[1],
                },
                {
                    binding: 2,
                    resource: this.gBufferPaper.colors[2],
                },
            ],
        });
        const commandEncoder = device.createCommandEncoder();
        const textureQuadPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [
                {
                    // view is acquired and set in render loop.
                    view: undefined,

                    clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                },
            ],
        };
        textureQuadPassDescriptor.colorAttachments[0].view = this.context
            .getCurrentTexture()
            .createView();
        const debugViewPass = commandEncoder.beginRenderPass(
            textureQuadPassDescriptor
        );
        debugViewPass.setPipeline(gBuffersDebugViewPipeline);
        debugViewPass.setBindGroup(0, gBufferTexturesBindGroup);
        debugViewPass.draw(6);
        debugViewPass.end();
        device.queue.submit([commandEncoder.finish()]);
    }
}