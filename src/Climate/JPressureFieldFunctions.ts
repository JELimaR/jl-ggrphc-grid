import JPoint from "../Geom/JPoint";
import JClimateGrid from "../heightmap/JClimateGrid";

interface IPressureZone {
	mag: number;
	point: JPoint;
}
/*
const pressureCenters: IPressureZone[] = [];
	
const arr: number[] = [];
for (let i = -180*1; i<=180*1; i+=0.5) arr.push(i);
//
let highPointArr: JPoint[] = [];
highPointArr = highPointArr.concat( arr.map((n: number) => new JPoint(n,90)) );
highPointArr = highPointArr.concat( arr.map((n: number) => new JPoint(n,-90)) );
highPointArr = highPointArr.concat( arr.map((n: number) => new JPoint(n,30 )) );
highPointArr = highPointArr.concat( arr.map((n: number) => new JPoint(n,-30 )) );
const highMag: number = 10;
highPointArr.forEach((lp: JPoint) => {
	//if (!world.diagram.getCellFromPoint(lp).info.isLand) {
		pressureCenters.push({point: lp, mag: highMag})

	//}
})

//
let lowPointArr: JPoint[] = [];
lowPointArr = lowPointArr.concat( arr.map((n: number) => new JPoint(n,0)) );
lowPointArr = lowPointArr.concat( arr.map((n: number) => new JPoint(n,60 )) );
lowPointArr = lowPointArr.concat( arr.map((n: number) => new JPoint(n,-60 )) );
const lowMag: number = -10;
lowPointArr.forEach((hp: JPoint) => {
	//if (world.diagram.getCellFromPoint(hp).info.isLand) {
		pressureCenters.push({point: hp, mag: lowMag})

	//}
})
*/
const MAGCOR: number = 20;

export const calcFieldInPoint = (point: JPoint, pressureCenters: IPressureZone[]): { vec: JPoint, pot: number } => {
	let out: JPoint = new JPoint(0, 0);
	let magSum: number = 0;

	pressureCenters.forEach((pz: IPressureZone) => {
		const dist: number = JPoint.distance2(pz.point, point) + 0.1;
		// const dist = JPoint.geogDistance(pz.point, point) + 100;
		const magnitude: number = pz.mag / ((dist) ** 2);
		let pz2: JPoint = point.point2(pz.point)
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
	const dev: number = tempGrid.getITCZPoints(4)[indexes.r]!._point.y;
	const angle = lat - dev;
	if (lat > 0) {
		out = out.add(out.rightPerp().scale(MAGCOR * Math.cos(Math.PI * angle / 180))).normalize()
	} else if (lat < 0) {
		out = out.add(out.leftPerp().scale(MAGCOR * Math.cos(Math.PI * angle / 180))).normalize()
	} else {

	}

	return out;
}