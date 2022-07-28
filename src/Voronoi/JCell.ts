import Point from '../Geom/Point';
import Triangle from '../Geom/Triangle';
import JEdge from './JEdge';
import JHalfEdge, { IJHalfEdgeInfo } from './JHalfEdge';
import JSite, { IJSiteInfo } from './JSite';
import JCellInformation from './CellInformation/JCellInformation';
import turf from '../Geom/turf';

export interface IJCellInfo {
	site: IJSiteInfo,
	halfedges: IJHalfEdgeInfo[],
}

export default class JCell {

	private _site: JSite;
	private _halfedges: JHalfEdge[] = [];
	private _cellInformation: JCellInformation; // eliminar esto
	private _subCells: JCell[] = [];
	// private _subsites: Point[] = [];

	constructor(site: JSite, arrEdges: JEdge[]) {

		this._site = site;
		arrEdges.forEach((edge: JEdge) => {
			const jhe: JHalfEdge = new JHalfEdge(this._site, edge);
			this._halfedges.push(jhe);
		})

		this._cellInformation = new JCellInformation(this);
	}

	static equals(a: JCell, b: JCell): boolean {
		return (a.id === b.id)
	}

	get site(): JSite { return this._site }
	get id(): number { return this._site.id }
	get center(): Point { return this._site.point }
	get allVertices(): Point[] {
		let out: Point[] = [];
		for (let he of this._halfedges) {
			const pts = he.points
			for (let i = 1; i < pts.length; i++) {
				out.push(pts[i]);
			}
		}
		return out;
	}

	get voronoiVertices(): Point[] {
		let out: Point[] = [];
		for (let he of this._halfedges) {
			out.push(he.initialPoint)
		}
		return out;
	}

	get verticesId(): string[] {
		let out: string[] = [];
		this.voronoiVertices.forEach((p: Point) => out.push(p.id))
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
		let verts: Point[] = this.allVertices;
		verts.push(verts[0]);
		return turf.polygon([
			verts.map((p: Point) => p.toTurfPosition())
		])
	}

	toTurfPolygonSimple(): turf.Feature<turf.Polygon> {
		let verts: Point[] = this.voronoiVertices;
		verts.push(verts[0]);
		return turf.polygon([
			verts.map((p: Point) => p.toTurfPosition())
		])
	}

	isPointIn(p: Point): boolean {
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
	private tesselate(): Triangle[] {
		let out: Triangle[] = [];
		const ts: turf.FeatureCollection<turf.Polygon> = turf.tesselate(this.toTurfPolygonSimple());
		ts.features.forEach((t: turf.Feature<turf.Polygon>) => {
			out.push(new Triangle(t));
		})
		return out;
	}

	getSubSites(AREA: number): Point[] {
		// if (this._subsites.length == 0) {
			const cantSites: number = Math.round(this.area / AREA) + 1;
			let points: Point[] = [];

			let triangles: Triangle[] = this.tesselate();
			triangles = triangles.sort((a: Triangle, b: Triangle) => b.area - a.area); // de mayor a menor area

			while (triangles.length < cantSites) {
				const tri: Triangle = triangles.shift() as Triangle;
				const div = tri.divide();
				triangles.push(div.t1);
				triangles.push(div.t2);
				triangles = triangles.sort((a: Triangle, b: Triangle) => b.area - a.area); // de mayor a menor area
			}

			for (let i = 0; i < cantSites; i++) points.push(triangles[i].centroid);

			const isIn: boolean = this.isPointIn(new Point(-90, 8))
			if (isIn) console.log(triangles.map((t: Triangle) => t.area));
			if (isIn) console.log(this.areaSimple)
			if (isIn) console.log(points)

			return points;
			// this._subsites = points;
		// }

		// return this._subsites;
	}

	/*
	 * Generic Information
	 */
	getInterface(): IJCellInfo {
		return {
			site: this._site.getInterface(),
			halfedges: this._halfedges.map((he: JHalfEdge) => he.getInterface())
		}
	}
	get info(): JCellInformation { return this._cellInformation }

	mark(): void { this._cellInformation.mark = true }
	dismark(): void { this._cellInformation.mark = false }
	isMarked(): boolean { return this._cellInformation.mark }
	
	/**
	 * sub cells functions
	 */
	get subCells(): JCell[] { return this._subCells }
	addSubCell(sb: JCell) { this._subCells.push(sb) }

}