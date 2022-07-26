import DrawerMap from "../Drawer/DrawerMap";
import Point from "../Geom/Point";
import NaturalWorld from "../NaturalWorld";

const tam: number = 3600;
let SIZE: Point = new Point(tam, tam / 2);

export default abstract class Shower {
	private _w: NaturalWorld;
	private _a: number;
	private _f: string;
	private _d: DrawerMap;
	constructor(world: NaturalWorld, area: number, folderSelected: string, subFolder: string) {
		this._w = world;
		this._a = area;
		this._f = folderSelected;
		this._d = new DrawerMap(SIZE, `/${subFolder}`);
	}

	get w(): NaturalWorld { return this._w}
	get a(): number { return this._a}
	get f(): string { return this._f}
	get d(): DrawerMap { return this._d }

	printSeparator() { console.log('-----------------------------------------------') }
	
}

// example
class ShowExample extends Shower {

	constructor(world: NaturalWorld, area: number, folderSelected: string) {
		super(world, area, folderSelected, 'climate');
	}
}