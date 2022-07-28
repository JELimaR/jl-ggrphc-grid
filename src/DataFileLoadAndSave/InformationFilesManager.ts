import fs from 'fs';
import { IPoint } from '../Geom/Point';
import MapElement from '../MapElement';
import { GRAN } from '../Geom/constants';
import GridPoint, { IGridPointInfo } from '../Grid/GridPoint';
import { TypeInformationKey } from '../TypeInformationKey';
import { DATA_INFORMATION } from './dataInformationTypes';
import { LoaderDiagram } from '../Voronoi/JDiagram';

// dividir esta clase
export default class InformationFilesManager {
	static _instance: InformationFilesManager;

	private _dirPath: string = '';

	private constructor() { }

	static get instance(): InformationFilesManager {
		if (!InformationFilesManager._instance) {
			this._instance = new InformationFilesManager();
		}
		return this._instance;
	}

	static configPath(path: string): void {
		this.instance._dirPath = path;
		fs.mkdirSync(this.instance._dirPath, { recursive: true });
	}

	//
	loadDiagramValues(area: number | undefined): LoaderDiagram {
		if (this._dirPath === '') throw new Error('non configurated path');
		let out: LoaderDiagram = new LoaderDiagram([],[],[]);
		try {
			let pathFile: string = `${this._dirPath}/${area}diagram.json`;
			const data = JSON.parse(fs.readFileSync(pathFile).toString());
			out = new LoaderDiagram(data.cells, data.edges, data.vertices);
		} catch (e) {

		}		
		return out;
	}
	saveDiagramValues(info: LoaderDiagram, area: number | undefined): void {
		fs.mkdirSync(`${this._dirPath}`, { recursive: true });
		let pathName: string = `${this._dirPath}/${area}diagram.json`;
		fs.writeFileSync(pathName, JSON.stringify(info));
	}

	/**
	 * voronoi diagram subsites
	 */
	loadSubSites(area: number | undefined): { p: IPoint, cid: number }[] {
		if (this._dirPath === '') throw new Error('non configurated path');
		let out: { p: IPoint, cid: number }[] = [];
		try {
			let pathFile: string = `${this._dirPath}/${area ? area : ''}secSites.json`;
			out = JSON.parse(fs.readFileSync(pathFile).toString());
		} catch (e) {

		}
		return out;
	}
	saveSubSites(sites: { p: IPoint, cid: number }[], area: number | undefined): void {
		fs.mkdirSync(`${this._dirPath}`, { recursive: true });
		let pathName: string = `${this._dirPath}/${area ? area : ''}secSites.json`;
		fs.writeFileSync(pathName, JSON.stringify(sites));
	}

	/**
	 * grid ppints
	 */
	loadGridPoints(area: number | undefined): IGridPointInfo[][] {
		let out: IGridPointInfo[][] = [];
		try {
			let pathFile: string = `${this._dirPath}/${area ? area : ''}G${GRAN}_grid.json`;
			out = JSON.parse(fs.readFileSync(pathFile).toString());
		} catch (e) {

		}
		return out;
	}

	saveGridPoints(gridPoints: GridPoint[][], area: number | undefined) {
		const data: IGridPointInfo[][] = gridPoints.map((col: GridPoint[]) => {
			return col.map((gp: GridPoint) => gp.getInterface());
		})
		fs.mkdirSync(`${this._dirPath}`, { recursive: true });
		let pathName: string = `${this._dirPath}/${area ? area : ''}G${GRAN}_grid.json`;
		fs.writeFileSync(pathName, JSON.stringify(data));
	}

	/**
	 * MapElement data
	 */
	loadMapElementData<I, T extends MapElement<I>>(area: number | undefined, TYPE: TypeInformationKey): I[] {
		let out: I[] = [];
		const subFolder: string = DATA_INFORMATION[TYPE].subFolder.join('/');
		const file: string = DATA_INFORMATION[TYPE].file;
		try {
			let pathName: string = `${this._dirPath}/${subFolder}/${area ? area : ''}${file}.json`;
			out = JSON.parse(fs.readFileSync(pathName).toString());
		} catch (e) {

		}
		return out;
	}

	saveMapElementData<I, T extends MapElement<I>>(infoArr: T[], area: number | undefined, TYPE: TypeInformationKey): void {
		const subFolder: string = DATA_INFORMATION[TYPE].subFolder.join('/');
		const file: string = DATA_INFORMATION[TYPE].file;
		fs.mkdirSync(`${this._dirPath}/${subFolder}`, { recursive: true });
		let pathName: string = `${this._dirPath}/${subFolder}/${area ? area : ''}${file}.json`;

		let data: I[] = [];
		infoArr.forEach((infoT: T) => {
			data.push(infoT.getInterface());
		})
		fs.writeFileSync(pathName, JSON.stringify(data));
	}

	/**
	 * gird information
	 */
	loadGridData<I>(TYPE: TypeInformationKey): I[][] {
		let out: I[][] = [];
		const subFolder: string = DATA_INFORMATION[TYPE].subFolder.join('/');
		const file: string = DATA_INFORMATION[TYPE].file;
		try {
			let pathName: string = `${this._dirPath}/${subFolder}/G${GRAN}${file}.json`;
			out = JSON.parse(fs.readFileSync(pathName).toString());
		} catch (e) {

		}
		return out;
	}

	saveGridData<I>(data: I[][], TYPE: TypeInformationKey): void {
		const subFolder: string = DATA_INFORMATION[TYPE].subFolder.join('/');
		const file: string = DATA_INFORMATION[TYPE].file;
		fs.mkdirSync(`${this._dirPath}/${subFolder}`, { recursive: true });
		let pathName: string = `${this._dirPath}/${subFolder}/G${GRAN}${file}.json`;
		fs.writeFileSync(pathName, JSON.stringify(data));
	}
}


