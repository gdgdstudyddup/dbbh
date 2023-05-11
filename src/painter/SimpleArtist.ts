import { Artist } from "./Artist";
import { DrawCallList } from "./drawcall/DrawCall";
import { Hall } from "../3d/Hall";
// for editor
export class SimpleArtist extends Artist {
    async beginWork(hall: Hall) {
        const list = await this.artistHelper.process(hall);
        this.prepare();
        this.draw(list);
    }

    prepare(): void {
    }

    draw(drawCallList: DrawCallList): void {

    }
}