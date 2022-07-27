import JVertex from "../JVertex";
import JVertexHeight, { IJVertexHeightInfo } from "./JVertexHeight";
import JVertexClimate, { IJVertexClimateInfo } from "./JVertexClimate";
import JVertexFlux, { IJVertexFluxInfo } from "./JVertexFlux";

export default class JVertexInformation {
	_vertex: JVertex
	_height: JVertexHeight | undefined;
	_climate: JVertexClimate | undefined;
	_flux: JVertexFlux | undefined;

	private _mark: boolean = false;

	constructor(vertex: JVertex) {
		this._vertex = vertex;
	}

	get mark(): boolean { return this._mark }
	set mark(b: boolean) { this._mark = b }

	/*
	 * height or relief
	 */

	setHeightInfo(h: IJVertexHeightInfo) { this._height = new JVertexHeight(this._vertex, h); }
	getHeightInfo(): IJVertexHeightInfo | undefined { return this._height!.getInterface(); }
	get vertexHeight(): JVertexHeight {
		return this._height!;
	}

	// get isLand(): boolean { return this._height!.heightType === 'land' }
	get height(): number { return this._height!.height }
	set height(h: number) { this._height!.height = h }

	// set islandId(id: number) { this._height!.island = id; }
	// get islandId(): number { return this._height!.island; }

	/*
	 * temp
	 */
	// setTempInfo(t: IJVertexTempInfo) { this._temp = new JVertexTemp(this._vertex, t);	}
	// getTempInfo(): IJVertexTempInfo | undefined { return this._temp!.getInterface();	}
	// get cellTemp(): JVertexTemp {
	// 	return this._temp!;
	// }

	// get tempMonthArr(): number[] { return this._temp!.tempMonth }
	// get tempMedia(): number { 
	// 	let out: number = 0;
	// 	this._temp!.tempMonth.forEach((t: number) => out += t)
	// 	return out/12;
	// }

	/*
	 * climate
	 */

	setClimateInfo(c: IJVertexClimateInfo) { this._climate = new JVertexClimate(this._vertex, c); }
	getClimateInfo(): IJVertexClimateInfo | undefined { return this._climate!.getInterface(); }
	get vertexClimate(): JVertexClimate {
		return this._climate!;
	}

	get tempMonthArr(): number[] { return this._climate!.tempMonth }

	// get tempMedia(): number { 
	// 	let out: number = 0;
	// 	this._temp!.tempMonth.forEach((t: number) => out += t)
	// 	return out/12;
	// }

	/*
	 * flux
	 */

	setFluxInfo(f: IJVertexFluxInfo) { this._flux = new JVertexFlux(this._vertex, f); }
	getFluxInfo(): IJVertexFluxInfo | undefined { return this._flux!.getInterface(); }
	get vertexFlux(): JVertexFlux {
		return this._flux!;
	}

}