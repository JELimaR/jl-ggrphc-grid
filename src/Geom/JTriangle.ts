import JPoint from "./JPoint";
import * as turf from '@turf/turf';

export default class JTriangle {
	_a: JPoint;
	_b: JPoint;
	_c: JPoint;

	_sab: JTriangleSide;
	_sbc: JTriangleSide;
	_sca: JTriangleSide;

	constructor(pol: turf.Feature<turf.Polygon>) {
		this._a = JPoint.fromTurfPosition(pol.geometry.coordinates[0][0]);
		this._b = JPoint.fromTurfPosition(pol.geometry.coordinates[0][1]);
		this._c = JPoint.fromTurfPosition(pol.geometry.coordinates[0][2]);

		this._sab = new JTriangleSide(this._a, this._b, this._c);
		this._sbc = new JTriangleSide(this._b, this._c, this._a);
		this._sca = new JTriangleSide(this._c, this._a, this._b);
	}

	toTurfPolygon(): turf.Feature<turf.Polygon> {
		let verts: JPoint[] = [this._a, this._b, this._c];
		verts.push(verts[0]);
		return turf.polygon([
			verts.map((p: JPoint) => p.toTurfPosition())
		])
	}

	get area(): number {
		return turf.area(this.toTurfPolygon()) / 1000000;
	}

	private get longestSide() {
		let out: JTriangleSide = this._sab;
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

	divide(): {t1: JTriangle, t2: JTriangle} {
		const longest: JTriangleSide = this.longestSide;
		const p1 = turf.polygon([[
			longest.midPoint.toTurfPosition(), longest.v2.toTurfPosition(), longest.op.toTurfPosition(), longest.midPoint.toTurfPosition()
		]]);
		const p2 = turf.polygon([[
			longest.midPoint.toTurfPosition(), longest.op.toTurfPosition(), longest.v1.toTurfPosition(), longest.midPoint.toTurfPosition()
		]]);
		return {
			t1: new JTriangle(p1),
			t2: new JTriangle(p2),
		}
	}

	get centroid(): JPoint {
		return new JPoint(
			(this._a.x + this._b.x + this._c.x)/3,
			(this._a.y + this._b.y + this._c.y)/3
		)
	}

	
}

export class JTriangleSide {
	_v1: JPoint;
	_v2: JPoint;
	_op: JPoint;
	constructor(v1: JPoint, v2: JPoint, op: JPoint) {
		this._v1 = v1;
		this._v2 = v2;
		this._op = op;
	}

	get v1() { return this._v1}
	get v2() { return this._v2}

	get length(): number {
		return JPoint.geogDistance(this._v1, this._v2);
	}

	get op(): JPoint { return this._op }

	get midPoint(): JPoint { return new JPoint((this._v2.x + this._v1.x)/2, (this._v2.y + this._v1.y)/2) }
}