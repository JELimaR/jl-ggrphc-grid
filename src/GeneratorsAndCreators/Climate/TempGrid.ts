import Grid from "../../Grid/Grid";
import Point from "../../Geom/Point";
import { IPressureZone } from './PressureGrid'
import InformationFilesManager from '../../DataFileLoadAndSave/InformationFilesManager';
import { GRAN } from "../../Geom/constants";
import GridPoint from "../../Grid/GridPoint";
import DataGrid from "../DataGrid";
import turf from "../../Geom/turf";
import { calculateTempPromPerLat, generateTempLatArrPerMonth, parametertoRealTemp } from "./tempGridFunctions";
const dataInfoManager = InformationFilesManager.instance;

export interface ITempDataGrid {
	tempCap: number;
	tempMed: number;
	tempMonth: number[];
}

export default class TempGrid extends DataGrid<ITempDataGrid> {
	private _itczPoints: Map<number, GridPoint[]> = new Map<number, GridPoint[]>();
	private _horseLatPoints: Map<number, { n: GridPoint[], s: GridPoint[] }> = new Map<number, { n: GridPoint[], s: GridPoint[] }>();
	private _polarFrontPoints: Map<number, { n: GridPoint[], s: GridPoint[] }> = new Map<number, { n: GridPoint[], s: GridPoint[] }>();;

	constructor(grid: Grid) {
		super(grid);
		console.log('calculate temp grid')
		console.time('set temp grid data');
		this.matrixData = this.setTempData();
		for (let i = 0; i < 2; i++)
			this.smoothTemp(5)
		this.grid.forEachPoint((gp: GridPoint, cidx: number, ridx: number) => {
			if (gp.cell.info.isLand) {
				const hf = 6.5 * gp.cell.info.cellHeight.heightInMeters / 1000;
				this.matrixData[cidx][ridx].tempMonth = this.matrixData[cidx][ridx].tempMonth.map((t: number, i: number) =>
					this.matrixData[cidx][ridx].tempMonth[i] = t - hf
				)
			}
		})
		console.timeEnd('set temp grid data');
	}

	private setTempData(): ITempDataGrid[][] {
		let out: ITempDataGrid[][] = dataInfoManager.loadGridData<ITempDataGrid>('temperature');
		if (out.length == 0) {
			const caps: number[][] = this.calculateCapPoints();
			this.grid.forEachPoint((gp: GridPoint, cidx: number, ridx: number) => {
				if (!out[cidx]) out[cidx] = [];
				const tempLatMed: number = calculateTempPromPerLat(gp.point.y);
				const tempLatMonth: number[] = generateTempLatArrPerMonth(gp.point.y).map((v) => v.tempLat);
				let tarr: number[] = [];
				tempLatMonth.forEach((mt: number) => {
					let tv: number = tempLatMed + (tempLatMed - mt) * caps[cidx][ridx] * 1.1;
					tv = parametertoRealTemp(tv);

					tarr.push(tv);
				})
				out[cidx][ridx] = {
					tempCap: caps[cidx][ridx],
					tempMed: tarr.reduce((v: number, c: number) => v + c, 0) / 12,
					tempMonth: tarr
				}
			})
			dataInfoManager.saveGridData<ITempDataGrid>(out, 'temperature');
		}
		return out;
	}

