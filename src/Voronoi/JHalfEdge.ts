
import Point from '../Geom/Point';
import JEdge from './JEdge';
import JSite from './JSite';

// export interface IJHalfEdgeInfo {
// 	siteid: number;
// 	edgeid: number;
// }

export default class JHalfEdge {
	private _site: JSite;
	private _edge: JEdge
	constructor(site: JSite, edge: JEdge) {
		this._site = site;
		this._edge = edge;
	}

	get initialPoint(): Point {

		return this._edge.lSite === this._site ? this._edge.vertexA : this._edge.vertexB;
	}
	get finalPoint(): Point {

		return this._edge.lSite === this._site ? this._edge.vertexB : this._edge.vertexA;
	}

	get points(): Point[] {
		let out: Point[] = this._edge.points;
		if (!Point.equal(out[0], this.initialPoint)) {
			out.reverse();
		}
		return out;
	}
	get edge(): JEdge { return this._edge }

	// getInterface(): IJHalfEdgeInfo {
	// 	return {
	// 		siteid: this._site.id,
	// 		edgeid: this._edge.id,
	// 	}
	// }

}