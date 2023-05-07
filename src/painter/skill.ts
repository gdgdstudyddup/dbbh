import { DrawCallList } from "./drawcall/Drawcall";

export interface BasicSkill {
    prepare():void;
    draw(drawCallList: DrawCallList): void
}