import JPoint from "../Geom/JPoint";
import LineMap, { ILineMapInfo } from "../RegionMap/LineMap";
import JDiagram from "../Voronoi/JDiagram";
import JVertex from "../Voronoi/JVertex";

/**
 * Un objeto JFluxRoute representa un camino de drenaje desde un punto inicial hacia la costa
 * Puede ser un lago o un oceano.
 */
export interface IFluxRouteInfo extends ILineMapInfo {
	id: number;
}

export default class FluxRoute extends LineMap {

	private _id: number;

	constructor(id: number, diagram: JDiagram, info?: IFluxRouteInfo) {
		super(diagram, info);
		this._id = id;
	}

	get id(): number { return this._id }

	getInterface(): IFluxRouteInfo {
		return {
			...super.getInterface(),
			id: this._id,
		}
	}
}