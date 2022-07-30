import InformationFilesManager from "../../DataFileLoadAndSave/InformationFilesManager";
import Grid from "../GACGrid/Grid";
import MapGenerator from "../MapGenerator";
import JCellClimate, { IJCellClimateInfo } from "../../../BuildingModel/Voronoi/CellInformation/JCellClimate";
import JCell from "../../../BuildingModel/Voronoi/JCell";
import JDiagram from "../../../BuildingModel/Voronoi/JDiagram";
import JVertex from "../../../BuildingModel/Voronoi/JVertex";
import { IJVertexClimateInfo } from "../../../BuildingModel/Voronoi/VertexInformation/JVertexClimate";
import PrecipGrid, { IPrecipData } from "./PrecipGrid";
import PressureGrid from "./PressureGrid";
import TempGrid from "./TempGrid";
import { getArrayOfN } from "../../../Geom/basicGeometryFunctions";


export default class ClimateMapGenerator extends MapGenerator<void> {
	private _grid: Grid;
	constructor(d: JDiagram, grid: Grid) {
		super(d);
		this._grid = grid;
	}

	generate(): void {
		// super.generate();
		const ifm = InformationFilesManager.instance;

		// let climateData: IJCellClimateInfo[] = dataInfoManager.loadCellsClimate(this.diagram.secAreaProm);
		let climateData: IJCellClimateInfo[] = ifm.loadMapElementData<IJCellClimateInfo, JCellClimate>(this.diagram.secAreaProm, JCellClimate.getTypeInformationKey());
		const isLoaded: boolean = climateData.length !== 0;
		if (!isLoaded) {
			climateData = this.generateClimateData(this._grid);
		}

		this.diagram.forEachCell((cell: JCell) => {
			if (!climateData[cell.id]) throw new Error(`no hay datos para ${cell.id}`)
			const cinfo = climateData[cell.id];
			cell.info.setClimatetInfo(cinfo);
		})

		if (!isLoaded) {
			console.log('smooth climate data')
			this.smoothData();
			// dataInfoManager.saveCellsClimate(this.diagram.cells, this.diagram.secAreaProm);
			const climateArr: JCellClimate[] = [...this.diagram.cells.values()].map((cell: JCell) => cell.info.cellClimate)
			ifm.saveMapElementData<IJCellClimateInfo, JCellClimate>(climateArr, this.diagram.secAreaProm, JCellClimate.getTypeInformationKey());
		}

		this.setVertexInfo();

		let annualMax: number = 0;
		this.diagram.forEachCell((cell: JCell) => {
			const ccl = cell.info.cellClimate;
			if (ccl.koppenSubType() !== 'O' && ccl.koppenType() !== 'O') {
				if (annualMax < ccl.annualPrecip) annualMax = ccl.annualPrecip;
			}
		})
		JCellClimate.maxAnnual = annualMax;

	}

	private generateClimateData(grid: Grid): IJCellClimateInfo[] {

		const tempGrid = new TempGrid(grid);
		const pressGrid = new PressureGrid(grid, tempGrid);
		const precipGrid: PrecipGrid = new PrecipGrid(grid, pressGrid, tempGrid)

		let climateData: IJCellClimateInfo[] = [];

		this.diagram.forEachCell((c: JCell) => {
			const gp = grid.getGridPoint(c.center);
			const precData: IPrecipData = precipGrid.getPointInfo(gp.point);
			const temps = [...tempGrid.getPointInfo(gp.point).tempMonth];
			const chf = c.info.isLand ? 6.5 * c.info.cellHeight.heightInMeters / 1000 : 0;
			const ghf = gp.cell.info.isLand ? 6.5 * gp.cell.info.cellHeight.heightInMeters / 1000 : 0;
			climateData[c.id] = {
				id: c.id,
				precipMonth: [...precData.precip],
				tempMonth: temps.map((t: number, i: number) => t + precData.deltaTemps[i] + ghf - chf)
			}
		})

		this.diagram.dismarkAllCells();

		return climateData;

	}

	private smoothData() {
		console.log('seting vertex climate')
		console.time('set vertex climate data')
		this.diagram.forEachCell((c: JCell) => {
			let cinfo: JCellClimate = c.info.cellClimate;
			let precipMonthProm: number[] = getArrayOfN(12, 0);
			let tempMonthProm: number[] = getArrayOfN(12, 0);
			let cant: number = 0;
			this.diagram.getCellNeighbours(c).forEach((nc: JCell) => {
				const ninfo: JCellClimate = nc.info.cellClimate;
				cant++;
				precipMonthProm.forEach((p: number, i: number) => precipMonthProm[i] = p + ninfo.precipMonth[i]);
				tempMonthProm.forEach((t: number, i: number) => tempMonthProm[i] = t + ninfo.tempMonth[i]);
			})
			cinfo.precipMonth.forEach((p: number, i: number) => cinfo.precipMonth[i] = 0.1 * p + 0.9 * precipMonthProm[i] / cant);
			cinfo.tempMonth.forEach((t: number, i: number) => cinfo.tempMonth[i] = 0.8 * t + 0.2 * tempMonthProm[i] / cant);
		})
		console.timeEnd('set vertex climate data')
	}

	private setVertexInfo() {
		this.diagram.forEachVertex((vertex: JVertex) => {
			let info: IJVertexClimateInfo = {
				id: vertex.id,
				tempMonth: getArrayOfN(12, 0),
				precipMonth: getArrayOfN(12, 0),
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
