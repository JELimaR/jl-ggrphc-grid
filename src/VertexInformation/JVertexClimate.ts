import JVertex from "../Voronoi/JVertex";

export interface IJVertexClimateInfo {
	id: string;
	tempMonth: number[];
	precipMonth: number[];
}

export default class JVertexClimate {
	private _vertex: JVertex;

	_tempMonth: number[];
	_precipMonth: number[];

	constructor(vertex: JVertex, info: IJVertexClimateInfo) {
		this._vertex = vertex;
		this._tempMonth = [...info.tempMonth]
		this._precipMonth = [...info.precipMonth]
	}

	get tempMonth() { return this._tempMonth }
	get precipMonth() { return this._precipMonth }

	get annualPrecip(): number { return this._precipMonth.reduce((c: number, p: number) => c+p, 0) }

	getInterface(): IJVertexClimateInfo {
		return {
			id: this._vertex.id,
			precipMonth: [...this._precipMonth],
			tempMonth: [...this._tempMonth],
		}
	}
}