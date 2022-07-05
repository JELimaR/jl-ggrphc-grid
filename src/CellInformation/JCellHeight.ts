import RandomNumberGenerator from "../Geom/RandomNumberGenerator";
/*import { BuffRegs } from "../zones/BuffRegs";
import { pointInArrReg } from "../Geom/utilsTurfFunctions";
import { HHRegs } from "../zones/HHRegs";
import { HLRegs } from "../zones/HLRegs";
import { LHRegs } from "../zones/LHRegs";
import { LLRegs } from "../zones/LLRegs";
import { MHRegs } from "../zones/MHRegs";
import { MLRegs } from "../zones/MLRegs";*/
import JCell from "../Voronoi/JCell";

export type TypeCellheight =
	| 'ocean'
	| 'lake'
	| 'land'

export interface IJCellHeightInfo {
	id: number;

	height: number;
	prevHeight: number;
	heightType: TypeCellheight;
}

export default class JCellHeight {
	private _cell: JCell;

	private _height: number;
	private _prevHeight: number = 0;
	private _heightType: TypeCellheight;
	private _island: number = -1;

	constructor(c: JCell, info: IJCellHeightInfo) {
		this._cell = c;
		// const turfPol = this._cell.toTurfPolygonSimple();
		
		this._height = info.height;
		this._prevHeight = info.prevHeight;
		this._heightType = info.heightType;
	}

	get height(): number {return this._height}
	get heightInMeters(): number { return 6121.258 * ((this._height - 0.2)/0.8) ** 1.8 } // corregir
	get prevHeight(): number {return this._prevHeight}
	get heightType(): TypeCellheight {return this._heightType}
	set heightType(ht: TypeCellheight) {this._heightType = ht}
	set height(h: number) {
		if (this._heightType === 'land' && h < 0.2) {
			this._prevHeight = this._height;
			this._height = 0.2;
			return;
		}
		if (this._heightType === 'ocean' && h > 0.19) {
			this._prevHeight = this._height;
			this._height = 0.19;
			return
		}
		this._prevHeight = this._height;
		this._height = h;
	}
	set island(id: number) { this._island = id }
	get island(): number { return this._island }
	// get inLandZone(): boolean {return this._heightType === ''}

	getInterface(): IJCellHeightInfo { 
		return {
			id: this._cell.id,

			height: this._height,
			prevHeight: this._prevHeight,
			heightType: this._heightType,
		}
	}
}