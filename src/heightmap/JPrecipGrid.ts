import JGrid, {JGridPoint} from '../Geom/JGrid';
import JPressureGrid, {IPrecipDataGenerated} from './JPressureGrid';
import DataInformationFilesManager from '../DataInformationLoadAndSave';
import JPoint from '../Geom/JPoint';
const dataInfoManager = DataInformationFilesManager.instance;

export interface IPrecipData {
	precip: number[];
}

export default class JPrecipGrid {
	_grid: JGrid;
	_precipData: IPrecipData[][] = []; // borrar asignacion

	constructor(pressGrid: JPressureGrid) {
		this._grid = pressGrid._grid;
		this._precipData = this.setPrecipData(pressGrid);
	}

	private setPrecipData(pressGrid: JPressureGrid): IPrecipData[][] {
		let out: IPrecipData[][] = dataInfoManager.loadGridPrecip(this._grid._granularity);
		if (out.length == 0) {
			out = [];
			const ws = pressGrid.windSim();
	
			ws.precip.forEach((generated: IPrecipDataGenerated[][], month: number) => {
				this._grid.forEachPoint((gp: JGridPoint, cidx: number, ridx: number) => {
					if (!out[cidx]) out[cidx] = [];
					if (!out[cidx][ridx]) out[cidx][ridx] = {precip: []};
					out[cidx][ridx].precip[month-1] = generated[cidx][ridx].value / generated[cidx][ridx].cant * 6;
				})
			})
			out = this.smoothData(out);
			
			dataInfoManager.saveGridPrecip(out, this._grid._granularity);
		}
		
		return out;
	}

	private smoothData(din: IPrecipData[][]) {
		let dout: IPrecipData[][] = [];

		this._grid.forEachPoint((gp: JGridPoint, cidx: number, ridx: number) => {
			if (!dout[cidx]) dout[cidx] = [];
			let precipArr: number[] = [];
			din[0][0].precip.forEach((v: number) => { precipArr.push(0) })
			const neigs: JGridPoint[] = this._grid.getGridPointsInWindowGrade(gp._point, 5)
			neigs.forEach((gpw: JGridPoint) => {
				din[0][0].precip.forEach((v: number, mi: number) => {
					precipArr[mi] += din[gpw.colValue][gpw.rowValue].precip[mi];
				})
			})
			dout[cidx][ridx] = {precip: precipArr.map((v:number) => v/neigs.length)};
		})

		return dout;
	}

	getPointInfo(p: JPoint): IPrecipData {
		const indexes = this._grid.getGridPointIndexes(p);
		return this._precipData[indexes.c][indexes.r];
	}
	
}