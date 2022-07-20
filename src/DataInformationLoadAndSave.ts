import { Site } from 'voronoijs';
import fs from 'fs';

import JCell from './Voronoi/JCell';
import JVertex from './Voronoi/JVertex';
import { IJContinentInfo, IJCountryInfo, IJStateInfo, JContinentMap, JCountryMap, JStateMap } from './MapElements/RegionMap';
import JPoint, { IPoint } from './Geom/JPoint';
// import { IJDiagramInfo } from './Voronoi/JDiagram';
// import { IJEdgeInfo } from './Voronoi/JEdge';
import { IJGridPointInfo, JGridPoint } from './Geom/JGrid';
// import { IJCellInformation } from './Voronoi/JCellInformation';
// import { IJCellInformation } from './CellInformation/JCellInformation';
import { IJCellHeightInfo } from './CellInformation/JCellHeight';
// import JCellTemp, { IJCellTempInfo } from './CellInformation/JCellTemp';

import { IJCellClimateInfo } from './CellInformation/JCellClimate';
import { IJVertexHeightInfo } from './VertexInformation/JVertexHeight';
import { ITempDataGrid } from './Climate/TempGrid';
import { IPressureDataGrid } from './Climate/PressureGrid';
import { IPrecipData } from './Climate/PrecipGrid';
import { IJVertexFluxInfo } from './VertexInformation/JVertexFlux';
import FluxRouteMap, { IFluxRouteMapInfo } from './River/FluxRouteMap';
import RiverMap, { IRiverMapInfo } from './River/RiverMap';
import IslandMap, { IIslandMapInfo } from './heightmap/IslandMap';

// dividir esta clase
export default class DataInformationFilesManager {
	static _instance: DataInformationFilesManager;

	private _dirPath: string = '';

	private constructor() { }

