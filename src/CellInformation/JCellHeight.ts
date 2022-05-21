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
	| 'deepocean'
	| 'ocean'
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

	constructor(c: JCell, info: IJCellHeightInfo | undefined) {
		this._cell = c;
		// const turfPol = this._cell.toTurfPolygonSimple();
		if (info) {
			this._height = /*(info.height < 0.2 && c.area > 17000) ? 0.05 :*/ info.height;
			this._prevHeight = info.prevHeight;
			this._heightType = info.heightType;
			
		} else {
			const out = this.setReliefZone();
			this._height = Math.round(out.h*1000000)/1000000*0 + 0.01;
			this._heightType = out.th;
		}
	}

	setReliefZone(): { h: number, th: TypeCellheight } {
		let out: { h: number, th: TypeCellheight } = { h: 0, th: 'land' };
		const rfn: ()=>number = RandomNumberGenerator.makeRandomFloat(this._cell.id);
		out.h = rfn();
		out.th = 'deepocean'
		
		return out;
	}

	get height(): number {return this._height}
	get heightInMeters(): number { return 6121.258 * ((this._height - 0.2)/0.8) ** 2.2 } // corregir
	get prevHeight(): number {return this._prevHeight}
	get heightType(): TypeCellheight {return this._heightType}
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
		if (this._heightType === 'deepocean') return;
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