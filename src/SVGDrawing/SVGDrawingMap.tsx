import ADrawingMap from "../Drawing/ADrawingMap";
import IDrawingParameters from "../Drawing/IDrawingParameters";
import { IPoint } from "../Geom/Point";
import SVGPanzoom from "./SVGPanzoom";


export default class SVGDrawingMap extends ADrawingMap<{}, SVGPanzoom> {
	constructor(SIZE: IPoint) {
		super(SIZE, new SVGPanzoom(SIZE))
	}

	getCenterPan(): IPoint {
		return { x: this.panzoom.centerX, y: this.panzoom.centerY };
	}
	setCenterpan(p: IPoint): void {
		this.panzoom.centerX = p.x;
		this.panzoom.centerY = p.y;
	}

	draw(points: IPoint[], ent: IDrawingParameters): {} {
		throw new Error(`non implemented`);
		// return {}
	}
	drawDot(p: IPoint, ent: IDrawingParameters, w: number): {} {
		return this.draw([], ent);
	}
}