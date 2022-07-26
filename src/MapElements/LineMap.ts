import JPoint from '../Geom/JPoint';

import JDiagram from '../Voronoi/JDiagram';
import JVertex from '../Voronoi/JVertex';
import JEdge from '../Voronoi/JEdge';
import { IDiagramContainer, IEdgeContainer, IVertexContainer } from '../containerInterfaces';


export interface ILineMapInfo {
	vertices: string[];
	length: number;
}

export default class LineMap implements IDiagramContainer, IVertexContainer, IEdgeContainer {

	private _diagram: JDiagram;
	private _vertices: JVertex[];
	private _allVertices: JPoint[] = [];

	private _length: number;
	private _isClosed: boolean = false;

	// constructor(diagram: JDiagram);
	// constructor(diagram: JDiagram, info: ILineMapInfo);
	constructor(diagram: JDiagram, info?: ILineMapInfo) {
		this._diagram = diagram;;
		if (info) {
			this._vertices = info.vertices.map((vid: string) => this.diagram.vertices.get(vid) as JVertex); // ojo, podría no estar ordenado.
			this._length = info.length;
		} else {
			this._vertices = [];
			this._length = -1;
		}
	}

	get diagram(): JDiagram { return this._diagram }
	get vertices(): JVertex[] { return this._isClosed ? [...this._vertices, this._vertices[0]] : this._vertices }
	get length(): number {
		if (this._length == -1) {
			this._length = this.calcLength();
		}
		return this._length
	}

	get ini(): JVertex { return this._vertices[0] }
	get fin(): JVertex { return this._vertices[this._vertices.length - 1] }

	close() {
		if (this.ini.isNeightbour(this.fin)) {
			this._isClosed = true;
		} else {
			throw new Error(`no se puede cerrar`)
		}
	}

	getVerticesSince(v: JVertex): JVertex[] { // aun no probado
		let out: JVertex[] = [];

		let idx: number = 0;
		let curr: JVertex = this._vertices[idx];
		while (curr.id !== v.id) {
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
			if (i < a.length - 1) {
				const edge = vertex.getEdgeFromNeighbour(a[i + 1]);
				out.push(edge);
			}
		})
		return out;
	}

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
		if (this._isClosed) {
			throw new Error(`no se puede agregar un nuevo vertex a este LineMap por esta cerrado`);
		}
		if (this.isInLine(vertex)) {
			throw new Error(`El vertex ya se encuentra en LineMap`);
		}
		const cant: number = this._vertices.length;
		if (cant == 0) {
			this._vertices.push(vertex);
		} else {
			const ini: JVertex = this.ini;
			const fin: JVertex = this.fin;
			if (fin.isNeightbour(vertex)) {
				this._vertices.push(vertex);
			} else if (ini.isNeightbour(vertex)) {
				this._vertices.unshift(vertex);
			} else {
				console.log('-------------------------------------------')
				console.log('ini', ini.point.getInterface())
				console.log('fin', fin.point.getInterface())
				console.log(vertex.point.getInterface())
				console.log('son vecinos?', vertex.isNeightbour(fin));
				throw new Error(
					`no se puede agregar el vertex a este LineMap porque no es vecino de los extremos`
				);
			}
		}
		// if (this.ini.id === this.fin.id) this._isClosed = true;
	}

	getDrawerParameters(): { center: JPoint, XMAXDIS: number, YMAXDIS: number } {
		let XMIN = 180, YMIN = 90;
		let XMAX = -180, YMAX = -90;

		this._vertices.forEach((vertex: JVertex) => {
			if (vertex.point.x < XMIN) XMIN = vertex.point.x;
			if (vertex.point.y < YMIN) YMIN = vertex.point.y;
			if (vertex.point.x > XMAX) XMAX = vertex.point.x;
			if (vertex.point.y > YMAX) YMAX = vertex.point.y;
		})

		return {
			center: new JPoint((XMAX - XMIN) / 2 + XMIN, (YMAX - YMIN) / 2 + YMIN),
			XMAXDIS: (XMAX - XMIN) + 0.3,
			YMAXDIS: (YMAX - YMIN) + 0.3
		}
	}

	private calcLength() {
		let out: number = 0;
		this.getEdges().forEach((edge: JEdge) => {
			out += edge.length;
		})
		return out;
	}

	getInterface(): ILineMapInfo {
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