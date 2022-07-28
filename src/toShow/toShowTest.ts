import NaturalWorldMap from "../NaturalWorldMap";
import Shower from "./Shower";


export default class ShowTest extends Shower {
	constructor(world: NaturalWorldMap, area: number, folderSelected: string) {
		super(world, area, folderSelected, 'test');
	}
}