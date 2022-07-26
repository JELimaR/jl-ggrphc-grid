import fs from 'fs';


import { IPoint } from './Geom/JPoint';
import { IJGridPointInfo, JGridPoint } from './Geom/JGrid';

import MapElement from './IMapElement';

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

	/**********************************************************************************
	 **********************************************************************************
	 *					ELIMINAR VARIABLE DE ENTRADA: tam DE TODAS LAS FUNCIONES							*
	 **********************************************************************************
	 **********************************************************************************/

	// voronoi diagram
	/*
	loadDiagram(tam: number): IJDiagramInfo | undefined {
		let out = {
			vertices: this.loadVertices(tam),
			cells: this.loadCells(tam),
			edges: this.loadEdges(tam),
		}
		if (out.cells.length == 0 || out.edges.length == 0 || out.vertices.length == 0) {
			return undefined
		}
		return out;
	}
	private loadVertices(tam: number): {x: number, y:number}[]  {
		let out: {x: number, y: number}[] = [];
		try {
			let pathName: string = `${this._dirPath}/VoronoiDiagram/vertices.json`;
			out = JSON.parse(fs.readFileSync(pathName).toString());
		} catch (e) {
			
		}
		return out;	
	}
	private loadCells(tam: number): IJCellInfo[]  {
		let out: IJCellInfo[] = [];
		try {
			let pathName: string = `${this._dirPath}/VoronoiDiagram/cells.json`;
			out = JSON.parse(fs.readFileSync(pathName).toString());
		} catch (e) {
			
		}
		return out;	
	}
	private loadEdges(tam: number): IJEdgeInfo[]  {
		let out: IJEdgeInfo[] = [];
		try {
			let pathName: string = `${this._dirPath}/VoronoiDiagram/edges.json`;
			out = JSON.parse(fs.readFileSync(pathName).toString());
		} catch (e) {
			
		}
		return out;	
	}
	saveDiagram(diagram: IJDiagramInfo, tam: number): void {
		let dirpathName: string = `${this._dirPath}/VoronoiDiagram`;
		fs.mkdirSync(dirpathName, {recursive: true});
		this.saveVertices(diagram.vertices, dirpathName);
		this.saveCells(diagram.cells, dirpathName);
		this.saveEdges(diagram.edges, dirpathName);
	}
	private saveVertices(verts: {x: number, y:number}[], dirpathName: string): void {
		let pathName: string = `${dirpathName}/vertices.json`;
		fs.writeFileSync(pathName, JSON.stringify(verts));
	}
	private saveCells(cells: IJCellInfo[], dirpathName: string): void {
		let pathName: string = `${dirpathName}/cells.json`;
		fs.writeFileSync(pathName, JSON.stringify(cells));
	}
	private saveEdges(edges: IJEdgeInfo[], dirpathName: string): void {
		let pathName: string = `${dirpathName}/edges.json`;
		fs.writeFileSync(pathName, JSON.stringify(edges));
	}
	*/
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
	loadGridPoints(gran: number, area: number | undefined): IJGridPointInfo[][] {
		let out: IJGridPointInfo[][] = [];
		try {
			let pathFile: string = `${this._dirPath}/${area ? area : ''}G${gran}_grid.json`;
			out = JSON.parse(fs.readFileSync(pathFile).toString());
		} catch (e) {

		}
		return out;
	}

	saveGridPoints(gridPoints: JGridPoint[][], gran: number, area: number | undefined) {
		const data: IJGridPointInfo[][] = gridPoints.map((col: JGridPoint[]) => {
			return col.map((gp: JGridPoint) => gp.getInterface());
		})
		fs.mkdirSync(`${this._dirPath}`, { recursive: true });
		let pathName: string = `${this._dirPath}/${area ? area : ''}G${gran}_grid.json`;
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
	loadGridData<I>(gran: number, TYPE: TypeGridInformation): I[][] {
		let out: I[][] = [];
		const subFolder: string = 'GridInfo';
		const file: string = TYPE;
		try {
			let pathName: string = `${this._dirPath}/${subFolder}/G${gran}${file}.json`;
			out = JSON.parse(fs.readFileSync(pathName).toString());
		} catch (e) {

		}
		return out;
	}

	saveGridData<I>(data: I[][], gran: number, TYPE: TypeGridInformation): void {
		const subFolder: string = 'GridInfo';
		const file: string = TYPE;
		fs.mkdirSync(`${this._dirPath}/${subFolder}`, { recursive: true });
		let pathName: string = `${this._dirPath}/${subFolder}/G${gran}${file}.json`;
		fs.writeFileSync(pathName, JSON.stringify(data));
	}
}

export type TypeGridInformation = 'temperature' | 'precip' | 'pressure';

export interface ISaveInformation {
	subFolder: string[];
	file: string;
}
export type TypeInformationKey = 
	| 'islands' | 'rivers' | 'fluxRoutes'
	| 'cellHeight' | 'cellClimate'
	| 'vertexHeight' | 'vertexFlux';

export type TypeInformation = { [key in TypeInformationKey]: ISaveInformation } // sirve para crear una constante con todo

export const DATA_INFORMATION: TypeInformation = {
	cellHeight: {
		file: 'height',
		subFolder: ['CellsInfo'],
	},
	cellClimate: {
		file: 'climate',
		subFolder: ['CellsInfo'],
	},
	vertexHeight: {
		file: 'height',
		subFolder: ['VerticesInfo'],
	},
	vertexFlux: {
		file: 'flux',
		subFolder: ['VerticesInfo'],
	},
	islands: {
		file: 'islandsInfo',
		subFolder: []
	},
	rivers: {
		file: 'riversInfo',
		subFolder: ['RiverAndFlux']
	},
	fluxRoutes: {
		file: 'fluxRoutesInfo',
		subFolder: ['RiverAndFlux']
	},
}

