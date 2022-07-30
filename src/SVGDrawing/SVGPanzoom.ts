import APanzoom from '../Drawing/APanzoom';
import { IPoint } from '../Geom/Point';

export default class SVGPanzoom extends APanzoom {
	constructor(size: IPoint) {
		super(size, {
			zoom: Math.pow(1.25, 0),
			center: { x: 0, y: 0 }
		})
	}

	get minCenterX(): number { return (-this.elementSize.x / 2) * (1 - 1 / this.scale); }
	get maxCenterX(): number { return -(-this.elementSize.x / 2) * (1 - 1 / this.scale); }
	get minCenterY(): number { return (-this.elementSize.y / 2) * (1 - 1 / this.scale); }
	get maxCenterY(): number { return -(-this.elementSize.y / 2) * (1 - 1 / this.scale); }

	get pointsBuffDrawLimits(): IPoint[] {
		const wxl = this.elementSize.x / this.scale;
		const wyl = this.elementSize.y / this.scale;
		const a = { x: this.centerX - wxl / 2, y: this.centerY - wyl / 2 };
		const b = { x: this.centerX - wxl / 2, y: this.centerY + wyl / 2 };
		const c = { x: this.centerX + wxl / 2, y: this.centerY + wyl / 2 };
		const d = { x: this.centerX + wxl / 2, y: this.centerY - wyl / 2 };
		return [a, b, c, d, a];
	}

	get pointsBuffCenterLimits(): IPoint[] {
		const a = { x: this.minCenterX, y: this.minCenterY };
		const b = { x: this.minCenterX, y: this.maxCenterY };
		const c = { x: this.maxCenterX, y: this.maxCenterY };
		const d = { x: this.maxCenterX, y: this.minCenterY };

		return [a, b, c, d, a];
	}

	getViewBox() {
		const a = this.pointsBuffDrawLimits[0];
		const c = this.pointsBuffDrawLimits[2];
		return `${a.x} ${a.y} ${Math.abs(c.x - a.x)} ${Math.abs(c.y - a.y)}`;
	}
}
