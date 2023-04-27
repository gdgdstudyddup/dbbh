import { BasicSkill } from "./skill";
import { DrawCallList } from "./drawcall/drawCall";
import { ArtistHelper } from "./artistHelper";
// for editor
class SimpleArtist implements BasicSkill {
    artistHelper: ArtistHelper;
    draw(drawCallList: DrawCallList): void {

    }
}