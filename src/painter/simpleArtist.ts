import { Artist } from "./Artist";
import { DrawCallList } from "./drawcall/DrawCall";
import { Hall } from "../DBBH";
// for editor
export class SimpleArtist extends Artist {
    beginWork(hall: Hall) {
        const list = this.artistHelper.process(hall);
        this.prepare();
        this.draw(list);
    }

    prepare(): void {
    }

    draw(drawCallList: DrawCallList): void {

    }
}