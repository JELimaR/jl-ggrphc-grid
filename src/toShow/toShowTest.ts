import NaturalWorld from "../NaturalWorld";
import Shower from "./Shower";


export default class ShowTest extends Shower {
	constructor(world: NaturalWorld, area: number, gran: number, folderSelected: string) {
		super(world, area, gran, folderSelected, 'test');
	}
}