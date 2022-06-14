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

import JCellClimate, {IJCellClimateInfo} from '../CellInformation/JCellClimate'
import JTempGrid from "../heightmap/JTempGrid";
import { JGridPoint } from '../Geom/JGrid';

const emptyMonthArr = [0,0,0, 0,0,0, 0,0,0, 0,0,0];

export default class JClimateMap extends JWMap {
	constructor(d: JDiagram, precipGrid: JPrecipGrid, tempGrid: JTempGrid) {
		super(d);

		const climateData: IJCellClimateInfo[] = this.getClimateData(precipGrid, tempGrid);
		
		this.diagram.forEachCell((cell: JCell) => {
			if (!climateData[cell.id]) throw new Error(`no hay datos para ${cell.id}`)
			cell.info.setClimatetInfo(climateData[cell.id]);
		})

	}

	getClimateData(precipGrid: JPrecipGrid, tempGrid: JTempGrid) {
		const climateData: IJCellClimateInfo[] = []; // dataInfoManager
		if (climateData.length == 0) {
			// agregar de los gridpoints
			precipGrid._grid.forEachPoint((gp: JGridPoint, cidx: number, ridx: number) => {
				const cell = gp._cell;
				const precData: IPrecipData = precipGrid._precipData[cidx][ridx];
				const temps = tempGrid._tempData[cidx][ridx].tempMonth
				climateData[cell.id] = {
					id: cell.id,
					precipMonth: precData.precip,
					tempMonth: temps.map((t: number, i: number) => t + precData.deltaTemps[i]) 
				}
				cell.mark();		
			})
			// para el resto hacer un promedio
			let restList: JCell[] = []
			this.forEachCell((c: JCell) => {
				if (!c.isMarked()) {
					restList.push(c);
				}
			})	
			while ( restList.length > 0 ) {
				const cell: JCell = restList.shift() as JCell;
				
				let cant: number = 0,
					tempArr: number[] = [...emptyMonthArr],
					precipArr: number[] = [...emptyMonthArr];				
				const neighs: JCell[] = this.diagram.getNeighbors(cell);
				neighs.forEach((nc: JCell) => {
					if (!!climateData[nc.id]) {
						cant++;
						const hf = 6.5 * nc.info.cellHeight.heightInMeters/1000;
						tempArr = tempArr.map((t: number, i: number) => t + climateData[nc.id].tempMonth[i] + hf); // este promedio no se puede hacer así!
						precipArr = precipArr.map((p: number, i: number) => p + climateData[nc.id].precipMonth[i])
					}
				})
	
				if (cant == 0) restList.push(cell);
				else {
					const hf = 6.5 * cell.info.cellHeight.heightInMeters/1000;
					climateData[cell.id] = {
						id: cell.id,
						precipMonth: precipArr.map((p: number) => p/cant),
						tempMonth: tempArr.map((t: number) => t/cant - hf)
					}
				}
			}			
		}

		return climateData;
		
	}
	
}