import JPoint from "./JPoint";


export interface IMovementState {
	vel: JPoint;
	pos: JPoint;
}

export const calcMovementState = (currState: IMovementState, force: JPoint, M: number, t: number): IMovementState => {
	
	const A: JPoint = force.scale(1/M);
	const vel: JPoint = A.scale(t).add(currState.vel);
	const pos: JPoint = A.scale(t/2).scale(t).add(currState.vel.scale(t));

	return {
		vel: vel,
		pos: pos.add(currState.pos)
	}
}