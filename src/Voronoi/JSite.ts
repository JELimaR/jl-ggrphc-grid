import {Site} from 'voronoijs';
import Point, {IPoint} from '../Geom/Point';

/*
export interface IJSiteInfo {
	id: number;
	x: number;
	y:number;
}
*/
export default class JSite {

	private _id: number;
	private _point: Point;

	constructor(s: Site) {
		this._id = s.id;
		if (Math.abs(s.x) > 180 || Math.abs(s.y) > 90)
			throw new Error(`El Site ${s.id} es invalido. {x: ${s.x}, y: ${s.y}}`);
		this._point = new Point(s.x, s.y);
	}

	get id(): number {return this._id}
	get point(): Point {return this._point}
/*
	getInterface(): IJSiteInfo {
		return {
			id: this._id,
			x: this._point.x, y: this._point.y
		}
	}*/
}