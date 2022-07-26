import { TypeInformationKey } from "../DataInformationLoadAndSave";
import IMapElement from "../MapElement";
import JCell from "../Voronoi/JCell";

export interface IJCellGenericInfo {
	id: number;
}

export default abstract class JCellGeneric implements IMapElement<IJCellGenericInfo> {
	private _cell: JCell;
	constructor(c: JCell) {
		this._cell = c;
	}

	get cell(): JCell { return this._cell };

	getInterface(): { id: number } {
		return {
			id: this._cell.id,
		}
	}

	static getTypeInformationKey(): TypeInformationKey { // borrar
		throw new Error(`non implemented`)
	}
}