import { ICellContainer, IVertexContainer } from "./MapContainersElements/containerInterfaces";
import Point from "./Geom/Point";
import JCell from "./Voronoi/JCell";
import JVertex from "./Voronoi/JVertex";

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

export const createICellContainer = (cells: JCell[] | Map<number, JCell>): ICellContainer => {
	return {
		cells: cells,
		forEachCell: (func: (jc: JCell) => void) => {
			cells.forEach((c: JCell) => { func(c) })
		}
	}
}

export const createIVertexContainer = (vertices: JVertex[] | Map<string, JVertex>): IVertexContainer => {
	return {
		vertices: vertices,
		forEachVertex: (func: (jv: JVertex) => void) => {
			vertices.forEach((v: JVertex) => { func(v) })
		}
	}
}