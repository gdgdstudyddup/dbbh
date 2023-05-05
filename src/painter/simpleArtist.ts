import { BasicSkill } from "./Skill";
import { DrawCallList } from "./drawcall/DrawCall";
import { ArtistHelper } from "./ArtistHelper";
// for editor
class SimpleArtist implements BasicSkill {
    artistHelper: ArtistHelper;
    draw(drawCallList: DrawCallList): void {

    }
}