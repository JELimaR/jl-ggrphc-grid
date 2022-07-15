import JVertex from "../Voronoi/JVertex";

export interface IJVertexFluxInfo {
	id: string;
	
	fluxMonth: number[];
	fluxRouteIds: number[];
	riverIds: number[];
}

export default class JVertexFlux {
	private _vertex: JVertex;

	private _fluxMonth: number[];
	_fluxRouteIds: number[] = [];
	_riverIds: number[] = [];

	constructor(vertex: JVertex, info: IJVertexFluxInfo) {
		this._vertex = vertex;
		this._fluxMonth = [...info.fluxMonth];
		this._fluxRouteIds = [...info.fluxRouteIds];
		if (info.riverIds.length > 3) throw new Error(``)
		this._riverIds = [...info.riverIds];
	}

	get annualFlux(): number { return this._fluxMonth.reduce((p: number, c: number) => c + p, 0) }
	get monthFlux(): number[] { return this._fluxMonth }
	get minFlux(): number { return Math.min(...this._fluxMonth) }

	get riverIds(): number[] { return this._riverIds }
	get fluxRouteIds(): number[] { return this._fluxRouteIds }

	getInterface(): IJVertexFluxInfo {
		return {
			id: this._vertex.id,
			fluxMonth: [...this._fluxMonth],
			fluxRouteIds: this._fluxRouteIds,
			riverIds: this._riverIds
		}
	}
}