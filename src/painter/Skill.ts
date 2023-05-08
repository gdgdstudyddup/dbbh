import { DrawCallList } from "./drawcall/DrawCall1";

export interface BasicSkill {
    prepare():void;
    draw(drawCallList: DrawCallList): void
}