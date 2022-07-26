
export class DivisionMaker {
	/*
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
	*/
}