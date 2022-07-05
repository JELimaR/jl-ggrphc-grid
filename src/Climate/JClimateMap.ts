import JDiagram from "../Voronoi/JDiagram";
import DataInformationFilesManager from '../DataInformationLoadAndSave';
// import { IJCellInformation } from "../Voronoi/JCellInformation";
import { IJCellHeightInfo } from '../CellInformation/JCellHeight';
import JCell from "../Voronoi/JCell";
import JWMap from "../JWMap";
import JRegionMap from "../RegionMap/JRegionMap";
const dataInfoManager = DataInformationFilesManager.instance;

import JPoint from "../Geom/JPoint";
import JPrecipGrid, { IPrecipData } from "../heightmap/JPrecipGrid";

import JCellClimate, { IJCellClimateInfo } from '../CellInformation/JCellClimate'
import JTempGrid from "../heightmap/JTempGrid";
import { JGridPoint } from '../Geom/JGrid';
import { IJVertexClimateInfo } from "../VertexInformation/JVertexClimate";
import JVertex from "../Voronoi/JVertex";

const emptyMonthArr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

export default class JClimateMap extends JWMap {
	constructor(d: JDiagram, precipGrid: JPrecipGrid, tempGrid: JTempGrid) {
		super(d);

		const climateData: IJCellClimateInfo[] = this.getClimateData(precipGrid, tempGrid);

		this.diagram.forEachCell((cell: JCell) => {
			if (!climateData[cell.id]) throw new Error(`no hay datos para ${cell.id}`)
			const cinfo = climateData[cell.id];
			cell.info.setClimatetInfo(cinfo);
			// cell.subCells.forEach((sc: JCell) => {
			// 	sc.info.setClimatetInfo(cinfo)
			// })
		})

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

	getClimateData(precipGrid: JPrecipGrid, tempGrid: JTempGrid) {
		const climateData: IJCellClimateInfo[] = []; // dataInfoManager
		if (climateData.length == 0) {
			
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
		}

		return climateData;

	}

	private setVertexInfo() {
		this.forEachVertex((vertex: JVertex) => {
			let info: IJVertexClimateInfo = {
				id: vertex.id,
				tempMonth: [0,0,0,0,0,0,0,0,0,0,0,0],
				precipMonth: [0,0,0,0,0,0,0,0,0,0,0,0],
			}
			
			const cells: JCell[] = this.diagram.getCellsAssociated(vertex);
			cells.forEach((c: JCell) => {
				const ch = c.info.cellClimate;
				info.tempMonth = ch.tempMonth.map((t: number, i: number) => info.tempMonth[i] + t);
				info.precipMonth = ch.precipMonth.map((p: number, i: number) => info.precipMonth[i] + p);
			})
			info.tempMonth = info.tempMonth.map((t: number) => t/cells.length);
			info.precipMonth = info.precipMonth.map((p: number) => p/cells.length);

			vertex.info.setClimateInfo(info)
			
		})
	}

}