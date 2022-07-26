/*
export default interface IMapElement<I> {
	getInterface(): I;
}
*/

import { TypeInformationKey } from "./DataInformationLoadAndSave";

export default abstract class MapElement<I> {
	abstract getInterface(): I;

	static getTypeInformationKey(): TypeInformationKey {
		throw new Error(`non implemented`);
	}
}
