import * as turf from '@turf/turf';
import JCell from '../Voronoi/JCell';
import JPoint from '../Geom/JPoint';
import RandomNumberGenerator from "../Geom/RandomNumberGenerator";
import DataInformationFilesManager from '../DataInformationLoadAndSave';
import JWMap from '../JWMap';
import JDiagram from '../Voronoi/JDiagram';
import JVertex from '../Voronoi/JVertex';
import JEdge from '../Voronoi/JEdge';
import { IDiagramContainer, IVertexContainer } from '../generalInterfaces';
const dataFilaManager = DataInformationFilesManager.instance;


export interface IJLineInfo {
	/**/
	vertices: string[];
	length: number;
}

export default class JLine implements IDiagramContainer, IVertexContainer {

	private _diagram: JDiagram;
	private _vertices: JVertex[];
	private _allVertices: JPoint[] = [];
	
	private _length: number;
	
	constructor(diagram: JDiagram, info?: IJLineInfo) {
		this._diagram = diagram;;
		if (info) {
			this._vertices = info.vertices.map((vid: string) => this.diagram.vertices.get(vid) as JVertex); // ojo, podría no estar ordenado.
			this._length = info.length;
		} else {
			this._vertices = [];
			this._length = -1;
		}
	}

	get diagram(): JDiagram {return this._diagram}
	get vertices(): JVertex[] { return this._vertices }
	get length(): number { 
		if (this._length == -1) {
			this._length = this.calcLength();
		}
		return this._length
	}

	getVerticesSince(v: JVertex): JVertex[] { // aun no probado
		let out: JVertex[] = [];

		let idx: number = 0;
		let curr: JVertex = this._vertices[idx];
		while(curr.id !== v.id) {
			idx++;
			curr = this._vertices[idx];
		}

		for (let i = idx; i < this._vertices.length; i++) {
			out.push(this._vertices[i]);
		}

		if (out.length == 0)
			throw new Error(
				`no existe vertex en este LineMap.
Buscado: ${v.id}.
Presentes: ${this._vertices.map((vertex: JVertex) => vertex.id + ' ')}`)

		return out;
	}

	private getEdges(): JEdge[] {
		let out: JEdge[] = [];
		this._vertices.forEach((vertex: JVertex, i: number, a: JVertex[]) => {
			if (i < a.length-1) {
				const edge = vertex.getEdgeFromNeighbour(a[i+1]);
				out.push(edge);
			}
		})
		return out;
	}

	// forEachCell(func: (c: JCell) => void) { // hacer mejor esto
	// 	throw new Error(`No tiene sentido recorrer las cells de un JLineMap`);
	// }

	forEachVertex(func: (vertex: JVertex) => void) {
		this._vertices.forEach((v: JVertex) => func(v));
	}

	forEachEdge(func: (edge: JEdge) => void) {
		this.getEdges().forEach((e: JEdge) => func(e));
	}

	isInLine(en: string | JVertex): boolean {
		let vertex: JVertex;
		if (en instanceof JVertex) {
			vertex = en;
		} else {
			vertex = this.diagram.vertices.get(en) as JVertex;
		}
		return this._vertices.includes(vertex);
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

	getDrawerParameters(): {center: JPoint, XMAXDIS: number, YMAXDIS: number} {
		let XMIN = 180, YMIN = 90;
		let XMAX = -180, YMAX = -90;

		this._vertices.forEach((vertex: JVertex) => {
			if (vertex.point.x < XMIN) XMIN = vertex.point.x;
			if (vertex.point.y < YMIN) YMIN = vertex.point.y;
			if (vertex.point.x > XMAX) XMAX = vertex.point.x;
			if (vertex.point.y > YMAX) YMAX = vertex.point.y;
		})
		
		return {
			center: new JPoint((XMAX-XMIN)/2 + XMIN, (YMAX-YMIN)/2+YMIN),
			XMAXDIS: (XMAX-XMIN)+0.3,
			YMAXDIS: (YMAX-YMIN)+0.3
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
	/*
	toTurfLineString() {
		return turf.lineString(
			this._vertices.map((v: JVertex) => v.point.toTurfPosition())
		);
	}
	*/
}