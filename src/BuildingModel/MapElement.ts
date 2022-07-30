import { TypeInformationKey } from "./TypeInformationKey";

export default abstract class MapElement<I> {
	abstract getInterface(): I;

	static getTypeInformationKey(): TypeInformationKey {
		throw new Error(`non implemented`);
	}
}
