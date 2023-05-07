import { ArtistHelper } from "./ArtistHelper";
import { DrawCallList } from "./drawcall/Drawcall";
import { BasicSkill } from "./Skill";

export class Artist implements BasicSkill {

    artistHelper: ArtistHelper;
    canvas: HTMLCanvasElement;

    adapter: GPUAdapter;
    device: GPUDevice;
    queue: GPUQueue;

    context: GPUCanvasContext;
    constructor(canvas, context, device, adapter, queue) {
        this.canvas = canvas;
        this.context = context;
        this.device = device;
        this.adapter = adapter;
        this.queue = queue;
        this.artistHelper = new ArtistHelper(device);
    }
    prepare(): void { }
    draw(drawCallList: DrawCallList): void { }
}