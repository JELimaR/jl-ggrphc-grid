import JPoint from "../Geom/JPoint";
import JLine, { IJLineInfo } from "../RegionMap/JLine";
import JDiagram from "../Voronoi/JDiagram";
import JVertex from "../Voronoi/JVertex";

export interface IJRiverInfo extends IJLineInfo {
  id: number;
}

export default class JRiver extends JLine {
	private _id: number;

  constructor(id: number, diagram: JDiagram, info?: IJRiverInfo) {
		super(diagram, info)
		this._id = id;
  }

	get id(): number { return this._id }

	getInterface(): IJRiverInfo {
		return {
			...super.getInterface(),
			id: this._id,
		}
	}
}