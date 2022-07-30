import Point from "../../../Geom/Point";
import Grid from "./Grid";

export default abstract class DataGrid<D> {
  private _grid: Grid;
  private _matrixData: D[][] = [];
  constructor(grid: Grid) {
    this._grid = grid;
  }

  get grid(): Grid {return this._grid}
  get matrixData(): D[][] {return this._matrixData}
  set matrixData(data: D[][]) {this._matrixData = data;}

  getPointInfo(p: Point): D {
		const indexes = this._grid.getGridPointIndexes(p);
		return this._matrixData[indexes.c][indexes.r];
	}
}