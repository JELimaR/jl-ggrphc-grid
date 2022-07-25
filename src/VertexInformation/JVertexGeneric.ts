import { TypeInformationKey } from "../DataInformationLoadAndSave";
import IElementDataGeneric, { IIElementDataGenericInfo } from "../ElementDataGeneric";
import JVertex from "../Voronoi/JVertex";

export interface IJVertexGenericInfo extends IIElementDataGenericInfo {
	id: string;
}

export default abstract class JVertexGeneric implements IElementDataGeneric {
	private _vertex: JVertex;
	constructor(v: JVertex) {
		this._vertex = v;
	}

	get vertex(): JVertex { return this._vertex };

	getInterface(): IJVertexGenericInfo {
		return {
			id: this._vertex.id
		};
	}

	static getTypeInformationKey(): TypeInformationKey {
		throw new Error(`non implemented`);
	}
}