	private calculateCapPoints() {
		let out: number[][] = [];

		this.grid.forEachPoint((gp: GridPoint, cidx: number, ridx: number) => {
			if (!out[cidx]) out[cidx] = [];
			let captotal: number = 0;
			let areaTotal: number = 0;
			this.grid.getGridPointsInWindowGrade(gp.point, 15).forEach((gpiw: GridPoint) => { // debe ser 20?
				const d: number = turf.lengthToDegrees(15) * 1.05 - Point.geogDistance(gpiw.point, gp.point);
				captotal += (gpiw.cell.info.isLand ? 1.0 : 0.44) * d;
				areaTotal += d;
			})
			out[cidx][ridx] = captotal / (areaTotal) * 0.75 + 0.25 * (gp.cell.info.isLand ? 1.0 : 0.44);

			if (cidx % 50 == 0 && ridx == 0) console.log(`van: ${cidx} de ${this.grid.colsNumber}`)
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
				this.grid.getGridPointsInWindow(this.grid.points[cidx][ridx].point, win).forEach((gpiw: GridPoint) => {
					// console.log(gpiw.point.toTurfPosition())
					// const indexes = this._grid.getGridPointIndexes(gpiw.point);
					cant++;
					cap += cin[gpiw.colValue][gpiw.rowValue];
				})
				capCol.push(cap / cant)
			})
			cout.push(capCol);
		})
		return cout;
	}

	private smoothTemp(win: number) {
		let cout: ITempDataGrid[][] = [];
		this.matrixData.forEach((col: ITempDataGrid[], cidx: number) => {
			let dataCol: ITempDataGrid[] = [...this.matrixData[cidx]];
			col.forEach((tdg: ITempDataGrid, ridx: number) => {
				let tmonth: number[] = [...tdg.tempMonth], cant: number = 1;
				//this._grid.getGridPointsInWindow(this._grid.points[cidx][ridx].point, win).forEach((gpiw: JGridPoint) => {
				this.grid.getGridPointsInWindowGrade(this.grid.points[cidx][ridx].point, win).forEach((gpiw: GridPoint) => {
					const indexes = this.grid.getGridPointIndexes(gpiw.point);
					cant++;
					this.matrixData[indexes.c][indexes.r].tempMonth.forEach((tv: number, i: number) => tmonth[i] += tv);
				})
				dataCol[ridx] = {
					tempCap: this.matrixData[cidx][ridx].tempCap,
					tempMonth: tmonth.map((v: number) => v / cant),
					tempMed: tmonth.reduce((p: number, c: number) => p + c) / cant / 12
				};
			})
			cout[cidx] = dataCol;
		})
		this.matrixData = cout;
	}
	
	private getTempValueMedia(arr: number[], month: number | 'med', col: GridPoint[], cidx: number, ridx: number) {
		let tempValue: number = 0, cant: number = 0;
		arr.forEach((n: number) => {
			if (n >= 0 && n < col.length) {
				cant++;
				tempValue += (month == 'med') ? this.matrixData[cidx][ridx].tempMed : this.matrixData[cidx][ridx].tempMonth[month - 1];
			}
		})
		return tempValue / cant;
	}

	getITCZPoints(month: number | 'med'): GridPoint[] {
		if (month === 'med') return this.calcITCZPoints(month)
		if (!this._itczPoints.get(month))
			this._itczPoints.set(month, this.calcITCZPoints(month));

		return this._itczPoints.get(month)!;
	}
	private calcITCZPoints(month: number | 'med'): GridPoint[] {
		let itczPoints: Point[] = [];
		this.grid.points.forEach((col: GridPoint[], cidx: number) => {
			let max: number = -Infinity;
			let id: number = -1;
			col.forEach((_gp: GridPoint, ridx: number) => {
				let arr: number[] = this.grid.getIndexsInWindow(ridx, 10);
				let tempValue: number = this.getTempValueMedia(arr, month, col, cidx, ridx);
				/*let tempValue: number = 0, cant: number = 0;
				arr.forEach((n: number) => {
					if (n >= 0 && n < col.length) {
						cant++;
						tempValue += (month == 'med') ? this.matrixData[cidx][ridx].tempMed : this.matrixData[cidx][ridx].tempMonth[month - 1];
					}
				})
				tempValue = tempValue / cant;*/
				if (tempValue > max) {
					max = tempValue;
					id = ridx;
				}
			})
			if (id == -1) console.log(this.matrixData[cidx])
			itczPoints.push(col[id].point);
		})

		/*  */
		return this.grid.soft(itczPoints, -7, 7)
	}

	getHorseLatPoints(month: number | 'med', hemisf: 'n' | 's'): GridPoint[] {
		if (month === 'med') return this.calcHorseLatPoints(month, hemisf)
		if (!this._horseLatPoints.get(month))
			this._horseLatPoints.set(month, { n: this.calcHorseLatPoints(month, 'n'), s: this.calcHorseLatPoints(month, 's') });
		return this._horseLatPoints.get(month)![hemisf];
	}
	private calcHorseLatPoints(month: number | 'med', hemisf: 'n' | 's'): GridPoint[] {
		let outPoints: Point[] = [];
		const RIDXmin: number = (hemisf === 'n') ? 0 : Math.round(this.grid.rowsNumber / 2) - 1;
		this.grid.points.forEach((col: GridPoint[], cidx: number) => {
			let min: number = Infinity;
			let id: number = -1;
			for (let ridx: number = RIDXmin; ridx < col.length / 2 + RIDXmin; ridx++) {
				let arr: number[] = this.grid.getIndexsInWindow(ridx, 10);
				let tempValue: number = this.getTempValueMedia(arr, month, col, cidx, ridx);
				if (Math.abs(tempValue - 20) < min) {
					min = Math.abs(tempValue - 20);
					id = ridx;
				}
			}
			outPoints.push(col[id].point);
		})

		/*  */
		const miny = (hemisf === 'n') ? -32 : 24;
		const maxy = (hemisf === 'n') ? -24 : 32;
		return this.grid.soft(outPoints, miny, maxy);
	}

	getPolarFrontPoints(month: number | 'med', hemisf: 'n' | 's'): GridPoint[] {
		if (month === 'med') return this.calcPolarFrontPoints(month, hemisf)
		if (!this._polarFrontPoints.get(month))
			this._polarFrontPoints.set(month, { n: this.calcPolarFrontPoints(month, 'n'), s: this.calcPolarFrontPoints(month, 's') });
		return this._polarFrontPoints.get(month)![hemisf];
	}
	private calcPolarFrontPoints(month: number | 'med', hemisf: 'n' | 's'): GridPoint[] {
		let outPoints: Point[] = [];
		const RIDXmin: number = (hemisf === 'n') ? 0 : Math.round(this.grid.rowsNumber / 2) - 1;
		this.grid.points.forEach((col: GridPoint[], cidx: number) => {
			let min: number = Infinity;
			let id: number = -1;
			for (let ridx: number = RIDXmin; ridx < col.length / 2 + RIDXmin; ridx++) {
				let arr: number[] = this.grid.getIndexsInWindow(ridx, 10);
				let tempValue: number = this.getTempValueMedia(arr, month, col, cidx, ridx);
				if (Math.abs(tempValue - 3) < min) {
					min = Math.abs(tempValue - 3);
					id = ridx;
				}
			}
			outPoints.push(col[id].point);
		})

		/*  */
		const miny = (hemisf === 'n') ? -61 : 57;
		const maxy = (hemisf === 'n') ? -57 : 61;
		return this.grid.soft(outPoints, miny, maxy)
	}

	getPolarLinePoints(month: number | 'med', hemisf: 'n' | 's'): GridPoint[] {
		let outPoints: Point[] = [];
		const RIDXmin: number = (hemisf === 'n') ? 1 : Math.round(this.grid.rowsNumber / 2) - 1;
		this.grid.points.forEach((col: GridPoint[], cidx: number) => {
			let min: number = Infinity;
			let id: number = -1;
			for (let ridx: number = RIDXmin; ridx < (col.length / 2 - 1) + RIDXmin; ridx++) {
				let arr: number[] = this.grid.getIndexsInWindow(ridx, 10);
				let tempValue: number = this.getTempValueMedia(arr, month, col, cidx, ridx);
				if (Math.abs(tempValue + 15) < min) {
					min = Math.abs(tempValue + 15);
					id = ridx;
				}
			}
			outPoints.push(col[id].point);
		})

		/*  */
		return this.grid.soft(outPoints)
	}

	getPressureCenters(month: number): { pressCenter: IPressureZone[], locationGrid: number[][] } { // verificar tiempo total
		console.time('calc pressure centers')
		const MAG: number = 5 * GRAN;
		let out: IPressureZone[] = [];
		let pressureCentersLocation: number[][] = [];
		this.grid.forEachPoint((_: GridPoint, cidx, ridx) => {
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
		itcz.forEach((gp: GridPoint) => { // ver criterio para agregar
			out.push({
				point: gp.point,
				mag: -5 / 3 * MAG
			})
			pressureCentersLocation[gp.colValue][gp.rowValue] = -1;
		})
		for (let hemisf of ['n', 's']) {
			// polar Front
			const polarFront = this.getPolarFrontPoints(month, hemisf as 's' | 'n');
			polarFront.sort((a: GridPoint, b: GridPoint) => {
				return this.getPointInfo(a.point).tempMonth[month - 1] - this.getPointInfo(b.point).tempMonth[month - 1];
			})
			polarFront.forEach((gp: GridPoint, i: number) => { // ver criterio para agregar
				out.push({
					point: gp.point,
					mag: 5 / 3 * (i > polarFront.length * 0.10 ? -MAG : -3.0 * landDiff * MAG)
				})
				pressureCentersLocation[gp.colValue][gp.rowValue] = -1;
			})

			// low press zones 
			// horse lat
			/**
			 * VER ORDEN Y ELIMINAR ALGUNOS QUE SE ENCUENTRAN AL ESTE DE CONTINENTES
			 */
			const horseLat = this.getHorseLatPoints(month, hemisf as 's' | 'n')//.concat(this.getHorseLatPoints(month, 's'));
			// let tempMedHL: number = 0;
			// horseLat.forEach((gp: JGridPoint) => tempMedHL += this.getPointInfo(gp.point).tempMonth[month - 1] / this._grid.colsNumber);
			horseLat.sort((a: GridPoint, b: GridPoint) => {
				return this.getPointInfo(b.point).tempMonth[month - 1] - this.getPointInfo(a.point).tempMonth[month - 1];
			})
			horseLat.forEach((gp: GridPoint, i: number) => { // ver criterio para agregar
				const pointsInWindow = this.grid.getGridPointsInWindowGrade(gp.point, 20);
				let landCount: number = 0, totalCount: number = 0;
				pointsInWindow.forEach((iwgp: GridPoint) => {
					// if (iwgp.cell.info.isLand) landCount++;
					if (horseLat.includes(iwgp) && iwgp.colValue > gp.colValue) {
						totalCount++;
						if (iwgp.cell.info.isLand) landCount++;
					}
				})
				if (landCount/totalCount > 0.50) {
					out.push({
						point: gp.point,
						mag: (i > horseLat.length * 0.2 || !gp.cell.info.isLand ? MAG : 2.5 * landDiff * MAG)
					})
					pressureCentersLocation[gp.colValue][gp.rowValue] = 1;
				} /*else if (landCount/totalCount > 0.30 && i > horseLat.length * 0.2) {
					out.push({
						point: gp.point,
						mag: 2.5 * landDiff * MAG
					})
					pressureCentersLocation[gp.colValue][gp.rowValue] = 1;
				}*/
			})

			// polarLine
			const polarLine = this.getPolarLinePoints(month, hemisf as 's' | 'n');
			// let tempMedPL: number = 0;
			// polarLine.forEach((gp: JGridPoint) => tempMedPL += this.getPointInfo(gp.point).tempMonth[month - 1] / this._grid.colsNumber);
			polarLine.forEach((gp: GridPoint) => { // ver criterio para agregar
				out.push({
					point: new Point(gp.point.x, (gp.point.y < 0) ? -90 : 90),
					mag: MAG
				})
				pressureCentersLocation[gp.colValue][gp.rowValue] = 1;
			})
		}

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