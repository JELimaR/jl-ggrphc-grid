import fs from 'fs';
import { AzgaarFullData, AzgaarCell } from './FullDataTypes';

export default class AzgaarReaderData {
	private static _instance: AzgaarReaderData;
	private static _directories: string[] = [];

	private _dirPath: string = '';
	private _fullData: AzgaarFullData | undefined;
	private _cellsMap: Map<number, AzgaarCell> = new Map<number, AzgaarCell>();

	private constructor() { }

	static get instance(): AzgaarReaderData {
		if (!this._instance) {
			this._instance = new AzgaarReaderData();
		}
		return this._instance;
	}

	static configPath(rootPath: string, folder: string): void {
		if (this._directories.length == 0) this.getDirectories(rootPath);
		if (!this._directories.includes(folder)) 
			throw new Error(`no existe Azgaar Data para la folder ${folder}`);
		this.instance._dirPath = rootPath + folder;
		// fs.mkdirSync(path, {recursive: true});
		this.instance._fullData = this.readData();
		this.instance._fullData.cells.cells.forEach((cell: AzgaarCell) => {
			this._instance._cellsMap.set(cell.i, cell);
		})
	}

	private static readData(): AzgaarFullData {
		try {
			let pathFile: string = `${this._instance._dirPath}/fullData.json`;
			return JSON.parse(fs.readFileSync(pathFile).toString());
		} catch (e) {
			console.log(e)
			throw e;
		}
	}

	static getDirectories(source: string): string[] {
		 this._directories = fs.readdirSync(source, { withFileTypes: true })
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name);
		return this._directories;
	}
	// height drawing
	getSites(): {id: number, x: number, y:number}[] {
		let out: {id: number, x: number, y:number}[] = [];
		this._fullData!.cells.cells.forEach((cell: any) => {
			const x = cell.p[0] / 1920 * 360 - 180;
			const y = cell.p[1] / 880 * 180 - 90;
			out.push({ id: cell.i, x, y })
		})
		return out;
	}

	private heighNeighbourMedia(cell: AzgaarCell): number {
		// const cell = this._fullData!.cells.cells.find((cell: any) => cell.i == id);
		let out: number = 0;

		cell.c.forEach((nid: number) => {
			const ncell = this._cellsMap.get(nid) as AzgaarCell;
			out += ncell.h;
		})

		return out / cell.c.length;
	}

	hs() {
		let out: { id: number, x: number, y: number, h: number }[] = [];
		console.log(this._fullData!.cells.cells.length)
		this._fullData!.cells.cells.forEach((cell: AzgaarCell) => {

			const hmedia = this.heighNeighbourMedia(cell);
			if (Math.abs(cell.h - hmedia) / hmedia > 0.5) {
				cell.h = hmedia;
			}

			let h = cell.h;
			h = (h - 19) / 80;
			const x = cell.p[0] / 1920 * 360 - 180;
			const y = cell.p[1] / 880 * 180 - 90;
			out.push({ id: cell.i, x, y, h })
		})
		return out;
	}

}