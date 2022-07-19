// import * as PImage from 'pureimage';
import { Canvas, CanvasRenderingContext2D, createCanvas } from 'canvas';
import fs from 'fs';
import * as turf from '@turf/turf';
import * as JCellToDrawEntryFunctions from '../JCellToDrawEntryFunctions'
import chroma from 'chroma-js';

import JPoint from '../Geom/JPoint';

import JCell from '../Voronoi/JCell';
import RegionMap from '../RegionMap/RegionMap';
import JPanzoom from './JPanzoom';
import { inRange } from '../utilFunctions';
import { ICellContainer, IEdgeContainer, IVertexContainer } from '../generalInterfaces';
import JVertex from '../Voronoi/JVertex';
import LineMap from '../RegionMap/LineMap';
import JEdge from '../Voronoi/JEdge';
// import { Bitmap } from 'pureimage/types/bitmap';
// import { Context } from 'pureimage/types/context';

export interface IDrawEntry {
	fillColor: string | 'none';
	strokeColor: string | 'none';
	dashPattern?: number[];
	drawType?: 'line' | 'polygon'
}

export default class DrawerMap {

	private _size: JPoint;
	private _cnvs: Canvas;
	// private _cnvs: Bitmap;

	private _panzoom: JPanzoom;
	private _dirPath: string;

	constructor(SIZE: JPoint, dirPath: string) {
		this._size = SIZE;
		this._cnvs = createCanvas(SIZE.x, SIZE.y);
		// this._cnvs = PImage.make(SIZE.x, SIZE.y, {});

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
	get zoomValue(): number {	return this._panzoom.zoom; }

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

	calculatePanzoomForReg(reg: RegionMap) {
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

	private getPolygonContainer(): turf.Feature<turf.Polygon> {
		return turf.polygon(
			[this.getPointsBuffDrawLimits().map((p: JPoint) => p.toTurfPosition())]
		)
	}
	
	drawCellContainer(cc: ICellContainer, func: (c: JCell) => IDrawEntry): void {
		const polContainer = this.getPolygonContainer();
		cc.forEachCell((c: JCell) => {
			if (!turf.booleanDisjoint(polContainer, c.toTurfPolygonSimple())) {
				const points: JPoint[] = (this.zoomValue < 8) ? c.voronoiVertices : c.allVertices;
				this.draw(points, func(c));
			}
		});
	}

	drawEdgeContainer(vc: IEdgeContainer, func: (e: JEdge) => IDrawEntry) {
		const polContainer = this.getPolygonContainer();
		vc.forEachEdge((edge: JEdge) => {
			if (!turf.booleanDisjoint(polContainer, edge.toTurfLineString())) {
				const points: JPoint[] = (this.zoomValue < 8) ? [edge.vertexA, edge.vertexB] : edge.points;
				this.draw(points, {...func(edge), fillColor: 'none'});					
			}
		})
	}

	drawVertexContainer(vc: IVertexContainer, vde: /*func: (v: JVertex) =>*/ IDrawEntry) { 
		const polContainer = this.getPolygonContainer();

		let lsin: turf.Position[] = [];
		vc.forEachVertex((v: JVertex) => lsin.push(v.point.toTurfPosition()));
		const lineString: turf.Feature<turf.LineString> = turf.lineString(lsin);
		
		if (!turf.booleanDisjoint(polContainer, lineString)) {
			const points: JPoint[] = [];
			if(this.zoomValue < 8) {
				vc.forEachVertex((v: JVertex) => points.push(v.point));
			}
			this.draw(points, vde);
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

	drawArr(arrReg: ICellContainer[], alpha: number) {
		arrReg.forEach((jsr: ICellContainer, _id: number) => {
			alpha = inRange(alpha, 0, 1);
			let color: string;
			color = chroma.random().alpha(alpha).hex();

			this.drawCellContainer(
				jsr,
				// createICellContainerFromCellArray(jsr.getLimitCells()),
				JCellToDrawEntryFunctions.colors({
					strokeColor: `${color}`,
					fillColor: `${color}`
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
	// private get context(): Context {
		return this._cnvs.getContext('2d');
	}

	draw(points: JPoint[], ent: IDrawEntry): void {
		// let len: number = points.length;

		let context: CanvasRenderingContext2D = this.context;
		// let context: Context = this.context;

		context.beginPath();

		// const initialPoint: JPoint = this._panzoom.convertPointToDrawer(points[len - 1]);
		// context.moveTo(initialPoint.x, initialPoint.y);
		for (let point of points) {
			const p: JPoint = this._panzoom.convertPointToDrawer(point);
			// console.log(p)
			context.lineTo(p.x, p.y);
		}

		if (ent.dashPattern) context.setLineDash(ent.dashPattern);
		context.strokeStyle = ent.strokeColor;
		if (ent.strokeColor !== 'none') context.stroke();
		context.fillStyle = ent.fillColor;
		if (ent.fillColor !== 'none') context.fill();
		context.closePath();
	}

	saveDrawStream(fileName: string) {
		const out = fs.createWriteStream(`${this._dirPath}/${fileName}`);
		const stream = this._cnvs.createPNGStream();
		stream.pipe(out);
	}

	getBuffer(): Buffer { return this._cnvs.toBuffer() }

	saveDrawFile(fileName: string) {
		fs.writeFileSync(`${this._dirPath}/${fileName}`, this.getBuffer());
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
	clear(zoomValue: number = 0, center: JPoint = new JPoint(0,0)) {
		this.setZoom(zoomValue);
		this.setCenterpan(center);
		this.context.clearRect(0, 0, this._cnvs.width, this._cnvs.height);
	}
}