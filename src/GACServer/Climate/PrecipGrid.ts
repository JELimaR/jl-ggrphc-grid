import InformationFilesManager from "../../DataFileLoadAndSave/InformationFilesManager";
import Grid from "../../Grid/Grid";
import GridPoint from "../../Grid/GridPoint";
import DataGrid from "../DataGrid";
import PressureGrid from "./PressureGrid";
import TempGrid from "./TempGrid";
import WindSimulate, { IPrecipDataGenerated } from "./WindSimulator";

export interface IPrecipData {
	precip: number[];
	deltaTemps: number[];
}

export default class PrecipGrid extends DataGrid<IPrecipData> {

	constructor(grid: Grid, pressGrid: PressureGrid, tempGrid: TempGrid) {
		super(grid);
		console.log('calculate and setting precip info')
		console.time('set precip info')
		this.matrixData = this.getPrecipData(pressGrid, tempGrid);
		console.timeEnd('set precip info')
	}

	private getPrecipData(pressGrid: PressureGrid, tempGrid: TempGrid): IPrecipData[][] {
		const ifm = InformationFilesManager.instance;
		let out: IPrecipData[][] = ifm.loadGridData<IPrecipData>('precip');
		if (out.length == 0) {
			out = [];
			const jws: WindSimulate = new WindSimulate(this.grid, pressGrid, tempGrid);
			const ws = jws.windSim();

			ws.precip.forEach((generated: IPrecipDataGenerated[][], month: number) => {
				generated = this.smoothDeltaTemp(generated);
				generated = this.smoothDeltaTemp(generated);
				this.grid.forEachPoint((_gp: GridPoint, cidx: number, ridx: number) => {
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
			this.grid.forEachPoint((_: GridPoint, cidx: number, ridx: number) => {
				const gmax = Math.max(...out[cidx][ridx].precip);
				if (precipMax < gmax) precipMax = gmax;
			})

			this.grid.forEachPoint((gp: GridPoint, cidx: number, ridx: number) => {
				out[cidx][ridx].precip = out[cidx][ridx].precip.map((r: number) => {
					return ((r / 100) ** 1.6) * 3444.1 * (0.2 + 0.8 * Math.cos(gp.point.y * Math.PI / 180))
				})
			})

			ifm.saveGridData<IPrecipData>(out, 'precip');
		}

		return out;
	}

	private smoothData(din: IPrecipData[][]) {
		let dout: IPrecipData[][] = [];

		this.grid.forEachPoint((gp: GridPoint, cidx: number, ridx: number) => {
			if (!dout[cidx]) dout[cidx] = [];
			let precipArr: number[] = [
				0, 0, 0, 0,
				0, 0, 0, 0,
				0, 0, 0, 0];
			const neigs: GridPoint[] = this.grid.getGridPointsInWindowGrade(gp.point, 5)
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
		this.grid.forEachPoint((_gp: GridPoint, cidx: number, ridx: number) => {
			dtin[cidx][ridx].deltaTempValue = (dtin[cidx][ridx].deltaTempCant != 0)
				? dtin[cidx][ridx].deltaTempValue / dtin[cidx][ridx].deltaTempCant
				: 0;
		})

		this.grid.forEachPoint((gp: GridPoint, cidx: number, ridx: number) => {
			if (!dtout[cidx]) dtout[cidx] = [];
			const neigs: GridPoint[] = this.grid.getGridPointsInWindowGrade(gp.point, 5);
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
}