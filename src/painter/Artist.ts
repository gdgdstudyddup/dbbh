import { ArtistHelper } from "./ArtistHelper";
import { DrawCallList } from "./drawcall/DrawCall";
import { BasicSkill } from "./Skill";

export enum ArtistType{
    simple,
    realistic
}

export class Artist implements BasicSkill {

    artistHelper: ArtistHelper;
    canvas: HTMLCanvasElement;

    adapter: GPUAdapter;
    device: GPUDevice;
    queue: GPUQueue;

    context: GPUCanvasContext;
    type = ArtistType.simple;
    constructor(canvas, context, device, adapter, queue) {
        this.canvas = canvas;
        this.context = context;
        this.device = device;
        this.adapter = adapter;
        this.queue = queue;
        this.artistHelper = new ArtistHelper(device);
    }
    prepare(device: GPUDevice): void { }
    draw(drawCallList: DrawCallList): void { }
}