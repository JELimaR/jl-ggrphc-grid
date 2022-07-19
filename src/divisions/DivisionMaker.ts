import DrawerMap from "../Drawer/DrawerMap";
import JPoint from "../Geom/JPoint";
import JWorldMap, {  } from "../JWorldMap";
import JCell from "../Voronoi/JCell";
import * as JCellToDrawEntryFunctions from '../Drawer/JCellToDrawEntryFunctions'
import RegionMap from "../MapElements/RegionMap";
import chroma from "chroma-js";
import { createICellContainer } from "../utilFunctions";


export class DivisionMaker {
	make(jwm: JWorldMap, dm: DrawerMap, plist: JPoint[][], region: RegionMap): RegionMap[] {
		let cellList: JCell[] = [];
		plist.forEach((points: JPoint[]) => {
			points.forEach((p: JPoint) => {
				cellList.push(jwm.diagram.getCellFromPoint(p));
			})
		})

		let regionsArr: RegionMap[] = region.divideInSubregions(plist);
		// regionsArr.sort((a: JRegionMap, b: JRegionMap) => {return a.area-b.area});

		dm.drawArr(regionsArr, 0.4);
		
		dm.drawCellContainer(
			createICellContainer(cellList),
			JCellToDrawEntryFunctions.colors({
				strokeColor: `#000000`,
				fillColor: `#000000`
			})
		)

		return regionsArr;
	}

}