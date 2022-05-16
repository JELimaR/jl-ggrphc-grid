import {Site} from 'voronoijs';
import JPoint from '../Geom/JPoint';

export interface IJSiteInfo {
	id: number;
	x: number;
	y:number;
}

export default class JSite {

	private _id: number;
	private _point: JPoint;

	constructor(s: Site | IJSiteInfo) {
		this._id = s.id;
		this._point = new JPoint(s.x, s.y);
	}

	get id(): number {return this._id}
	get point(): JPoint {return this._point}

	getInterface(): IJSiteInfo {
		return {
			id: this._id,
			x: this._point.x, y: this._point.y
		}
	}
}