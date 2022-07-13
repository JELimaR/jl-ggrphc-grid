import DrawerMap from "../Drawer/DrawerMap";
import JPoint from "../Geom/JPoint";
import JWorldMap, { createICellContainerFromCellArray } from "../JWorldMap";
import JCell from "../Voronoi/JCell";
import * as JCellToDrawEntryFunctions from '../JCellToDrawEntryFunctions'
import JRegionMap from "../RegionMap/JRegionMap";
import chroma from "chroma-js";


export class DivisionMaker {
	make(jwm: JWorldMap, dm: DrawerMap, plist: JPoint[][], region: JRegionMap): JRegionMap[] {
		let cellList: JCell[] = [];
		plist.forEach((points: JPoint[]) => {
			points.forEach((p: JPoint) => {
				cellList.push(jwm.diagram.getCellFromPoint(p));
			})
		})

		let regionsArr: JRegionMap[] = region.divideInSubregions(plist);
		// regionsArr.sort((a: JRegionMap, b: JRegionMap) => {return a.area-b.area});

		dm.drawArr(regionsArr, 0.4);
		
		dm.drawCellMap(
			createICellContainerFromCellArray(cellList),
			JCellToDrawEntryFunctions.colors({
				strokeColor: `#000000`,
				fillColor: `#000000`
			})
		)

		return regionsArr;
	}

}