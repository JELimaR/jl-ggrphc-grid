import RegionMap, { IRegionMapInfo } from "../MapElements/RegionMap";
import JDiagram from "../Voronoi/JDiagram";

export interface IDrainageBasinMapInfo extends IRegionMapInfo {
	id: string;
}

export default class DrainageBasinMap extends RegionMap {

	private _id: string;
	
	constructor(id: string/*o river*/, diagram: JDiagram, info?: IDrainageBasinMapInfo) {
		super(diagram, info);
		this._id = id;
	}

	getInterface(): IDrainageBasinMapInfo {
		return {
			...super.getInterface(),
			id: this._id,
		}
	}
}