import JCell from '../Voronoi/JCell';
import JDiagram from '../Voronoi/JDiagram';
import JPoint from './JPoint';
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
		for (let i = -180; i <= 179; i += this._granularity) {
			let col: JGridPoint[] = [];
		  for (let j = -89; j <= 89; j += this._granularity) {
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
		let out: number = 0;
		for (let j = -180; j <= 180; j += this._granularity) {
			out++;
		}
		return out;
	}
}

