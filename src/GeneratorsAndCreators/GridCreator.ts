import JCell from '../Voronoi/JCell';
import JDiagram from '../Voronoi/JDiagram';
import Point from '../Geom/Point';
import { GRAN } from '../Geom/constants'
import InformationFilesManager from '../DataFileLoadAndSave/InformationFilesManager';
import Grid from '../Grid/Grid';
import GridPoint, { IGridPointInfo } from '../Grid/GridPoint';

export default class GridCreator {
	static createGrid(diagram: JDiagram): Grid {
		const ifm = InformationFilesManager.instance;
		let out: GridPoint[][];
		const loadedData = ifm.loadGridPoints(diagram.secAreaProm);
		if (loadedData.length === 0) {
			out = this.createGridPoints(diagram);
			ifm.saveGridPoints(out, diagram.secAreaProm);
		} else {
			out = loadedData.map((coli: IGridPointInfo[]) => {
				return coli.map((info: IGridPointInfo) => {
					return new GridPoint(new Point(info.point.x, info.point.y), diagram.cells.get(info.cellId)!);
				})
			})
		}
		return new Grid(out);
	}

	private static createGridPoints(diagram: JDiagram): GridPoint[][] {
		let out: GridPoint[][] = [];
		for (let i = -180; i < 180; i += GRAN) {
			console.log('x value:', i);
			let col: GridPoint[] = [];
			for (let j = -90; j <= 90; j += GRAN) {
				const point: Point = new Point(i, j);
				const cell: JCell = diagram.getCellFromPoint(point);
				const gp = new GridPoint(point, cell);
				col.push(gp);
			}
			out.push(col);
		}
		return out;
	}
}