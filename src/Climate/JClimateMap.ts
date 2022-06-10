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

export default class JClimateMap extends JWMap {
	constructor(d: JDiagram, precipGrid: JPrecipGrid) {
		super(d);
	}
}