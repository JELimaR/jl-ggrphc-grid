import JPoint from "../Geom/JPoint";

export default class JPanzoom {
	private _zoom: number;
	private _centerX: number;
	private _centerY: number;
	private _elementSize: JPoint;

	constructor(size: JPoint) {
		this._elementSize = size;
		this._zoom = Math.pow(1.25, 0);
		this._centerX = this._elementSize.x / 2;
		this._centerY = this._elementSize.y / 2;
		this.calculateCenter();
	}

	reset(): void {
		this._zoom = Math.pow(1.25, 0);
		this._centerX = this._elementSize.x / 2;
		this._centerY = this._elementSize.y / 2;
	}

	get zoom(): number {
		return Math.round(Math.log(this._zoom) / Math.log(1.25))
	}
	set zoom(n: number) {
		if (n >= 0 && n === Math.round(n) && n <= 20) {
			this._zoom = Math.pow(1.25, n);
		}
		this.calculateCenter();
	}
	set centerX(X: number) {
		this._centerX = X;
		this.calculateCenter();
	}
	set centerY(Y: number) {
		this._centerY = Y;
		this.calculateCenter();
	}

	get scale(): number { return this._elementSize.x / 360 * this._zoom }
	get centerX(): number { return this._centerX }
	get centerY(): number { return this._centerY }
	private calculateCenter(): void {
		let minCenterX = this._elementSize.x / 2 * (1 - (this._zoom - 1) * (+1));
		let maxCenterX = this._elementSize.x / 2 * (1 - (this._zoom - 1) * (-1));
		let minCenterY = this._elementSize.y / 2 * (1 - (this._zoom - 1) * (+1));
		let maxCenterY = this._elementSize.y / 2 * (1 - (this._zoom - 1) * (-1));

		if (this._centerX > maxCenterX) this._centerX = maxCenterX;
		if (this._centerY > maxCenterY) this._centerY = maxCenterY;
		if (this._centerX < minCenterX) this._centerX = minCenterX;
		if (this._centerY < minCenterY) this._centerY = minCenterY;
	}
	// convertGeoJPointToDrawerJPoint
	convertPointToDrawer(p: JPoint): JPoint {
		return new JPoint(
			p.x * this.scale + this._centerX,
			p.y * this.scale + this._centerY
		);
	}
	// convertDrawerJPointToGeoJPoint
	convertDrawerToPoint(p: JPoint): JPoint {
		return new JPoint(
			(p.x - this._centerX) / this.scale,
			(p.y - this._centerY) / this.scale,
		);
	}

	get pointsBuffDrawLimits(): JPoint[] {
		const a = this.convertDrawerToPoint(new JPoint(0, 0));
		const b = this.convertDrawerToPoint(new JPoint(0, this._elementSize.y));
		const c = this.convertDrawerToPoint(new JPoint(this._elementSize.x, this._elementSize.y));
		const d = this.convertDrawerToPoint(new JPoint(this._elementSize.x, 0));
		return [a, b, c, d, a]
	}

	get pointsBuffCenterLimits(): JPoint[] {
		let minCenterX = this._elementSize.x / 2 * (1 - (this._zoom - 1) * (+1));
		let maxCenterX = this._elementSize.x / 2 * (1 - (this._zoom - 1) * (-1));
		let minCenterY = this._elementSize.y / 2 * (1 - (this._zoom - 1) * (+1));
		let maxCenterY = this._elementSize.y / 2 * (1 - (this._zoom - 1) * (-1));
		// drawer to point asuming center in size/2
		const a = new JPoint(
			(minCenterX - this._elementSize.x / 2) / this.scale,
			(minCenterY - this._elementSize.y / 2) / this.scale
		);
		const b = new JPoint(
			(minCenterX - this._elementSize.x / 2) / this.scale,
			(maxCenterY - this._elementSize.y / 2) / this.scale
		);
		const c = new JPoint(
			(maxCenterX - this._elementSize.x / 2) / this.scale,
			(maxCenterY - this._elementSize.y / 2) / this.scale
		);
		const d = new JPoint(
			(maxCenterX - this._elementSize.x / 2) / this.scale,
			(minCenterY - this._elementSize.y / 2) / this.scale
		);

		return [a, b, c, d, a];
	}

	getXstep(): number {
		const i2 = this.pointsBuffDrawLimits[2].x;
		const i1 = this.pointsBuffDrawLimits[1].x;
		const dif: number = i2 - i1;
		return dif / 5;
	}

	getYstep(): number {
		const i1 = this.pointsBuffDrawLimits[1].y;
		const i0 = this.pointsBuffDrawLimits[0].y;
		const dif: number = i1 - i0;
		return dif / 5;
	}

}