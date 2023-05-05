import { DrawCallList } from "./drawcall/DrawCall";

export interface BasicSkill {
    draw(drawCallList: DrawCallList): void
}