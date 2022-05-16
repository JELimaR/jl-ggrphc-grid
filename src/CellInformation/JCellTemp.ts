import JCell from "../Voronoi/JCell";

export interface IJCellTempInfo {
	id: number;
	tempCap: number;
	tempMonth: number[];
}

export default class JCellTemp {
	_cell: JCell;
	_tempCap: number = 1;
	_tempMonth: number[];
	constructor(cell: JCell, info: IJCellTempInfo) {
		this._cell = cell;
		this._tempCap = info.tempCap;
		this._tempMonth = info.tempMonth;
	}

	get tempMonth(): number[] { return this._tempMonth }
	set tempMonth(tempArr: number[]) { this._tempMonth = [...tempArr] }

	getInterface(): IJCellTempInfo {
		return {
			id: this._cell.id,
			tempCap: this._tempCap,
			tempMonth: this._tempMonth,
		}
	}
}