	static get instance(): DataInformationFilesManager {
		if (!DataInformationFilesManager._instance) {
			this._instance = new DataInformationFilesManager();
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
	// voronoi diagram subsites	
	loadSites(area: number | undefined): { p: IPoint, cid: number }[] {
		if (this._dirPath === '') throw new Error('non configurated path');
		let out: { p: IPoint, cid: number }[] = [];
		try {
			let pathFile: string = `${this._dirPath}/${area ? area : ''}secSites.json`;
			out = JSON.parse(fs.readFileSync(pathFile).toString());
		} catch (e) {

		}
		return out;
	}
	saveSites(sites: { p: IPoint, cid: number }[], area: number | undefined): void {
		fs.mkdirSync(`${this._dirPath}`, { recursive: true });
		let pathName: string = `${this._dirPath}/${area ? area : ''}secSites.json`;
		fs.writeFileSync(pathName, JSON.stringify(sites));
	}

	// grid
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
	 * cells information
	 */
	// height info cell
	loadCellsHeigth(area: number | undefined): IJCellHeightInfo[] {
		let out: IJCellHeightInfo[] = [];
		try {
			let pathName: string = `${this._dirPath}/CellsInfo/${area ? area : ''}height.json`;
			out = JSON.parse(fs.readFileSync(pathName).toString());
		} catch (e) {

		}
		return out;
	}

	saveCellsHeigth(mapCells: Map<number, JCell>, area: number | undefined): void {
		fs.mkdirSync(`${this._dirPath}/CellsInfo`, { recursive: true });
		let pathName: string = `${this._dirPath}/CellsInfo/${area ? area : ''}height.json`;
		let data: IJCellHeightInfo[] = [];
		mapCells.forEach((cell: JCell) => {
			data[cell.id] = cell.info.getHeightInfo()!;
		})
		fs.writeFileSync(pathName, JSON.stringify(data));
	}

	// climate info cell
	loadCellsClimate(area: number | undefined): IJCellClimateInfo[] {
		let out: IJCellClimateInfo[] = [];
		try {
			let pathName: string = `${this._dirPath}/CellsInfo/${area ? area : ''}climate.json`;
			out = JSON.parse(fs.readFileSync(pathName).toString());
		} catch (e) {

		}
		return out;
	}

	saveCellsClimate(mapCells: Map<number, JCell>, area: number | undefined): void {
		fs.mkdirSync(`${this._dirPath}/CellsInfo`, { recursive: true });
		let pathName: string = `${this._dirPath}/CellsInfo/${area ? area : ''}climate.json`;
		let data: IJCellClimateInfo[] = [];
		mapCells.forEach((cell: JCell) => {
			data[cell.id] = cell.info.getClimateInfo()!;
		})
		fs.writeFileSync(pathName, JSON.stringify(data));
	}

	/**
	 * vertex information
	 */
	// height info vertex
	loadVerticesHeigth(area: number | undefined): IJVertexHeightInfo[] {
		let out: IJVertexHeightInfo[] = [];
		try {
			let pathName: string = `${this._dirPath}/VerticesInfo/${area ? area : ''}height.json`;
			out = JSON.parse(fs.readFileSync(pathName).toString());
		} catch (e) {

		}
		return out;
	}

	saveVerticesHeigth(mapVertex: Map<string, JVertex>, area: number | undefined): void {
		fs.mkdirSync(`${this._dirPath}/VerticesInfo`, { recursive: true });
		let pathName: string = `${this._dirPath}/VerticesInfo/${area ? area : ''}height.json`;
		let data: IJVertexHeightInfo[] = [];
		mapVertex.forEach((vertex: JVertex) => {
			data.push(vertex.info.getHeightInfo()!);
		})
		fs.writeFileSync(pathName, JSON.stringify(data));
	}

	// flux info vertex
	loadVerticesFlux(area: number | undefined): IJVertexFluxInfo[] {
		let out: IJVertexFluxInfo[] = [];
		try {
			let pathName: string = `${this._dirPath}/VerticesInfo/${area ? area : ''}flux.json`;
			out = JSON.parse(fs.readFileSync(pathName).toString());
		} catch (e) {

		}
		return out;
	}

	saveVerticesFlux(mapVertex: Map<string, JVertex>, area: number | undefined): void {
		fs.mkdirSync(`${this._dirPath}/VerticesInfo`, { recursive: true });
		let pathName: string = `${this._dirPath}/VerticesInfo/${area ? area : ''}flux.json`;
		let data: IJVertexFluxInfo[] = [];
		mapVertex.forEach((vertex: JVertex) => {
			data.push(vertex.info.getFluxInfo()!);
		})
		fs.writeFileSync(pathName, JSON.stringify(data));
	}

	/**
	 * grid information
	 */
	//
	/*
	loadGridTemperature(gran: number): ITempDataGrid[][] {
		let out: ITempDataGrid[][] = [];
		try {
			let pathName: string = `${this._dirPath}/GridInfo/G${gran}temperature.json`;
			out = JSON.parse(fs.readFileSync(pathName).toString());
		} catch (e) {

		}
		return out;
	}

	saveGridTemperature(data: ITempDataGrid[][], gran: number): void {
		fs.mkdirSync(`${this._dirPath}/GridInfo`, { recursive: true });
		let pathName: string = `${this._dirPath}/GridInfo/G${gran}temperature.json`;
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
		fs.mkdirSync(`${this._dirPath}/GridInfo`, { recursive: true });
		let pathName: string = `${this._dirPath}/GridInfo/G${gran}pressure.json`;
		fs.writeFileSync(pathName, JSON.stringify(data));
	}

	//
	loadGridPrecip(gran: number): IPrecipData[][] {
		let out: IPrecipData[][] = [];
		try {
			let pathName: string = `${this._dirPath}/GridInfo/G${gran}precip.json`;
			out = JSON.parse(fs.readFileSync(pathName).toString());
		} catch (e) {

		}
		return out;
	}

	saveGridPrecip(precipData: IPrecipData[][], gran: number): void {
		fs.mkdirSync(`${this._dirPath}/GridInfo`, { recursive: true });
		let pathName: string = `${this._dirPath}/GridInfo/G${gran}precip.json`;
		fs.writeFileSync(pathName, JSON.stringify(precipData));
	}
	*/
	// islands o masas
	loadIslandsInfo(area: number | undefined): IIslandMapInfo[] {
		let out: IIslandMapInfo[] = [];
		try {
			let pathName: string = `${this._dirPath}/${area ? area : ''}IslandsInfo.json`;
			out = JSON.parse(fs.readFileSync(pathName).toString());
		} catch (e) {

		}
		return out;
	}

	saveIslandsInfo(islands: IslandMap[], area: number | undefined): void {
		fs.mkdirSync(`${this._dirPath}`, { recursive: true });
		let pathName: string = `${this._dirPath}/${area ? area : ''}IslandsInfo.json`;
		let data: IIslandMapInfo[] = [];
		islands.forEach((i: IslandMap) => {
			data.push(i.getInterface());
		})
		fs.writeFileSync(pathName, JSON.stringify(data));
	}

	// water routes
	loadWaterRoutesInfo(area: number | undefined): IFluxRouteMapInfo[] {
		let out: IFluxRouteMapInfo[] = [];
		try {
			let pathName: string = `${this._dirPath}/RiverAndFlux/${area ? area : ''}FluxRoutesInfo.json`;
			out = JSON.parse(fs.readFileSync(pathName).toString());
		} catch (e) {

		}
		return out;
	}

	saveWaterRoutesInfo(fluxRoutes: Map<number,FluxRouteMap>, area: number | undefined): void {
		fs.mkdirSync(`${this._dirPath}/RiverAndFlux`, { recursive: true });
		let pathName: string = `${this._dirPath}/RiverAndFlux/${area ? area : ''}FluxRoutesInfo.json`;
		let data: IFluxRouteMapInfo[] = [];
		fluxRoutes.forEach((fr: FluxRouteMap) => {
			data.push(fr.getInterface());
		})
		fs.writeFileSync(pathName, JSON.stringify(data));
	}

	// rivers
	loadRiversInfo(area: number | undefined): IRiverMapInfo[] {
		let out: IRiverMapInfo[] = [];
		try {
			let pathName: string = `${this._dirPath}/RiverAndFlux/${area ? area : ''}RiversInfo.json`;
			out = JSON.parse(fs.readFileSync(pathName).toString());
		} catch (e) {

		}
		return out;
	}

	saveRiversInfo(rivers: Map<number,RiverMap>, area: number | undefined): void {
		fs.mkdirSync(`${this._dirPath}/RiverAndFlux`, { recursive: true });
		let pathName: string = `${this._dirPath}/RiverAndFlux/${area ? area : ''}RiversInfo.json`;
		let data: IRiverMapInfo[] = [];
		rivers.forEach((river: RiverMap) => {
			data.push(river.getInterface());
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
		fs.mkdirSync(`${this._dirPath}`, { recursive: true });
		let pathName: string = `${this._dirPath}/ContinentsInfo.json`;
		let data: IJContinentInfo[] = [];
		continents.forEach((i: JContinentMap) => {
			data.push(i.getInterface());
		})
		fs.writeFileSync(pathName, JSON.stringify(data));
	}

	// states
	loadStatesInfo(tam: number, contid: number): IJStateInfo[] {
		let out: IJStateInfo[] = [];
		try {
			let pathName: string = `${this._dirPath}/divisions/cont${contid}/StatesInfo.json`;
			out = JSON.parse(fs.readFileSync(pathName).toString());
		} catch (e) {

		}
		return out;
	}

	saveStatesInfo(states: JStateMap[] | Map<string, JStateMap>, tam: number, contid: number) {
		fs.mkdirSync(`${this._dirPath}/divisions/cont${contid}`, { recursive: true });
		let pathName: string = `${this._dirPath}/divisions/cont${contid}/StatesInfo.json`;
		let data: IJStateInfo[] = [];
		states.forEach((s: JStateMap) => {
			data.push(s.getInterface());
		})
		fs.writeFileSync(pathName, JSON.stringify(data));
	}

	// country
	loadCountriesInfo(tam: number, contid: number): IJCountryInfo[] {
		let out: IJCountryInfo[] = [];
		try {
			let pathName: string = `${this._dirPath}/divisions/cont${contid}/CountriesInfo.json`;
			out = JSON.parse(fs.readFileSync(pathName).toString());
		} catch (e) {

		}
		return out;
	}

	saveCountriesInfo(countries: JCountryMap[], tam: number, contid: number) {
		fs.mkdirSync(`${this._dirPath}/divisions/cont${contid}`, { recursive: true });
		let pathName: string = `${this._dirPath}/divisions/cont${contid}/CountriesInfo.json`;
		let data: IJCountryInfo[] = [];
		countries.forEach((c: JCountryMap) => {
			data.push(c.getInterface());
		})
		fs.writeFileSync(pathName, JSON.stringify(data));
	}

	/* NUEVO */
	/*
	load<I, T extends {getInterface: ()=>I}>(area: number | undefined, t: any): I[] {
		let out: I[] = [];
		const subFolder: string = '';
		const file: string = '';
		try {
			let pathName: string = `${this._dirPath}/${subFolder}/${area ? area : ''}${file}.json`;
			out = JSON.parse(fs.readFileSync(pathName).toString());
		} catch (e) {

		}
		return out;
	}

	save<I, T extends {getInterface: ()=> I}>(dataT: T[], area: number | undefined) {

		const subFolder: string = '';
		const file: string = '';
		
		fs.mkdirSync(`${this._dirPath}/${subFolder}`, { recursive: true });
		let pathName: string = `${this._dirPath}/${subFolder}/${area ? area : ''}${file}.json`;
		let data: I[] = [];
		dataT.forEach((c: T) => {
			data.push(c.getInterface());
		})
		fs.writeFileSync(pathName, JSON.stringify(data));
	}
	*/
	loadGridData<I>(gran: number, TYPE: TypeGridInformation): I[][] {
		let out: I[][] = [];
		const subFolder: string = 'GridInfo';
		const file: string = GRID_DATA[TYPE].file;
		try {
			let pathName: string = `${this._dirPath}/${subFolder}/G${gran}${file}.json`;
			out = JSON.parse(fs.readFileSync(pathName).toString());
		} catch (e) {

		}
		return out;
	}

	saveGridData<I>(data: I[][], gran: number, TYPE: TypeGridInformation): void {
		const subFolder: string = 'GridInfo';
		const file: string = GRID_DATA[TYPE].file;
		fs.mkdirSync(`${this._dirPath}/${subFolder}`, { recursive: true });
		let pathName: string = `${this._dirPath}/${subFolder}/G${gran}${file}.json`;
		fs.writeFileSync(pathName, JSON.stringify(data));
	}
	
}

export type TypeDivisionRegion =
	| 'country'
	| 'state'

interface ISaveInformation {
	subFolder: string;
	file: string;
}

/*** GRID INFO **/
// const GRID_INFORMATION = ['temp', 'precip', 'pressure'];
type TypeGridInformation = 'temp' | 'precip' | 'pressure';
type TypeGridData = { [key in TypeGridInformation]: ISaveInformation; };
const g = {}

const GRID_DATA: TypeGridData = {
	'temp': {
		file: 'temperature',
		subFolder: ''
	},
	'pressure': {
		file: 'pressure',
		subFolder: ''
	},
	'precip': {
		file: 'precip',
		subFolder: ''
	}
}