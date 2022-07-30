import { Canvas, CanvasRenderingContext2D, createCanvas } from 'canvas';
import fs from 'fs';
import ADrawingMap from '../Drawing/ADrawingMap';
import IDrawingParameters from '../Drawing/IDrawingParameters';

import Point, { IPoint } from '../Geom/Point';
import RegionMap from '../BuildingModel/MapContainerElements/RegionMap';
import CanvasPanzoom from './CanvasPanzoom';

export default class CanvasDrawingMap extends ADrawingMap<void, CanvasPanzoom> {
	private _cnvs: Canvas;
	private _dirPath: string;

	static _srcPath: string;
	static configPath(path: string): void {
		this._srcPath = path;
	}

	constructor(SIZE: IPoint, dirPath: string) {
		super(SIZE, new CanvasPanzoom(SIZE))

		this._cnvs = createCanvas(SIZE.x, SIZE.y);

		this._dirPath = CanvasDrawingMap._srcPath + `/${dirPath}`;
		fs.mkdirSync(this._dirPath, { recursive: true });
	}

	getCenterPan(): Point {
		return new Point(
			(-this.panzoom.centerX + this.size.x / 2) / this.panzoom.scale,
			(-this.panzoom.centerY + this.size.y / 2) / this.panzoom.scale
		);
	}
	setCenterpan(p: IPoint) {
		this.panzoom.centerX = -p.x * this.panzoom.scale + this.size.x / 2;
		this.panzoom.centerY = -p.y * this.panzoom.scale + this.size.y / 2;
	}

	getPanzoomForReg(reg: RegionMap) {
		const auxPZ: CanvasPanzoom = new CanvasPanzoom(this.size);
		return super.getPanzoomForReg(reg, auxPZ);
	}

	private get context(): CanvasRenderingContext2D {
		return this._cnvs.getContext('2d');
	}

	draw(points: Point[], ent: IDrawingParameters): void {
		let context: CanvasRenderingContext2D = this.context;

		context.beginPath();

		for (let point of points) {
			const pconverted: IPoint = this.panzoom.convertPointToDrawer(point);
			context.lineTo(pconverted.x, pconverted.y);
		}

		if (ent.dashPattern) context.setLineDash(ent.dashPattern);
		else context.setLineDash([1, 0]);
		if (ent.lineWidth) context.lineWidth = ent.lineWidth; // depende del zoom
		else context.lineWidth = 1;
		context.strokeStyle = ent.strokeColor;
		if (ent.strokeColor !== 'none') context.stroke();
		context.fillStyle = ent.fillColor;
		if (ent.fillColor !== 'none') context.fill();
		context.closePath();
	}
	/**/
	drawDot(p: Point, ent: IDrawingParameters, w: number): void {
		let list: Point[] = [];

		list.push(new Point(p.x - w / 2, p.y - w / 2));
		list.push(new Point(p.x + w / 2, p.y - w / 2));
		list.push(new Point(p.x + w / 2, p.y + w / 2));
		list.push(new Point(p.x - w / 2, p.y + w / 2));

		this.draw(list, ent);
	}

	clear(zoomValue: number = 0, center: Point = new Point(0, 0)) {
		this.setZoomValue(zoomValue);
		this.setCenterpan(center);
		this.context.clearRect(0, 0, this._cnvs.width, this._cnvs.height);
	}

	/* SAVE */
	saveDrawStream(fileName: string) {
		const out = fs.createWriteStream(`${this._dirPath}/${fileName}`);
		const stream = this._cnvs.createPNGStream();
		stream.pipe(out);
	}

	getBuffer(): Buffer { return this._cnvs.toBuffer() }

	saveDrawFile(fileName: string) {
		fs.writeFileSync(`${this._dirPath}/${fileName}`, this.getBuffer());
	}

}