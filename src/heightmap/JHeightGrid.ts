import JGrid, { JGridPoint } from "../Geom/JGrid";
import * as TempFunctions from './JTempFunctions';

interface ITempDataGrid {
	heigh: number;
}

export default class JHeightGrid {
	_grid: JGrid;
	_heighData: ITempDataGrid[][] = [];
	constructor(grid: JGrid) {
		this._grid = grid;
	}

	setHeightData() {
		this._grid._points.forEach((col: JGridPoint[], colIdx: number) => {
			let dataCol: ITempDataGrid[] = []
			col.forEach((gp: JGridPoint, rowIdx: number) => {
				if (gp._cell.info.cellHeight.heightType !== 'deepocean') {
					dataCol.push({
						heigh: 1
					})
				} else {
					const tempLatMed: number = TempFunctions.calculateTempPromPerLat(gp._point.y);
					const tempLatMonth: number[] = TempFunctions.generateTempLatArrPerMonth(gp._point.y).map((v) => v.tempLat);
					let tarr: number[] = [];
					tempLatMonth.forEach((mt: number) => {
						let tv: number = tempLatMed + (tempLatMed - mt) * 0.25;
						tv = tv * 50 - 23;
						tarr.push(tv);
					})
					dataCol.push({
						heigh: 1
					})
				}
			})
			this._heighData.push(dataCol);
		})
	}

	
}