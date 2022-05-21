import JGrid, { JGridPoint } from "../Geom/JGrid";
import JPoint from "../Geom/JPoint";
import * as TempFunctions from '../Climate/JTempFunctions';

interface ITempDataGrid {
	tempCap: number;
	tempMed: number;
	tempMonth: number[];
}

export default class JClimateGrid {
	_grid: JGrid;
	_tempData: ITempDataGrid[][] = [];
	
	constructor(grid: JGrid) {
		this._grid = grid;
		this._tempData = this.setTempData();
		//for (let i=0; i<2;i++)
			//this.smoothTemp(1)
	}
	
	private setTempData(): ITempDataGrid[][] {
		let out: ITempDataGrid[][] = [];
		this._grid._points.forEach((col: JGridPoint[], colIdx: number) => {
			let dataCol: ITempDataGrid[] = []
			col.forEach((gp: JGridPoint, rowIdx: number) => {
				if (gp._cell.info.cellHeight.heightType !== 'deepocean') {
					dataCol.push({
						tempCap: gp._cell.info.cellTemp._tempCap,
						tempMed: gp._cell.info.tempMedia,
						tempMonth: gp._cell.info.tempMonthArr
					})
				} else {
					const tempLatMed: number = TempFunctions.calculateTempPromPerLat(gp._point.y);
					const tempLatMonth: number[] = TempFunctions.generateTempLatArrPerMonth(gp._point.y).map((v) => v.tempLat);
					let tarr: number[] = [];
					tempLatMonth.forEach((mt: number) => {
						let tv: number = tempLatMed + (tempLatMed - mt) * 0.25;
						tv = TempFunctions.parametertoRealTemp(tv);
						tarr.push(tv);
					})
					dataCol.push({
						tempCap: gp._cell.info.cellTemp._tempCap,
						tempMed: 0.25 * gp._cell.info.tempMedia + 0.75 * tarr.reduce((v: number, c: number) => v += c) / 12,
						tempMonth: tarr.map((tv: number, i: number) => 0.25 * gp._cell.info.tempMonthArr[i] + 0.75 * tv)
					})
				}
			})
			out.push(dataCol);
		})
		return out;
	}

	private setTempData2(): ITempDataGrid[][] {
		let out: ITempDataGrid[][] = [];
		const caps: number[][] = this.calculateCapPoints();
		this._grid._points.forEach((col: JGridPoint[], colIdx: number) => {
			let dataCol: ITempDataGrid[] = []
			col.forEach((gp: JGridPoint, rowIdx: number) => {
				const tempLatMed: number = TempFunctions.calculateTempPromPerLat(gp._point.y);
				const tempLatMonth: number[] = TempFunctions.generateTempLatArrPerMonth(gp._point.y).map((v) => v.tempLat);
				let tarr: number[] = [];
				tempLatMonth.forEach((mt: number) => {
					let tv: number = tempLatMed + (tempLatMed - mt) * caps[colIdx][rowIdx];
					tv = TempFunctions.parametertoRealTemp(tv);
					if (gp._cell.info.isLand)
						tv -= 6.5 * gp._cell.info.cellHeight.heightInMeters/1000;
					tarr.push(tv);
				})
				dataCol.push({
					tempCap: caps[colIdx][rowIdx],
					tempMed: tarr.reduce((v: number, c: number) => v += c) / 12,
					tempMonth: tarr
				})
			})
			out.push(dataCol);
		})
		return out;
	}

	private calculateCapPoints() {
		let out: number[][] = [];
		this._grid._points.forEach((col: JGridPoint[], cidx: number) => {
			let capCol: number[] = []
			col.forEach((gp: JGridPoint, ridx: number) => {
				let cap: number = 0, cant: number = 0;
				this._grid.getGridPointsInWindow(gp._point, 20).forEach((gpiw: JGridPoint) => { // debe ser 20?
					cant++;
					cap += (gpiw._cell.info.isLand) ? 1 : 0.44;
				})

				capCol.push(cap/cant)
			})
			out.push(capCol);
			if (cidx % 50 == 0) console.log(`van ${cidx}: `)
		})

		for (let i = 0; i<1; i++) {
			out = this.smoothCap(out, 2)
		}
		console.log('cap grid calculada');
		return out;
	}

	private smoothCap(cin: number[][], win: number): number[][] {
		let cout: number[][] = [];
		cin.forEach((col: number[], cidx: number) => {
			let capCol: number[] = []
			col.forEach((capin: number, ridx: number) => {
				let cap: number = capin, cant: number = 1;
				this._grid.getGridPointsInWindow(this._grid._points[cidx][ridx]._point, win).forEach((gpiw: JGridPoint) => {
					// console.log(gpiw._point.toTurfPosition())
					const indexes = this._grid.getGridPointIndexes(gpiw._point);
					cant++;
					cap += cin[indexes.c][indexes.r];
				})
				capCol.push(cap/cant)
			})
			cout.push(capCol);
		})
		return cout;
	}

