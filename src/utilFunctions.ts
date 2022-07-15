import { ICellContainer } from "./generalInterfaces";
import JCell from "./Voronoi/JCell";

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