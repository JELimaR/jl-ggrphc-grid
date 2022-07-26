import {Site} from 'voronoijs';
import JPoint from '../Geom/JPoint';

/*
export interface IJSiteInfo {
	id: number;
	x: number;
	y:number;
}
*/
export default class JSite {

	private _id: number;
	private _point: JPoint;

	constructor(s: Site) {
		this._id = s.id;
		if (Math.abs(s.x) > 180 || Math.abs(s.y) > 90)
			throw new Error(`El Site ${s.id} es invalido. {x: ${s.x}, y: ${s.y}}`);
		this._point = new JPoint(s.x, s.y);
	}

	get id(): number {return this._id}
	get point(): JPoint {return this._point}
/*
	getInterface(): IJSiteInfo {
		return {
			id: this._id,
			x: this._point.x, y: this._point.y
		}
	}*/
}