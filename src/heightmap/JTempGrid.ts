import JGrid, { JGridPoint } from "../Geom/JGrid";
import JPoint from "../Geom/JPoint";
import * as TempFunctions from '../Climate/JTempFunctions';
import * as turf from '@turf/turf'
import { IPressureZone } from './JPressureGrid'
import DataInformationFilesManager from '../DataInformationLoadAndSave';
const dataInfoManager = DataInformationFilesManager.instance;

export interface ITempDataGrid {
	tempCap: number;
	tempMed: number;
	tempMonth: number[];
}

export default class JTempGrid {
	_grid: JGrid;
	_tempData: ITempDataGrid[][] = [];
	_itczPoints: Map<number, JGridPoint[]> = new Map<number, JGridPoint[]>();
	_horseLatPoints: Map<number, { n: JGridPoint[], s: JGridPoint[] }> = new Map<number, { n: JGridPoint[], s: JGridPoint[] }>();
	_polarFrontPoints: Map<number, { n: JGridPoint[], s: JGridPoint[] }> = new Map<number, { n: JGridPoint[], s: JGridPoint[] }>();;

	constructor(grid: JGrid) {
		console.log('calculate temp grid')
		console.time('set temp grid data');
		this._grid = grid;
		this._tempData = this.setTempData2();
		for (let i = 0; i < 2; i++)
			this.smoothTemp(5)
		this._grid.forEachPoint((gp: JGridPoint, cidx: number, ridx: number) => {
			if (gp._cell.info.isLand) {
				const hf = 6.5 * gp._cell.info.cellHeight.heightInMeters / 1000;
				this._tempData[cidx][ridx].tempMonth = this._tempData[cidx][ridx].tempMonth.map((t: number) => t -= hf)
			}
		})
		console.timeEnd('set temp grid data');
	}

	// private setTempData(): ITempDataGrid[][] {
	// 	let out: ITempDataGrid[][] = dataInfoManager.loadGridTemperature(this._grid._granularity);
	// 	if (out.length > 0) {
	// 		this._grid._points.forEach((col: JGridPoint[], colIdx: number) => {
	// 			let dataCol: ITempDataGrid[] = []
	// 			col.forEach((gp: JGridPoint, rowIdx: number) => {
	// 				dataCol.push({
	// 					tempCap: gp._cell.info.cellTemp._tempCap,
	// 					tempMed: gp._cell.info.tempMedia,
	// 					tempMonth: gp._cell.info.tempMonthArr
	// 				})
	// 			})
	// 			out.push(dataCol);
	// 		})
	// 		dataInfoManager.saveGridTemperature(out, this._grid._granularity);
	// 	}
	// 	return out;
	// }

	private setTempData2(): ITempDataGrid[][] {
		let out: ITempDataGrid[][] = dataInfoManager.loadGridTemperature(this._grid._granularity);
		if (out.length == 0) {
			const caps: number[][] = this.calculateCapPoints();
			this._grid.forEachPoint((gp: JGridPoint, cidx: number, ridx: number) => {
				if (!out[cidx]) out[cidx] = [];
				const tempLatMed: number = TempFunctions.calculateTempPromPerLat(gp._point.y);
				const tempLatMonth: number[] = TempFunctions.generateTempLatArrPerMonth(gp._point.y).map((v) => v.tempLat);
				let tarr: number[] = [];
				tempLatMonth.forEach((mt: number) => {
					let tv: number = tempLatMed + (tempLatMed - mt) * caps[cidx][ridx] * 1.1;
					tv = TempFunctions.parametertoRealTemp(tv);
					// if (gp._cell.info.isLand)
					//	tv -= 6.5 * gp._cell.info.cellHeight.heightInMeters / 1000;
					tarr.push(tv);
				})
				out[cidx][ridx] = {
					tempCap: caps[cidx][ridx],
					tempMed: tarr.reduce((v: number, c: number) => v += c) / 12,
					tempMonth: tarr
				}
			})
			dataInfoManager.saveGridTemperature(out, this._grid._granularity);
		}
		return out;
	}

