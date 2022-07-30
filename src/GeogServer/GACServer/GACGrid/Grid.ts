import Point from '../../../Geom/Point';
import GridPoint from './GridPoint';
import { inRange } from '../../../Geom/basicGeometryFunctions';
import { GRAN } from '../constants';

export default class Grid {
	private _points: GridPoint[][];

	constructor(points: GridPoint[][]) {
		this._points = points;
	}

	getRow(n: number): GridPoint[] {
		let out: GridPoint[] = [];
		this._points.forEach((col: GridPoint[]) => out.push(col[n]))
		return out;
	}
	get rowsNumber(): number {
		return this._points[0].length;
	}

	get colsNumber(): number {
		return this._points.length;
	}
	get points(): GridPoint[][] { return this._points }

	forEachPoint(func: (gp: GridPoint, col: number, row: number) => void) {
		this._points.forEach((col: GridPoint[], cidx: number) => {
			col.forEach((gp: GridPoint, ridx: number) => {
				func(gp, cidx, ridx);
			})
		})
	}

	getGridPointIndexes(p: Point) {
		if (Math.abs(p.x) > 180 || Math.abs(p.y) > 90)
			throw new Error(`el punto: ${p.toTurfPosition()} se encuentra fuera de rango`)
		return {
			c: inRange(Math.round((p.x + 180) / GRAN), 0, this.colsNumber - 1),
			r: inRange(Math.round((p.y + 90) / GRAN), 0, this.rowsNumber - 1)
		}
	}

	getGridPoint(p: Point): GridPoint {
		const INDXS = this.getGridPointIndexes(p);
		return this._points[INDXS.c][INDXS.r];
	}

	getGridPointsInWindow(point: Point, windKm: number): GridPoint[] {
		let out: GridPoint[] = [];

		this.getGridPointsInWindowGrade(point, windKm / 3).forEach((gp: GridPoint) => {
			if (Point.geogDistance(point, gp.point) <= windKm) {
				out.push(gp);
			}
		})

		return out;
	}

	getIndexsInWindow(index: number, window: number): number[] {
		let out: number[] = [];
		const stepCantMed: number = Math.round(window / GRAN);
		for (let j = -stepCantMed; j <= stepCantMed; j++)
			out.push(index + j)
		return out;
	}

	// obtener puntos en una ventana
	getGridPointsInWindowGrade(point: Point, windowGrades: number): GridPoint[] {

		let out: GridPoint[] = [];
		const INDXS = this.getGridPointIndexes(point);

		const cidxs: number[] = this.getIndexsInWindow(INDXS.c, windowGrades);
		const ridxs: number[] = this.getIndexsInWindow(INDXS.r, windowGrades);

		cidxs.forEach((c: number) => {
			if (c < 0) {
				c = this.colsNumber + c;
			}
			if (c >= this.colsNumber) {
				c = c - this.colsNumber;
			}
			ridxs.forEach((r: number) => {
				if (r < 0) {
					r = -r;
					c = Math.round((c < this.colsNumber / 2) ? c + this.colsNumber / 2 : c - this.colsNumber / 2)
				}
				if (r >= this.rowsNumber) {
					r = this.rowsNumber - (r - this.rowsNumber + 1);
					c = Math.round((c < this.colsNumber / 2) ? c + this.colsNumber / 2 : c - this.colsNumber / 2)
				}
				if (!this._points[c]) console.log('c', c)
				const p: GridPoint = this._points[c][r];
				out.push(p)
			})
		})
		return out;
	}

	//dada una lista de puntos de recorrido horizontal, (un punto para cada columna), se devuelve el recorrido "suavizado"
	soft(points: Point[], miny: number = -90, maxy: number = 90): GridPoint[] {
		let out: Point[] = points.map((p: Point, idx: number) => {
			let val: number = 0, cant = 0;
			let arr: number[] = [];
			const stepCantMed: number = Math.round(10 / GRAN);
			for (let j = -stepCantMed; j <= stepCantMed; j++) arr.push(idx + j)
			arr.forEach((n: number) => {
				if (n >= 0 && n < this.colsNumber) {
					val += points[n].y;
					cant++;
				}
			})
			return new Point(p.x, GRAN * Math.round(val / cant / GRAN));
		})

		return out.map((point: Point) => {
			const y = inRange(point.y, miny, maxy);
			const x = point.x;
			return this.getGridPoint(new Point(x, y));
		})
	}
}