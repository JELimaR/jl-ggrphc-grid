
import JPoint from '../Geom/JPoint';
import JEdge from './JEdge';
import JSite from './JSite';

// export interface IJHalfEdgeInfo {
// 	siteid: number;
// 	edgeid: number;
// }


export default class JHalfEdge {

	constructor(private _site: JSite, private _edge: JEdge) {

	}

	get initialPoint(): JPoint {

		return this._edge.lSite === this._site ? this._edge.vertexA : this._edge.vertexB;
	}
	get finalPoint(): JPoint {

		return this._edge.lSite === this._site ? this._edge.vertexB : this._edge.vertexA;
	}

	get points(): JPoint[] {
		let out: JPoint[] = this._edge.points;
		if (!JPoint.equal(out[0], this.initialPoint)) {
			out.reverse();
		}
		return out;
	}
	get edge(): JEdge {return this._edge}

	// getInterface(): IJHalfEdgeInfo {
	// 	return {
	// 		siteid: this._site.id,
	// 		edgeid: this._edge.id,
	// 	}
	// }

}