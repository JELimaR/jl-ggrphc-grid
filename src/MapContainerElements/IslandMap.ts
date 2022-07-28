import { TypeInformationKey } from "../TypeInformationKey";
import RegionMap, { IRegionMapInfo } from "./RegionMap";
import JCell from "../Voronoi/JCell";
import JDiagram from "../Voronoi/JDiagram";

export interface IIslandMapInfo extends IRegionMapInfo {
	id: number;
}

export default class IslandMap extends RegionMap {
	private _id: number;
	constructor(id: number, diag: JDiagram, info?: IIslandMapInfo,) {
		super(diag, info);
		this._id = id
	}

	get id(): number { return this._id }

	getWaterCoastCells(): JCell[] {
		let out: Map<number, JCell> = new Map<number, JCell>();

		this.getLimitCells().forEach((lcell: JCell) => {
			this.diagram.getCellNeighbours(lcell).forEach((n: JCell) => {
				if (!this.isInRegion(n)) out.set(n.id, n);
			})
		})

		return [...out.values()];
	}

	getInterface(): IIslandMapInfo {
		return {
			id: this._id,
			...super.getInterface()
		}
	}

	static getTypeInformationKey(): TypeInformationKey {
		return 'islands';
	}
}