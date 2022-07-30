import JCell from "../Voronoi/JCell";
import JDiagram from "../Voronoi/JDiagram";
import JEdge from "../Voronoi/JEdge";
import JVertex from "../Voronoi/JVertex";

export interface ICellContainer {
	cells: JCell[] | Map<number, JCell>;
	forEachCell: (func: (cell: JCell) => void) => void;
}

export interface IVertexContainer {
	vertices: JVertex[] | Map<string, JVertex>;
	forEachVertex: (func: (vertex: JVertex) => void) => void;
}

export interface IEdgeContainer {
	forEachEdge: (func: (edge: JEdge) => void) => void;
}

export interface IDiagramContainer {
	diagram: JDiagram
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