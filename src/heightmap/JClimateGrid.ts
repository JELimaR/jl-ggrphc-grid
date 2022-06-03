import JGrid, { JGridPoint } from "../Geom/JGrid";
import JPoint from "../Geom/JPoint";
import * as TempFunctions from '../Climate/JTempFunctions';
import { IPressureZone } from './JPressureGrid'

export interface ITempDataGrid {
	tempCap: number;
	tempMed: number;
	tempMonth: number[];
}

export default class JClimateGrid {
	_grid: JGrid;
	_tempData: ITempDataGrid[][] = [];
	_itczPoints: JGridPoint[] = [];
	_horseLatPoints: {n: JGridPoint[], s: JGridPoint[]} = {n: [], s:[]};
	_polarFrontPoints: {n: JGridPoint[], s: JGridPoint[]} = {n: [], s:[]};

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
				// if (gp._cell.info.cellHeight.heightType !== 'deepocean') {
				dataCol.push({
					tempCap: gp._cell.info.cellTemp._tempCap,
					tempMed: gp._cell.info.tempMedia,
					tempMonth: gp._cell.info.tempMonthArr
				})
				/*} else {
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
				}*/
			})
			out.push(dataCol);
		})
		return out;
	}
	/*
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
	*/
	smoothTemp(win: number) {
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
		if (this._itczPoints.length === 0)
			this._itczPoints = this.calcITCZPoints(month);

		return this._itczPoints
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
		return this._grid.soft(itczPoints)
	}

	getHorseLatPoints(month: number | 'med', hemisf: 'n' | 's'): JGridPoint[] {
		if (this._horseLatPoints[hemisf].length === 0)
			this._horseLatPoints = {n: this.calcHorseLatPoints(month, 'n'), s: this.calcHorseLatPoints(month, 's')};
		return this._horseLatPoints[hemisf];
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
		return this._grid.soft(outPoints);
	}

	getPolarFrontPoints(month: number | 'med', hemisf: 'n' | 's'): JGridPoint[] {
		if (this._polarFrontPoints[hemisf].length === 0)
			this._polarFrontPoints = {n: this.calcPolarFrontPoints(month, 'n'), s: this.calcPolarFrontPoints(month, 's')};
		return this._polarFrontPoints[hemisf];
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
				if (Math.abs(tempValue - 0) < min) {
					min = Math.abs(tempValue - 0);
					id = ridx;
				}
			}
			outPoints.push(col[id]._point);
		})

		/*  */
		return this._grid.soft(outPoints)
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

	getPressureCenters(month: number): IPressureZone[] { // verificar tiempo total
		console.time('calc pressure centers')
		const MAG: number = 5 * this._grid._granularity;
		let out: IPressureZone[] = [];
		/*
		// high press zones 
		// ITZC
		const itcz = this.getITCZPoints(month);
		let tempMedITCZ: number = 0;
		itcz.forEach((gp: JGridPoint) => tempMedITCZ += this.getPointInfo(gp._point).tempMonth[month - 1] / 720);
		itcz.forEach((gp: JGridPoint) => { // ver criterio para agregar
			out.push({
				point: gp._point,
				mag: -10 * gp.getPixelArea() - 10
			})
		})
		// ITZC polar Front
		const polarFront = this.getPolarFrontPoints(month, 'n').concat(this.getPolarFrontPoints(month, 's'));
		let tempMedPF: number = 0;
		polarFront.forEach((gp: JGridPoint) => tempMedPF += this.getPointInfo(gp._point).tempMonth[month - 1] / 720);
		polarFront.forEach((gp: JGridPoint) => { // ver criterio para agregar
			out.push({
				point: gp._point,
				mag: -10 * gp.getPixelArea() - 10
			})
		})

		// low press zones 
		// horse lat
		const horseLat = this.getHorseLatPoints(month, 'n').concat(this.getHorseLatPoints(month, 's'));
		let tempMedHL: number = 0;
		horseLat.forEach((gp: JGridPoint) => tempMedHL += this.getPointInfo(gp._point).tempMonth[month - 1] / 720);
		horseLat.forEach((gp: JGridPoint) => { // ver criterio para agregar
			out.push({
				point: gp._point,
				mag: 10 * gp.getPixelArea() + 10
			})
		})
		// polarLine
		const polarLine = this.getPolarLinePoints(month, 'n').concat(this.getPolarLinePoints(month, 's'));
		let tempMedPL: number = 0;
		polarLine.forEach((gp: JGridPoint) => tempMedPL += this.getPointInfo(gp._point).tempMonth[month - 1] / 720);
		polarLine.forEach((gp: JGridPoint) => { // ver criterio para agregar
			out.push({
				point: gp._point,
				mag: 10 * gp.getPixelArea() + 10
			})
		})
		*/
		
		const arr: number[] = [];
		for (let i = -180; i<180; i+=this._grid._granularity) arr.push(i);
		//
		let highPointArr: JGridPoint[] = [];
		highPointArr = highPointArr.concat( arr.map((n: number) => this._grid.getGridPoint(new JPoint(n,90))) );
		highPointArr = highPointArr.concat( arr.map((n: number) => this._grid.getGridPoint(new JPoint(n,-90))) );
		highPointArr = highPointArr.concat( arr.map((n: number) => this._grid.getGridPoint(new JPoint(n,30 ))) );
		highPointArr = highPointArr.concat( arr.map((n: number) => this._grid.getGridPoint(new JPoint(n,-30 ))) );
		
		highPointArr.forEach((hp: JGridPoint) => {
			//if (!hp._cell.info.isLand || Math.abs(hp._point.y) == 90) {
				out.push({
					point: hp._point, 
					mag: (hp._cell.info.isLand) ? 0.999*MAG : MAG // */ 10 /** hp.getPixelArea() + 10*/
				})
			//}
		})

		//
		let lowPointArr: JGridPoint[] = [];
		lowPointArr = lowPointArr.concat( arr.map((n: number) => this._grid.getGridPoint(new JPoint(n,0))) );
		lowPointArr = lowPointArr.concat( arr.map((n: number) => this._grid.getGridPoint(new JPoint(n,60 ))) );
		lowPointArr = lowPointArr.concat( arr.map((n: number) => this._grid.getGridPoint(new JPoint(n,-60 ))) );

		lowPointArr.forEach((lp: JGridPoint) => {
			// if (lp._cell.info.isLand || Math.abs(lp._point.y) == 0) {
				out.push({
					point: lp._point, 
					mag: 4/3 * (lp._cell.info.isLand ? -MAG : -0.999*MAG) // */-10 /** lp.getPixelArea() - 10*/
				})
			//}
		})
		

		console.timeEnd('calc pressure centers')
		return out;
	}


}