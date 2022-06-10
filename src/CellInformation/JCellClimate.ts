import JCell from "../Voronoi/JCell";

export interface IJCellClimateInfo {
	id: number;
	tempMonth: number[];
	precipMonth: number[];
}

export default class JCellClimate {
	_cell: JCell;
	_tempMonth: number[];
	_precipMonth: number[];
	constructor(cell: JCell, info: IJCellClimateInfo) {
		this._cell = cell;
		this._tempMonth = info.tempMonth;
		this._precipMonth = info.precipMonth;
	}

	get tempMonth(): number[] { return this._tempMonth }
	// set tempMonth(tempArr: number[]) { this._tempMonth = [...tempArr] }
	get precipMonth(): number[] { return this._precipMonth }

	// temp
	get tmin() { return Math.min(...this._tempMonth) }
	get tmax() { return Math.max(...this._tempMonth) }

	// precip
	get precipSemCalido(): number {
		let out: number = 0;
		for (let m of this.getMonthsSet().calido) {
			out += this._precipMonth[m-1];
		}
		return out;
	}	
	get precipSemFrio() {
		let out: number = 0;
		for (let m of this.getMonthsSet().frio) {
			out += this._precipMonth[m-1];
		}
		return out;
	}

	getMonthsSet(): { calido: number[], frio: number[]} {
		return {
			calido: (this._cell.center.y < 0) ? [1,2,3,4,11,12] : [5,6,7,8,9,10],
			frio: (this._cell.center.y < 0) ? [5,6,7,8,9,10] : [1,2,3,4,11,12]
		}
	}

	getInterface(): IJCellClimateInfo {
		return {
			id: this._cell.id,
			tempMonth: this._tempMonth,
			precipMonth: this._precipMonth
		}
	}
}