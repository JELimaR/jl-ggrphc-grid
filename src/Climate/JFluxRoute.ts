import JPoint from "../Geom/JPoint";
import JLine, { IJLineInfo } from "../RegionMap/JLine";
import JDiagram from "../Voronoi/JDiagram";
import JVertex from "../Voronoi/JVertex";

// cambiar road por otra cosa
export interface IJFluxRouteInfo extends IJLineInfo {
	id: number;
}

export default class JFluxRoute extends JLine {

	private _id;

	constructor(id: number, diagram: JDiagram, info?: IJFluxRouteInfo) {
		super(diagram, info);
		this._id = id;
	}

	get id(): number { return this._id }

	getInterface(): IJFluxRouteInfo {
		return {
			...super.getInterface(),
			id: this._id,
		}
	}
}