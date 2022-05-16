import Jimp from 'jimp';
import fs from 'fs';
import GeoCoordGrid, { GridCoord } from "../Geom/GeoCoordGrid";
import PNGDrawsDataManager from '../PNGDrawsDataManager';
import RandomNumberGenerator from "../Geom/RandomNumberGenerator";


const pngDrawData: PNGDrawsDataManager = PNGDrawsDataManager.instance;

export interface IHeightGridInfo {
	height: number,
	type: 'land' | 'ocean',
}

export default class HeightGridData {

	_heightData: Map<number, IHeightGridInfo> = new Map<number, IHeightGridInfo>();
	_rawData: Jimp;

	constructor(grid: GeoCoordGrid) {

		this._rawData = pngDrawData.readHeight2();

		const randFunc = RandomNumberGenerator.makeRandomFloat(0);
		
		grid._matrix.forEach((row: GridCoord[]) => {
			row.forEach((gc: GridCoord) => {
				this._heightData.set(gc.id, 
					this.calcHeightValues(gc, randFunc)
				)
			})
		})

		this.smoothHeight(grid);
		this.smoothHeight(grid);
		this.smoothHeight(grid);
	}

	calcHeightValues(gc: GridCoord, func: ()=>number): IHeightGridInfo {
		let out: IHeightGridInfo = {height: 0, type: 'land'};
		const stringColor = this._rawData.getPixelColor(gc.colValue, gc.rowValue).toString(16);
		switch (stringColor) {
			case '3f48ccff':
				out.height = func()*3000 - 5000;
				break;
			case 'a2e8ff': // '00a2e8ff'
				out.height = func()*1500 - 2000;
				break;
			case '99d9eaff':
				out.height = func()*450 - 500;
				break;
			case '22b14cff':
				out.height = func()*150;
				break;
			case 'efe4b0ff':
				out.height = func()*600 + 100;
				break;
			case 'ff7f27ff':
				out.height = func()*1200 + 500;
				break;
			case 'ed1c24ff':
				out.height = func()*2500 + 1500;
				break;
			case '880015ff':
				out.height = func()*2500 + 4000;
				break;
			default:
				break; //throw new Error(`value non valid: ${stringColor}`)
		}
		if (out.height < 0) out.type = 'ocean';
		return out;
	}

	smoothHeight(grid: GeoCoordGrid) {
		this._heightData.forEach((val: IHeightGridInfo, id: number) => {
			const ns = grid.getNeighbours(grid._map.get(id)!);

			let cant = 1;
			let h = val.height;
			ns.forEach((gc: GridCoord) => {
				cant++;
				h += this._heightData.get(gc.id)!.height;
			})
			val.height = h/cant; // usar funcion inRange
		})
	}
}






