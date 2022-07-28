import Point from "./Point";
import turf from "./turf";

export default class Triangle {
	private _a: Point;
	private _b: Point;
	private _c: Point;

	private _sab: TriangleSide;
	private _sbc: TriangleSide;
	private _sca: TriangleSide;

	constructor(pol: turf.Feature<turf.Polygon>) {
		this._a = Point.fromTurfPosition(pol.geometry.coordinates[0][0]);
		this._b = Point.fromTurfPosition(pol.geometry.coordinates[0][1]);
		this._c = Point.fromTurfPosition(pol.geometry.coordinates[0][2]);

		this._sab = new TriangleSide(this._a, this._b, this._c);
		this._sbc = new TriangleSide(this._b, this._c, this._a);
		this._sca = new TriangleSide(this._c, this._a, this._b);
	}

	toTurfPolygon(): turf.Feature<turf.Polygon> {
		let verts: Point[] = [this._a, this._b, this._c];
		verts.push(verts[0]);
		return turf.polygon([
			verts.map((p: Point) => p.toTurfPosition())
		])
	}

	get area(): number {
		return turf.area(this.toTurfPolygon()) / 1000000;
	}

	private get longestSide() {
		let out: TriangleSide = this._sab;
		let maxLong: number = this._sab.length;

		if (maxLong < this._sbc.length) {
			maxLong = this._sbc.length;
			out = this._sbc
		}

		if (maxLong < this._sca.length) {
			out = this._sca;
		}

		return out;
	}

	divide(): { t1: Triangle, t2: Triangle } {
		const longest: TriangleSide = this.longestSide;
		const p1 = turf.polygon([[
			longest.midPoint.toTurfPosition(), longest.v2.toTurfPosition(), longest.op.toTurfPosition(), longest.midPoint.toTurfPosition()
		]]);
		const p2 = turf.polygon([[
			longest.midPoint.toTurfPosition(), longest.op.toTurfPosition(), longest.v1.toTurfPosition(), longest.midPoint.toTurfPosition()
		]]);
		return {
			t1: new Triangle(p1),
			t2: new Triangle(p2),
		}
	}

	get centroid(): Point {
		return new Point(
			(this._a.x + this._b.x + this._c.x) / 3,
			(this._a.y + this._b.y + this._c.y) / 3
		)
	}


}

class TriangleSide {
	private _v1: Point;
	private _v2: Point;
	private _op: Point;
	constructor(v1: Point, v2: Point, op: Point) {
		this._v1 = v1;
		this._v2 = v2;
		this._op = op;
	}

	get v1() { return this._v1 }
	get v2() { return this._v2 }

	get length(): number {
		return Point.geogDistance(this._v1, this._v2);
	}

	get op(): Point { return this._op }

	get midPoint(): Point { return new Point((this._v2.x + this._v1.x) / 2, (this._v2.y + this._v1.y) / 2) }
}