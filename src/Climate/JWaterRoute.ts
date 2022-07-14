import JPoint from "../Geom/JPoint";
import JLine, { IJLineInfo } from "../RegionMap/JLine";
import JDiagram from "../Voronoi/JDiagram";
import JVertex from "../Voronoi/JVertex";

/**
 * Un objeto JFluxRoute representa un camino de drenaje desde un punto inicial hacia la costa
 * Puede ser un lago o un oceano.
 */
export interface IJWaterRouteInfo extends IJLineInfo {
	id: number;
}

export default class JWaterRoute extends JLine {

	private _id: number;

	constructor(id: number, diagram: JDiagram, info?: IJWaterRouteInfo) {
		super(diagram, info);
		this._id = id;
	}

	get id(): number { return this._id }

	getInterface(): IJWaterRouteInfo {
		return {
			...super.getInterface(),
			id: this._id,
		}
	}
}