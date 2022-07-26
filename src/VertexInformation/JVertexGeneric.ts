import { TypeInformationKey } from "../DataInformationLoadAndSave";
import MapElement from "../IMapElement";
// import IMapElement from "../IMapElement";
import JVertex from "../Voronoi/JVertex";

export interface IJVertexGenericInfo {
	id: string;
}

// export default abstract class JVertexGeneric implements IMapElement<IJVertexGenericInfo> {
	export default abstract class JVertexGeneric extends MapElement<IJVertexGenericInfo> {
	private _vertex: JVertex;
	constructor(v: JVertex) {
		super();
		this._vertex = v;
	}

	get vertex(): JVertex { return this._vertex };

	getInterface(): IJVertexGenericInfo {
		return {
			id: this._vertex.id
		};
	}

}

