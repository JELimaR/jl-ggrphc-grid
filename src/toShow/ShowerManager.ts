import NaturalMap from "../BuildingModel/NaturalMap";
import ShowClimate from "./toShowClimate";
import ShowHeight from "./toShowHeight";
import ShowTest from "./toShowTest";
import ShowWater from "./toShowWater";


export default class ShowerManager {
	private _sc: ShowClimate | undefined;
	private _sh: ShowHeight | undefined;
	private _sw: ShowWater | undefined;
	private _st: ShowTest | undefined;

	private _w: NaturalMap;
	private _a: number;
	private _f: string;

	constructor(world: NaturalMap, area: number, folderSelected: string) {
		this._w = world;
		this._a = area;
		this._f = folderSelected;
	}

	get sc(): ShowClimate {
		if (!this._sc)
			this._sc = new ShowClimate(this._w, this._a, this._f);
		return this._sc;
	}

	get sh(): ShowHeight {
		if (!this._sh)
			this._sh = new ShowHeight(this._w, this._a, this._f);
		return this._sh;
	}

	get sw(): ShowWater {
		if (!this._sw)
			this._sw = new ShowWater(this._w, this._a, this._f);
		return this._sw;
	}

	get st(): ShowTest {
		if (!this._st)
			this._st = new ShowTest(this._w, this._a, this._f);
		return this._st;
	}
	
}