import APanzoom from "../Drawing/APanzoom";
import Point, { IPoint } from "../Geom/Point";

export default class CanvasPanzoom extends APanzoom {

	constructor(size: IPoint) {
		super(size, {
			zoom: Math.pow(1.25, 0),
			center: { x: size.x / 2, y: size.y / 2 }
		})
	}

	get minCenterX(): number { return this.elementSize.x / 2 * (1 - (this.zoom - 1) * (+1)); }
	get maxCenterX(): number { return this.elementSize.x / 2 * (1 - (this.zoom - 1) * (-1)); }
	get minCenterY(): number { return this.elementSize.y / 2 * (1 - (this.zoom - 1) * (+1)); }
	get maxCenterY(): number { return this.elementSize.y / 2 * (1 - (this.zoom - 1) * (-1)); }

	// convertGeoJPointToDrawerJPoint
	convertPointToDrawer(p: IPoint): IPoint {
		return {
			x: p.x * this.scale + this.centerX,
			y: p.y * this.scale + this.centerY
		};
	}
	// convertDrawerJPointToGeoJPoint
	convertDrawerToPoint(p: IPoint): IPoint {
		return {
			x: (p.x - this.centerX) / this.scale,
			y: (p.y - this.centerY) / this.scale,
		};
	}

	get pointsBuffDrawLimits(): IPoint[] {
		const a = this.convertDrawerToPoint(new Point(0, 0));
		const b = this.convertDrawerToPoint(new Point(0, this.elementSize.y));
		const c = this.convertDrawerToPoint(new Point(this.elementSize.x, this.elementSize.y));
		const d = this.convertDrawerToPoint(new Point(this.elementSize.x, 0));
		return [a, b, c, d, a];
	}

	get pointsBuffCenterLimits(): IPoint[] {
		// drawer to point asuming center in size/2
		const a = {
			x: (this.minCenterX - this.elementSize.x / 2) / this.scale,
			y: (this.minCenterY - this.elementSize.y / 2) / this.scale
		};
		const b = {
			x: (this.minCenterX - this.elementSize.x / 2) / this.scale,
			y: (this.maxCenterY - this.elementSize.y / 2) / this.scale
		};
		const c = {
			x: (this.maxCenterX - this.elementSize.x / 2) / this.scale,
			y: (this.maxCenterY - this.elementSize.y / 2) / this.scale
		};
		const d = {
			x: (this.maxCenterX - this.elementSize.x / 2) / this.scale,
			y: (this.minCenterY - this.elementSize.y / 2) / this.scale
		};

		return [a, b, c, d, a];
	}

}