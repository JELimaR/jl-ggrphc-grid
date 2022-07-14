import DrawerMap from "../Drawer/DrawerMap";
import JPoint from "../Geom/JPoint";
import JWorld from "../JWorld";

const tam: number = 3600;
let SIZE: JPoint = new JPoint(tam, tam / 2);

export default abstract class Shower {
	private _w: JWorld;
	private _a: number;
	private _g: number;
	private _f: string;
	private _d: DrawerMap;
	constructor(world: JWorld, area: number, gran: number, folderSelected: string, subFolder: string) {
		this._w = world;
		this._a = area;
		this._g = gran;
		this._f = folderSelected;
		this._d = new DrawerMap(SIZE, __dirname + `/../../img/${this.f}/${subFolder}`);
	}

	get w(): JWorld { return this._w}
	get a(): number { return this._a}
	get g(): number { return this._g}
	get f(): string { return this._f}
	get d(): DrawerMap { return this._d }

	printSeparator() { console.log('-----------------------------------------------') }
	
}

// example
class ShowExample extends Shower {

	constructor(world: JWorld, area: number, gran: number, folderSelected: string) {
		super(world, area, gran, folderSelected, 'climate');
	}
}