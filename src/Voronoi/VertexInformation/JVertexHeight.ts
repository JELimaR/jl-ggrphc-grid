import { TypeInformationKey } from "../../DataInformationLoadAndSave";
import JVertex from "../JVertex";
import JVertexGeneric, { IJVertexGenericInfo } from "./JVertexGeneric";

export type TypeVertexheight =
	| 'ocean'
	| 'coast'
	| 'land'
	| 'lakeCoast'
	| 'lake'

export interface IJVertexHeightInfo extends IJVertexGenericInfo {
	id: string;

	height: number;
	heightType: TypeVertexheight;
}

export default class JVertexHeight extends JVertexGeneric {
	// private _vertex: JVertex;

	private _height: number;
	private _heightType: TypeVertexheight;
	// private _island: number = -1;
	constructor(vertex: JVertex, info: IJVertexHeightInfo) {
		super(vertex);
		// this._vertex = vertex;
		this._height = info.height;
		this._heightType = info.heightType;
	}

	get height(): number { return this._height }
	set height(h: number) { this._height = h }
	get heightType(): TypeVertexheight { return this._heightType }
	set heightType(tvh: TypeVertexheight) { this._heightType = tvh }

	getInterface(): IJVertexHeightInfo {
		return {
			id: this.vertex.id,

			height: this._height,
			heightType: this._heightType
		}
	}

	static getTypeInformationKey(): TypeInformationKey {
		return 'vertexHeight';
	}
}