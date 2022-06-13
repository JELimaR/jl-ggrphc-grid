import JDiagram from "../Voronoi/JDiagram";
import DataInformationFilesManager from '../DataInformationLoadAndSave';
// import { IJCellInformation } from "../Voronoi/JCellInformation";
import { IJCellHeightInfo } from '../CellInformation/JCellHeight';
import JCell from "../Voronoi/JCell";
import JWMap from "../JWMap";
import JRegionMap from "../RegionMap/JRegionMap";
const dataInfoManager = DataInformationFilesManager.instance;

import JPoint from "../Geom/JPoint";
import JPrecipGrid from "../heightmap/JPrecipGrid";

import JCellClimate, {IJCellClimateInfo} from '../CellInformation/JCellClimate'
import JTempGrid from "../heightmap/JTempGrid";
import { JGridPoint } from '../Geom/JGrid';

export default class JClimateMap extends JWMap {
	constructor(d: JDiagram, precipGrid: JPrecipGrid, tempGrid: JTempGrid) {
		super(d);

		const climateData: IJCellClimateInfo[] = [];
		if (climateData.length == 0) {
			precipGrid._grid.forEachPoint((gp: JGridPoint, cidx: number, ridx: number) => {
				const cell = gp._cell;
				climateData[cell.id] = {
					id: cell.id,
					precipMonth: precipGrid._precipData[cidx][ridx].precip,
					tempMonth: tempGrid._tempData[cidx][ridx].tempMonth
				}
				cell.mark();
				cell.info.setClimatetInfo(climateData[cell.id]);
			})
			this.forEachCell((c: JCell) => {
				if (!c.isMarked()) {
					
				}
			})
		}


	}
}