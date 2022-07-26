import { TypeInformationKey } from "../DataInformationLoadAndSave";
import LineMap, { ILineMapInfo } from "../MapElements/LineMap";
import JDiagram from "../Voronoi/JDiagram";

/**
 * Un objeto FluxRouteMap representa un camino de drenaje desde un punto inicial hacia la costa
 * Puede ser un lago o un oceano.
 */
export interface IFluxRouteMapInfo extends ILineMapInfo {
	id: number;
}

export default class FluxRouteMap extends LineMap {

	private _id: number;

	constructor(id: number, diagram: JDiagram, info?: IFluxRouteMapInfo) {
		super(diagram, info);
		this._id = id;
	}

	get id(): number { return this._id }

	getInterface(): IFluxRouteMapInfo {
		return {
			...super.getInterface(),
			id: this._id,
		}
	}

	static getTypeInformationKey(): TypeInformationKey {
		return 'fluxRoutes';
	}
}