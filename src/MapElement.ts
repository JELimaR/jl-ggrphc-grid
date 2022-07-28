import { TypeInformationKey } from "./informationTypes";

export default abstract class MapElement<I> {
	abstract getInterface(): I;

	static getTypeInformationKey(): TypeInformationKey {
		throw new Error(`non implemented`);
	}
}
