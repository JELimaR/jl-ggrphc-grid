import Point from "../../Geom/Point";

const MASS = 1;
const time = .075;
const VELROTVALUE: number = 2;

export const calcCoriolisForce = (state: IMovementState): Point => {
	const lat: number = state.pos.y;
	// const indexes = tempGrid._grid.getGridPointIndexes(state.pos);
	const dev: number = 0//tempGrid.getITCZPoints(4)[indexes.r]!._point.y;
	const RADGRADES: number = (lat - dev) * Math.PI / 180;

	let out = state.vel.scale(2 * VELROTVALUE * MASS * Math.sin(RADGRADES)).rightPerp();

	return out;
	
}

// calc air movement
export interface IMovementState {
	vel: Point;
	pos: Point;
}


export const calcMovementState = (currState: IMovementState, force: Point, GRAN: number): IMovementState => {
	
	const A: Point = force.scale(1/MASS);
	let vel: Point = A.scale(time).add(currState.vel);
	let pos: Point = A.scale(time/2).scale(time).add(currState.vel.scale(time)).add(currState.pos);

	// constant distance
	const dir: Point = pos.sub(currState.pos).normalize();
	const pos2: Point = dir.scale(GRAN * 0.8).add(currState.pos);

	const newT = calcTime(A, currState, pos2);
	if (newT > 0) {
		//vel = A.scale(newT).add(currState.vel);
		pos = pos2;
	}

	return {
		vel: vel,
		pos: pos
	}
}

const calcTime = (A: Point, currState: IMovementState, pos2: Point): number => {
	let calculatedTime: number = 0;

	let a = A.x/2;
	let b = currState.vel.x;
	let c = currState.pos.x - pos2.x;

	let root = (b**2) - (4*a*c);
	if (root > 0) {
		calculatedTime = (-b + Math.sqrt(root)) / (2*a);
	}
/*
	if (time > 0) {
		console.log(currState)
		console.log(pos2)
		console.log('vel', A.scale(time).add(currState.vel))
		throw new Error('time no puede ser 0')
	}*/

	return calculatedTime;
}