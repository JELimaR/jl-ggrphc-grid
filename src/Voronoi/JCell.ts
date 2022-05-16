// import { Cell, Halfedge } from "voronoijs";
import JPoint from '../Geom/JPoint';
import JEdge from './JEdge';
import JHalfEdge from './JHalfEdge';
import JSite, { IJSiteInfo } from './JSite';

import * as turf from '@turf/turf';
//import JCellInformation, { IJCellInformation } from "./JCellInformation";
import JCellInformation from '../CellInformation/JCellInformation';
import JCellHeight, { IJCellHeightInfo } from '../CellInformation/JCellHeight';

/**
 * En una cell:
 * 	halfedge es un borde de celda.
 */

// export interface IJCellInfo {
// 	site: IJSiteInfo;
// 	halfedges: IJHalfEdgeInfo[];
// }

export default class JCell {

	//private _cell: Cell;
	private _site: JSite;
	private _halfedges: JHalfEdge[] = [];
	private /*readonly*/ _cellInformation: JCellInformation; // eliminar esto

	constructor(/*c: Cell,*/ s: JSite, arrEdges: JEdge[]) {
		//this._cell = c;
		this._site = s;
		arrEdges.forEach((je: JEdge) => {
			const jhe: JHalfEdge = new JHalfEdge(this._site, je);
			this._halfedges.push(jhe);
		})
		/*
		c.halfedges.forEach( (he: Halfedge, idx: number) => {
			const edge: JEdge = arrEdges[idx];
			const Jhe: JHalfEdge = new JHalfEdge(this._site, edge);
			this._halfedges.push(Jhe);
		})
		*/
		// this._cellInformation = new JCellInformation(this, info);
		this._cellInformation = new JCellInformation(this);
	}

	static equals(a: JCell, b: JCell): boolean {
		return (a.id === b.id)
	}
	
	get site(): JSite { return this._site }
	get id(): number { return this._site.id }
	get center(): JPoint { return this._site.point }
	get allVertices(): JPoint[] {
		let out: JPoint[] = [];
		for (let he of this._halfedges) {
			const pts = he.points
			for (let i = 1; i < pts.length; i++) {
				out.push(pts[i]);
			}
		}
		return out;
	}

	get voronoiVertices(): JPoint[] {
		let out: JPoint[] = [];
		for (let he of this._halfedges) {
			out.push(he.initialPoint)
		}
		return out;
	}

	get neighborsId(): number[] {
		let out: number[] = [];
		this._halfedges.forEach((he: JHalfEdge) => {
			if (he.edge.lSite.id !== this.id) {
				out.push(he.edge.lSite.id)
			} else {
				if (!!he.edge.rSite) out.push(he.edge.rSite.id)
			}
		})
		return out;
	}

	get isBorder(): boolean {
		let out: boolean = false;
		for (let i = 0; i < this._halfedges.length && !out; i++) {
			const he = this._halfedges[i];
			out = !he.edge.rSite
		}
		return out;
	}

	get area(): number {
		return turf.area(this.toTurfPolygonComplete()) / 1000000;
	}

	get areaSimple(): number {
		return turf.area(this.toTurfPolygonSimple()) / 1000000;
	}

	private toTurfPolygonComplete(): turf.Feature<turf.Polygon> {
		let verts: JPoint[] = this.allVertices;
		verts.push(verts[0]);
		return turf.polygon([
			verts.map((p: JPoint) => p.toTurfPosition())
		])
	}

	toTurfPolygonSimple(): turf.Feature<turf.Polygon> {
		let verts: JPoint[] = this.voronoiVertices;
		verts.push(verts[0]);
		return turf.polygon([
			verts.map((p: JPoint) => p.toTurfPosition())
		])
	}

	/*
	 * Generic Information
	 */
	mark(): void { this._cellInformation!.mark = true }
	dismark(): void { this._cellInformation!.mark = false }
	isMarked(): boolean { return this._cellInformation!.mark }
	/*
	 * Height or relief Information
	 */

	get info(): JCellInformation {return this._cellInformation}

	/*get heightInfo(): JCellHeight {
		return this._cellInformation.getHeightInfo()!;
	}*/
	
	// getInterface(): IJCellInfo {
	// 	return {
	// 		site: this._site.getInterface(),
	// 		halfedges: this._halfedges.map((jhe: JHalfEdge) => {return jhe.getInterface()})
	// 	}
	// }

}