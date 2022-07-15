import JCell from "./Voronoi/JCell";
import JDiagram from "./Voronoi/JDiagram";
import JEdge from "./Voronoi/JEdge";
import JVertex from "./Voronoi/JVertex";

export interface ICellContainer {
	cells: JCell[] | Map<number, JCell>;
	forEachCell: (func: (cell: JCell) => void) => void;
}

export interface IVertexContainer {
	vertices: JVertex[] | Map<string, JVertex>;
	forEachVertex: (func: (vertex: JVertex) => void) => void;
	forEachEdge: (func: (edge: JEdge) => void) => void;
}

export interface IDiagramContainer {
	diagram: JDiagram
}