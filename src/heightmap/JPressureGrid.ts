import JGrid, { JGridPoint } from "../Geom/JGrid";
import JPoint from "../Geom/JPoint";
import * as TempFunctions from '../Climate/JTempFunctions';
import { applyCoriolis, calcCoriolisForce, calcFieldInPoint } from '../Climate/JPressureFieldFunctions';

import DataInformationFilesManager from '../DataInformationLoadAndSave';
import JClimateGrid from "./JClimateGrid";
import { calcMovementState, IMovementState } from "../Geom/Movement";
const dataInfoManager = DataInformationFilesManager.instance;

/*********************************************************************************************************/
const sat: number = 60000;
const TOTALPRECIPMAX = 400000;
const MASS = 1;
const time = .075;
const roz = 0.7;
const MAXEVAP = 100;
const MAXRAIN = 100;
const tempMin = -10;

export interface IPressureZone {
	mag: number;
	point: JPoint;
}

export interface IPressureDataGrid { // debe ser por mes
	vecs: { x: number, y: number }[],
	pots: number[],
}

interface IWindRoute {
	point: JPoint,
	precipOut: number,
	evapOut: number,
	accOut: number,
}

export interface IPrecipDataGenerated { value: number, cant: number }

export class PressureData {
	_vecs: JPoint[];
	_pots: number[];

