import { calcCoriolisForce, calcMovementState, IMovementState } from "../Climate/JPressureFieldFunctions";
import { JGridPoint } from "../Geom/JGrid";
import JPoint from "../Geom/JPoint";
import JPressureGrid, { IPressureZone, PressureData } from "./JPressureGrid";

const sat: number = 60000;
const roz = 0.7;
const MAXEVAP = 100;
const MAXRAIN = 100;
const tempMin = -20;


export class JWindRoutePoint {
	constructor(
		public point: JPoint,
		public precipOut: number,
		public evapOut: number,
		public accOut: number
	) {}

	static fromInterface(wr: IWindRoute) {
		return new JWindRoutePoint(
			JPoint.fromInterface(wr.point), wr.precipOut,	wr.evapOut, wr.accOut
		)
	}

	getInterface(): IWindRoute {
		return {
			point: {x: this.point.x, y: this.point.y},
			precipOut: this.precipOut,
			evapOut: this.evapOut,
			accOut: this.accOut,
		}
	}
}

export interface IWindRoute {
	point: {x: number, y: number},
	precipOut: number,
	evapOut: number,
	accOut: number,
}

export interface IPrecipDataGenerated { value: number, cant: number }

export default class JWindSimulate {

	private _pressGrid: JPressureGrid;
	
	constructor(pressGrid: JPressureGrid) {
		this._pressGrid = pressGrid;
	}
	
