import { IPoint } from "../Geom/Point";

export interface IAPanzoom {
	zoom: number;
	center: IPoint;
}

export default abstract class APanzoom {
	private _zoom: number;
	private _centerX: number;
	private _centerY: number;
	private _elementSize: IPoint;

	private iap: IAPanzoom;

	constructor(size: IPoint, iap: IAPanzoom) {
		this._elementSize = size;
		this.iap = { ...iap };

		if (this.iap.zoom >= 0 && this.iap.zoom === Math.round(this.iap.zoom) && this.iap.zoom <= 20) {
			this._zoom = Math.pow(1.25, this.iap.zoom);
		} else {
			this._zoom = Math.pow(1.25, 0);
		}
		this._centerX = this.iap.center.x;
		this._centerY = this.iap.center.y;

		this.calculateCenter();
	}

	reset(): void {
		if (this.iap.zoom >= 0 && this.iap.zoom === Math.round(this.iap.zoom) && this.iap.zoom <= 20) {
			this._zoom = Math.pow(1.25, this.iap.zoom);
		} else {
			this._zoom = Math.pow(1.25, 0);
		}
		this._centerX = this.iap.center.x;
		this._centerY = this.iap.center.y;
	}

	get elementSize(): IPoint { return this._elementSize; }

	get zoom(): number {return this._zoom}
	get zoomValue(): number {
		return Math.round(Math.log(this._zoom) / Math.log(1.25))
	}
	set zoomValue(n: number) {
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

	abstract get minCenterX(): number;
	abstract get maxCenterX(): number;
	abstract get minCenterY(): number;
	abstract get maxCenterY(): number;

	get scale(): number { return this._elementSize.x / 360 * this._zoom }
	get centerX(): number { return this._centerX }
	get centerY(): number { return this._centerY }

	private calculateCenter(): void {
		if (this._centerX > this.maxCenterX) this._centerX = this.maxCenterX;
		if (this._centerY > this.maxCenterY) this._centerY = this.maxCenterY;
		if (this._centerX < this.minCenterX) this._centerX = this.minCenterX;
		if (this._centerY < this.minCenterY) this._centerY = this.minCenterY;
	}
	
	abstract get pointsBuffDrawLimits(): IPoint[];
	abstract get pointsBuffCenterLimits(): IPoint[];

	getXstep(): number {
		const a = this.pointsBuffDrawLimits[0];
    const c = this.pointsBuffDrawLimits[2];
    const dif: number = c.x - a.x;
    return dif / 5;
	}

	getYstep(): number {
		const a = this.pointsBuffDrawLimits[0];
    const c = this.pointsBuffDrawLimits[2];
    const dif: number = c.y - a.y;
    return dif / 5;
	}
}