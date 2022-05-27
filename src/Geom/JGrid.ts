import JCell from '../Voronoi/JCell';
import JDiagram from '../Voronoi/JDiagram';
import JPoint from './JPoint';
import {WRADIUS, GRAN} from './constants'
import DataInformationFilesManager from '../DataInformationLoadAndSave';
const dataInfoManager = DataInformationFilesManager.instance;

export interface IJGridPointInfo {
	point: {x: number, y: number};
	cellId: number;
}

export class JGridPoint {
	/*private*/ _point: JPoint;
	/*private*/ _cell: JCell;
	constructor(p: JPoint, cell: JCell) {
		this._point = p;
		this._cell = cell;
	}

	getInterface(): IJGridPointInfo {
		return {
			point: {x: this._point.x, y: this._point.y},
			cellId: this._cell.id
		}
	}
}

export default class JGrid {
	/*private*/ _points: JGridPoint[][];
	/*private*/ _granularity: number;
	
	constructor(gran: number, diagram: JDiagram) {
		this._granularity = gran;
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

	getGridPointIndexes(p: JPoint) {
		if (Math.abs(p.x) > 180 || Math.abs(p.y) > 90)
			throw new Error(`el punto: ${p.toTurfPosition()} se encuentra fuera de rango`)
		return {
			c: Math.round((p.x+180)/this._granularity),
			r: Math.round((p.y+90)/this._granularity)
		}
	}
	
	getGridPoint(p: JPoint): JGridPoint {
		const INDXS = this.getGridPointIndexes(p);
		return this._points[INDXS.c][INDXS.r];
	}

	getIndexsInWindow(index: number, window: number): number[] {
		let out: number[] = [];
		const stepCantMed: number = Math.round(window / this._granularity);
		for (let j = -stepCantMed; j <= stepCantMed; j++)
			out.push(index + j)
		return out;
	}

	// obtener puntos en una ventana (en principio se cortan los bordes)
	getGridPointsInWindow(point: JPoint, windowGrades: number): JGridPoint[] {
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
					c = Math.round((c < this.colsNumber/2) ? c + this.colsNumber/2 : c - this.colsNumber/2)//-1
				}
				if (r >= this.rowsNumber) {
					r = this.rowsNumber - (r - this.rowsNumber + 1);
					c = Math.round((c < this.colsNumber/2) ? c + this.colsNumber/2 : c - this.colsNumber/2)//-1
				}	
				// console.log('c',c)
				const p: JGridPoint = this._points[c][r];
				out.push(p)
			})			
		})
		return out;
	}
}

