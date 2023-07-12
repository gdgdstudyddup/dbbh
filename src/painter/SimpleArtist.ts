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
                    format: 'depth32float',
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
            @location(3) fragID: f32,
        };
        @group(0) @binding(0) var<storage, read> vertexBuffer:  array<f32>;
        @group(0) @binding(1) var<storage, read> clusterBuffer: array<f32>;
        @group(0) @binding(2) var<storage, read> ubo: TransformUniforms;
        @group(0) @binding(3) var<uniform> camera: Camera;
        @group(0) @binding(4) var<storage, read> mIDs: array<f32>;
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
            output.fragID = mIDs[uboIndex];
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
            @location(2) fragUV : vec2<f32>,
            @location(3) fragID: f32,
          ) -> GBufferOutput {
            
            let uv = floor(30.0 * fragUV);
            let c = 0.2 + 0.5 * ((uv.x + uv.y) - 2.0 * floor((uv.x + uv.y) / 2.0));
          
            var output : GBufferOutput;
            output.position = vec4(fragPosition, fragID);
            output.normal = vec4(fragNormal, 1.0);
            output.albedo = vec4(c,c,c, 1.0);
          
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
                        {
                            binding: 4,
                            resource: {
                                buffer: drawCallList.mIDBuffer,
                            },
                        },
                    ],
                });
            }
            gBufferPass.setBindGroup(0, this.gBufferUBOBindGroup);
            gBufferPass.draw(384, clusterCount, 0, 0);
            // we can do it in cs and drawing buffer here directly.
            // let test = new Uint32Array(5);
            // test[0] = 384;
            // test[1] = 384;
            // test[2] = clusterCount;
            // test[3] = 0;
            // test[4] = 0;
            // let testBuffer = device.createBuffer({
            //     size: test.byteLength,
            //     usage: GPUBufferUsage.INDIRECT | GPUBufferUsage.COPY_DST
            // });
            // device.queue.writeBuffer(testBuffer, 0, test);
            // gBufferPass.drawIndirect(testBuffer, 1*4);
        }
        gBufferPass.end();
        device.queue.submit([commandEncoder.finish()]);
    }

    draw(drawCallList: DrawCallList): void {

    }

    writeMaterialIDToDepth() {
        const materialDepthTexture = this.device.createTexture({
            size: [this.canvas.width, this.canvas.height],
            format: 'depth32float',
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
        });
        const materialDepthView = materialDepthTexture.createView();
        const primitive: GPUPrimitiveState = {
            topology: 'triangle-list',
            cullMode: 'back',
        };
        const device = this.device;
        const bindGroupLayout = device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {
                        sampleType: 'unfilterable-float',
                    },
                },
            ],
        });

        const bindGroup = device.createBindGroup({
            layout: bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: this.gBufferPaper.colors[0],
                }
            ],
        });
        const pipeline = device.createRenderPipeline({
            layout: device.createPipelineLayout({
                bindGroupLayouts: [bindGroupLayout],
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
                    override canvasSizeWidth: f32;
                    override canvasSizeHeight: f32;
                    
                    struct FragmentOutput {
                        @builtin(frag_depth) depth: f32,
                      }
                    @fragment
                    fn main(
                        @builtin(position) coord : vec4<f32>
                    ) -> FragmentOutput {
                        var output : FragmentOutput;
                        let c = coord.xy / vec2<f32>(canvasSizeWidth, canvasSizeHeight);
                        output.depth = textureLoad( gBufferPosition, vec2<i32>(floor(coord.xy)), 0 ).a / 8888888.0;
                        // output.depth = 0.5;
                        return output;
                    }
                    `,
                }),
                entryPoint: 'main',
                targets: [],
                constants: {
                    canvasSizeWidth: this.canvas.width,
                    canvasSizeHeight: this.canvas.height,
                },

            },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth32float',
            },
            primitive,
        });
        const commandEncoder = device.createCommandEncoder();
        const quadPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [],
            depthStencilAttachment: {
                view: materialDepthView,
                depthClearValue: 1,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
            }
        };
        const pass = commandEncoder.beginRenderPass(
            quadPassDescriptor
        );
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.draw(6);
        pass.end();
        device.queue.submit([commandEncoder.finish()]);
        return materialDepthView;
    }

    generateIDTable() {
        // for example, canvas w = 9 h = 9, then size should be 2 * 2  2
        const device = this.device;
        const tilesPerCol = Math.ceil(this.canvas.height / 8);
        const idRange = new Uint32Array(Math.ceil(this.canvas.width / 8) * 2 * Math.ceil(this.canvas.height / 8));
        for (let i = 0; i < idRange.length; i += 2) {
            idRange[i] = 9999999;
        }
        console.log('idRange', idRange)
        let buffer = device.createBuffer({
            size: idRange.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
        });
        device.queue.writeBuffer(buffer, 0, idRange);
        const module = device.createShaderModule({
            label: 'generate compute module',
            code: `
            struct A {
                a:atomic<u32>
            };
            @group(0) @binding(0) var<storage, read_write> data: array<A>;
            @group(0) @binding(1) var tID : texture_2d<f32>;
            override rowWidth: u32;
            override tilesPerCol: u32;

            @compute @workgroup_size(8, 8) fn computeSomething(
                @builtin(global_invocation_id) id: vec3<u32>
            ) {
                
                let uv = id.xy;
                let mID = u32(textureLoad(tID, uv, 0).a);

                let global_index = uv / 8;
                let min_index = (tilesPerCol - global_index.y - 1) * (rowWidth)  + global_index.x * 2;
                let max_index = min_index + 1;
                atomicMin(&data[min_index].a, mID);
                atomicMax(&data[max_index].a, mID);
                
            }
            `,
        }
        );
        const pipeline = device.createComputePipeline({
            layout: 'auto',
            compute: {
                module,
                entryPoint: 'computeSomething',
                constants: {
                    rowWidth: (Math.ceil(this.canvas.width / 8) ) * 2,
                    tilesPerCol
                }
            },
        });
        const bindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer } },
                { binding: 1, resource: this.gBufferPaper.colors[0] }
            ]
        })

        // const resultBuffer = device.createBuffer({
        //     label: 'result buffer',
        //     size: idRange.byteLength,
        //     usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
        // });
        // begin
        const encoder = device.createCommandEncoder({
            label: 'generate id encoder',
        });
        const pass = encoder.beginComputePass({
            label: 'generate id compute pass',
        });

        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.dispatchWorkgroups(Math.ceil(this.canvas.width / 8), Math.ceil(this.canvas.height / 8));
        pass.end();

        // encoder.copyBufferToBuffer(buffer, 0, resultBuffer, 0, resultBuffer.size);
        const commandBuffer = encoder.finish();
        device.queue.submit([commandBuffer]);

        // await resultBuffer.mapAsync(GPUMapMode.READ);
        // const result = new Uint32Array(resultBuffer.getMappedRange().slice(0));
        // resultBuffer.unmap();
        // console.log('idmap', result); // 16 0
        // for (let i = 0; i < result.length; i++) {
        //     if (result[i] !== 0 && result[i] != 9999999) console.log(result[i])
        // }

        return buffer;
    }
    getMaterials() {
        return [2, 150, 50];
    }
    generateTile() {
        const device = this.device;
        const idTable = this.generateIDTable();
        const materialDepthView = this.writeMaterialIDToDepth();
        const materials = this.getMaterials();
        const tilesPerRow = Math.ceil(this.canvas.width / 8);
        const tilesPerCol = Math.ceil(this.canvas.height / 8);
        const countOfTile = tilesPerRow * tilesPerCol;
        const offsetX = 8.0 / this.canvas.width;
        const offsetY = 8.0 / this.canvas.height;
        let needCheckPipeline = true;

        const primitive: GPUPrimitiveState = {
            topology: 'triangle-list',
            cullMode: 'back',
        };
        const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
        const vertexLayout = device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: { type: 'read-only-storage' }
                },
            ]
        });
        const gBufferTexturesBindGroupLayout = device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX,
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
                {
                    binding: 3,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: { type: 'read-only-storage' }
                },
            ],
        });
        const gBuffersDebugViewPipeline = device.createRenderPipeline({
            layout: device.createPipelineLayout({
                bindGroupLayouts: [
                    gBufferTexturesBindGroupLayout,
                    vertexLayout
                ],
            }),
            vertex: {
                module: device.createShaderModule({
                    code: `
                    @group(0) @binding(0) var gBufferPosition: texture_2d<f32>;
                    @group(0) @binding(3) var<storage, read> materialID: u32;
                    @group(1) @binding(0) var<storage, read> data: array<u32>;
                    override tileWidth: f32;
                    override tileHeight: f32;
                    override tilesPerRow: u32;
                    // override canvasWidth: f32;
                    // override canvasHeight: f32;
                    struct VertexOutput {
                        @builtin(position) Position : vec4<f32>,
                        @location(0) test: vec3<f32>,
                    };
                    @vertex
                    fn main(
                        @builtin(vertex_index) VertexIndex : u32,
                        @builtin(instance_index) instanceIdx : u32,
                    ) -> VertexOutput {
                        
                      let y = (instanceIdx) / (tilesPerRow);
                      let x = instanceIdx - y * tilesPerRow;
                    //   y=;
                      let x0: f32 = (f32(x) * tileWidth) * 2.0 -1.0;
                      let x1: f32 = (f32(x + 1) * tileWidth) * 2.0 -1.0;
                      let y0: f32 = (f32(y) * tileHeight) * 2.0 -1.0;
                      let y1: f32 = (f32(y + 1) * tileHeight) * 2.0 -1.0;
                      let pos = array(
                        vec2(x0, y0), vec2(x1, y0), vec2(x0, y1),
                        vec2(x0, y1), vec2(x1, y0), vec2(x1, y1),
                      );
              
                      let min_index = (y + 1) * (tilesPerRow) * 2 + x * 2; // I have no idea why we need to add 1, but it seems correct.
                      let max_index = min_index + 1;
                      let mMin = data[min_index];
                      let mMax = data[max_index];
                      var output : VertexOutput;
                      output.Position = vec4<f32>(pos[VertexIndex], 0.0, 1.0);
                      if(materialID < mMin || materialID > mMax)
                      {
                        output.Position = vec4<f32>(100000.0);
                        return output;
                      }
                    //   output.test = vec3<f32>(f32(materialID));
                      return output;
                    }`,
                }),
                entryPoint: 'main',
                constants: {
                    tilesPerRow,
                    tileWidth: offsetX,
                    tileHeight: offsetY,
                    // canvasWidth: this.canvas.width,
                    // canvasHeight: this.canvas.height
                },
            },
            fragment: {
                module: device.createShaderModule({
                    code: `
                    @group(0) @binding(0) var gBufferPosition: texture_2d<f32>;
                    @group(0) @binding(1) var gBufferNormal: texture_2d<f32>;
                    @group(0) @binding(2) var gBufferAlbedo: texture_2d<f32>;
                    
                    struct FragmentOutput {
                        @builtin(frag_depth) depth: f32,
                        @location(0) color : vec4<f32>
                    }
                    @fragment
                    fn main(
                        @builtin(position) coord : vec4<f32>,
                        @location(0) test: vec3<f32>,
                    ) -> FragmentOutput {
                        var result : vec4<f32>;
                        var output: FragmentOutput;
                        let depth = textureLoad(
                            gBufferPosition,
                        vec2<i32>(floor(coord.xy)),
                        0
                        ).a;
                        
                        // output.depth = 150.0 / 8888888.0;
                        output.depth = textureLoad( gBufferPosition, vec2<i32>(floor(coord.xy)), 0 ).a / 8888888.0;
                        output.color = textureLoad(
                            gBufferAlbedo,
                            vec2<i32>(floor(coord.xy)),
                            0
                            );
                        // output.color = vec4(textureLoad( gBufferPosition, vec2<i32>(floor(coord.xy)), 0 ).a/20.0);
                        // output.color = vec4(test /20., 1.0);
                        return output;
                    }
                    `,
                }),
                entryPoint: 'main',
                targets: [
                    {
                        format: presentationFormat,
                    },
                ],

            },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'equal',
                format: 'depth32float',
            },
            primitive,
        });
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

            // test depth output
            depthStencilAttachment: {
                view: materialDepthView,
                depthClearValue: 1,
                depthLoadOp: 'load',
                depthStoreOp: 'store',
            }
        };
        const commandEncoder = device.createCommandEncoder();
        textureQuadPassDescriptor.colorAttachments[0].view = this.context
            .getCurrentTexture()
            .createView();
        const debugViewPass = commandEncoder.beginRenderPass(
            textureQuadPassDescriptor
        );
        const vertexBindGroup = device.createBindGroup({
            layout: vertexLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: idTable,
                    },
                },]
        })
        const bindGroups = [];
        for (let i = 0; i < materials.length; i++) {
            const id = new Uint32Array(1);
            id[0] = materials[i];
            const materialID = device.createBuffer({
                label: 'count buffer',
                size: id.byteLength,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
            });
            // Copy our input data to that buffer
            device.queue.writeBuffer(materialID, 0, id);
            const bindGroup = device.createBindGroup({
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
                    {
                        binding: 3,
                        resource: { buffer: materialID }
                    }
                ],
            });
            bindGroups.push(bindGroup)
        }

        console.log('countOfTile', countOfTile, tilesPerCol)
        for (let i = 0; i < materials.length; i++) {
            if (needCheckPipeline) {
                debugViewPass.setPipeline(gBuffersDebugViewPipeline);
            }
            debugViewPass.setBindGroup(0, bindGroups[i]);
            debugViewPass.setBindGroup(1, vertexBindGroup);
            debugViewPass.draw(6, countOfTile);
        }
        debugViewPass.end();
        device.queue.submit([commandEncoder.finish()]);
        // // if innerWidth == 0  tilesInOneRow = 0
        // const tilesInOneRow = u32(window.innerWidth / 8) + 1;
        // const y = (instanceID) / tilesInOneRow;
        // const x = instanceID - y * tilesInOneRow;

        // min_index = y * tilesInOneRow * 2 + x * 2;
        // max_index = min_index + 1;

        // // A B C D 
        // x * offsetX, (x + 1) * offsetX, y * offsetY, (y + 1) * offsetY
    }
    debug() {
        this.generateTile();
        return;
        const materialDepthView = this.writeMaterialIDToDepth();
        const idTable = this.generateIDTable();

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
                        vec2(-1.0, -1.0), vec2(0.0, -1.0), vec2(-1.0, 1.0),
                        vec2(-1.0, 1.0), vec2(0.0, -1.0), vec2(0.0, 1.0),
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
                    struct FragmentOutput {
                        @builtin(frag_depth) depth: f32,
                        @location(0) color : vec4<f32>
                    }
                    @fragment
                    fn main(
                        @builtin(position) coord : vec4<f32>
                    ) -> FragmentOutput {
                        var result : vec4<f32>;
                        let c = coord.xy / vec2<f32>(canvasSizeWidth, canvasSizeHeight);
                        var output: FragmentOutput;
                        let depth = textureLoad(
                            gBufferPosition,
                        vec2<i32>(floor(coord.xy)),
                        0
                        ).a;
                        
                        // if(c.x>900.0){
                            // actually it is the material id
                            output.depth = depth;
                        // }
                        output.depth = 150.0 / 8888888.0;
                        if(c.y  < c.x)
                        {
                            output.color = textureLoad(
                                gBufferAlbedo,
                            vec2<i32>(floor(coord.xy)),
                            0
                            ) ;
                        } else 
                        {
                            output.color = textureLoad(
                            gBufferNormal,
                            vec2<i32>(floor(coord.xy)),
                            0
                            ) ;
                        }
                        return output;
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
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'equal',
                format: 'depth32float',
            },
            primitive,
        });

        const gBuffersDebugViewPipelineR = device.createRenderPipeline({
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
                        vec2(0.0, -1.0), vec2(1.0, -1.0), vec2(0.0, 1.0),
                        vec2(0.0, 1.0), vec2(1.0, -1.0), vec2(1.0, 1.0),
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
                    struct FragmentOutput {
                        @builtin(frag_depth) depth: f32,
                        @location(0) color : vec4<f32>
                      }
                    @fragment
                    fn main(
                        @builtin(position) coord : vec4<f32>
                    ) -> FragmentOutput {
                        var result : vec4<f32>;
                        let c = coord.xy / vec2<f32>(canvasSizeWidth, canvasSizeHeight);
                        var output: FragmentOutput;
                        let depth = textureLoad(
                            gBufferPosition,
                        vec2<i32>(floor(coord.xy)),
                        0
                        ).a;
                        
                        // if(c.x>900.0){
                            // actually it is the material id
                            output.depth = depth;
                        // }
                        output.depth = 150.0 / 8888888.0;
                        if(c.y  < c.x)
                        {
                            output.color = textureLoad(
                                gBufferAlbedo,
                            vec2<i32>(floor(coord.xy)),
                            0
                            ); //+0.1;
                        } else 
                        {
                            output.color = textureLoad(
                            gBufferNormal,
                            vec2<i32>(floor(coord.xy)),
                            0
                            ) ;
                        }
                        return output;
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
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'equal',
                format: 'depth32float',
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

            // test depth output
            depthStencilAttachment: {
                view: materialDepthView,
                depthClearValue: 1,
                depthLoadOp: 'load',
                depthStoreOp: 'store',
            }
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
        debugViewPass.setPipeline(gBuffersDebugViewPipelineR);
        debugViewPass.setBindGroup(0, gBufferTexturesBindGroup);
        debugViewPass.draw(6);
        debugViewPass.end();
        device.queue.submit([commandEncoder.finish()]);
    }
    debug2() {
        const materialDepthView = this.writeMaterialIDToDepth();

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
                    struct FragmentOutput {
                        @builtin(frag_depth) depth: f32,
                        @location(0) color : vec4<f32>
                      }
                    @fragment
                    fn main(
                        @builtin(position) coord : vec4<f32>
                    ) -> FragmentOutput {
                        var result : vec4<f32>;
                        let c = coord.xy / vec2<f32>(canvasSizeWidth, canvasSizeHeight);
                        var output: FragmentOutput;
                        let depth = textureLoad(
                            gBufferPosition,
                        vec2<i32>(floor(coord.xy)),
                        0
                        ).a;
                        
                        // if(c.x>900.0){
                            // actually it is the material id
                            output.depth = depth;
                        // }
                        //output.depth = 150.0 / 8888888.0;
                        if(c.y  < c.x)
                        {
                            output.color = textureLoad(
                                gBufferPosition,
                            vec2<i32>(floor(coord.xy)),
                            0
                            ).aaaa ;
                        } else 
                        {
                            output.color = textureLoad(
                            gBufferNormal,
                            vec2<i32>(floor(coord.xy)),
                            0
                            ) ;
                        }
                        return output;
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
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'equal',
                format: 'depth32float',
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

            // test depth output
            depthStencilAttachment: {
                view: materialDepthView,
                depthClearValue: 1,
                depthLoadOp: 'load',
                depthStoreOp: 'store',
            }
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

    resize() {
        this.canvas.width
    }
}