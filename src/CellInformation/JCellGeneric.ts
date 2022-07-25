import { TypeInformationKey } from "../DataInformationLoadAndSave";
import IElementDataGeneric, { IIElementDataGenericInfo } from "../ElementDataGeneric";
import JCell from "../Voronoi/JCell";

export interface IJCellGenericInfo extends IIElementDataGenericInfo {
	id: number;
}

export default abstract class JCellGeneric implements IElementDataGeneric {
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

	static getTypeInformationKey(): TypeInformationKey {
		throw new Error(`non implemented`)
	}
}