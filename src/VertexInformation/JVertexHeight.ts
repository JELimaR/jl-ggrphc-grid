import JVertex from "../Voronoi/JVertex";

export type TypeVertexheight =
	| 'ocean'
	| 'coast'
	| 'land'
	| 'lakeCoast'
	| 'lake'

export interface IJVertexHeightInfo {
	id: string;

	height: number;
	heightType: TypeVertexheight;
}

export default class JVertexHeight {
	private _vertex: JVertex;

	private _height: number;
	private _heightType: TypeVertexheight = 'land';
	// private _island: number = -1;
	constructor(vertex: JVertex, info: IJVertexHeightInfo) {
		this._vertex = vertex;
		this._height = info.height;
		this._heightType = info.heightType;
	}

	get height(): number { return this._height }
	set height(h: number) { this._height = h }
	get heightType(): TypeVertexheight { return this._heightType }
	set heightType(tvh: TypeVertexheight) { this._heightType = tvh }

	getInterface(): IJVertexHeightInfo {
		return {
			id: this._vertex.point.id,

			height: this._height,
			heightType: this._heightType
		}
	}
}