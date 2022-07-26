import { calcCoriolisForce, calcMovementState, IMovementState } from "./PressureFieldFunctions";
import JGrid, { JGridPoint } from "../Geom/JGrid";
import JPoint from "../Geom/JPoint";
import JPressureGrid, { IPressureZone, PressureData } from "./PressureGrid";
import TempGrid from "./TempGrid";
import { GRAN } from "../Geom/constants";
import { getArrayOfN } from "../utilFunctions";
import ShowerManager from "../toShow/ShowerManager";

const sat: number = 8000;
const roz = 0.71;
const MAXEVAP = 200;
const MAXRAIN = 100;
const tempMin = -25;

export class WindRoutePoint {
	constructor(
		public point: JPoint,
		public precipOut: number,
		public evapOut: number,
		public accOut: number
	) { }

	static fromInterface(wr: IWindRoute) {
		return new WindRoutePoint(
			JPoint.fromInterface(wr.point), wr.precipOut, wr.evapOut, wr.accOut
		)
	}

	getInterface(): IWindRoute {
		return {
			point: { x: this.point.x, y: this.point.y },
			precipOut: this.precipOut,
			evapOut: this.evapOut,
			accOut: this.accOut,
		}
	}
}

export interface IWindRoute {
	point: { x: number, y: number },
	precipOut: number,
	evapOut: number,
	accOut: number,
}

export interface IPrecipDataGenerated {
	precipValue: number;
	precipCant: number
	deltaTempValue: number;
	deltaTempCant: number;
} // agregar deltaT

export default class WindSimulate {

	private _grid: JGrid;
	private _pressGrid: JPressureGrid;
	private _tempGrid: TempGrid;

	constructor(grid: JGrid, pressGrid: JPressureGrid, tempGrid: TempGrid) {
		this._grid = grid;
		this._pressGrid = pressGrid;
		this._tempGrid = tempGrid;
	}

	windSim() {
		let precipOut: Map<number, IPrecipDataGenerated[][]> = new Map<number, IPrecipDataGenerated[][]>();
		let routeOut: Map<number, Array<WindRoutePoint>[][]> = new Map<number, Array<WindRoutePoint>[][]>();

		console.time('wind sim iteration')
		getArrayOfN(12, 0).forEach((_v: number, i: number) => {
			const m = i+1;
			console.log('month:', m);
			let dataPrecip: IPrecipDataGenerated[][] = [];
			let dataRoutes: Array<WindRoutePoint>[][] = [];
			this._grid.forEachPoint((_gp: JGridPoint, cidx: number, ridx: number) => {
				if (!dataPrecip[cidx]) dataPrecip[cidx] = [];
				dataPrecip[cidx][ridx] = { precipValue: 0, precipCant: 0, deltaTempCant: 0, deltaTempValue: 0 };
				if (!dataRoutes[cidx]) dataRoutes[cidx] = [];
				dataRoutes[cidx][ridx] = [];
			})

			let sortedList: JGridPoint[] = this._pressGrid.getPointsSorted(m);

			while (sortedList.length > 0) {
				// tiempos
				if (sortedList.length % 1000 == 0) {
					console.log('faltan:', sortedList.length);
					console.timeLog('wind sim iteration');
				}

				const gp: JGridPoint = sortedList.shift() as JGridPoint;
				if (gp.cell.isMarked()) continue

				let route: WindRoutePoint[] = [];
				const currPos: JPoint = new JPoint(gp.point.x, gp.point.y);
				let wsOut: { dataPrecip: IPrecipDataGenerated[][], route: WindRoutePoint[] }// = { dataPrecip: [], route: [] }
				// if (pressGrid._pressureCentersLocationGrid.get(m)![gp.colValue][gp.rowValue] !== 1) {
				wsOut = this.windSimIteration(currPos, m, dataPrecip, route);
				dataPrecip = wsOut.dataPrecip;
				// dataRoutes[gp.colValue][gp.rowValue] = wsOut.route;
				//}

			}
			this._grid.forEachPoint((gp: JGridPoint) => {
				gp.cell.dismark();
			})
			precipOut.set(m, dataPrecip);
			routeOut.set(m, dataRoutes);
		})
		
		return {
			precip: precipOut,
			routes: routeOut
		}
	}

