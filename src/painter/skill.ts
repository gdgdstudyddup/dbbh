import { DrawCallList } from "./drawcall/DrawCall";

export interface BasicSkill {
    prepare():void;
    draw(drawCallList: DrawCallList): void
}