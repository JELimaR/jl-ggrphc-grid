import * as turf from '@turf/turf'

import { Vertex } from 'voronoijs';
import Coord from './Coord';

export interface IPoint {
	x: number, y: number
}

export default class JPoint {
	private _x: number;
	private _y: number;

	constructor( x: number, y: number ) {
		this._x = x;
		this._y = y;
	}

	get x() { return this._x }
	get y() { return this._y }
	get mod(): number { return Math.sqrt( this.x*this.x + this.y*this.y ); }
	get angle(): number {
		let out: number = 0;
		if (this.x !== 0) {
			out = Math.atan(this.y/this.x);
		}
		return out;
	}

	add(b: JPoint ): JPoint {
		return new JPoint( this._x + b._x, this._y + b._y );
	}

	sub(b: JPoint ): JPoint {
		return new JPoint( this._x - b._x, this._y - b._y );
	}

	scale(k: number): JPoint {
		return new JPoint( this._x * k, this._y * k);
	}

	translate( dir: JPoint ): JPoint {
		return this.add(dir);
	}

	normalize(): JPoint {
		let out: JPoint = new JPoint(0,0);
		if (this.mod > 0) {
			out = new JPoint(this.x/this.mod, this.y/this.mod);
		}
		return out;
	}

	rightPerp(): JPoint {
		return new JPoint(this._y, -this._x);
	}

	leftPerp(): JPoint {
		return new JPoint(-this._y, this._x);
	}

	get id(): string {
		return `x${Math.round(1000000 * this._x)}-y${Math.round(1000000 * this._y)}`;
	}

	static equal(a: JPoint, b: JPoint): boolean {
		return (
			Math.abs(a._x - b._x) < 0.0001 &&
			Math.abs(a._y - b._y) < 0.0001
		)
	}

	static distance(a: JPoint, b: JPoint): number {
		return Math.sqrt( Math.pow(a._x-b._x, 2) + Math.pow(a._y-b._y, 2) );
	}

	static distance2(a: JPoint, b: JPoint): number {
		const amas = new JPoint(a.x+360, a.y)
		const amen = new JPoint(a.x-360, a.y)
		return Math.min(
			JPoint.distance(amas,b),
			JPoint.distance(amen,b),
			JPoint.distance(a,b)
		);
	}

	point2(b: JPoint): JPoint {
		b = JPoint.pointToCoord(b);
		let out: JPoint = b;
		let dist: number = JPoint.distance(this, b);
		
		const bmas = new JPoint(b._x+360, b._y)
		const bmen = new JPoint(b._x-360, b._y)

		if (JPoint.distance(this, bmas) < dist) out = bmas;
		if (JPoint.distance(this, bmen) < dist) out = bmen;


		return out;		
	}

	static fromTurfPosition(position: turf.Position): JPoint {
		return new JPoint(position[0], position[1]);
	}

	static fromVertex(v: Vertex): JPoint {
		return new JPoint(v.x, v.y);
	}

	static getIdfromVertex(v: Vertex): string {
		return JPoint.fromVertex(v).id;
	}

	static pointToCoord(p: JPoint): JPoint { // o modificamos el JPoint
		const coord: Coord = new Coord(p.y, p.x);
		return coord.toPoint();
	}


	private toTurfPoint(): turf.Feature<turf.Point> {
		return turf.point( [this._x, this._y] );
	}

	toTurfPosition(): turf.Position {
		return  [this._x, this._y];
	}

	static geogDistance(a: JPoint, b: JPoint): number {
		return turf.distance( a.toTurfPoint(), b.toTurfPoint(), {units: 'kilometers'} );
	}

	static greatCircle(start: JPoint, ended: JPoint): JPoint[] {
		let greatCircle = turf.greatCircle(start.toTurfPoint(), ended.toTurfPoint(), {
			npoints: Math.round(JPoint.geogDistance(start, ended)/50) //10
		});
		return greatCircle.geometry.coordinates.map((tp: any) => new JPoint(tp[0], tp[1]));
	}

	// static constructors
	static fromInterface(ip: IPoint): JPoint {
		return new JPoint( ip.x, ip.y);
	}

	scalarprod( b: JPoint ): number {
		return this._x*b.x+this._y*b.y;
	}

	getInterface(): IPoint {
		return {
			x: this._x, y: this._y
		}
	}
}