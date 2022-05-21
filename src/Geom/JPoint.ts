import * as turf from '@turf/turf'
import { Vertex } from 'voronoijs';
import Coord from './Coord';

export default class JPoint {
	private _x: number;
	private _y: number;

	constructor( x: number, y: number ) {
		this._x = x;
		this._y = y;
	}

	get x() { return this._x }
	get y() { return this._y }

	static add(a: JPoint, b: JPoint ): JPoint {
		return new JPoint( a._x + b._x, a._y + b._y );
	}

	private scale(k: number): JPoint {
		return new JPoint( this._x * k, this._y * k);
	}

	private translate( dir: JVector ) {
		this._x = dir.x + this._x;
		this._y = dir.y + this._y;
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

	static fromTurfPosition(position: turf.Position): JPoint {
		return new JPoint(position[0], position[1]);
	}

	static fromVertex(v: Vertex): JPoint {
		return new JPoint(v.x, v.y);
	}

	static pointToCoord(p: JPoint): JPoint { // o modificamos el JPoint
		const coord: Coord = new Coord(p.y, p.x);
		return new JPoint(coord.lon, coord.lat)
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
}

export class JVector extends JPoint {
	// private _beg: Point;
	// private _end: Point;

	constructor( ends: JPoint | {x:number, y:number}, begins: JPoint | {x: number, y: number} = {x:0,y:0} ) {
		super(ends.x - begins.x, ends.y - begins.y )
		// this._end = JSON.parse( JSON.stringify(ends) );
		// this._beg = JSON.parse( JSON.stringify(begins) );
	}

	static scalarprod( a: JVector, b: JVector ): number {
		return a.x*b.x+a.y*b.y;
	}

	static angleDif( a: JVector, b: JVector): number {
		return (a.angle - b.angle) % 2*Math.PI
	}

	get mod(): number { return Math.sqrt( this.x*this.x + this.y*this.y ); }

	get angle(): number {
		let out: number = 0;

		if (this.x !== 0) {
			out = Math.atan(this.y/this.x);
		}

		return out;
	}
}