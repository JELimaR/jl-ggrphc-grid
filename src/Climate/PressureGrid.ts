import JGrid, { JGridPoint } from "../Geom/JGrid";
import JPoint from "../Geom/JPoint";
import { calcFieldInPoint } from './PressureFieldFunctions';

import DataInformationFilesManager from '../DataInformationLoadAndSave';
import TempGrid from "./TempGrid";
// import { calcMovementState, IMovementState } from "../Geom/Movement";
const dataInfoManager = DataInformationFilesManager.instance;

export interface IPressureZone {
	mag: number;
	point: JPoint;
}

export interface IPressureDataGrid {
	vecs: { x: number, y: number }[],
	pots: number[],
}

export class PressureData {
	_vecs: JPoint[];
	_pots: number[];

	constructor(id: IPressureDataGrid) {
		if (id.vecs.length !== 12) throw new Error('cantidad debe ser 12')
		if (id.pots.length !== 12) throw new Error('cantidad debe ser 12')
		this._vecs = id.vecs.map((v: { x: number, y: number }) => new JPoint(v.x, v.y));
		this._pots = [...id.pots];
	}

	get vecs() { return this._vecs }
	get pots() { return this._pots }
	getInterface(): IPressureDataGrid {
		return {
			vecs: this.vecs.map((vec: JPoint) => { return { x: vec.x, y: vec.y } }),
			pots: this._pots
		}
	}
}

export default class JPressureGrid {
	_grid: JGrid;
	_pressureData: PressureData[][] = [];
	_pressureCenters: Map<number, IPressureZone[]> = new Map<number, IPressureZone[]>();
	_pressureCentersLocationGrid: Map<number, number[][]> = new Map<number, number[][]>();
	_mmmData: Map<number, { med: number, max: number, min: number }> = new Map<number, { med: number, max: number, min: number }>();
	// _tempGrid: JClimateGrid;

	constructor(grid: JGrid, tempGrid: TempGrid) {
		this._grid = grid;
		// this._tempGrid = tempGrid;
		console.time('set pressures centers');
		for (let m = 1; m <= 12; m++) {
			const { pressCenter, locationGrid } = tempGrid.getPressureCenters(m);
			this._pressureCenters.set(m, pressCenter)
			this._pressureCentersLocationGrid.set(m, locationGrid);
		}
		console.timeEnd('set pressures centers');
		this._pressureData = this.setPressureData();
	}

	private setPressureData(): PressureData[][] {
		console.log('calculate and setting pressures values')
		console.time('set pressures info');
		let out: PressureData[][] = [];
		let info: IPressureDataGrid[][] = dataInfoManager.loadGridPressure(this._grid._granularity);
		if (info.length == 0) {
			this._grid._points.forEach((col: JGridPoint[], colIdx: number) => {
				let dataCol: IPressureDataGrid[] = [];
				col.forEach((gp: JGridPoint) => {
					let vecData: { x: number, y: number }[] = [];
					let potData: number[] = [];
					this._pressureCenters.forEach((pcs: IPressureZone[], m: number) => {
						let { vec, pot } = calcFieldInPoint(gp._point, pcs);
						vecData[m - 1] = vec.getInterface();
						potData[m - 1] = pot;
					})
					dataCol.push({
						vecs: [...vecData],
						pots: [...potData]
					})
				})
				if (colIdx % 20 == 0) {
					console.log('van:', colIdx, ', de:', this._grid.colsNumber)
					console.timeLog('set pressures info');
				}
				info.push(dataCol);
			})

			// info = this.smoothData(info);
			this._pressureCenters.forEach(( _pcs: IPressureZone[], m: number) => {
				let med: number = 0;
				info.forEach((infoCol: IPressureDataGrid[]) => {
					infoCol.forEach((elem: IPressureDataGrid) => {
						med += elem.pots[m - 1];
					})
				})
				med = med / (this._grid.colsNumber * this._grid.rowsNumber);
				this._grid._points.forEach((col: JGridPoint[], cidx: number) => {
					col.forEach((_gp: JGridPoint, ridx: number) => {
						info[cidx][ridx].pots[m - 1] -= med;
					})
				})
			})
			dataInfoManager.saveGridPressure(info, this._grid._granularity)
		}

		info.forEach((col: IPressureDataGrid[], _c: number) => {
			let outCol: PressureData[] = [];
			col.forEach((ipdata: IPressureDataGrid, _r: number) => {
				const npd: PressureData = new PressureData(ipdata);
				outCol.push(npd)
			})
			out.push(outCol);
		})
		console.timeEnd('set pressures info');
		return out;
	}
	
	smoothData(info: IPressureDataGrid[][]): IPressureDataGrid[][] {
		let out: IPressureDataGrid[][] = [];
		this._grid._points.forEach((col: JGridPoint[], colIdx: number) => {

			let dataCol: IPressureDataGrid[] = [];
			col.forEach((gp: JGridPoint, rowIdx: number) => {
				let potValArr: number[] = [...info[colIdx][rowIdx].pots], cant: number = 1;
				this._grid.getGridPointsInWindowGrade(gp._point, 5).forEach((wp: JGridPoint) => {
					const indexes = this._grid.getGridPointIndexes(wp._point);
					cant++;
					info[indexes.c][indexes.r].pots.forEach((p: number, i: number) => potValArr[i] += p)
				});
				dataCol.push({
					pots: potValArr.map((v: number, i: number) => 0.2 * v / cant + 0.8 * info[colIdx][rowIdx].pots[i]),
					vecs: info[colIdx][rowIdx].vecs
				})

				out.push(dataCol)
			})
		})
		return out;
	}
	
	getPointInfo(p: JPoint): PressureData {
		const indexes = this._grid.getGridPointIndexes(p);
		return this._pressureData[indexes.c][indexes.r];
	}

	getMaxMedMin(month: number): { med: number, min: number, max: number } {
		if (!!this._mmmData.get(month)) return this._mmmData.get(month)!;

		let med: number = 0, max: number = -Infinity, min: number = Infinity;
		this._pressureData.forEach((colVal: PressureData[]) => {
			colVal.forEach((elemVal: PressureData) => {
				if (elemVal.pots[month - 1] < min) min = elemVal.pots[month - 1];
				if (elemVal.pots[month - 1] > max) max = elemVal.pots[month - 1];
				med += elemVal.pots[month - 1];
			})
		})

		med = med / (this._grid.colsNumber * this._grid.rowsNumber);

		this._mmmData.set(month, { med, min, max })
		return {
			med, min, max
		}
	}

	isCloseLowPressure(point: JPoint, month: number): boolean {
		let out: boolean = false;
		const gp = this._grid.getGridPoint(point);

		const locations: number[][] = this._pressureCentersLocationGrid.get(month) as number[][];
		return locations[gp.colValue][gp.rowValue] === -1;
	}

	getPointsSorted(month: number): JGridPoint[] {
		let out: JGridPoint[];
		let list: { p: JGridPoint, v: number }[] = []
		this._grid.forEachPoint((gp: JGridPoint, cidx: number, ridx: number) => {
			list.push({ p: gp, v: this._pressureData[cidx][ridx]._pots[month - 1] });
		})
		list = list.sort((a: { p: JGridPoint, v: number }, b: { p: JGridPoint, v: number }) => a.v - b.v);
		out = list.map((elem: { p: JGridPoint, v: number }) => elem.p);
		return out;
	}
}