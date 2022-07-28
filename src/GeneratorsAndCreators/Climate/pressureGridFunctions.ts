import Point from "../../Geom/Point";

interface IPressureZone {
	mag: number;
	point: Point;
}

export const calcFieldInPoint = (point: Point, pressureCenters: IPressureZone[]): { vec: Point, pot: number } => {
	let out: Point = new Point(0, 0);
	let magSum: number = 0;

	pressureCenters.forEach((pz: IPressureZone) => {
		//const dist = JPoint.geogDistance(pz.point, point) + 10;
		let pz2: Point = point.point2(pz.point);
		const dist: number = Point.distance(pz2, point) + 1;
		const magnitude: number = pz.mag / (dist ** 2);
		
		let dir: Point = point.sub(pz2).normalize();
		dir = dir.scale(magnitude);
		out = out.add(dir);

		magSum += pz.mag / dist;
	})

	return { vec: out, pot: magSum };
}

