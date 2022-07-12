import JWorldMap, { ICellContainer } from '../JWorldMap';
import JCell from '../Voronoi/JCell';
import JPoint from '../Geom/JPoint';
import RandomNumberGenerator from "../Geom/RandomNumberGenerator";
import DataInformationFilesManager from '../DataInformationLoadAndSave';
import JWMap from '../JWMap';
import JDiagram from '../Voronoi/JDiagram';
import JVertex from '../Voronoi/JVertex';
import JEdge from '../Voronoi/JEdge';
const dataFilaManager = DataInformationFilesManager.instance;


export interface IJLineInfo {

	/**/
	vertices: string[];
	length: number;
}

export default class JLine extends JWMap {

	private _vertices: JVertex[];
	private _allVertices: JPoint[] = [];
	
	private _length: number;
	
	constructor(diagram: JDiagram, info?: IJLineInfo) {
		super(diagram);
		if (info) {
			this._vertices = info.vertices.map((vid: string) => this.diagram.vertices2.get(vid) as JVertex); // ojo, podría no estar ordenado.
			this._length = info.length;
		} else {
			this._vertices = [];
			this._length = -1;
		}
	}

	get vertices(): JVertex[] { return this._vertices }
	get length(): number { return this._length }

	getEdges(): JEdge[] {
		let out: JEdge[] = [];
		this._vertices.forEach((vertex: JVertex, i: number, a: JVertex[]) => {
			if (i < a.length-1) {
				const edge = vertex.getEdgeFromNeighbour(a[i+1]);
				out.push(edge);
			}
		})
		return out;
	}

	forEachCell(func: (c: JCell) => void) {
		throw new Error(`No tiene sentido recorrer las cells de un JLineMap`);
	}

	forEachVertex(func: (vertex: JVertex) => void) {
		this._vertices.forEach((v: JVertex) => func(v));
	}

	addVertex(vertex: JVertex) {
		const cant: number = this._vertices.length;
		if (cant == 0) {
			this._vertices.push(vertex);
		} else {
			const ini: JVertex = this._vertices[0];
			const fin: JVertex = this._vertices[cant-1];
			if (fin.isNeightbour(vertex)) {
				this._vertices.push(vertex);
			} else if (ini.isNeightbour(vertex)) {
				this._vertices.unshift(vertex);
			} else {
				throw new Error(`no se puede agregar el vertex a este JLine`);
			}
		}		
	}

	private calcLength() {
		let out: number = 0;
		this.getEdges().forEach((edge: JEdge) => {
			out += edge.length;
		})
		return out;
	}

	getInterface(): IJLineInfo {
		return {
			vertices: this._vertices.map((vertex: JVertex) => vertex.id),
			length: this._length,
		}
	}
}