	private calculateCapPoints() {
		let out: number[][] = [];

		this._grid.forEachPoint((gp: JGridPoint, cidx: number, ridx: number) => {
			if (!out[cidx]) out[cidx] = [];
			let captotal: number = 0;
			let areaTotal: number = 0;
			this._grid.getGridPointsInWindowGrade(gp._point, 15).forEach((gpiw: JGridPoint) => { // debe ser 20?
				const d: number = turf.lengthToDegrees(15) * 1.05 - JPoint.geogDistance(gpiw._point, gp._point);
				captotal += (gpiw._cell.info.isLand ? 1.0 : 0.44) * d;
				areaTotal += d;
			})
			out[cidx][ridx] = captotal / (areaTotal) * 0.75 + 0.25 * (gp._cell.info.isLand ? 1.0 : 0.44);

			if (cidx % 50 == 0 && ridx == 0) console.log(`van: ${cidx} de ${this._grid.colsNumber}`)
		})

		for (let i = 0; i < 3; i++) {
			out = this.smoothCap(out, 5)
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
					// const indexes = this._grid.getGridPointIndexes(gpiw._point);
					cant++;
					cap += cin[gpiw.colValue][gpiw.rowValue];
				})
				capCol.push(cap / cant)
			})
			cout.push(capCol);
		})
		return cout;
	}

	smoothTemp(win: number) {
		let cout: ITempDataGrid[][] = [];
		this._tempData.forEach((col: ITempDataGrid[], cidx: number) => {
			let dataCol: ITempDataGrid[] = [...this._tempData[cidx]];
			col.forEach((tdg: ITempDataGrid, ridx: number) => {
				let tmonth: number[] = [...tdg.tempMonth], cant: number = 1;
				//this._grid.getGridPointsInWindow(this._grid._points[cidx][ridx]._point, win).forEach((gpiw: JGridPoint) => {
				this._grid.getGridPointsInWindowGrade(this._grid._points[cidx][ridx]._point, win).forEach((gpiw: JGridPoint) => {
					const indexes = this._grid.getGridPointIndexes(gpiw._point);
					cant++;
					this._tempData[indexes.c][indexes.r].tempMonth.forEach((tv: number, i: number) => tmonth[i] += tv);
				})
				dataCol[ridx] = {
					tempCap: this._tempData[cidx][ridx].tempCap,
					tempMonth: tmonth.map((v: number) => v / cant),
					tempMed: tmonth.reduce((p: number, c: number) => p + c) / cant / 12
				};
			})
			cout[cidx] = dataCol;
		})
		this._tempData = cout;
	}

	getPointInfo(p: JPoint): ITempDataGrid {
		const indexes = this._grid.getGridPointIndexes(p);
		return this._tempData[indexes.c][indexes.r];
	}

	getITCZPoints(month: number | 'med'): JGridPoint[] {
		if (month === 'med') return this.calcITCZPoints(month)
		if (!this._itczPoints.get(month))
			this._itczPoints.set(month, this.calcITCZPoints(month));

		return this._itczPoints.get(month)!;
	}
	private calcITCZPoints(month: number | 'med'): JGridPoint[] {
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
						tempValue += (month == 'med') ? this._tempData[cidx][ridx].tempMed : this._tempData[cidx][ridx].tempMonth[month - 1];
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
		return this._grid.soft(itczPoints, -7, 7)
	}

	getHorseLatPoints(month: number | 'med', hemisf: 'n' | 's'): JGridPoint[] {
		if (month === 'med') return this.calcHorseLatPoints(month, hemisf)
		if (!this._horseLatPoints.get(month))
			this._horseLatPoints.set(month, { n: this.calcHorseLatPoints(month, 'n'), s: this.calcHorseLatPoints(month, 's') });
		return this._horseLatPoints.get(month)![hemisf];
	}
	private calcHorseLatPoints(month: number | 'med', hemisf: 'n' | 's'): JGridPoint[] {
		let outPoints: JPoint[] = [];
		const RIDXmin: number = (hemisf === 'n') ? 0 : Math.round(this._grid.rowsNumber / 2) - 1;
		this._grid._points.forEach((col: JGridPoint[], cidx: number) => {
			let min: number = Infinity;
			let id: number = -1;
			for (let ridx: number = RIDXmin; ridx < col.length / 2 + RIDXmin; ridx++) {
				let arr: number[] = this._grid.getIndexsInWindow(ridx, 10);
				let tempValue: number = 0, cant: number = 0;
				arr.forEach((n: number) => {
					if (n >= 0 && n < col.length) {
						cant++;
						tempValue += (month == 'med') ? this._tempData[cidx][ridx].tempMed : this._tempData[cidx][ridx].tempMonth[month - 1];
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
		const miny = (hemisf === 'n') ? -32 : 24;
		const maxy = (hemisf === 'n') ? -24 : 32;
		return this._grid.soft(outPoints, miny, maxy);
	}

	getPolarFrontPoints(month: number | 'med', hemisf: 'n' | 's'): JGridPoint[] {
		if (month === 'med') return this.calcPolarFrontPoints(month, hemisf)
		if (!this._polarFrontPoints.get(month))
			this._polarFrontPoints.set(month, { n: this.calcPolarFrontPoints(month, 'n'), s: this.calcPolarFrontPoints(month, 's') });
		return this._polarFrontPoints.get(month)![hemisf];
	}
	private calcPolarFrontPoints(month: number | 'med', hemisf: 'n' | 's'): JGridPoint[] {
		let outPoints: JPoint[] = [];
		const RIDXmin: number = (hemisf === 'n') ? 0 : Math.round(this._grid.rowsNumber / 2) - 1;
		this._grid._points.forEach((col: JGridPoint[], cidx: number) => {
			let min: number = Infinity;
			let id: number = -1;
			for (let ridx: number = RIDXmin; ridx < col.length / 2 + RIDXmin; ridx++) {
				let arr: number[] = this._grid.getIndexsInWindow(ridx, 10);
				let tempValue: number = 0, cant: number = 0;
				arr.forEach((n: number) => {
					if (n >= 0 && n < col.length) {
						cant++;
						tempValue += (month == 'med') ? this._tempData[cidx][ridx].tempMed : this._tempData[cidx][ridx].tempMonth[month - 1];
					}
				})
				tempValue = tempValue / cant;
				if (Math.abs(tempValue - 3) < min) {
					min = Math.abs(tempValue - 3);
					id = ridx;
				}
			}
			outPoints.push(col[id]._point);
		})

		/*  */
		const miny = (hemisf === 'n') ? -61 : 57;
		const maxy = (hemisf === 'n') ? -57 : 61;
		return this._grid.soft(outPoints, miny, maxy)
	}

	getPolarLinePoints(month: number | 'med', hemisf: 'n' | 's'): JGridPoint[] {
		let outPoints: JPoint[] = [];
		const RIDXmin: number = (hemisf === 'n') ? 1 : Math.round(this._grid.rowsNumber / 2) - 1;
		this._grid._points.forEach((col: JGridPoint[], cidx: number) => {
			let min: number = Infinity;
			let id: number = -1;
			for (let ridx: number = RIDXmin; ridx < (col.length / 2 - 1) + RIDXmin; ridx++) {
				let arr: number[] = this._grid.getIndexsInWindow(ridx, 10);
				let tempValue: number = 0, cant: number = 0;
				arr.forEach((n: number) => {
					if (n >= 0 && n < col.length) {
						cant++;
						tempValue += (month == 'med') ? this._tempData[cidx][ridx].tempMed : this._tempData[cidx][ridx].tempMonth[month - 1];
					}
				})
				tempValue = tempValue / cant;
				if (Math.abs(tempValue + 15) < min) {
					min = Math.abs(tempValue + 15);
					id = ridx;
				}
			}
			outPoints.push(col[id]._point);
		})

		/*  */
		return this._grid.soft(outPoints)
	}

	getPressureCenters(month: number): { pressCenter: IPressureZone[], locationGrid: number[][] } { // verificar tiempo total
		console.time('calc pressure centers')
		const MAG: number = 5 * this._grid._granularity;
		let out: IPressureZone[] = [];
		let pressureCentersLocation: number[][] = [];
		this._grid.forEachPoint((gp: JGridPoint, cidx, ridx) => {
			if (!pressureCentersLocation[cidx]) pressureCentersLocation[cidx] = [];
			pressureCentersLocation[cidx][ridx] = 0;
		})
		// let magProm: number = 0;
		// let posProm: number = 0;
		// let negProm: number = 0;
		const landDiff = 0.25;

		// high press zones 
		// ITZC
		const itcz = this.getITCZPoints(month);
		// let tempMedITCZ: number = 0;
		// itcz.forEach((gp: JGridPoint) => tempMedITCZ += this.getPointInfo(gp._point).tempMonth[month - 1] / this._grid.colsNumber);
		/*
		itcz.sort((a: JGridPoint, b: JGridPoint) => {
			return this.getPointInfo(a._point).tempMonth[month - 1] - this.getPointInfo(b._point).tempMonth[month - 1];
		})
		*/
		itcz.forEach((gp: JGridPoint, i: number) => { // ver criterio para agregar
			// if (gp._cell.info.isLand) {
			// if (gp._cell.info.tempMonthArr[month - 1] >= tempMedITCZ) {
				// if (i > itcz.length * 0.35) {
			out.push({
				point: gp._point,
				mag: 5 / 3 * (i > itcz.length * 0 ? -MAG : -landDiff * MAG)
			})
			pressureCentersLocation[gp.colValue][gp.rowValue] = -1;
			// }
		})
		for (let hemisf of ['n', 's']) {
			// polar Front
			const polarFront = this.getPolarFrontPoints(month, hemisf as 's' | 'n');
			// let tempMedPF: number = 0;
			// polarFront.forEach((gp: JGridPoint) => tempMedPF += this.getPointInfo(gp._point).tempMonth[month - 1] / this._grid.colsNumber);
			polarFront.sort((a: JGridPoint, b: JGridPoint) => {
				return this.getPointInfo(a._point).tempMonth[month - 1] - this.getPointInfo(b._point).tempMonth[month - 1];
			})
			polarFront.forEach((gp: JGridPoint, i: number) => { // ver criterio para agregar
				// if (gp._cell.info.isLand) {
					// if (this.getPointInfo(gp._point).tempMonth[month - 1] >= tempMedPF-1) {
						// if (i > polarFront.length * 0.30) {
						out.push({
							point: gp._point,
							mag: 5 / 3 * (i > polarFront.length * 0.10 ? -MAG : -3.5*landDiff * MAG)
						})
						pressureCentersLocation[gp.colValue][gp.rowValue] = -1;
					// }
			})

			// low press zones 
			// horse lat
			const horseLat = this.getHorseLatPoints(month, hemisf as 's' | 'n')//.concat(this.getHorseLatPoints(month, 's'));
			// let tempMedHL: number = 0;
			// horseLat.forEach((gp: JGridPoint) => tempMedHL += this.getPointInfo(gp._point).tempMonth[month - 1] / this._grid.colsNumber);
			horseLat.sort((a: JGridPoint, b: JGridPoint) => {
				return this.getPointInfo(b._point).tempMonth[month - 1] - this.getPointInfo(a._point).tempMonth[month - 1];
			})
			horseLat.forEach((gp: JGridPoint, i: number) => { // ver criterio para agregar
				// if (!gp._cell.info.isLand) {
				// if (this.getPointInfo(gp._point).tempMonth[month - 1] <= tempMedHL+1) {
					// if (i > horseLat.length * 0.30) {
				out.push({
					point: gp._point,
					mag: (i > polarFront.length * 0.2 || !gp._cell.info.isLand ? MAG : 1.5*landDiff * MAG )
				})
				pressureCentersLocation[gp.colValue][gp.rowValue] = 1;
				// }
			})

			// polarLine
			const polarLine = this.getPolarLinePoints(month, hemisf as 's' | 'n');
			// let tempMedPL: number = 0;
			// polarLine.forEach((gp: JGridPoint) => tempMedPL += this.getPointInfo(gp._point).tempMonth[month - 1] / this._grid.colsNumber);
			polarLine.forEach((gp: JGridPoint) => { // ver criterio para agregar
				out.push({
					point: new JPoint(gp._point.x, (gp._point.y < 0) ? -90 : 90),
					mag: MAG
				})
				pressureCentersLocation[gp.colValue][gp.rowValue] = 1;
			})
		}


		/*
				const arr: number[] = [];
				for (let i = -180; i < 180; i += this._grid._granularity) arr.push(i);
		
				let highPointArr: JGridPoint[] = [];
				highPointArr = highPointArr.concat(arr.map((n: number) => this._grid.getGridPoint(new JPoint(n, 90))));
				highPointArr = highPointArr.concat(arr.map((n: number) => this._grid.getGridPoint(new JPoint(n, -90))));
				highPointArr = highPointArr.concat(arr.map((n: number) => this._grid.getGridPoint(new JPoint(n, 30))));
				highPointArr = highPointArr.concat(arr.map((n: number) => this._grid.getGridPoint(new JPoint(n, -30))));
		
				highPointArr.forEach((hp: JGridPoint) => {
					// if (!hp._cell.info.isLand || Math.abs(hp._point.y) == 90) {
						out.push({
							point: hp._point,
							mag: (hp._cell.info.isLand) ? 0.4999 * MAG : MAG // 10 
						})
						pressureCentersLocation[hp.colValue][hp.rowValue] = 1;
					// }
				})
		
				//
				let lowPointArr: JGridPoint[] = [];
				lowPointArr = lowPointArr.concat(arr.map((n: number) => this._grid.getGridPoint(new JPoint(n, 0))));
				lowPointArr = lowPointArr.concat(arr.map((n: number) => this._grid.getGridPoint(new JPoint(n, 60))));
				lowPointArr = lowPointArr.concat(arr.map((n: number) => this._grid.getGridPoint(new JPoint(n, -60))));
		
				lowPointArr.forEach((lp: JGridPoint) => {
					// if (lp._cell.info.isLand || Math.abs(lp._point.y) == 750) {
					out.push({
						point: lp._point,
						mag: 4 / 3 * (lp._cell.info.isLand ? -MAG : -0.4999 * MAG) // -10 /** lp.getPixelArea() - 10
					})
					pressureCentersLocation[lp.colValue][lp.rowValue] = -1;
					// }
				})
		
		*/

		/*
		out.forEach((val: IPressureZone) => {
			magProm += val.mag;
			if (val.mag > 0) posProm += val.mag;
			else negProm += val.mag;
		})
		*/

		// out.forEach((val: IPressureZone) => {
		// 	if (val.mag < 0) {
		// 		val.mag = (val.mag - magProm >= 0) ? val.mag + negProm : val.mag - magProm;
		// 	} else {
		// 		val.mag = (val.mag - magProm <= 0) ? val.mag + posProm : val.mag - magProm;
		// 	}
		// })


		console.timeEnd('calc pressure centers')
		return {
			pressCenter: out,
			locationGrid: pressureCentersLocation
		};
	}


}