import JGrid, { JGridPoint } from "../Geom/JGrid";
import * as TempFunctions from './JTempFunctions';

interface ITempDataGrid {
	tempMed: number;
	tempMonth: number[];
}

export default class JClimateGrid {
	_grid: JGrid;
	_tempData: ITempDataGrid[][] = [];
	constructor(grid: JGrid) {
		this._grid = grid;
	}

	setTempData() {
		this._grid._points.forEach((col: JGridPoint[], colIdx: number) => {
			let dataCol: ITempDataGrid[] = []
			col.forEach((gp: JGridPoint, rowIdx: number) => {
				if (gp._cell.info.cellHeight.heightType !== 'deepocean') {
					dataCol.push({
						tempMed: gp._cell.info.tempMedia,
						tempMonth: gp._cell.info.tempMonthArr
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
						tempMed: 0.25 * gp._cell.info.tempMedia + 0.75 * tarr.reduce((v: number, c: number) => v+=c)/12,
						tempMonth: tarr.map((tv:number, i: number) => 0.25*gp._cell.info.tempMonthArr[i] + 0.75 * tv )
					})
				}
			})
			this._tempData.push(dataCol);
		})
	}

	
}