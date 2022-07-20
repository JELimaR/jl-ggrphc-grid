import JGrid, { JGridPoint } from '../Geom/JGrid';
import JPressureGrid from './PressureGrid';
import DataInformationFilesManager from '../DataInformationLoadAndSave';
import JPoint from '../Geom/JPoint';
import WindSimulate, { IPrecipDataGenerated } from './WindSimulator';
import TempGrid from './TempGrid';
const dataInfoManager = DataInformationFilesManager.instance;

export interface IPrecipData {
	precip: number[];
	deltaTemps: number[];
}

export default class PrecipGrid {
	_grid: JGrid;
	_precipData: IPrecipData[][] = []; // borrar asignacion

	constructor(pressGrid: JPressureGrid, tempGrid: TempGrid) {
		this._grid = pressGrid._grid;
		console.log('calculate and setting precip info')
		console.time('set precip info')
		this._precipData = this.getPrecipData(pressGrid, tempGrid);
		console.timeEnd('set precip info')
	}

	private getPrecipData(pressGrid: JPressureGrid, tempGrid: TempGrid): IPrecipData[][] {
		// let out: IPrecipData[][] = dataInfoManager.loadGridPrecip(this._grid._granularity);
		let out: IPrecipData[][] = dataInfoManager.loadGridData<IPrecipData>(this._grid._granularity, 'precip');
		if (out.length == 0) {
			out = [];
			const jws: WindSimulate = new WindSimulate(pressGrid, tempGrid);
			const ws = jws.windSim();

			ws.precip.forEach((generated: IPrecipDataGenerated[][], month: number) => {
				generated = this.smoothDeltaTemp(generated);
				generated = this.smoothDeltaTemp(generated);
				this._grid.forEachPoint((_gp: JGridPoint, cidx: number, ridx: number) => {
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
			this._grid.forEachPoint((_: JGridPoint, cidx: number, ridx: number) => {
				const gmax = Math.max(...out[cidx][ridx].precip);
				if (precipMax < gmax) precipMax = gmax;
			})

			this._grid.forEachPoint((gp: JGridPoint, cidx: number, ridx: number) => {
				out[cidx][ridx].precip = out[cidx][ridx].precip.map((r: number) => ((r/100) ** 1.6) * 3344.1 * (0.2 + 0.8*Math.cos(gp._point.y * Math.PI/180)))
			})

			// dataInfoManager.saveGridPrecip(out, this._grid._granularity);
			dataInfoManager.saveGridData<IPrecipData>(out, this._grid._granularity, 'precip');
		}

		return out;
	}

	private smoothData(din: IPrecipData[][]) {
		let dout: IPrecipData[][] = [];

		this._grid.forEachPoint((gp: JGridPoint, cidx: number, ridx: number) => {
			if (!dout[cidx]) dout[cidx] = [];
			let precipArr: number[] = [
				0,0,0,0,
				0,0,0,0,
				0,0,0,0];
			const neigs: JGridPoint[] = this._grid.getGridPointsInWindowGrade(gp._point, 5)
			neigs.forEach((gpw: JGridPoint) => {
				precipArr.forEach((_v: number, mi: number) => {
					precipArr[mi] += din[gpw.colValue][gpw.rowValue].precip[mi];
				})
			})
			dout[cidx][ridx] = {
				precip: precipArr.map((v: number, i: number) => 0.55 * v / neigs.length + 0.45 * din[cidx][ridx].precip[i]),
				deltaTemps: din[cidx][ridx].deltaTemps
				// routes: din[cidx][ridx].routes
			};
		})

		return dout;
	}

	private smoothDeltaTemp(dtin: IPrecipDataGenerated[][]): IPrecipDataGenerated[][] {
		let dtout: IPrecipDataGenerated[][] = [];
		this._grid.forEachPoint((_gp: JGridPoint, cidx: number, ridx: number) => {
			dtin[cidx][ridx].deltaTempValue = (dtin[cidx][ridx].deltaTempCant != 0)
				? dtin[cidx][ridx].deltaTempValue / dtin[cidx][ridx].deltaTempCant
				: 0;
		})

		this._grid.forEachPoint((gp: JGridPoint, cidx: number, ridx: number) => {
			if (!dtout[cidx]) dtout[cidx] = [];
			const neigs: JGridPoint[] = this._grid.getGridPointsInWindowGrade(gp._point, 5);
			let sum: number = 0;
			neigs.forEach((gpw: JGridPoint) => {
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

	getPointInfo(p: JPoint): IPrecipData {
		const indexes = this._grid.getGridPointIndexes(p);
		return this._precipData[indexes.c][indexes.r];
	}

}