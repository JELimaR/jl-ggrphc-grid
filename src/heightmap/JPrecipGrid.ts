import JGrid, { JGridPoint } from '../Geom/JGrid';
import JPressureGrid from './JPressureGrid';
import DataInformationFilesManager from '../DataInformationLoadAndSave';
import JPoint from '../Geom/JPoint';
import JWindSimulate, { IPrecipDataGenerated } from './JWindSimulate';
import JTempGrid from './JTempGrid';
const dataInfoManager = DataInformationFilesManager.instance;

export interface IPrecipData {
	precip: number[];
	deltaTemps: number[];
}

export default class JPrecipGrid {
	_grid: JGrid;
	_precipData: IPrecipData[][] = []; // borrar asignacion

	constructor(pressGrid: JPressureGrid, tempGrid: JTempGrid) {
		this._grid = pressGrid._grid;
		this._precipData = this.setPrecipData(pressGrid, tempGrid);
		
	}

	private setPrecipData(pressGrid: JPressureGrid, tempGrid: JTempGrid): IPrecipData[][] {
		let out: IPrecipData[][] = dataInfoManager.loadGridPrecip(this._grid._granularity);
		if (out.length == 0) {
			out = [];
			const jws: JWindSimulate = new JWindSimulate(pressGrid, tempGrid);
			const ws = jws.windSim();

			ws.precip.forEach((generated: IPrecipDataGenerated[][], month: number) => {
				generated = this.smoothDeltaTemp(generated);
				generated = this.smoothDeltaTemp(generated);
				this._grid.forEachPoint((gp: JGridPoint, cidx: number, ridx: number) => {
					if (!out[cidx]) out[cidx] = [];
					if (!out[cidx][ridx]) out[cidx][ridx] = { precip: [], deltaTemps: []/*, routes: []*/ };
					const gen = generated[cidx][ridx];
					out[cidx][ridx].precip[month - 1] = gen.precipCant === 0 ? 0 : gen.precipValue / gen.precipCant;
					out[cidx][ridx].deltaTemps[month - 1] = gen.deltaTempValue;
					// hacer mejor
					// tempGrid._tempData[cidx][ridx].tempMonth[month - 1] += gen.deltaTempValue;
				})

			})
			// tempGrid.smoothTemp(2)
			/*
			ws.routes.forEach((route: JWindRoutePoint[][][], month: number) => {
				this._grid.forEachPoint((gp: JGridPoint, cidx: number, ridx: number) => {
					out[cidx][ridx].routes[month-1] = route[cidx][ridx];
				})
			})
			*/
			out = this.smoothData(out);
			out = this.smoothData(out);

			let precipMax: number = 0;
			this._grid.forEachPoint((gp: JGridPoint, cidx: number, ridx: number) => {
				const gmax = Math.max(...out[cidx][ridx].precip);
				if (precipMax < gmax) precipMax = gmax;
			})

			this._grid.forEachPoint((gp: JGridPoint, cidx: number, ridx: number) => {
				out[cidx][ridx].precip = out[cidx][ridx].precip.map((r: number) => ((r/100) ** 1.6) * 3544.1 * (0.2 + 0.8*Math.cos(gp._point.y * Math.PI/180)))
			})

			dataInfoManager.saveGridPrecip(out, this._grid._granularity);
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
				precipArr.forEach((v: number, mi: number) => {
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
		this._grid.forEachPoint((gp: JGridPoint, cidx: number, ridx: number) => {
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