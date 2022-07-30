import NaturalMap from "../BuildingModel/NaturalMap";
import Shower from "./Shower";


export default class ShowTest extends Shower {
	constructor(world: NaturalMap, area: number, folderSelected: string) {
		super(world, area, folderSelected, 'test');
	}
}