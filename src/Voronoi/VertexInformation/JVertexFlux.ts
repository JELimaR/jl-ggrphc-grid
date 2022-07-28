import { TypeInformationKey } from "../../TypeInformationKey";
import JVertex from "../JVertex";
import JVertexGeneric, { IJVertexGenericInfo } from "./JVertexGeneric";

export interface IJVertexFluxInfo extends IJVertexGenericInfo {
	id: string;

	fluxMonth: number[];
	fluxRouteIds: number[];
	riverIds: number[];
}

export default class JVertexFlux extends JVertexGeneric {

	private _fluxMonth: number[];
	private _fluxRouteIds: number[] = [];
	private _riverIds: number[] = [];

	constructor(vertex: JVertex, info: IJVertexFluxInfo) {
		super(vertex)
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
			...super.getInterface(),
			fluxMonth: [...this._fluxMonth],
			fluxRouteIds: this._fluxRouteIds,
			riverIds: this._riverIds
		}
	}

	static getTypeInformationKey(): TypeInformationKey {
		return 'vertexFlux';
	}
}