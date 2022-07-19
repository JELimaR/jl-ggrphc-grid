import RegionMap, { IRegionMapInfo } from "../MapElements/RegionMap";
import JDiagram from "../Voronoi/JDiagram";

export interface IIslandMapInfo extends IRegionMapInfo {
	id: number;
}

export default class IslandMap extends RegionMap {
	private _id: number;
	constructor(id: number, /*world: JWorldMap*/ diag: JDiagram, info?: IIslandMapInfo,) {
		super(diag, info);
		this._id = id
	}

	get id(): number {return this._id}

	getInterface(): IIslandMapInfo {
		return {
			id: this._id,
			...super.getInterface()
		}
	}
}