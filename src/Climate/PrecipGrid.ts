import Grid, { GridPoint } from '../Geom/Grid';
import JPressureGrid from './PressureGrid';
import InformationFilesManager from '../DataInformationLoadAndSave';
import Point from '../Geom/Point';
import WindSimulate, { IPrecipDataGenerated } from './WindSimulator';
import TempGrid from './TempGrid';
import { GRAN } from '../Geom/constants';
const dataInfoManager = InformationFilesManager.instance;

export interface IPrecipData {
	precip: number[];
	deltaTemps: number[];
}

export default class PrecipGrid {
	private _grid: Grid;
	private _precipData: IPrecipData[][] = []; // borrar asignacion

	constructor(grid: Grid, pressGrid: JPressureGrid, tempGrid: TempGrid) {
		this._grid = grid;
		console.log('calculate and setting precip info')
		console.time('set precip info')
		this._precipData = this.getPrecipData(pressGrid, tempGrid);
		console.timeEnd('set precip info')
	}

	private getPrecipData(pressGrid: JPressureGrid, tempGrid: TempGrid): IPrecipData[][] {
		// let out: IPrecipData[][] = dataInfoManager.loadGridPrecip(this._grid._granularity);
		let out: IPrecipData[][] = dataInfoManager.loadGridData<IPrecipData>('precip');
		if (out.length == 0) {
			out = [];
			const jws: WindSimulate = new WindSimulate(this._grid, pressGrid, tempGrid);
			const ws = jws.windSim();

			ws.precip.forEach((generated: IPrecipDataGenerated[][], month: number) => {
				generated = this.smoothDeltaTemp(generated);
				generated = this.smoothDeltaTemp(generated);
				this._grid.forEachPoint((_gp: GridPoint, cidx: number, ridx: number) => {
					if (!out[cidx]) out[cidx] = [];
					if (!out[cidx][ridx]) out[cidx][ridx] = { precip: [], deltaTemps: []/*, routes: []*/ };
					const gen = generated[cidx][ridx];
					out[cidx][ridx].precip[month - 1] = gen.precipCant === 0 ? 0 : gen.precipValue / gen.precipCant;
					out[cidx][ridx].deltaTemps[month - 1] = gen.deltaTempValue;
				})

			})

			out = this.smoothData(out);
			out = this.smoothData(out);

			let precipMax: number = 0;
			this._grid.forEachPoint((_: GridPoint, cidx: number, ridx: number) => {
				const gmax = Math.max(...out[cidx][ridx].precip);
				if (precipMax < gmax) precipMax = gmax;
			})

			this._grid.forEachPoint((gp: GridPoint, cidx: number, ridx: number) => {
				out[cidx][ridx].precip = out[cidx][ridx].precip.map((r: number) => {
					return ((r / 100) ** 1.6) * 3344.1 * (0.4 + 0.6 * Math.cos(gp.point.y * Math.PI / 180))
				})
			})

			// dataInfoManager.saveGridData<IPrecipData>(out, 'precip');
		}

		return out;
	}

	private smoothData(din: IPrecipData[][]) {
		let dout: IPrecipData[][] = [];

		this._grid.forEachPoint((gp: GridPoint, cidx: number, ridx: number) => {
			if (!dout[cidx]) dout[cidx] = [];
			let precipArr: number[] = [
				0, 0, 0, 0,
				0, 0, 0, 0,
				0, 0, 0, 0];
			const neigs: GridPoint[] = this._grid.getGridPointsInWindowGrade(gp.point, 5)
			neigs.forEach((gpw: GridPoint) => {
				precipArr.forEach((_v: number, mi: number) => {
					precipArr[mi] += din[gpw.colValue][gpw.rowValue].precip[mi];
				})
			})
			dout[cidx][ridx] = {
				precip: precipArr.map((v: number, i: number) => 0.65 * v / neigs.length + 0.35 * din[cidx][ridx].precip[i]),
				deltaTemps: din[cidx][ridx].deltaTemps
				// routes: din[cidx][ridx].routes
			};
		})

		return dout;
	}

	private smoothDeltaTemp(dtin: IPrecipDataGenerated[][]): IPrecipDataGenerated[][] {
		let dtout: IPrecipDataGenerated[][] = [];
		this._grid.forEachPoint((_gp: GridPoint, cidx: number, ridx: number) => {
			dtin[cidx][ridx].deltaTempValue = (dtin[cidx][ridx].deltaTempCant != 0)
				? dtin[cidx][ridx].deltaTempValue / dtin[cidx][ridx].deltaTempCant
				: 0;
		})

		this._grid.forEachPoint((gp: GridPoint, cidx: number, ridx: number) => {
			if (!dtout[cidx]) dtout[cidx] = [];
			const neigs: GridPoint[] = this._grid.getGridPointsInWindowGrade(gp.point, 5);
			let sum: number = 0;
			neigs.forEach((gpw: GridPoint) => {
				sum += dtin[gpw.colValue][gpw.rowValue].deltaTempValue;
			})
			dtout[cidx][ridx] = {
				...dtin[cidx][ridx],
				deltaTempValue: 0.9 * sum / neigs.length + 0.1 * dtin[cidx][ridx].deltaTempValue,
				deltaTempCant: 1
			}
		})

		return dtout;
	}

	getPointInfo(p: Point): IPrecipData {
		const indexes = this._grid.getGridPointIndexes(p);
		return this._precipData[indexes.c][indexes.r];
	}

}