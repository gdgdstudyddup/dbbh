import { Hall } from "./3d/Hall";
import { Artist } from "./painter/Artist";
import { SimpleArtist } from "./painter/SimpleArtist";

// the job of this guy is taking an artist to some camera, this guy is abstract thing, so it not an object3d
export class Party {
    static instance?: Party;
    static currentFrame = 0;
    halls: Hall[] = [];
    isSuspend = false;
    canvas: HTMLCanvasElement;

    adapter: GPUAdapter;
    device: GPUDevice;
    queue: GPUQueue;

    context: GPUCanvasContext;
    activeArtist: Artist;
    static getInstance(): Party {
        if (Party.instance === undefined) {
            Party.instance = new Party();
        }
        return Party.instance;
    }

    async start() {
        await this.prepare();
        this.partying();
    }

    async prepare(): Promise<boolean> {
        try {
            const entry: GPU = navigator.gpu;
            if (!entry) {
                return false;
            }
            this.adapter = await entry.requestAdapter();
            this.device = await this.adapter.requestDevice();
            this.queue = this.device.queue;

            if (!this.context) {
                if (!this.canvas) {
                    const canvas = document.getElementById('gfx') as HTMLCanvasElement;
                    canvas.width = canvas.height = 640;
                    this.canvas = canvas;
                }
                this.context = this.canvas.getContext('webgpu');
                const canvasConfig: GPUCanvasConfiguration = {
                    device: this.device,
                    format: 'bgra8unorm',
                    usage:
                        GPUTextureUsage.RENDER_ATTACHMENT |
                        GPUTextureUsage.COPY_SRC,
                    alphaMode: 'opaque'
                };
                this.context.configure(canvasConfig);
                if (!this.activeArtist) {
                    this.activeArtist = new SimpleArtist(
                        this.canvas,
                        this.context,
                        this.device,
                        this.queue,
                        this.adapter
                    );
                }
            }
        } catch (e) {
            console.error(e);
            return false;
        }
        {//test
            const device = this.device;
            const module = device.createShaderModule({
                label: 'doubling compute module',
                code: `
                  @group(0) @binding(0) var<storage, read_write> data: u32;
            
                  @compute @workgroup_size(1) fn computeSomething(
                    @builtin(global_invocation_id) id: vec3<u32>
                  ) {
                    let i = id.x;
                    data++;
                  }
                `,
            });

            const pipeline = device.createComputePipeline({
                label: 'doubling compute pipeline',
                layout: 'auto',
                compute: {
                    module,
                    entryPoint: 'computeSomething',
                },
            });

            const input = new Uint32Array([65]);

            // create a buffer on the GPU to hold our computation
            // input and output
            const workBuffer = device.createBuffer({
                label: 'work buffer',
                size: input.byteLength,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
            });
            // Copy our input data to that buffer
            device.queue.writeBuffer(workBuffer, 0, input);

            const resultBuffer = device.createBuffer({
                label: 'result buffer',
                size: input.byteLength,
                usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
            });

            // Setup a bindGroup to tell the shader which
            // buffer to use for the computation
            const bindGroup = device.createBindGroup({
                label: 'bindGroup for work buffer',
                layout: pipeline.getBindGroupLayout(0),
                entries: [
                    { binding: 0, resource: { buffer: workBuffer } },
                ],
            });

            // Encode commands to do the computation
            const encoder = device.createCommandEncoder({
                label: 'doubling encoder',
            });
            const pass = encoder.beginComputePass({
                label: 'doubling compute pass',
            });
            pass.setPipeline(pipeline);
            pass.setBindGroup(0, bindGroup);
            pass.dispatchWorkgroups(input.length);
            pass.end();

            // Encode a command to copy the results to a mappable buffer.
            encoder.copyBufferToBuffer(workBuffer, 0, resultBuffer, 0, resultBuffer.size);

            // Finish encoding and submit the commands
            const commandBuffer = encoder.finish();
            device.queue.submit([commandBuffer]);

            await resultBuffer.mapAsync(GPUMapMode.READ);
            const result = new Uint32Array(resultBuffer.getMappedRange().slice(0));
            resultBuffer.unmap();

            console.log('input', input);
            console.log('result', result);

        }
        return true;
    }

    async partying() {
        if (!this.isSuspend) {
            console.log('partying');
            for (let i = 0; i < this.halls.length; i++) {
                const hall = this.halls[i];
                if (hall.isActive && hall.hasCamera()) {
                    const artist = this.activeArtist as SimpleArtist;
                    await artist.beginWork(hall);
                }
            }
        }
        requestAnimationFrame(this.partying.bind(this));
    }

    suspend() {
        this.isSuspend = true;
    }

    goOn() {
        this.isSuspend = false;
    }

    end() {

    }
}