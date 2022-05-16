/*
import RandomNumberGenerator from "../Geom/RandomNumberGenerator";
import { BuffRegs } from "../zones/BuffRegs";
import { pointInArrReg } from "../Geom/utilsTurfFunctions";
import { HHRegs } from "../zones/HHRegs";
import { HLRegs } from "../zones/HLRegs";
import { LHRegs } from "../zones/LHRegs";
import { LLRegs } from "../zones/LLRegs";
import { MHRegs } from "../zones/MHRegs";
import { MLRegs } from "../zones/MLRegs";
import JCell from "./JCell";

export type TypeCellheight =
	| 'deepocean'
	| 'ocean'
	| 'land'

export interface IJCellInformation {
	id: number;

	height: number;
	prevHeight: number;
	heightType: TypeCellheight;
	island: number;
}

export default class JCellInformation {
	private _cell: JCell;
	private _mark: boolean = false;

	private _height: number;
	private _prevHeight: number = 0;
	private _heightType: TypeCellheight;
	private _island: number = -1;

	constructor(c: JCell, info: IJCellInformation | undefined) {
		this._cell = c;
		// const turfPol = this._cell.toTurfPolygonSimple();
		if (info) {
			this._height = info.height;
			this._prevHeight = info.prevHeight;
			this._heightType = info.heightType;
			this._island = info.island;
		} else {
			const out = this.setReliefZone();
			this._height = Math.round(out.h*1000000)/1000000;
			this._heightType = out.th;
		}
	}

	setReliefZone(): { h: number, th: TypeCellheight } {
		let out: { h: number, th: TypeCellheight } = { h: 0, th: 'land' };
		const rfn: ()=>number = RandomNumberGenerator.makeRandomFloat(this._cell.id);
		if (!pointInArrReg(this._cell.center.toTurfPosition(), BuffRegs)) {
			out.h = 0.05;
			out.th = 'deepocean'
		} else if (pointInArrReg(this._cell.center.toTurfPosition(), HHRegs)) {
			out.h = 0.88+0.200*rfn();
		} else if (pointInArrReg(this._cell.center.toTurfPosition(), HLRegs)) {
			out.h = 0.68+0.240*rfn();
		} else if (pointInArrReg(this._cell.center.toTurfPosition(), MHRegs)) {
			out.h = 0.44+0.280*rfn();
		} else if (pointInArrReg(this._cell.center.toTurfPosition(), MLRegs)) {
			out.h = 0.30+0.180*rfn();
		} else if (pointInArrReg(this._cell.center.toTurfPosition(), LHRegs)) {
			out.h = 0.24+0.080*rfn();
		} else if (pointInArrReg(this._cell.center.toTurfPosition(), LLRegs)) {
			out.h = 0.20+0.048*rfn();
		} else {
			out.h = 0.18;
			out.th = 'ocean';
		}
		return out;
	}

	get height(): number {return this._height}
	get prevHeight(): number {return this._prevHeight}
	get heightType(): TypeCellheight {return this._heightType}
	set height(h: number) {
		if (this._heightType === 'land' && h < 0.2) {
			this._prevHeight = this._height;
			this._height = 0.2;
			return;
		}
		if ((this._heightType === 'ocean' || this._heightType === 'deepocean') && h > 0.19) {
			this._prevHeight = this._height;
			this._height = 0.19;
			return
		}
		// if (this._heightType === 'deepocean') return;
		this._prevHeight = this._height;
		this._height = h;
	}
	set island(id: number) { this._island = id }
	get island(): number { return this._island }
	// get inLandZone(): boolean {return this._heightType === ''}
	get mark(): boolean {return this._mark}
	set mark(b: boolean) {this._mark = b}

	getInterface(): IJCellInformation { 
		return {
			id: this._cell.id,

			height: this._height,
			prevHeight: this._prevHeight,
			heightType: this._heightType,
			island: this._island,
		}
	}
}
*/