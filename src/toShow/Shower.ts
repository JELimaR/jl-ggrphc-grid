import CanvasDrawingMap from "../Drawing/CanvasDrawingMap";
import Point from "../Geom/Point";
import NaturalWorldMap from "../NaturalWorldMap";

const tam: number = 3600;
let SIZE: Point = new Point(tam, tam / 2);

export default abstract class Shower {
	private _w: NaturalWorldMap;
	private _a: number;
	private _f: string;
	private _d: CanvasDrawingMap;
	constructor(world: NaturalWorldMap, area: number, folderSelected: string, subFolder: string) {
		this._w = world;
		this._a = area;
		this._f = folderSelected;
		this._d = new CanvasDrawingMap(SIZE, `/${subFolder}`);
	}

	get w(): NaturalWorldMap { return this._w}
	get a(): number { return this._a}
	get f(): string { return this._f}
	get d(): CanvasDrawingMap { return this._d }

	printSeparator() { console.log('-----------------------------------------------') }
	
}

// example
class ShowExample extends Shower {

	constructor(world: NaturalWorldMap, area: number, folderSelected: string) {
		super(world, area, folderSelected, 'climate');
	}
}