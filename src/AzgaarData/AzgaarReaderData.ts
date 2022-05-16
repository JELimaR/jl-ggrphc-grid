
import { Site } from 'voronoijs';
import fs from 'fs';
import {AzgaarFullData, Cell} from './FullDataTypes';
// import {AzgaarPackData} from './PackDataTypes'
// import {AzgaarGridData} from './GridDataTypes'

export default class AzgaarReaderData {
	static _instance: AzgaarReaderData;

	private _dirPath: string = '';
	private _fullData: AzgaarFullData | undefined;
	private _cellsMap: Map<number, Cell> = new Map<number, Cell>();

	private constructor() {  }

	static get instance(): AzgaarReaderData {
		if (!this._instance) {
			this._instance = new AzgaarReaderData();
		}
		return this._instance;
	}

	static configPath(path: string): void {
		this.instance._dirPath = path;
		// fs.mkdirSync(path, {recursive: true});
		this.instance._fullData = this.readData();
		this.instance._fullData.cells.cells.forEach((cell: Cell) => {
			this._instance._cellsMap.set(cell.i, cell);
		})
	}

	private static readData(): AzgaarFullData {
		try {
			let pathFile: string = `${this._instance._dirPath}/fullData.json`;
			return JSON.parse(fs.readFileSync(pathFile).toString());
		} catch(e) {
			console.log(e)
			throw e;
		}
	}
	
	// height drawing
	sites(): Site[] {
		let out: Site[] = [];
		this._fullData!.cells.cells.forEach((cell: any) => {
			const x = cell.p[0]/1920*360-180;
			const y = cell.p[1]/880*180-90;
			out.push({ id: cell.i, x, y})
		})
		return out;
	}

	heighNeighbourMedia(cell: Cell): number {
		// const cell = this._fullData!.cells.cells.find((cell: any) => cell.i == id);
		let out:number = 0;

		cell!.c.forEach((nid: number) => {
			const ncell = this._cellsMap.get(nid) as Cell;
			out += ncell!.h;
		})

		return out/cell!.c.length;
	}

	hs() {
		let out: {id: number, x: number, y: number, h: number}[] = [];
		// AzgaarReaderData.azgaarData.forEach((cell: any) => {
		console.log(this._fullData!.cells.cells.length)
		this._fullData!.cells.cells.forEach((cell: Cell, indx: number) => {
			//const fc: number | FeatureClass | undefined = this._data!.cells.features.find((fc: any) => fc.i == cell.i)
			//if (!fc) throw new Error('')
			//if (typeof fc === 'number') throw new Error('')
			
			const hmedia = this.heighNeighbourMedia(cell);
			if (Math.abs(cell.h - hmedia)/hmedia > 0.5) {
				cell.h = hmedia;
			}
			
			let h = cell.h;
			h = (h - 19)/80;
			const x = cell.p[0]/1920*360-180;
			const y = cell.p[1]/880*180-90;
			out.push({ id: cell.i, x, y, h})
		})
		return out;
	}

}