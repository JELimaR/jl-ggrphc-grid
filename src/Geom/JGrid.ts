import JCell from '../Voronoi/JCell';
import JDiagram from '../Voronoi/JDiagram';
import JPoint from './JPoint';
import { WRADIUS } from './constants'
import DataInformationFilesManager from '../DataInformationLoadAndSave';
const dataInfoManager = DataInformationFilesManager.instance;

export interface IJGridPointInfo {
	point: { x: number, y: number };
	cellId: number;
}

export class JGridPoint {
	private static _gran: number;
	/*private*/ _point: JPoint;
	/*private*/ _cell: JCell;
	constructor(p: JPoint, cell: JCell) {
		this._point = p;
		this._cell = cell;
	}

	static set gran(g: number) { this._gran = g; }
	// static get gran() { return this._gran; }

	get rowValue() {
		return inRange(
			Math.round((90 + this._point.y)/JGridPoint._gran),
			0,
			180/JGridPoint._gran + 1
		);
	}

	get colValue() {
		return inRange(
			Math.round((180 + this._point.x)/JGridPoint._gran),
			0,
			360/JGridPoint._gran
		);
	}

	getPixelArea(): number {
		const grad2radConst = Math.PI / 180;

		let out = WRADIUS * (JGridPoint._gran * grad2radConst);
		out *= WRADIUS * Math.cos(this._point.y * grad2radConst) * (JGridPoint._gran * grad2radConst);

		return out;
	}

	getInterface(): IJGridPointInfo {
		return {
			point: { x: this._point.x, y: this._point.y },
			cellId: this._cell.id
		}
	}
}

export default class JGrid {
	/*private*/ _points: JGridPoint[][];
	/*private*/ _granularity: number;

	constructor(gran: number, diagram: JDiagram) {
		this._granularity = gran;
		JGridPoint.gran = gran;
		const loadedData = dataInfoManager.loadGridPoints(this._granularity, diagram.cells.size);
		if (loadedData.length === 0) {
			this._points = this.createGridPoints(diagram);
			dataInfoManager.saveGridPoints(this._points, this._granularity, diagram.cells.size)
		} else {
			this._points = loadedData.map((coli: IJGridPointInfo[]) => {
				return coli.map((info: IJGridPointInfo) => {
					return new JGridPoint(new JPoint(info.point.x, info.point.y), diagram.cells.get(info.cellId)!);
				})
			})
		}
	}

	private createGridPoints(diagram: JDiagram): JGridPoint[][] {
		let out: JGridPoint[][] = [];
		for (let i = -180; i < 180; i += this._granularity) {
			console.log('x value:', i);
			let col: JGridPoint[] = [];
			for (let j = -90; j <= 90; j += this._granularity) {
				const point: JPoint = new JPoint(i, j);
				const cell: JCell = diagram.getCellFromPoint(point);
				const gp = new JGridPoint(point, cell);
				col.push(gp);
			}
			out.push(col);
		}
		return out;
	}

	getRow(n: number): JGridPoint[] {
		let out: JGridPoint[] = [];
		this._points.forEach((col: JGridPoint[]) => out.push(col[n]))
		return out;
	}
	get rowsNumber(): number {
		return this._points[0].length;
	}

	get colsNumber(): number {
		return this._points.length;
	}

	forEachPoint(func: (gp: JGridPoint, col: number, row: number) => void) {
		this._points.forEach((col: JGridPoint[], cidx: number) => {
			col.forEach((gp: JGridPoint, ridx: number) => {
				func(gp, cidx, ridx);
			})
		})
	}

	getGridPointIndexes(p: JPoint) {
		if (Math.abs(p.x) > 180 || Math.abs(p.y) > 90)
			throw new Error(`el punto: ${p.toTurfPosition()} se encuentra fuera de rango`)
		return {
			c: inRange(Math.round((p.x + 180) / this._granularity), 0, this.colsNumber - 1),
			r: inRange(Math.round((p.y + 90) / this._granularity), 0, this.rowsNumber - 1)
		}
	}

	getGridPoint(p: JPoint): JGridPoint {
		const INDXS = this.getGridPointIndexes(p);
		return this._points[INDXS.c][INDXS.r];
	}

	getGridPointsInWindow(point: JPoint, windKm: number): JGridPoint[] {
		let out: JGridPoint[] = [];

		this.getGridPointsInWindowGrade(point, windKm / 30).forEach((gp: JGridPoint) => {
			if (JPoint.geogDistance(point, gp._point) < windKm) {
				out.push(gp);
			}
		})

		return out;
	}

	getIndexsInWindow(index: number, window: number): number[] {
		let out: number[] = [];
		const stepCantMed: number = Math.round(window / this._granularity);
		for (let j = -stepCantMed; j <= stepCantMed; j++)
			out.push(index + j)
		return out;
	}

	// obtener puntos en una ventana (en principio se cortan los bordes)
	getGridPointsInWindowGrade(point: JPoint, windowGrades: number): JGridPoint[] {
		const cWindow = (windowGrades > 360) ? 360 : windowGrades;
		const rWindow = (windowGrades > 180) ? 180 : windowGrades;
		let out: JGridPoint[] = [];
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
				const p: JGridPoint = this._points[c][r];
				out.push(p)
			})
		})
		return out;
	}

	//dada una lista de puntos de recorrido horizontal, (un punto para cada columna), se devuelve el recorrido "suavizado"
	soft(points: JPoint[], miny: number = -90, maxy: number = 90): JGridPoint[] {
		let out: JPoint[] = points.map((p: JPoint, idx: number) => {
			let val: number = 0, cant = 0;
			let arr: number[] = [];
			const stepCantMed: number = Math.round(10 / this._granularity);
			for (let j = -stepCantMed; j <= stepCantMed; j++) arr.push(idx + j)
			arr.forEach((n: number) => {
				if (n >= 0 && n < this.colsNumber) {
					val += points[n].y;
					cant++;
				}
			})
			return new JPoint(p.x, this._granularity * Math.round(val / cant / this._granularity));
		})
		
		return out.map((point: JPoint) => {
			const y = inRange(point.y, miny, maxy);
			const x = point.x;
			return this.getGridPoint(new JPoint(x,y));
		})
	}
}

const inRange = (value: number, minimo: number, maximo: number): number => {
	let out = value;

	if (out > maximo) out = maximo;
	if (out < minimo) out = minimo;

	return out;
}