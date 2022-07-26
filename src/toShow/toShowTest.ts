import NaturalWorld from "../NaturalWorld";
import Shower from "./Shower";


export default class ShowTest extends Shower {
	constructor(world: NaturalWorld, area: number, folderSelected: string) {
		super(world, area, folderSelected, 'test');
	}
}