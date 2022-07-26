// import { Cell, Halfedge } from "voronoijs";
import JPoint from '../Geom/JPoint';
import JTriangle from '../Geom/JTriangle';
import JEdge from './JEdge';
import JHalfEdge from './JHalfEdge';
import JSite from './JSite';

import * as turf from '@turf/turf';
import JCellInformation from '../CellInformation/JCellInformation';

/**
 * En una cell:
 * 	halfedge es un borde de celda.
 */
export default class JCell {

	private _site: JSite;
	private _halfedges: JHalfEdge[] = [];
	private _cellInformation: JCellInformation; // eliminar esto
	private _subCells: JCell[] = [];
	private _subsites: JPoint[] = [];

	constructor( s: JSite, arrEdges: JEdge[]) {
	
		this._site = s;
		arrEdges.forEach((je: JEdge) => {
			const jhe: JHalfEdge = new JHalfEdge(this._site, je);
			this._halfedges.push(jhe);
		})

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

	get verticesId(): string[] {
		let out: string[] = [];
		this.voronoiVertices.forEach((p: JPoint) => out.push(p.id))
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

	isPointIn(p: JPoint): boolean {
		return turf.booleanPointInPolygon(turf.point(p.toTurfPosition()), this.toTurfPolygonSimple())
	}
	/*
	private getBBoxLongs(): {xlong: number, ylong: number, xmin: number, xmax: number, ymin: number, ymax: number} {
		const listPoints: JPoint[] = [];
		const bbox: turf.Feature<turf.Polygon> = turf.envelope(this.toTurfPolygonSimple());
		bbox.geometry.coordinates[0].forEach((pos: turf.Position) => {
			listPoints.push(JPoint.fromTurfPosition(pos));
		})
		let xmin: number = 180, xmax: number = -180;
		let ymin: number = 90, ymax: number = -90;
		listPoints.forEach((p: JPoint) => {
			if (p.x < xmin) xmin = p.x;
			if (p.x > xmax) xmax = p.x;
			if (p.y < ymin) ymin = p.y;
			if (p.y > ymax) ymax = p.y;
		})

		return {
			xlong: xmax - xmin,
			ylong: ymax - ymin,
			xmax,
			xmin,
			ymax,
			ymin
		}
	}
	*/
	private tesselate(): JTriangle[] {
		let out: JTriangle[] = [];
		const ts: turf.FeatureCollection<turf.Polygon> = turf.tesselate(this.toTurfPolygonSimple());
		ts.features.forEach((t: turf.Feature<turf.Polygon>) => {
			out.push(new JTriangle(t));
		})
		return out;
	}

	getSubSites(AREA: number): JPoint[] {
		if (this._subsites.length == 0) {
			const cantSites: number = Math.round(this.area / AREA) + 1;
			let points: JPoint[] = [];

			let triangles: JTriangle[] = this.tesselate();
			triangles = triangles.sort((a: JTriangle, b: JTriangle) => b.area - a.area); // de mayor a menor area

			while (triangles.length < cantSites) {
				const tri: JTriangle = triangles.shift() as JTriangle;
				const div = tri.divide();
				triangles.push(div.t1);
				triangles.push(div.t2);
				triangles = triangles.sort((a: JTriangle, b: JTriangle) => b.area - a.area); // de mayor a menor area
			}

			for (let i = 0; i < cantSites; i++) {
				points.push(triangles[i].centroid)
			}

			if (this.id == 3545) console.log(triangles.map((t: JTriangle) => t.area));
			if (this.id == 3545) console.log(this.areaSimple)
			if (this.id == 3545) console.log(points)

			this._subsites = points;
		}

		return this._subsites;
	}

	/*
	 * Generic Information
	 */
	mark(): void { this._cellInformation.mark = true }
	dismark(): void { this._cellInformation.mark = false }
	isMarked(): boolean { return this._cellInformation.mark }
	/*
	 * Height or relief Information
	 */

	get info(): JCellInformation { return this._cellInformation }

	
	/**
	 * sub cells functions
	 */

	get subCells(): JCell[] { return this._subCells }
	addSubCell(sb: JCell) { this._subCells.push(sb) }

}