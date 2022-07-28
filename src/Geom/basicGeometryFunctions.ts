import Point from "./Point";
import RandomNumberGenerator from "./RandomNumberGenerator";
import turf from "./turf";

export const getPointInValidCoords = (pin: Point) => {
	let lat: number = pin.y, lon: number = pin.x;
	let latOut: number, lonOut: number;

	latOut = lat;
	if (latOut < -90) latOut += -(90 + latOut) * 2;
	if (latOut > 90) latOut += -(latOut - 90) * 2;
	//latOut = (lat + 90) % 180 - 90;
	lon = Math.abs(latOut - lat) > 0.001 ? lon + 180 : lon;
	if (lon + 180 < 0) lon += 360
	if (lon + 180 > 360) lon -= 360;
	lonOut = lon;

	return new Point(lonOut, latOut);
}

export const getArrayOfN = (tam: number, value: number): number[] => {
	let out: number[] = [];
	for (let i = 0; i < tam; i++) out.push(value);
	return out;
}

export const inRange = (value: number, minimo: number, maximo: number): number => {
	let out = value;

	if (out > maximo) out = maximo;
	if (out < minimo) out = minimo;

	return out;
}

export const generateShape = (center: Point, rad: number, m: number): Point[] => {

	const randf: () => number = RandomNumberGenerator.makeRandomFloat(center.x * center.y);

	let out: Point[] = [];
	let r: number = turf.lengthToDegrees(rad, 'kilometers');
	const initialAngle: number = randf() * 2 * Math.PI;

	for (let i = 0; i < m; i++) {
		const ang = 2 * Math.PI * i / m + initialAngle;
		const rr = r * (0.8 + 0.4 * randf());
		const X = center.x + rr * Math.cos(ang);
		const Y = center.y + rr * Math.sin(ang);
		out.push(new Point(X, Y))
	}

	return out;
}