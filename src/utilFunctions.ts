import { ICellContainer, IVertexContainer } from "./containerInterfaces";
import JCell from "./Voronoi/JCell";
import JVertex from "./Voronoi/JVertex";

export const getArrayOfN = (tam: number, value: number): number[] => {
	let out: number[] = [];
	for (let i = 0; i<tam; i++) out.push(value);
	return out;
}

export const inRange = (value: number, minimo: number, maximo: number): number => {
	let out = value;

	if (out > maximo) out = maximo;
	if (out < minimo) out = minimo;

	return out;
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