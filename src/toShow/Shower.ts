
import CanvasDrawingMap from "../CanvasDrawing/CanvasDrawingMap";
import Point from "../Geom/Point";
import NaturalMap from "../BuildingModel/NaturalMap";

const tam: number = 3600;
let SIZE: Point = new Point(tam, tam / 2);

export default abstract class Shower {
	private _w: NaturalMap;
	private _a: number;
	private _f: string;
	private _d: CanvasDrawingMap;
	constructor(world: NaturalMap, area: number, folderSelected: string, subFolder: string) {
		this._w = world;
		this._a = area;
		this._f = folderSelected;
		this._d = new CanvasDrawingMap(SIZE, `/${subFolder}`);
	}

	get w(): NaturalMap { return this._w}
	get a(): number { return this._a}
	get f(): string { return this._f}
	get d(): CanvasDrawingMap { return this._d }

	printSeparator() { console.log('-----------------------------------------------') }
	
}

// example
class ShowExample extends Shower {

	constructor(world: NaturalMap, area: number, folderSelected: string) {
		super(world, area, folderSelected, 'climate');
	}
}