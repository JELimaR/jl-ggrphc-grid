import JGrid, { JGridPoint } from "../Geom/JGrid";
import JPoint from "../Geom/JPoint";
import * as TempFunctions from '../Climate/JTempFunctions';
import { applyCoriolis, calcFieldInPoint } from '../Climate/JPressureFieldFunctions';

import DataInformationFilesManager from '../DataInformationLoadAndSave';
import JClimateGrid from "./JClimateGrid";
const dataInfoManager = DataInformationFilesManager.instance;

/*********************************************************************************************************/
export interface IPressureZone {
	mag: number;
	point: JPoint;
}

export interface IPressureDataGrid { // debe ser por mes
	vecs: { x: number, y: number }[],
	pots: number[],
}

export class PressureData {
	_vecs: JPoint[];
	_pots: number[];

	constructor(id: IPressureDataGrid) {
		if (id.vecs.length !== 2) throw new Error('cantidad debe ser 12')
		if (id.pots.length !== 2) throw new Error('cantidad debe ser 12')
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

	constructor(grid: JGrid, tempGrid: JClimateGrid) {
		this._grid = grid;
		console.time('set pressures centers');
		for (let m = 1; m <= 2; m++) {
			this._pressureCenters.set(m, tempGrid.getPressureCenters(m))
		}
		console.timeEnd('set pressures centers');
		this._pressureData = this.setPressureData();
	}

	private setPressureData(): PressureData[][] {
		console.log('calculate and setting pressures values')
		console.time('set pressures info');
		let out: PressureData[][] = [];
		let info: IPressureDataGrid[][] = dataInfoManager.loadGridPressure();
		if (info.length == 0) {
			this._grid._points.forEach((col: JGridPoint[], colIdx: number) => {
				let dataCol: IPressureDataGrid[] = [];
				col.forEach((gp: JGridPoint, rowIdx: number) => {
					let vecData: { x: number, y: number }[] = [];
					let potData: number[] = [];
					this._pressureCenters.forEach((pcs: IPressureZone[], m: number) => {
						let { vec, pot } = calcFieldInPoint(gp._point, pcs);
						vecData[m - 1] = { x: vec.x, y: vec.y };
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
			dataInfoManager.saveGridPressure(info)
		}
		info.forEach((col: IPressureDataGrid[], c: number) => {
			let outCol: PressureData[] = [];
			col.forEach((ipdata: IPressureDataGrid, r: number) => {
				const npd: PressureData = new PressureData(ipdata);
				outCol.push(npd)
			})
			out.push(outCol);
		})
		console.timeEnd('set pressures info');
		return out;
	}

	getPointInfo(p: JPoint): PressureData {
		const indexes = this._grid.getGridPointIndexes(p);
		return this._pressureData[indexes.c][indexes.r];
	}

}