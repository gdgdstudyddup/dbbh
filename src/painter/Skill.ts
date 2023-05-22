import { DrawCallList } from "./drawcall/DrawCall";

export interface BasicSkill {
    prepare(device: GPUDevice):void;
    draw(drawCallList: DrawCallList): void
}