	constructor(id: IPressureDataGrid) {
		if (id.vecs.length !== 7) throw new Error('cantidad debe ser 12')
		if (id.pots.length !== 7) throw new Error('cantidad debe ser 12')
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
	_mmmData: Map<number, {med: number, max: number, min: number}> = new Map<number, {med: number, max: number, min: number}>();
	// _tempGrid: JClimateGrid;

	constructor(grid: JGrid, tempGrid: JClimateGrid) {
		this._grid = grid;
		// this._tempGrid = tempGrid;
		console.time('set pressures centers');
		for (let m = 1; m <= 7; m++) {
			const {pressCenter, locationGrid} = tempGrid.getPressureCenters(m);
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

			this._pressureCenters.forEach((pcs: IPressureZone[], m: number) => {
				let med: number = 0;
				info.forEach((infoCol: IPressureDataGrid[]) => {
					infoCol.forEach((elem: IPressureDataGrid) => {
						med += elem.pots[m-1];
					})
				})
				med = med / (this._grid.colsNumber * this._grid.rowsNumber);
				this._grid._points.forEach((col: JGridPoint[], cidx: number) => {
					col.forEach((gp: JGridPoint, ridx: number) => {
						info[cidx][ridx].pots[m - 1] -= med;
					})
				})
			})
			// info = this.smoothData(info);
			dataInfoManager.saveGridPressure(info, this._grid._granularity)
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
/*
	smoothData(info: IPressureDataGrid[][]): IPressureDataGrid[][] {
		let out: IPressureDataGrid[][] = [];
		this._grid._points.forEach((col: JGridPoint[], colIdx: number) => {

			let dataCol: IPressureDataGrid[] = [];
			col.forEach((gp: JGridPoint, rowIdx: number) => {
				let potValArr: number[] = [...info[colIdx][rowIdx].pots], cant: number = 1;
				this._grid.getGridPointsInWindowGrade(gp._point, 2).forEach((wp: JGridPoint) => {
					const indexes = this._grid.getGridPointIndexes(wp._point);
					cant++;
					info[indexes.c][indexes.r].pots.forEach((p: number, i: number) => potValArr[i] += p)
				});
				dataCol.push({
					pots: potValArr.map((v: number) => v / cant),
					vecs: info[colIdx][rowIdx].vecs
				})

				out.push(dataCol)
			})
		})
		return out;
	}
*/
	getPointInfo(p: JPoint): PressureData {
		const indexes = this._grid.getGridPointIndexes(p);
		return this._pressureData[indexes.c][indexes.r];
	}

	getMaxMedMin(month: number): { med: number, min: number, max: number } {
		if ( !!this._mmmData.get(month) ) return this._mmmData.get(month)!;
		
		let med: number = 0, max: number = -Infinity, min: number = Infinity;
		this._pressureData.forEach((colVal: PressureData[]) => {
			colVal.forEach((elemVal: PressureData) => {
				if (elemVal.pots[month-1] < min) min = elemVal.pots[month-1];
				if (elemVal.pots[month-1] > max) max = elemVal.pots[month-1];
				med += elemVal.pots[month-1];
			})
		})

		med = med/(this._grid.colsNumber * this._grid.rowsNumber);

		this._mmmData.set(month, {	med, min, max	})
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
		out = list
			.sort((a: { p: JGridPoint, v: number }, b: { p: JGridPoint, v: number }) => a.v - b.v)
			.map((elem: { p: JGridPoint, v: number }) => elem.p);
		return out;
	}

	/*************************** SIMULATION ************************************/
	windSim() {
		let precipOut: Map<number, IPrecipDataGenerated[][]> = new Map<number, IPrecipDataGenerated[][]>();
		let routeOut: Map<number, Array<IWindRoute>[][]> = new Map<number, Array<IWindRoute>[][]>();

		console.time('wind sim iteration')
		this._pressureCenters.forEach((pcs: IPressureZone[], m: number) => {
			console.log('month:', m);
			let dataPrecip: IPrecipDataGenerated[][] = [];
			// let dataRoutes: Array<IWindRoute>[][] = [];
			this._grid.forEachPoint((gp: JGridPoint, cidx: number, ridx: number) => {
				if (!dataPrecip[cidx]) dataPrecip[cidx] = [];
				dataPrecip[cidx][ridx] = { value: 0, cant: 0 };
				// if (!dataRoutes[cidx]) dataRoutes[cidx] = [];
				// dataRoutes[cidx][ridx] = [];
			})
			
			let sortedList: JGridPoint[] = this.getPointsSorted(m);

			while (sortedList.length > 0) {
				// tiempos
				if (sortedList.length % 1000 == 0) {
					console.log('faltan:', sortedList.length);
					console.timeLog('wind sim iteration');
				}
				
				const gp: JGridPoint = sortedList.shift() as JGridPoint;
				if (gp._cell.isMarked()) continue

				let route: IWindRoute[] = [];
				const currPos: JPoint = new JPoint(gp._point.x, gp._point.y);

				if (this._pressureCentersLocationGrid.get(m)![gp.colValue][gp.rowValue] !== 1) {
					const wsOut = this.windSimIteration(currPos, m, dataPrecip, route);
					dataPrecip = wsOut.dataPrecip;
					// dataRoutes[gp.colValue][gp.rowValue] = wsOut.route;
				}				
			}

			this._grid.forEachPoint((gp: JGridPoint) => {
				gp._cell.dismark();
			})
			precipOut.set(m, dataPrecip);
			// routeOut.set(m, dataRoutes);
		})

		return {
			precip: precipOut,
			routes: routeOut
		}
	}

	windSimIteration( initPoint: JPoint, month: number,	dataPrecip: IPrecipDataGenerated[][], route: IWindRoute[]): { dataPrecip: IPrecipDataGenerated[][],	route: IWindRoute[]	} {
		
		route = [];
		let currPos = initPoint;
		let currVel = new JPoint(0, 0);
		let acc = 0;
	
		let gpprev: JGridPoint | undefined,  gpnew: JGridPoint | undefined;
	
		let cont: number = 0;
		let it: number = 0;
		for (it = 0; it < 5000 && cont < 100; it++) {
			if (this.isCloseLowPressure(currPos, month)) cont++;
			if ((!!gpprev && !!gpnew && gpprev === gpnew)) cont += 0.1//0.25 0.01;
			else cont = 0;
	
			gpprev = this._grid.getGridPoint(currPos);
			gpprev._cell.mark();
	
			// calc force
			let pd: PressureData = this.getPointInfo(currPos);
			let vec: JPoint = pd.vecs[month - 1];
			let cor: JPoint = /*new JPoint(0,0) //*/calcCoriolisForce({ pos: currPos, vel: currVel }, MASS);
			let netForce = vec.add(cor).sub(currVel.scale(roz));
			// new state
			const newState: IMovementState = calcMovementState({ pos: currPos, vel: currVel }, netForce, MASS, time);
			currPos = JPoint.pointToCoord(newState.pos);
			currVel = newState.vel;
			gpnew = this._grid.getGridPoint(currPos);
			// calc iter : evap and precip for currPos
			const {
				precipOut,
				evapOut,
				accOut,
			} = this.calcMoistureValuesIter(gpnew._cell.info.height, pd.pots[month - 1], acc, gpprev._cell.info.tempMonthArr[month - 1], gpprev._cell.info.isLand, this.getMaxMedMin(month));
			acc = accOut;
			route.push({ point: currPos, accOut, evapOut, precipOut })
	
			// asignar
			dataPrecip[gpprev.colValue][gpprev.rowValue].value += Math.cos(gpprev._point.y * Math.PI / 180) * precipOut;
			dataPrecip[gpprev.colValue][gpprev.rowValue].cant++;
			
			this._grid.getGridPointsInWindowGrade(currPos, this._grid._granularity).forEach((gpn: JGridPoint) => {
				dataPrecip[gpn.colValue][gpn.rowValue].value += Math.cos(gpprev!._point.y * Math.PI / 180) * precipOut * 0.65;
				dataPrecip[gpn.colValue][gpn.rowValue].cant++;
			})
		}
		
		return {
			dataPrecip,
			route
		}
	
	}

	calcMoistureValuesIter(nextHeight: number, pressValue: number, acc: number, temp: number, isLand: boolean, mmm: {med: number, max: number, min: number}): {
		precipOut: number,
		evapOut: number,
		accOut: number,
	} {
		let precipOut: number = 0;
		let evapOut: number = 0;
		let accOut: number = 0;	
	
		// pressValue
		let pval: number = 0;
		pval = ((-pressValue + mmm.max * 1.1) / (mmm.max - mmm.min)) ** 0.95;
	
		// nextHeight
		if (nextHeight >= 0.8) {
			precipOut = (nextHeight) ** 0.25 * acc * pval;
		} else if (nextHeight >= 0.2) {
			let exponent = (nextHeight < 0.5)	? 3 : ((nextHeight < 0.7) ? 2 : 0.5);
			precipOut = (nextHeight) ** exponent * acc * pval;
	
			if (temp - tempMin > 0) {
				evapOut = ((temp - tempMin) / (35 - tempMin)) * (precipOut + MAXRAIN * pval * 0.15);
			}
		} else {
			precipOut = (0.1 ** 3) * acc * pval;
			evapOut = ((temp - tempMin) / (35 - tempMin)) * (MAXEVAP + MAXRAIN * pval * 0.25);
		}
	
		if (precipOut > MAXRAIN) precipOut = MAXRAIN;
		if (evapOut > MAXEVAP) evapOut = MAXEVAP;
		
		accOut = (nextHeight >= 0.8) ? 0 : acc + evapOut - precipOut;
		if (accOut > sat) accOut = sat;
		if (accOut < 0) accOut = 0;
	
		return {
			precipOut,
			evapOut,
			accOut,
		}
	}

}