import { DrawCallList } from "./drawcall/drawCall";

export interface BasicSkill {
    draw(drawCallList: DrawCallList): void
}