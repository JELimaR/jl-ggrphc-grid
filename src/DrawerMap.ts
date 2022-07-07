import { createCanvas } from 'canvas';
import fs from 'fs';
import * as turf from '@turf/turf';
import * as JCellToDrawEntryFunctions from './JCellToDrawEntryFunctions'
import chroma from 'chroma-js';

import JPoint, { JVector } from './Geom/JPoint';
import JWorldMap, { createICellContainerFromCellArray, ICellContainer } from './JWorldMap';
import JCell from './Voronoi/JCell';
import JRegionMap from './RegionMap/JRegionMap';

export interface IDrawEntry {
	fillColor: string | 'none';
	strokeColor: string | 'none';
	dashPattern?: number[];
	drawType?: 'line' | 'polygon'
}

export class JPanzoom {
	private _zoom: number;
	private _centerX: number;
	private _centerY: number;
	private _elementSize: JVector;

	constructor(size: JVector) {
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

export default class DrawerMap {

	private _size: JVector;
	private _cnvs: any;

	private _panzoom: JPanzoom;
	private _dirPath: string;

	constructor(SIZE: JVector, dirPath: string) {
		this._size = SIZE;
		this._cnvs = createCanvas(SIZE.x, SIZE.y);

		this._panzoom = new JPanzoom(this._size);
		this._dirPath = dirPath;
		fs.mkdirSync(this._dirPath, { recursive: true });
	}

	// borrar
	getPanzoom() { return this._panzoom }

	get centerPoint(): JPoint {
		return new JPoint(
			(-this._panzoom.centerX + this._size.x / 2) / this._panzoom.scale,
			(-this._panzoom.centerY + this._size.y / 2) / this._panzoom.scale
		);
	}
	get zoomValue(): number {
		return this._panzoom.zoom;
	}

	setZoom(n: number) {
		this._panzoom.zoom = n;
	}

	setCenterpan(p: JPoint) {
		this._panzoom.centerX = -p.x * this._panzoom.scale + this._size.x / 2;
		this._panzoom.centerY = -p.y * this._panzoom.scale + this._size.y / 2;
	}

	getPointsBuffDrawLimits(): JPoint[] {
		return this._panzoom.pointsBuffDrawLimits;
	}

	getPointsBuffCenterLimits(): JPoint[] {
		return this._panzoom.pointsBuffCenterLimits;
	}

	/**navigation */
	zoomIn() {
		const center: JPoint = this.centerPoint;
		this.setZoom(this.zoomValue + 1);
		this.setCenterpan(center);
	}
	zoomOut() {
		const center: JPoint = this.centerPoint;
		this.setZoom(this.zoomValue - 1);
		this.setCenterpan(center);
	}
	toTop() {
		this.setCenterpan(new JPoint(
			this.centerPoint.x,
			this.centerPoint.y - this._panzoom.getYstep()
		));
	}
	toBottom() {
		this.setCenterpan(new JPoint(
			this.centerPoint.x,
			this.centerPoint.y + this._panzoom.getYstep()
		));
	}
	toRight() {
		this.setCenterpan(new JPoint(
			this.centerPoint.x + this._panzoom.getXstep(),
			this.centerPoint.y
		));
	}
	toLeft() {
		this.setCenterpan(new JPoint(
			this.centerPoint.x - this._panzoom.getXstep(),
			this.centerPoint.y
		));
	}

	drawCellMap(cc: ICellContainer, func: (c: JCell) => IDrawEntry): void {
		const polContainer = turf.polygon(
			[this.getPointsBuffDrawLimits().map((p: JPoint) => {
				return p.toTurfPosition()
			})]
		);
		cc.forEachCell((c: JCell) => {
			if (!turf.booleanDisjoint(polContainer, c.toTurfPolygonSimple())) {
				const points: JPoint[] = (this.zoomValue < 8) ? c.voronoiVertices : c.allVertices;
				this.draw(points, func(c));
			}
		});
	}

	calculatePanzoomForReg(reg: JRegionMap) {
		const auxPZ: JPanzoom = new JPanzoom(this._size);
		let ok: boolean = true;
		let zoom = 0;
		const datDM = reg.getDrawerParameters();
		while (ok) {
			zoom++;
			auxPZ.zoom = zoom;
			ok =
				(auxPZ.pointsBuffDrawLimits[2].x - auxPZ.pointsBuffDrawLimits[1].x) > datDM.XMAXDIS &&
				(auxPZ.pointsBuffDrawLimits[1].y - auxPZ.pointsBuffDrawLimits[0].y) > datDM.YMAXDIS &&
				zoom !== 21
		}
		return {
			zoom: zoom - 1,
			center: datDM.center
		}
	}

	drawMeridianAndParallels(cantMer: number = 19, cantPar: number = 37) {
		// meridianos
		for (let i = 0; i < cantMer; i++) {
			const val = 180 / (cantMer - 1) * (i) - 90;
			const dashPattern = (val === 0) ? [1] : [5,5]
			this.draw([new JPoint(-200, val), new JPoint(200, val)], {
				fillColor: 'none',
				dashPattern,
				strokeColor: '#000000'
			})
		}
		// paralelos
		for (let i = 0; i < cantPar; i++) {
			const val = 360 / (cantPar - 1) * (i) - 180;
			const dashPattern = (val === 0) ? [1] : [5,5]
			this.draw([new JPoint(val, -100), new JPoint(val, 100)], {
				fillColor: 'none',
				dashPattern,
				strokeColor: '#000000'
			})
		}
	}

	drawArr(arrReg: ICellContainer[]) {
		arrReg.forEach((jsr: ICellContainer, id: number) => {
			let color: string;
			color = chroma.random().hex();

			this.drawCellMap(
				jsr,
				// createICellContainerFromCellArray(jsr.getLimitCells()),
				JCellToDrawEntryFunctions.colors({
					strokeColor: `${color}20`,
					fillColor: `${color}20`
				})
			)
		})
	}

	drawFondo(color?: string) {
		color = chroma.scale('Spectral').domain([1, 0])(0.05).hex();
		this.draw([new JPoint(-200, -100), new JPoint(-200, 100), new JPoint(200, 100), new JPoint(200, -100), new JPoint(-200, -100)], {
			strokeColor: color,
			fillColor: color
		})
	}

	/** uso del canvas */
	private get context(): CanvasRenderingContext2D {
		return this._cnvs.getContext('2d');
	}

	draw(points: JPoint[], ent: IDrawEntry): void {
		let len: number = points.length;

		this.context.beginPath();

		const initialPoint: JPoint = this._panzoom.convertPointToDrawer(points[len - 1]);
		//this.context.moveTo(initialPoint.x, initialPoint.y);
		for (let vert of points) {
			const vertex: JPoint = this._panzoom.convertPointToDrawer(vert);
			this.context.lineTo(vertex.x, vertex.y);
		}

		if (ent.dashPattern) this.context.setLineDash(ent.dashPattern);
		this.context.strokeStyle = ent.strokeColor;
		if (ent.strokeColor !== 'none') this.context.stroke();
		this.context.fillStyle = ent.fillColor;
		if (ent.fillColor !== 'none') this.context.fill();
		this.context.closePath();
	}

	saveDrawStream(fileName: string) {
		const out = fs.createWriteStream(`${this._dirPath}/${fileName}`);
		const stream = this._cnvs.createPNGStream();
		stream.pipe(out);
	}

	getBuffer(): Buffer[] { return this._cnvs.toBuffer() }

	saveDrawFile(fileName: string) {
		fs.writeFileSync(`${this._dirPath}/${fileName}`, this._cnvs.toBuffer());
	}

	/**/
	drawDot(p: JPoint, ent: IDrawEntry, w: number): void {

		let list: JPoint[] = [];

		list.push(new JPoint(p.x-w/2,p.y-w/2));
		list.push(new JPoint(p.x+w/2,p.y-w/2));
		list.push(new JPoint(p.x+w/2,p.y+w/2));
		list.push(new JPoint(p.x-w/2,p.y+w/2));

		this.draw(list, ent);
	}

	/**/
	clear() {
		this.context.clearRect(0, 0, this._cnvs.width, this._cnvs.height);
	}
}