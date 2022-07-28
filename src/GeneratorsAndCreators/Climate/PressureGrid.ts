import { calcFieldInPoint } from "./PressureFieldFunctions";
import InformationFilesManager from "../../DataFileLoadAndSave/InformationFilesManager";
import Point from "../../Geom/Point";
import Grid from "../../Grid/Grid";
import GridPoint from "../../Grid/GridPoint";
import DataGrid from "../DataGrid";
import TempGrid from "./TempGrid";

export interface IPressureZone {
	mag: number;
	point: Point;
}

export interface IPressureDataGrid {
	vecs: { x: number, y: number }[],
	pots: number[],
}

export class PressureData {
	private _vecs: Point[];
	private _pots: number[];

	constructor(id: IPressureDataGrid) {
		if (id.vecs.length !== 12) throw new Error('cantidad debe ser 12')
		if (id.pots.length !== 12) throw new Error('cantidad debe ser 12')
		this._vecs = id.vecs.map((v: { x: number, y: number }) => new Point(v.x, v.y));
		this._pots = [...id.pots];
	}

	get vecs() { return this._vecs }
	get pots() { return this._pots }
	getInterface(): IPressureDataGrid {
		return {
			vecs: this.vecs.map((vec: Point) => { return { x: vec.x, y: vec.y } }),
			pots: this._pots
		}
	}
}

export default class PressureGrid extends DataGrid<PressureData> {

	private _pressureCenters: Map<number, IPressureZone[]> = new Map<number, IPressureZone[]>();
	private _pressureCentersLocationGrid: Map<number, number[][]> = new Map<number, number[][]>();
	private _mmmData: Map<number, { med: number, max: number, min: number }> = new Map<number, { med: number, max: number, min: number }>();

	constructor(grid: Grid, tempGrid: TempGrid) {
		super(grid)
		console.time('set pressures centers');
		for (let m = 1; m <= 12; m++) {
			const { pressCenter, locationGrid } = tempGrid.getPressureCenters(m);
			this._pressureCenters.set(m, pressCenter)
			this._pressureCentersLocationGrid.set(m, locationGrid);
		}
		console.timeEnd('set pressures centers');
		this.matrixData = this.setPressureData();
	}

	private setPressureData(): PressureData[][] {
		const ifm = InformationFilesManager.instance;
		console.log('calculate and setting pressures values')
		console.time('set pressures info');
		let out: PressureData[][] = [];
		let info: IPressureDataGrid[][] = ifm.loadGridData<IPressureDataGrid>('pressure');
		if (info.length == 0) {
			this.grid.points.forEach((col: GridPoint[], colIdx: number) => {
				let dataCol: IPressureDataGrid[] = [];
				col.forEach((gp: GridPoint) => {
					let vecData: { x: number, y: number }[] = [];
					let potData: number[] = [];
					this._pressureCenters.forEach((pcs: IPressureZone[], m: number) => {
						let { vec, pot } = calcFieldInPoint(gp.point, pcs);
						vecData[m - 1] = vec.getInterface();
						potData[m - 1] = pot;
					})
					dataCol.push({
						vecs: [...vecData],
						pots: [...potData]
					})
				})
				if (colIdx % 20 == 0) {
					console.log('van:', colIdx, ', de:', this.grid.colsNumber)
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
				med = med / (this.grid.colsNumber * this.grid.rowsNumber);
				this.grid.points.forEach((col: GridPoint[], cidx: number) => {
					col.forEach((_gp: GridPoint, ridx: number) => {
						info[cidx][ridx].pots[m - 1] -= med;
					})
				})
			})

			ifm.saveGridData<IPressureDataGrid>(info, 'pressure');
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
		this.grid.points.forEach((col: GridPoint[], colIdx: number) => {

			let dataCol: IPressureDataGrid[] = [];
			col.forEach((gp: GridPoint, rowIdx: number) => {
				let potValArr: number[] = [...info[colIdx][rowIdx].pots], cant: number = 1;
				this.grid.getGridPointsInWindowGrade(gp.point, 5).forEach((wp: GridPoint) => {
					const indexes = this.grid.getGridPointIndexes(wp.point);
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
	
	getPointInfo(p: Point): PressureData {
		const indexes = this.grid.getGridPointIndexes(p);
		return this.matrixData[indexes.c][indexes.r];
	}

	getMaxMedMin(month: number): { med: number, min: number, max: number } {
		if (!!this._mmmData.get(month)) return this._mmmData.get(month)!;

		let med: number = 0, max: number = -Infinity, min: number = Infinity;
		this.matrixData.forEach((colVal: PressureData[]) => {
			colVal.forEach((elemVal: PressureData) => {
				if (elemVal.pots[month - 1] < min) min = elemVal.pots[month - 1];
				if (elemVal.pots[month - 1] > max) max = elemVal.pots[month - 1];
				med += elemVal.pots[month - 1];
			})
		})

		med = med / (this.grid.colsNumber * this.grid.rowsNumber);

		this._mmmData.set(month, { med, min, max })
		return {
			med, min, max
		}
	}

	isCloseLowPressure(point: Point, month: number): boolean {
		let out: boolean = false;
		const gp = this.grid.getGridPoint(point);

		const locations: number[][] = this._pressureCentersLocationGrid.get(month) as number[][];
		return locations[gp.colValue][gp.rowValue] === -1;
	}

	getPointsSorted(month: number): GridPoint[] {
		let out: GridPoint[];
		let list: { p: GridPoint, v: number }[] = []
		this.grid.forEachPoint((gp: GridPoint, cidx: number, ridx: number) => {
			list.push({ p: gp, v: this.matrixData[cidx][ridx].pots[month - 1] });
		})
		list = list.sort((a: { p: GridPoint, v: number }, b: { p: GridPoint, v: number }) => a.v - b.v);
		out = list.map((elem: { p: GridPoint, v: number }) => elem.p);
		return out;
	}
}