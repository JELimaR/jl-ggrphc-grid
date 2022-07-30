import { TypeInformationKey } from "../TypeInformationKey";
import JDiagram from "../Voronoi/JDiagram";
import LineMap, { ILineMapInfo } from "./LineMap";


export interface IRiverMapInfo extends ILineMapInfo {
	id: number;
}

export default class RiverMap extends LineMap {
	private _id: number;

	constructor(id: number, diagram: JDiagram, info?: IRiverMapInfo) {
		super(diagram, info)
		this._id = id;
	}

	get id(): number { return this._id }

	getInterface(): IRiverMapInfo {
		return {
			...super.getInterface(),
			id: this._id,
		}
	}

	static getTypeInformationKey(): TypeInformationKey {
		return 'rivers';
	}
}