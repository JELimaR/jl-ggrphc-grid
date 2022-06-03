import { Site } from 'voronoijs';
import fs from 'fs';

import JCell from './Voronoi/JCell';
import { IJContinentInfo, IJCountryInfo, IJIslandInfo, IJStateInfo, JContinentMap, JCountryMap, JIslandMap, JStateMap } from './RegionMap/JRegionMap';
// import { IJDiagramInfo } from './Voronoi/JDiagram';
// import { IJEdgeInfo } from './Voronoi/JEdge';
import { IJGridPointInfo, JGridPoint } from './Geom/JGrid';
// import { IJCellInformation } from './Voronoi/JCellInformation';
// import { IJCellInformation } from './CellInformation/JCellInformation';
import { IJCellHeightInfo } from './CellInformation/JCellHeight';
import JCellTemp, { IJCellTempInfo } from './CellInformation/JCellTemp';
import { IPressureDataGrid } from './heightmap/JPressureGrid';

export default class DataInformationFilesManager {
	static _instance: DataInformationFilesManager;

	private _dirPath: string = '';

	private constructor() {}

	static get instance(): DataInformationFilesManager {
		if (!this._instance) {
			this._instance = new DataInformationFilesManager();
		}
		return this._instance;
	}

	static configPath(path: string): void {
		this.instance._dirPath = path;
		fs.mkdirSync(this.instance._dirPath, {recursive: true});
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
	// voronoi diagram sites
	/*
	loadSites(tam: number): Site[] {
		if (this._dirPath === '') throw new Error('non configurated path');
		let out: Site[] = [];
		try {
			let pathFile: string = `${this._dirPath}/GeneratedSites.json`;
			out = JSON.parse(fs.readFileSync(pathFile).toString());
		} catch (e) {
			
		}
		return out;
	}

	saveSites(sites: Site[], tam: number): void {
		fs.mkdirSync(`${this._dirPath}`, {recursive: true});
		let pathName: string = `${this._dirPath}/GeneratedSites.json`;
		fs.writeFileSync(pathName, JSON.stringify(sites));
	}
*/
	// grid
	loadGridPoints(gran: number, tam: number): IJGridPointInfo[][] {
		let out: IJGridPointInfo[][] = [];
		try {
			let pathFile: string = `${this._dirPath}/G${gran}_grid.json`;
			out = JSON.parse(fs.readFileSync(pathFile).toString());
		} catch (e) {
			
		}
		return out;		
	}

	saveGridPoints(gridPoints: JGridPoint[][], gran: number, tam: number) {
		const data: IJGridPointInfo[][] = gridPoints.map((col: JGridPoint[]) => {
			return col.map((gp: JGridPoint) => gp.getInterface());
		})
		fs.mkdirSync(`${this._dirPath}`, {recursive: true});
		let pathName: string = `${this._dirPath}/G${gran}_grid.json`;
		fs.writeFileSync(pathName, JSON.stringify(data));		
	}

	/**
	 * cells information
	 */
	
	// heigth info cell
	// loadCellsHeigth(tam: number): IJCellInformation[] {
	loadCellsHeigth(tam: number): IJCellHeightInfo[] {
		let out: IJCellHeightInfo[] = [];
		try {
			let pathName: string = `${this._dirPath}/CellsInfo/heigth.json`;
			out = JSON.parse(fs.readFileSync(pathName).toString());
		} catch (e) {
			
		}
		return out;
	}

	saveCellsHeigth(mapCells: Map<number, JCell>, tam: number): void {
		fs.mkdirSync(`${this._dirPath}/CellsInfo`, {recursive: true});
		let pathName: string = `${this._dirPath}/CellsInfo/heigth.json`;
		let data: IJCellHeightInfo[] = [];
		mapCells.forEach( (cell: JCell) => {
			data[cell.id] = cell.info.getHeightInfo()!;
		})
		fs.writeFileSync(pathName, JSON.stringify(data));
	}

	// climate info cell
	loadCellsTemperature(tam: number): IJCellTempInfo[] {
		let out: IJCellTempInfo[] = [];
		try {
			let pathName: string = `${this._dirPath}/CellsInfo/temperature.json`;
			out = JSON.parse(fs.readFileSync(pathName).toString());
		} catch (e) {
			
		}
		return out;
	}

	saveCellsTemperature(mapCells: Map<number, JCell>, tam: number): void {
		fs.mkdirSync(`${this._dirPath}/CellsInfo`, {recursive: true});
		let pathName: string = `${this._dirPath}/CellsInfo/temperature.json`;
		let data: IJCellTempInfo[] = [];
		mapCells.forEach( (cell: JCell) => {
			data[cell.id] = cell.info.getTempInfo()!;
		})
		fs.writeFileSync(pathName, JSON.stringify(data));
	}

	// 
	loadGridPressure(gran: number): IPressureDataGrid[][] {
		let out: IPressureDataGrid[][] = [];
		try {
			let pathName: string = `${this._dirPath}/GridInfo/G${gran}pressure.json`;
			out = JSON.parse(fs.readFileSync(pathName).toString());
		} catch (e) {
			
		}
		return out;
	}

	saveGridPressure(data: IPressureDataGrid[][], gran: number): void {
		fs.mkdirSync(`${this._dirPath}/GridInfo`, {recursive: true});
		let pathName: string = `${this._dirPath}/GridInfo/G${gran}pressure.json`;
		fs.writeFileSync(pathName, JSON.stringify(data));
	}

	// islands o masas
	loadIslandsInfo(tam: number): IJIslandInfo[] {
		let out: IJIslandInfo[] = [];
		try {
			let pathName: string = `${this._dirPath}/IslandsInfo.json`;
			out = JSON.parse(fs.readFileSync(pathName).toString());
		} catch (e) {
			
		}
		return out;
	}

	saveIslandsInfo(islands: JIslandMap[], tam: number): void {
		fs.mkdirSync(`${this._dirPath}`, {recursive: true});
		let pathName: string = `${this._dirPath}/IslandsInfo.json`;
		let data: IJIslandInfo[] = [];
		islands.forEach( (i: JIslandMap) => {
			data.push(i.getInterface());
		})
		fs.writeFileSync(pathName, JSON.stringify(data));
	}
	// continents
	loadContinentsInfo(tam: number): IJContinentInfo[] {
		let out: IJContinentInfo[] = [];
		try {
			let pathName: string = `${this._dirPath}/ContinentsInfo.json`;
			out = JSON.parse(fs.readFileSync(pathName).toString());
		} catch (e) {
			
		}
		return out;
	}

	saveContinentsInfo(continents: JContinentMap[], tam: number): void {
		fs.mkdirSync(`${this._dirPath}`, {recursive: true});
		let pathName: string = `${this._dirPath}/ContinentsInfo.json`;
		let data: IJContinentInfo[] = [];
		continents.forEach( (i: JContinentMap) => {
			data.push(i.getInterface());
		})
		fs.writeFileSync(pathName, JSON.stringify(data));
	}

	// states
	loadStatesInfo(tam: number, contid: number): IJStateInfo[]  {
		let out: IJStateInfo[] = [];
		try {
			let pathName: string = `${this._dirPath}/divisions/cont${contid}/StatesInfo.json`;
			out = JSON.parse(fs.readFileSync(pathName).toString());
		} catch (e) {
			
		}
		return out;
	}

	saveStatesInfo(states: JStateMap[] | Map<string, JStateMap>, tam: number, contid: number) {
		fs.mkdirSync(`${this._dirPath}/divisions/cont${contid}`, {recursive: true});
		let pathName: string = `${this._dirPath}/divisions/cont${contid}/StatesInfo.json`;
		let data: IJStateInfo[] = [];
		states.forEach((s: JStateMap) => {
			data.push(s.getInterface());
		})
		fs.writeFileSync(pathName, JSON.stringify(data));
	}

	// country
	loadCountriesInfo(tam: number, contid: number): IJCountryInfo[]  {
		let out: IJCountryInfo[] = [];
		try {
			let pathName: string = `${this._dirPath}/divisions/cont${contid}/CountriesInfo.json`;
			out = JSON.parse(fs.readFileSync(pathName).toString());
		} catch (e) {
			
		}
		return out;
	}

	saveCountriesInfo(countries: JCountryMap[], tam: number, contid: number) {
		fs.mkdirSync(`${this._dirPath}/divisions/cont${contid}`, {recursive: true});
		let pathName: string = `${this._dirPath}/divisions/cont${contid}/CountriesInfo.json`;
		let data: IJCountryInfo[] = [];
		countries.forEach((c: JCountryMap) => {
			data.push(c.getInterface());
		})
		fs.writeFileSync(pathName, JSON.stringify(data));
	}
}

export type TypeDivisionRegion = 
	| 'country'
	| 'state'