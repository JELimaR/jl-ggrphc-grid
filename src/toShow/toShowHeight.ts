import JWorld from "../JWorld";
import Shower from "./Shower";
import * as JCellToDrawEntryFunctions from '../JCellToDrawEntryFunctions';
import { createICellContainerFromCellArray } from "../JWorldMap";
import JCell from "../Voronoi/JCell";

export default class ShowHeight extends Shower {

	constructor(world: JWorld, area: number, gran: number, folderSelected: string) {
		super(world, area, gran, folderSelected, 'height');
	}

	drawHeight() {
		this.d.clear();
		this.d.drawFondo()
		this.d.drawCellContainer(this.w.diagram, JCellToDrawEntryFunctions.heighLand(1))
		this.d.drawMeridianAndParallels();
		this.d.saveDrawFile(`${this.a}heightLand.png`);
	}

	drawIslands() {
		this.d.clear();
		this.d.drawArr(this.w._islands, 1);
		this.d.drawMeridianAndParallels();
		this.d.saveDrawFile(`${this.a}islands.png`)
	}

	printMaxAndMinCellsHeight() {
		this.printSeparator();
		console.log('cells cant', this.w.diagram.cells.size) // sacar de aca
		let areaLand: number = 0, cantLand: number = 0;
		let maxAreaLand: JCell = this.w.diagram.cells.get(3255)!;
		let minAreaLand: JCell = this.w.diagram.cells.get(3255)!;
		this.w.diagram.forEachCell((c: JCell) => {
			if (c.info.isLand) {
				areaLand += c.areaSimple;
				cantLand ++;		
				if (c.areaSimple < minAreaLand.areaSimple) minAreaLand = c;
				if (c.areaSimple > maxAreaLand.areaSimple) maxAreaLand = c;
			}
		})
		console.log('area total', areaLand);
		console.log('area prom', areaLand/cantLand);
		console.log('area max', maxAreaLand.area);
		
		console.log('area min', minAreaLand.area);
	}
}