	windSimIteration(initPoint: JPoint, month: number, dataPrecip: IPrecipDataGenerated[][], route: WindRoutePoint[]): { dataPrecip: IPrecipDataGenerated[][], route: WindRoutePoint[] } {

		route = [];
		let currPos = initPoint;
		let currVel = new JPoint(0, 0);
		let acc = 0;

		let gpprev: JGridPoint | undefined, gpnew: JGridPoint | undefined;

		let cont: number = 0;
		// let it: number = 0;
		// for (it = 0; /*it < 5000 && */cont < 1; it++) {
		while (cont < 1) {
			if (this._pressGrid.isCloseLowPressure(currPos, month)) cont++;
			if ((!!gpprev && !!gpnew && gpprev === gpnew)) cont += 0.2//0.25 0.01;
			else cont = 0;

			gpprev = this._grid.getGridPoint(currPos);
			gpprev.cell.mark();

			// calc force
			let pd: PressureData = this._pressGrid.getPointInfo(currPos);
			let vec: JPoint = pd.vecs[month - 1];
			let cor: JPoint = calcCoriolisForce({ pos: currPos, vel: currVel });
			let netForce = vec.add(cor).sub(currVel.scale(roz));
			// new state
			const newState: IMovementState = calcMovementState({ pos: currPos, vel: currVel }, netForce, GRAN);
			currPos = JPoint.pointToCoord(newState.pos);
			currVel = newState.vel;
			gpnew = this._grid.getGridPoint(currPos);
			// calc iter : evap and precip for currPos

			// if (gpprev !== gpnew) {
			const {
				precipOut,
				evapOut,
				accOut,
				deltaTempOut,
			} = this.calcMoistureValuesIter(gpnew, gpprev, acc, month);
			acc = accOut;
			if (gpprev !== gpnew)
				route.push(new WindRoutePoint(currPos, precipOut, evapOut, accOut));

			// asignar
			dataPrecip[gpprev.colValue][gpprev.rowValue].precipValue += /*((Math.cos(gpprev._point.y * Math.PI / 180) * 0.7 + 0.3) ** 1.0) */ precipOut;
			dataPrecip[gpprev.colValue][gpprev.rowValue].precipCant++;
			dataPrecip[gpnew.colValue][gpnew.rowValue].deltaTempValue += deltaTempOut;
			dataPrecip[gpnew.colValue][gpnew.rowValue].deltaTempCant++;
			/*
						this._grid.getGridPointsInWindowGrade(currPos, this._grid._granularity).forEach((gpn: JGridPoint) => {
							dataPrecip[gpn.colValue][gpn.rowValue].value += Math.cos(gpprev!._point.y * Math.PI / 180) * precipOut * 0.65;
							dataPrecip[gpn.colValue][gpn.rowValue].cant++;
						})
						*/
			// }
		}

		return {
			dataPrecip,
			route
		}

	}

	calcMoistureValuesIter(gpnew: JGridPoint, gpprev: JGridPoint, acc: number, month: number): {
		precipOut: number,
		evapOut: number,
		accOut: number,
		deltaTempOut: number,
	} {
		// variables de entrada
		const nextHeight: number = gpnew.cell.info.height;
		const currHeight: number = gpprev.cell.info.height;
		// const nextPress: number = this._pressGrid.getPointInfo(gpnew._point).pots[month - 1];
		const currPress: number = this._pressGrid.getPointInfo(gpprev.point).pots[month - 1];
		const nextTemp: number = this._tempGrid.getPointInfo(gpprev.point).tempMonth[month - 1];
		const currTemp: number = this._tempGrid.getPointInfo(gpnew.point).tempMonth[month - 1];
		const tempParam: number = currTemp < tempMin ? 0 : (currTemp - tempMin) / (35 - tempMin);
		const mmm: { med: number, max: number, min: number } = this._pressGrid.getMaxMedMin(month);
		// salidas
		let precipOut: number = 0;
		let evapOut: number = 0;
		let accOut: number = 0;
		let deltaTempOut: number = (nextHeight > 0.2 ? 2 : 10) * (currTemp - nextTemp);

		// pressValue
		let pval: number = 0;
		if (currPress == 0) throw new Error('pressValue es 0')
		pval = (currPress > 0) ? currPress / mmm.max : -mmm.min / currPress; // entre -1 y 1
		if (Math.abs(pval) < 0.02)
			pval = (pval > 0) ? 0.02 : -0.02;

		pval = ((pval > 0) ? 1 / pval : 100 + 1 / pval) / 100;// (mmm.max - mmm.min)
		if (pval < 0) console.log(pval)
		pval = (0.95 * pval + 0.05) ** 3;


		// nextHeight		
		if (nextHeight >= 0.84) {
			precipOut = (nextHeight ** 0.45) * acc;
		} else if (nextHeight >= 0.2) {
			let exponent = (nextHeight < 0.5) ? 2 : ((nextHeight < 0.7) ? 1.5 : 0.45);
			precipOut = ((currHeight <= nextHeight) ? 0.5 : 0.0) * (nextHeight ** exponent + pval) * acc;
			if (precipOut > acc) precipOut = acc;
			if (precipOut > MAXRAIN) precipOut = MAXRAIN;

			evapOut = (tempParam + pval * 0.11) * (precipOut < 10 ? 10 : precipOut + MAXEVAP * 0.25); // adaptar 
		} else {
			precipOut = 0.04 * ((0.1 ** 3) + pval) * acc;
			if (currTemp - tempMin > 0)
				evapOut = (tempParam + pval * 0.11) * (MAXEVAP * 1.5);
		}

		// precip real value
		if (precipOut > MAXRAIN) precipOut = MAXRAIN;
		if (precipOut > acc) precipOut = acc;
		// evap real value
		if (evapOut > MAXEVAP) evapOut = MAXEVAP;

		accOut = (nextHeight >= 0.84) ? 0 : acc + evapOut - precipOut;
		if (accOut > sat * (0.1 + 0.9 * tempParam)) accOut = sat * (0.1 + 0.9 * tempParam);
		if (accOut < 0) accOut = 0;

		return {
			precipOut,
			evapOut,
			accOut,
			deltaTempOut
		}
	}
}