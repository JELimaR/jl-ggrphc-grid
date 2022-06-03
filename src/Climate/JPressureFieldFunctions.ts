import JPoint from "../Geom/JPoint";
import { IMovementState } from "../Geom/Movement";
import JClimateGrid from "../heightmap/JClimateGrid";

interface IPressureZone {
	mag: number;
	point: JPoint;
}

const MAGCOR: number = 10;

export const calcFieldInPoint = (point: JPoint, pressureCenters: IPressureZone[]): { vec: JPoint, pot: number } => {
	let out: JPoint = new JPoint(0, 0);
	let magSum: number = 0;

	pressureCenters.forEach((pz: IPressureZone) => {
		//const dist = JPoint.geogDistance(pz.point, point) + 10;
		let pz2: JPoint = point.point2(pz.point);
		const dist: number = JPoint.distance(pz2, point) + 1;
		const magnitude: number = pz.mag / (dist ** 2);
		
		let dir: JPoint = point.sub(pz2).normalize();
		dir = dir.scale(magnitude);
		out = out.add(dir);

		magSum += pz.mag / ((dist));;
	})

	return { vec: out, pot: magSum };
}

export const applyCoriolis = (point: JPoint, vec: JPoint, tempGrid: JClimateGrid) => {
	let out = vec.normalize();
	const lat: number = point.y;
	const indexes = tempGrid._grid.getGridPointIndexes(point);
	const dev: number = 0//tempGrid.getITCZPoints(4)[indexes.r]!._point.y;
	const angle = lat - dev;
	const grad2radConst = Math.PI / 180;
	//if (angle > 100) {
		out = out.add(out.rightPerp().scale(MAGCOR * Math.sin(grad2radConst * angle))).normalize()
	//} else if (angle < -1) {
	//	out = out.add(out.leftPerp().scale(MAGCOR * Math.cos(grad2radConst * angle))).normalize()
	//} else {

	//}

	return out;
}

const VELROTVALUE: number = 2;

export const calcCoriolisForce = (state: IMovementState, M: number, tempGrid: JClimateGrid): JPoint => {
	const lat: number = state.pos.y;
	// const indexes = tempGrid._grid.getGridPointIndexes(state.pos);
	const dev: number = 0//tempGrid.getITCZPoints(4)[indexes.r]!._point.y;
	const RADGRADES: number = (lat - dev) * Math.PI / 180;

	let out = state.vel.scale(2 * VELROTVALUE * M * Math.sin(RADGRADES)).rightPerp();

	return out;
	
}