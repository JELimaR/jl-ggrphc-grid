import JDiagram from "../Voronoi/JDiagram";
import DataInformationFilesManager from '../DataInformationLoadAndSave';
// import { IJCellInformation } from "../Voronoi/JCellInformation";
import { IJCellHeightInfo } from '../CellInformation/JCellHeight';
import JCell from "../Voronoi/JCell";
import JWMap from "../JWMap";
import JRegionMap from "../RegionMap/JRegionMap";
// const dataInfoManager = DataInformationFilesManager.instance;

import JPoint from "../Geom/JPoint";
import JPrecipGrid, { IPrecipData } from "./JPrecipGrid";

import JCellClimate, { IJCellClimateInfo } from '../CellInformation/JCellClimate'

import JGrid, { JGridPoint } from '../Geom/JGrid';
import { IJVertexClimateInfo } from "../VertexInformation/JVertexClimate";
import JVertex from "../Voronoi/JVertex";
import JTempGrid from "./JTempGrid";
import JPressureGrid from "./JPressureGrid";
import { getArrayOfN } from "../utilFunctions";


export default class JClimateMap extends JWMap {
	constructor(d: JDiagram, grid: JGrid/*precipGrid: JPrecipGrid, tempGrid: JTempGrid*/) {
		const dataInfoManager = DataInformationFilesManager.instance;
		super(d);

		let climateData: IJCellClimateInfo[] = dataInfoManager.loadCellsClimate(this.diagram.secAreaProm);
		const isLoaded: boolean = climateData.length !== 0;
		if (!isLoaded) {
			climateData = this.generateClimateData(grid/*, precipGrid, tempGrid*/);
		}

		this.diagram.forEachCell((cell: JCell) => {
			if (!climateData[cell.id]) throw new Error(`no hay datos para ${cell.id}`)
			const cinfo = climateData[cell.id];
			cell.info.setClimatetInfo(cinfo);
		})

		if (!isLoaded) {
			console.log('smooth climate data')
			this.smoothData();
			dataInfoManager.saveCellsClimate(this.diagram.cells, this.diagram.secAreaProm)
		}

		this.setVertexInfo();

		let annualMax: number = 0;
		this.forEachCell((cell: JCell) => {
			const ccl = cell.info.cellClimate;
			if (ccl.koppenSubType() !== 'O' && ccl.koppenType() !== 'O') {
				if (annualMax < ccl.annualPrecip) annualMax = ccl.annualPrecip;
			}
		})
		JCellClimate.maxAnnual = annualMax;

	}

	generateClimateData(grid: JGrid/*, precipGrid: JPrecipGrid, tempGrid: JTempGrid*/): IJCellClimateInfo[] {

		const tempGrid = new JTempGrid(grid);
		const pressGrid = new JPressureGrid(grid, tempGrid);
		const precipGrid: JPrecipGrid = new JPrecipGrid(pressGrid, tempGrid)

		let climateData: IJCellClimateInfo[] = [];

		this.diagram.forEachCell((c: JCell) => {
			//if (!c.isMarked()) {
			const gp = tempGrid._grid.getGridPoint(c.center);
			const cidx = gp.colValue, ridx = gp.rowValue;
			const precData: IPrecipData = precipGrid._precipData[cidx][ridx];
			const temps = [...tempGrid._tempData[cidx][ridx].tempMonth];
			const chf = c.info.isLand ? 6.5 * c.info.cellHeight.heightInMeters / 1000 : 0;
			const ghf = gp._cell.info.isLand ? 6.5 * gp._cell.info.cellHeight.heightInMeters / 1000 : 0;
			climateData[c.id] = {
				id: c.id,
				precipMonth: [...precData.precip],
				tempMonth: temps.map((t: number, i: number) => t + precData.deltaTemps[i] + ghf - chf)
			}
			//}
		})

		this.diagram.dismarkAllCells();

		return climateData;

	}

	private smoothData() {
		console.log('seting vertex climate')
		console.time('set vertex climate data')
		this.diagram.forEachCell((c: JCell) => {
			let cinfo: JCellClimate = c.info.cellClimate;
			let precipMonthProm: number[] = getArrayOfN(12,0);
			let tempMonthProm: number[] = getArrayOfN(12,0);
			let cant: number = 0;
			this.diagram.getCellNeighbours(c).forEach((nc: JCell) => {
				const ninfo: JCellClimate = nc.info.cellClimate;
				cant++;
				precipMonthProm.forEach((p: number, i: number) => precipMonthProm[i] = p + ninfo.precipMonth[i]);
				tempMonthProm.forEach((t: number, i: number) => tempMonthProm[i] = t + ninfo.tempMonth[i]);
			})
			cinfo.precipMonth.forEach((p: number, i: number) => cinfo.precipMonth[i] = 0.1 * p + 0.9 * precipMonthProm[i]/cant);
			cinfo.tempMonth.forEach((t: number, i: number) => cinfo.tempMonth[i] = 0.8 * t + 0.2 * tempMonthProm[i]/cant);
		})
		console.timeEnd('set vertex climate data')
	}

	private setVertexInfo() {
		this.forEachVertex((vertex: JVertex) => {
			let info: IJVertexClimateInfo = {
				id: vertex.id,
				tempMonth: getArrayOfN(12,0),
				precipMonth: getArrayOfN(12,0),
			}

			const cells: JCell[] = this.diagram.getCellsAssociated(vertex);
			cells.forEach((c: JCell) => {
				const ch = c.info.cellClimate;
				info.tempMonth = ch.tempMonth.map((t: number, i: number) => info.tempMonth[i] + t);
				info.precipMonth = ch.precipMonth.map((p: number, i: number) => info.precipMonth[i] + p);
			})
			info.tempMonth = info.tempMonth.map((t: number) => t / cells.length);
			info.precipMonth = info.precipMonth.map((p: number) => p / cells.length);

			vertex.info.setClimateInfo(info)

		})
	}

}