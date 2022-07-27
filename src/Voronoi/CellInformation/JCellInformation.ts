import JCell from "../JCell";
import JCellHeight, {IJCellHeightInfo} from './JCellHeight';
import JCellClimate, {IJCellClimateInfo} from './JCellClimate';

export default class JCellInformation {
	_cell: JCell
	_height: JCellHeight | undefined;
	_climate: JCellClimate | undefined;
	// _temp: JCellTemp | undefined;

	private _mark: boolean = false;

	constructor(cell: JCell) {
		this._cell = cell;
	}

	get mark(): boolean {return this._mark}
	set mark(b: boolean) {this._mark = b}

	/*
	 * height
	 */
	setHeightInfo(h: IJCellHeightInfo) { this._height = new JCellHeight(this._cell, h);	}
	getHeightInfo(): IJCellHeightInfo | undefined { return this._height!.getInterface(); }	
	get cellHeight(): JCellHeight {
		return this._height!;
	}
	
	get isLand(): boolean { return this._height!.heightType === 'land' }
	get height(): number { return this._height!.height }
	get prevHeight(): number { return this._height!.prevHeight }
	set height(h: number) { this._height!.height = h }

	set islandId(id: number) { this._height!.island = id; } // se puede eliminar
	get islandId(): number { return this._height!.island; }

	/*
	 * climate
	 */
	setClimatetInfo(c: IJCellClimateInfo) { this._climate = new JCellClimate(this._cell, c);	}
	getClimateInfo(): IJCellClimateInfo | undefined { return this._climate!.getInterface(); }	
	get cellClimate(): JCellClimate {
		return this._climate!;
	}

	get tempMonthArr(): number[] { return this._climate!.tempMonth }
	// get tempMedia(): number { 
	// 	let out: number = 0;
	// 	this._temp!.tempMonth.forEach((t: number) => out += t)
	// 	return out/12;
	// }
}

