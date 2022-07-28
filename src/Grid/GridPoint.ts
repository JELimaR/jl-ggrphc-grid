import { inRange } from "../Geom/basicGeometryFunctions";
import { GRAN } from "../Geom/constants";
import Point from "../Geom/Point";
import JCell from "../Voronoi/JCell";

export interface IGridPointInfo {
	point: { x: number, y: number };
	cellId: number;
}

export default class GridPoint {
	private _point: Point;
	private _cell: JCell;
	constructor(p: Point, cell: JCell) {
		this._point = p;
		this._cell = cell;
	}

	get cell(): JCell {return this._cell}
	get point(): Point {return this._point}

	get rowValue() {
		return inRange(
			Math.round((90 + this._point.y) / GRAN),
			0,
			180 / GRAN + 1
		);
	}

	get colValue() {
		return inRange(
			Math.round((180 + this._point.x) / GRAN),
			0,
			360 / GRAN
		);
	}

	/*
	getPixelArea(): number {
		let out = WRADIUS * (GRAN * GRAD2RAD);
		out *= WRADIUS * Math.cos(this._point.y * GRAD2RAD) * (GRAN * GRAD2RAD);

		return out;
	}
	*/
	getInterface(): IGridPointInfo {
		return {
			point: this._point.getInterface(),
			cellId: this._cell.id
		}
	}
}