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
        return true;
    }

    partying() {
        if (!this.isSuspend) {
            console.log('partying');
            for (let i = 0; i < this.halls.length; i++) {
                const hall = this.halls[i];
                if (hall.isActive && hall.hasCamera()) {
                    const artist = this.activeArtist as SimpleArtist;
                    artist.beginWork(hall);
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