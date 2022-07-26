import JPoint from "./JPoint";
import {WRADIUS, GRAN} from './constants'

export interface ICoordInfo {
	lat: number,
	lon: number,
}

export default class Coord {
	
	private _lat: number;
	private _lon: number;

	constructor(lat: number, lon: number) {
		this._lat = lat;
		if (this._lat < -90) this._lat += -(90 + this._lat)*2;
		if (this._lat > 90) this._lat += -(this._lat - 90)*2;
		//this._lat = (lat + 90) % 180 - 90;
		lon = Math.abs(this._lat - lat) > 0.001 ? lon + 180 : lon;
		if (lon + 180 < 0) lon += 360
		if (lon + 180 > 360) lon -= 360;
		this._lon = lon;
	}

	get lat(): number {return this._lat}
	get lon(): number {return this._lon}

	toPoint(): JPoint {
		return new JPoint(this._lon, this._lat);
	}

	static distance(a: Coord, b: Coord): number {
		return JPoint.geogDistance(a.toPoint(), b.toPoint())/6371*WRADIUS;
	}

	static pointToCoord(p: JPoint): Coord {
		return new Coord(p.y, p.x);
	}

}

