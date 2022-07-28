import { getPointInValidCoords } from './basicGeometryFunctions';
import turf from './turf';

const PRECITION = 1000000;

export interface IPoint {
	x: number, y: number
}

export default class Point {
	private _x: number;
	private _y: number;

	constructor(x: number, y: number) {
		this._x = x;
		this._y = y;
	}

	get x() { return this._x }
	get y() { return this._y }
	get mod(): number { return Math.sqrt(this.x * this.x + this.y * this.y); }
	get angle(): number {
		let out: number = 0;
		if (this.x !== 0) {
			out = Math.atan(this.y / this.x);
		}
		return out;
	}

	add(b: Point): Point {
		return new Point(this._x + b._x, this._y + b._y);
	}

	sub(b: Point): Point {
		return new Point(this._x - b._x, this._y - b._y);
	}

	scale(k: number): Point {
		return new Point(this._x * k, this._y * k);
	}

	translate(dir: Point): Point {
		return this.add(dir);
	}

	normalize(): Point {
		let out: Point = new Point(0, 0);
		if (this.mod > 0) {
			out = new Point(this.x / this.mod, this.y / this.mod);
		}
		return out;
	}

	rightPerp(): Point {
		return new Point(this._y, -this._x);
	}

	leftPerp(): Point {
		return new Point(-this._y, this._x);
	}

	get id(): string {
		return `x${Math.round(PRECITION * this._x)}-y${Math.round(PRECITION * this._y)}`;
	}

	static equal(a: Point, b: Point): boolean {
		return (
			Math.abs(a._x - b._x) < 1 / PRECITION &&
			Math.abs(a._y - b._y) < 1 / PRECITION
		)
	}

	static distance(a: Point, b: Point): number {
		return Math.sqrt(Math.pow(a._x - b._x, 2) + Math.pow(a._y - b._y, 2));
	}

	static distance2(a: Point, b: Point): number {
		const amas = new Point(a.x + 360, a.y)
		const amen = new Point(a.x - 360, a.y)
		return Math.min(
			Point.distance(amas, b),
			Point.distance(amen, b),
			Point.distance(a, b)
		);
	}

	/**
	 * retorna el punto equivalente a b como coordenada más cercano
	 */
	point2(b: Point): Point {
		b = getPointInValidCoords(b);
		let out: Point = b;
		let dist: number = Point.distance(this, b);

		const bmas = new Point(b._x + 360, b._y);
		const bmen = new Point(b._x - 360, b._y);

		if (Point.distance(this, bmas) < dist) out = bmas;
		if (Point.distance(this, bmen) < dist) out = bmen;

		return out;
	}

	static getIdfromInterface(ip: IPoint): string {
		return Point.fromInterface(ip).id;
	}

	private toTurfPoint(): turf.Feature<turf.Point> {
		return turf.point([this._x, this._y]);
	}

	toTurfPosition(): turf.Position {
		return [this._x, this._y];
	}
	getInterface(): IPoint {
		return {
			x: this._x, y: this._y
		}
	}

	static geogDistance(a: Point, b: Point): number {
		return turf.distance(a.toTurfPoint(), b.toTurfPoint(), { units: 'kilometers' });
	}

	static greatCircle(start: Point, ended: Point): Point[] {
		let greatCircle = turf.greatCircle(start.toTurfPoint(), ended.toTurfPoint(), {
			npoints: Math.round(Point.geogDistance(start, ended) / 50) //10
		});
		return greatCircle.geometry.coordinates.map((tp: any) => new Point(tp[0], tp[1]));
	}

	// static constructors
	static fromInterface(ip: IPoint): Point {
		return new Point(ip.x, ip.y);
	}
	
	static fromTurfPosition(position: turf.Position): Point {
		return new Point(position[0], position[1]);
	}

}