	private smoothTemp(win: number) {
		let cout: ITempDataGrid[][] = [];
		this._tempData.forEach((col: ITempDataGrid[], cidx: number) => {
			let dataCol: ITempDataGrid[] = [...this._tempData[cidx]];
			col.forEach((tdg: ITempDataGrid, ridx: number) => {
				let tmonth: number[] = [...tdg.tempMonth], cant: number = 1;
				this._grid.getGridPointsInWindow(this._grid._points[cidx][ridx]._point, win).forEach((gpiw: JGridPoint) => {
					const indexes = this._grid.getGridPointIndexes(gpiw._point);
					cant++;
					this._tempData[indexes.c][indexes.r].tempMonth.forEach((tv: number, i: number) => tmonth[i] += tv);
				})
				dataCol[ridx] = {
					tempCap: this._tempData[cidx][ridx].tempCap,
					tempMonth: tmonth.map((v: number) => v/cant),
					tempMed: tmonth.reduce((p: number, c: number) => p+c)/cant/12
				};
			})
			cout[cidx] = dataCol;
		})
		this._tempData = cout;
	}

	getITCZPoints(month: number | 'med'): JPoint[] {
		let itczPoints: JPoint[] = [];
		this._grid._points.forEach((col: JGridPoint[], cidx: number) => {
			let max: number = -Infinity;
			let id: number = -1;
			col.forEach((gp: JGridPoint, ridx: number) => {
				let arr: number[] = this._grid.getIndexsInWindow(ridx, 10);
				let tempValue: number = 0, cant: number = 0;
				arr.forEach((n: number) => {
					if (n >= 0 && n < col.length) {
						cant++;
						tempValue += (month == 'med') ? this._tempData[cidx][ridx].tempMed : this._tempData[cidx][ridx].tempMonth[month-1];
					}
				})
				tempValue = tempValue / cant;
				if (tempValue > max) {
					max = tempValue;
					id = ridx;
				}
			})
			if (id == -1) console.log(this._tempData[cidx])
			itczPoints.push(col[id]._point);
		})

		/*  */
		itczPoints = itczPoints.map((p: JPoint, idx: number) => {
			let val: number = 0, cant = 0;
			let arr: number[] = this._grid.getIndexsInWindow(idx, 5);
			arr.forEach((n: number) => {
				if (n >= 0 && n < this._grid.colsNumber) {
					val += itczPoints[n].y;
					cant++;
				}
			})
			return new JPoint(p.x, this._grid._granularity * Math.round(val / cant / this._grid._granularity));
		})
		return itczPoints;
	}

	getHorseLatPoints(month: number | 'med', hemisf: 'n' | 's'): JPoint[] {
		let outPoints: JPoint[] = [];
		const RIDXmin: number = (hemisf === 'n') ? 0 : Math.round(this._grid._points[0].length/2)-1;
		this._grid._points.forEach((col: JGridPoint[], cidx: number) => {
			let min: number = Infinity;
			let id: number = -1;
			for (let ridx: number = RIDXmin; ridx < col.length/2 + RIDXmin; ridx++) {
				let arr: number[] = this._grid.getIndexsInWindow(ridx, 10);
				let tempValue: number = 0, cant: number = 0;
				arr.forEach((n: number) => {
					if (n >= 0 && n < col.length) {
						cant++;
						tempValue += (month == 'med') ? this._tempData[cidx][ridx].tempMed : this._tempData[cidx][ridx].tempMonth[month-1];
					}
				})
				tempValue = tempValue / cant;
				if (Math.abs(tempValue - 20) < min) {
					min = Math.abs(tempValue - 20);
					id = ridx;
				}
			}
			outPoints.push(col[id]._point);
		})

		/*  */
		outPoints = outPoints.map((p: JPoint, idx: number) => {
			let val: number = 0, cant = 0;
			let arr: number[] = this._grid.getIndexsInWindow(idx, 10);
			arr.forEach((n: number) => {
				if (n >= 0 && n < this._grid.colsNumber) {
					val += outPoints[n].y;
					cant++;
				}
			})
			return new JPoint(p.x, this._grid._granularity * Math.round(val / cant / this._grid._granularity));
		})
		return outPoints;
	}

	getPolarFrontPoints(month: number | 'med', hemisf: 'n' | 's'): JPoint[] {
		let outPoints: JPoint[] = [];
		const RIDXmin: number = (hemisf === 'n') ? 0 : Math.round(this._grid._points[0].length/2)-1;
		this._grid._points.forEach((col: JGridPoint[], cidx: number) => {
			let min: number = Infinity;
			let id: number = -1;
			for (let ridx: number = RIDXmin; ridx < col.length/2 + RIDXmin; ridx++) {
				let arr: number[] = this._grid.getIndexsInWindow(ridx, 10);
				let tempValue: number = 0, cant: number = 0;
				arr.forEach((n: number) => {
					if (n >= 0 && n < col.length) {
						cant++;
						tempValue += (month == 'med') ? this._tempData[cidx][ridx].tempMed : this._tempData[cidx][ridx].tempMonth[month-1];
					}
				})
				tempValue = tempValue / cant;
				if (Math.abs(tempValue - 0) < min) {
					min = Math.abs(tempValue - 0);
					id = ridx;
				}
			}
			outPoints.push(col[id]._point);
		})

		/*  */
		outPoints = outPoints.map((p: JPoint, idx: number) => {
			let val: number = 0, cant = 0;
			let arr: number[] = [];
			const stepCantMed: number = Math.round(10 / this._grid._granularity);
			for (let j = -stepCantMed; j <= stepCantMed; j++) arr.push(idx + j)
			arr.forEach((n: number) => {
				if (n >= 0 && n < this._grid.colsNumber) {
					val += outPoints[n].y;
					cant++;
				}
			})
			return new JPoint(p.x, this._grid._granularity * Math.round(val / cant / this._grid._granularity));
		})
		return outPoints;
	}

	
}