	windSim() {
		let precipOut: Map<number, IPrecipDataGenerated[][]> = new Map<number, IPrecipDataGenerated[][]>();
		let routeOut: Map<number, Array<JWindRoutePoint>[][]> = new Map<number, Array<JWindRoutePoint>[][]>();

		console.time('wind sim iteration')
		this._pressGrid._pressureCenters.forEach((pcs: IPressureZone[], m: number) => {
			console.log('month:', m);
			let dataPrecip: IPrecipDataGenerated[][] = [];
			let dataRoutes: Array<JWindRoutePoint>[][] = [];
			this._pressGrid._grid.forEachPoint((gp: JGridPoint, cidx: number, ridx: number) => {
				if (!dataPrecip[cidx]) dataPrecip[cidx] = [];
				dataPrecip[cidx][ridx] = { value: 0, cant: 0 };
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
				if (gp._cell.isMarked()) continue

				let route: JWindRoutePoint[] = [];
				const currPos: JPoint = new JPoint(gp._point.x, gp._point.y);
				let wsOut: { dataPrecip: IPrecipDataGenerated[][], route: JWindRoutePoint[] } = {dataPrecip: [], route: []}
				// if (pressGrid._pressureCentersLocationGrid.get(m)![gp.colValue][gp.rowValue] !== 1) {
					wsOut = this.windSimIteration(currPos, m, dataPrecip, route);
					dataPrecip = wsOut.dataPrecip;
					// dataRoutes[gp.colValue][gp.rowValue] = wsOut.route;
				//}
				
			}
			this._pressGrid._grid.forEachPoint((gp: JGridPoint) => {
				gp._cell.dismark();
			})
			precipOut.set(m, dataPrecip);
			routeOut.set(m, dataRoutes);
		})

		return {
			precip: precipOut,
			routes: routeOut
		}
	}

	windSimIteration(initPoint: JPoint, month: number, dataPrecip: IPrecipDataGenerated[][], route: JWindRoutePoint[]): { dataPrecip: IPrecipDataGenerated[][], route: JWindRoutePoint[] } {

		route = [];
		let currPos = initPoint;
		let currVel = new JPoint(0, 0);
		let acc = 0;

		let gpprev: JGridPoint | undefined, gpnew: JGridPoint | undefined;

		let cont: number = 0;
		let it: number = 0;
		for (it = 0; it < 5000 && cont < 10; it++) {
			if (this._pressGrid.isCloseLowPressure(currPos, month)) cont++;
			if ((!!gpprev && !!gpnew && gpprev === gpnew)) cont += 0.25//0.25 0.01;
			else cont = 0;

			gpprev = this._pressGrid._grid.getGridPoint(currPos);
			gpprev._cell.mark();

			// calc force
			let pd: PressureData = this._pressGrid.getPointInfo(currPos);
			let vec: JPoint = pd.vecs[month - 1];
			let cor: JPoint = calcCoriolisForce({ pos: currPos, vel: currVel });
			let netForce = vec.add(cor).sub(currVel.scale(roz));
			// new state
			const newState: IMovementState = calcMovementState({ pos: currPos, vel: currVel }, netForce, this._pressGrid._grid._granularity);
			currPos = JPoint.pointToCoord(newState.pos);
			currVel = newState.vel;
			gpnew = this._pressGrid._grid.getGridPoint(currPos);
			// calc iter : evap and precip for currPos
			const {
				precipOut,
				evapOut,
				accOut,
			} = this.calcMoistureValuesIter(gpnew, gpprev, acc, month);
			acc = accOut;
			if (gpprev !== gpnew)
				route.push( new JWindRoutePoint( currPos, accOut, evapOut, precipOut ));

			// asignar
			dataPrecip[gpprev.colValue][gpprev.rowValue].value += Math.cos(gpprev._point.y * Math.PI / 180) * precipOut;
			dataPrecip[gpprev.colValue][gpprev.rowValue].cant++;
/*
			this._grid.getGridPointsInWindowGrade(currPos, this._grid._granularity).forEach((gpn: JGridPoint) => {
				dataPrecip[gpn.colValue][gpn.rowValue].value += Math.cos(gpprev!._point.y * Math.PI / 180) * precipOut * 0.65;
				dataPrecip[gpn.colValue][gpn.rowValue].cant++;
			})
			*/
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
	} {
		// variables de entrada
		const nextHeight: number = gpnew._cell.info.height;
		const currHeight: number = gpprev._cell.info.height;
		const pressValue: number = this._pressGrid.getPointInfo(gpprev._point).pots[month-1];
		const temp: number = gpprev._cell.info.tempMonthArr[month - 1];
		const mmm: { med: number, max: number, min: number } = this._pressGrid.getMaxMedMin(month);
		// salidas
		let precipOut: number = 0;
		let evapOut: number = 0;
		let accOut: number = 0;

		// pressValue
		let pval: number = 0;
		if (pressValue == 0) throw new Error('pressValue es 0')
		pval = (pressValue > 0) ? pressValue/mmm.max: -mmm.min/pressValue; // entre -1 y 1
		if (Math.abs(pval) < 0.02) 
			pval = (pval > 0) ? 0.02 : -0.02;
		
		pval = ((pval > 0) ? 1/pval : 100 + 1/pval) / 100;// (mmm.max - mmm.min)
		if (pval < 0) console.log(pval)
		pval = pval ** 1;


		// nextHeight
		
		if (nextHeight >= 0.84) {
			precipOut = (nextHeight) ** 0.25 * MAXRAIN;
		} else if (nextHeight >= 0.2) {
			let exponent = (nextHeight < 0.5) ? 2 : ((nextHeight < 0.7) ? 1.5 : 0.45);
			precipOut = ( (currHeight <= nextHeight) ? 0.5 : 0.1 ) * ((nextHeight) ** exponent + pval) * MAXRAIN;
			if (precipOut > acc) precipOut = acc;

			if (temp - tempMin > 0) {
				evapOut = ((temp - tempMin) / (35 - tempMin)) * (precipOut + MAXRAIN * pval * 0.15);
			}
		} else {
			precipOut =  0.4 * ((0.1 ** 2) + pval) * MAXRAIN;
			if (temp - tempMin > 0)
				evapOut = ((temp - tempMin) / (35 - tempMin)) * (MAXEVAP + MAXRAIN * pval * 0.25);
		}

		// precip real value
		if (precipOut > MAXRAIN) precipOut = MAXRAIN;
		if (precipOut > acc) precipOut = acc;
		// evap real value
		if (evapOut > MAXEVAP) evapOut = MAXEVAP;

		accOut = (nextHeight >= 0.84) ? 0 : acc + evapOut - precipOut;
		if (accOut > sat) accOut = sat;
		if (accOut < 0) accOut = 0;

		return {
			precipOut,
			evapOut,
			accOut,
		}
	}
}