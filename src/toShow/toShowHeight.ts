import NaturalMap from "../BuildingModel/NaturalMap";
import Shower from "./Shower";
import * as JCellToDrawEntryFunctions from '../Drawing/JCellToDrawEntryFunctions';

import JCell from "../BuildingModel/Voronoi/JCell";
import Point from "../Geom/Point";

export default class ShowHeight extends Shower {

	constructor(world: NaturalMap, area: number, folderSelected: string) {
		super(world, area, folderSelected, 'height');
	}

	drawHeight(zoom: number = 0, center?: Point) {
		this.d.clear(zoom, center);
		this.d.drawBackground()
		this.d.drawCellContainer(this.w.diagram, JCellToDrawEntryFunctions.heighLand(1))
		this.d.drawMeridianAndParallels();
		this.d.saveDrawFile(`${this.a}heightLand.png`);
	}

	drawIslands(zoom: number = 0, center?: Point) {
		this.d.clear(zoom, center);
		this.d.drawArr(this.w.islands, 1);
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