import Point from "../Geom/Point";
import APanzoom from "./APanzoom";

export default class CanvasPanzoom extends APanzoom {

	constructor(size: Point) {
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
	convertPointToDrawer(p: Point): Point {
		return new Point(
			p.x * this.scale + this.centerX,
			p.y * this.scale + this.centerY
		);
	}
	// convertDrawerJPointToGeoJPoint
	convertDrawerToPoint(p: Point): Point {
		return new Point(
			(p.x - this.centerX) / this.scale,
			(p.y - this.centerY) / this.scale,
		);
	}

	get pointsBuffDrawLimits(): Point[] {
		const a = this.convertDrawerToPoint(new Point(0, 0));
		const b = this.convertDrawerToPoint(new Point(0, this.elementSize.y));
		const c = this.convertDrawerToPoint(new Point(this.elementSize.x, this.elementSize.y));
		const d = this.convertDrawerToPoint(new Point(this.elementSize.x, 0));
		return [a, b, c, d, a];
	}

	get pointsBuffCenterLimits(): Point[] {
		let minCenterX = this.elementSize.x / 2 * (1 - (this.zoom - 1) * (+1));
		let maxCenterX = this.elementSize.x / 2 * (1 - (this.zoom - 1) * (-1));
		let minCenterY = this.elementSize.y / 2 * (1 - (this.zoom - 1) * (+1));
		let maxCenterY = this.elementSize.y / 2 * (1 - (this.zoom - 1) * (-1));
		// drawer to point asuming center in size/2
		const a = new Point(
			(minCenterX - this.elementSize.x / 2) / this.scale,
			(minCenterY - this.elementSize.y / 2) / this.scale
		);
		const b = new Point(
			(minCenterX - this.elementSize.x / 2) / this.scale,
			(maxCenterY - this.elementSize.y / 2) / this.scale
		);
		const c = new Point(
			(maxCenterX - this.elementSize.x / 2) / this.scale,
			(maxCenterY - this.elementSize.y / 2) / this.scale
		);
		const d = new Point(
			(maxCenterX - this.elementSize.x / 2) / this.scale,
			(minCenterY - this.elementSize.y / 2) / this.scale
		);

		return [a, b, c, d, a];
	}

}