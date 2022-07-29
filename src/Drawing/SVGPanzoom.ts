import Point from '../Geom/Point';
import APanzoom from './APanzoom';

export default class SVGPanzoom extends APanzoom {
	constructor(size: Point) {
		super(size, {
			zoom: Math.pow(1.25, 0),
			center: {x: 0, y: 0}
		})
	}

	get minCenterX(): number { return (-this.elementSize.x / 2) * (1 - 1 / this.scale);}
	get maxCenterX(): number { return -(-this.elementSize.x / 2) * (1 - 1 / this.scale);}
	get minCenterY(): number { return (-this.elementSize.y / 2) * (1 - 1 / this.scale);}
	get maxCenterY(): number { return -(-this.elementSize.y / 2) * (1 - 1 / this.scale);}

  get pointsBuffDrawLimits(): Point[] {
    const wxl = this.elementSize.x / this.scale;
    const wyl = this.elementSize.y / this.scale;
    const a = new Point(this.centerX - wxl / 2, this.centerY - wyl / 2);
    const b = new Point(this.centerX - wxl / 2, this.centerY + wyl / 2);
    const c = new Point(this.centerX + wxl / 2, this.centerY + wyl / 2);
    const d = new Point(this.centerX + wxl / 2, this.centerY - wyl / 2);
    return [a, b, c, d, a];
  }

  get pointsBuffCenterLimits(): Point[] {
    const a = new Point(this.minCenterX, this.minCenterY);
    const b = new Point(this.minCenterX, this.maxCenterY);
    const c = new Point(this.maxCenterX, this.maxCenterY);
    const d = new Point(this.maxCenterX, this.minCenterY);

    return [a, b, c, d, a];
  }

  getViewBox() {
    const a = this.pointsBuffDrawLimits[0];
    const c = this.pointsBuffDrawLimits[2];
    return `${a.x} ${a.y} ${Math.abs(c.x - a.x)} ${Math.abs(c.y - a.y)}`;
  }
}
