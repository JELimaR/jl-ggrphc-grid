import JPoint, { JVector } from '../Geom/JPoint';
import JVertexInformation from '../VertexInformation/JVertexInformation';
import JCell from "./JCell";
import JEdge from "./JEdge";
import JSite from './JSite';

export default class JVertex {
	_point: JPoint;
	_edges: JEdge[];

	_vertexInformation: JVertexInformation;
	constructor(point: JPoint, edges: JEdge[]) {
		this._point = point;
		if (!(edges.length == 2 || edges.length == 3)) {
			console.log(point)
			console.log(edges)
			throw new Error(`deben haber 3 edges o 2 edges bordes y hay: ${edges.length}`)
		}
		this._edges = edges;

		this._vertexInformation = new JVertexInformation(this);
		
	}

	get id(): string {return this._point.id}
	get point(): JPoint {return this._point}
	get edges(): JEdge[] {return this._edges}
	get cellIds() {
		let list: Set<number> = new Set<number>();
		this._edges.forEach((e: JEdge) => {
			list.add(e.lSite.id)
			if (!!e.rSite) list.add(e.rSite.id)
		})
		return Array.from(list)
	}
	get neighborsId(): string[] {
		let out: string[] = [];
		this._edges.forEach((e: JEdge) => {
			if (e.vertexA.id == this._point.id) out.push(e.vertexB.id);
			else if (e.vertexB.id == this._point.id) out.push(e.vertexA.id);
			else throw new Error(``)
		})
		return out;
	}

	getEdgeFromNeighbour(v: JVertex): JEdge {
		let out: JEdge | undefined;
		this._edges.forEach((e: JEdge) => {
			if (e.vertexA.id == v.point.id || e.vertexB.id == v.point.id) {
				out = e;
			}
		})
		if (out) return out
		else throw Error(`los vertices ${v} y ${this} no son vecinos`)
		
	}



	/*
	 * Generic Information
	 */
	mark(): void { this._vertexInformation.mark = true }
	dismark(): void { this._vertexInformation.mark = false }
	isMarked(): boolean { return this._vertexInformation.mark }
	/*
	 * Height or relief Information
	 */

	get info(): JVertexInformation {return this._vertexInformation}

}