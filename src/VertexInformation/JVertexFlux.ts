import JVertex from "../Voronoi/JVertex";

export interface IJVertexFluxInfo {
	id: string;
	
	fluxMonth: number[];
	fluxRoute: number[];
	river: number[];
}

export default class JVertexFlux {
	private _vertex: JVertex;

	_fluxMonth: number[];
	_fluxRoute: number[] = [];
	_river: number[] = [];

	constructor(vertex: JVertex, info: IJVertexFluxInfo) {
		this._vertex = vertex;
		this._fluxMonth = [...info.fluxMonth];
		this._fluxRoute = [...info.fluxRoute];
		if (info.river.length > 3) throw new Error(``)
		this._river = [...info.river];
	}

	get mediaFlux(): number { return this._fluxMonth.reduce((p: number, c: number) => c + p, 0) }
	get monthFlux(): number[] { return this._fluxMonth }

	getInterface(): IJVertexFluxInfo {
		return {
			id: this._vertex.id,
			fluxMonth: [...this._fluxMonth],
			fluxRoute: this._fluxRoute,
			river: this._river
		}
	}
}