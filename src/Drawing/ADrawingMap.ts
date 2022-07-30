import * as JCellToDrawEntryFunctions from './JCellToDrawEntryFunctions'
import chroma from 'chroma-js';
import Point, { IPoint } from '../Geom/Point';
import JCell from '../BuildingModel/Voronoi/JCell';
import RegionMap from '../BuildingModel/MapContainerElements/RegionMap';
import { ICellContainer, IEdgeContainer, IVertexContainer } from '../BuildingModel/MapContainerElements/containerInterfaces';
import JVertex from '../BuildingModel/Voronoi/JVertex';
import JEdge from '../BuildingModel/Voronoi/JEdge';
import turf from '../Geom/turf';
import { inRange } from '../Geom/basicGeometryFunctions';
import IDrawingParameters from './IDrawingParameters';
import APanzoom, { IAPanzoom } from './APanzoom';

export default abstract class ADrawingMap<I, P extends APanzoom> {
	private _size: IPoint;
	private _panzoom: P;

	constructor(SIZE: IPoint, panzoom: P) {
		this._size = SIZE;
		this._panzoom = panzoom;
	}

	get size(): IPoint { return this._size; }
	get panzoom(): P { return this._panzoom }


	abstract getCenterPan(): IPoint;
	abstract setCenterpan(p: IPoint): void;

	get zoomValue(): number { return this._panzoom.zoomValue; }

	setZoomValue(n: number) {
		this._panzoom.zoomValue = n;
	}


	getPointsBuffDrawLimits(): IPoint[] {
		return this._panzoom.pointsBuffDrawLimits;
	}

	getPointsBuffCenterLimits(): IPoint[] {
		return this._panzoom.pointsBuffCenterLimits;
	}

	/**navigation */
	zoomIn() {
		const center: IPoint = this.getCenterPan();
		this.setZoomValue(this.zoomValue + 1);
		this.setCenterpan(center);
	}
	zoomOut() {
		const center: IPoint = this.getCenterPan();
		this.setZoomValue(this.zoomValue - 1);
		this.setCenterpan(center);
	}
	toTop() {
		this.setCenterpan(new Point(
			this.getCenterPan().x,
			this.getCenterPan().y - this._panzoom.getYstep()
		));
	}
	toBottom() {
		this.setCenterpan(new Point(
			this.getCenterPan().x,
			this.getCenterPan().y + this._panzoom.getYstep()
		));
	}
	toRight() {
		this.setCenterpan(new Point(
			this.getCenterPan().x + this._panzoom.getXstep(),
			this.getCenterPan().y
		));
	}
	toLeft() {
		this.setCenterpan(new Point(
			this.getCenterPan().x - this._panzoom.getXstep(),
			this.getCenterPan().y
		));
	}

	getPanzoomForReg(reg: RegionMap, auxPanzoom: P): IAPanzoom {
		let ok: boolean = true;
		let zoom = 0;
		const datDM = reg.getDrawerParameters();
		while (ok) {
			zoom++;
			auxPanzoom.zoomValue = zoom;
			ok =
				(auxPanzoom.pointsBuffDrawLimits[2].x - auxPanzoom.pointsBuffDrawLimits[1].x) > datDM.XMAXDIS &&
				(auxPanzoom.pointsBuffDrawLimits[1].y - auxPanzoom.pointsBuffDrawLimits[0].y) > datDM.YMAXDIS &&
				zoom !== 21
		}
		return {
			zoom: zoom - 1,
			center: datDM.center
		}
	}

	private getPolygonContainer(): turf.Feature<turf.Polygon> {
		return turf.polygon(
			[this.getPointsBuffDrawLimits().map((p: IPoint) => [p.x, p.y])]
		)
	}

	drawCellContainer(cc: ICellContainer, func: (c: JCell) => IDrawingParameters): I[] {
		let out: I[] = [];
		const polContainer = this.getPolygonContainer();
		cc.forEachCell((c: JCell) => {
			if (!turf.booleanDisjoint(polContainer, c.toTurfPolygonSimple())) {
				const points: IPoint[] = (this.zoomValue < 8) ? c.voronoiVertices : c.allVertices;
				const res = this.draw(points, func(c));
				if (typeof res == 'string') out.push(res);
			}
		});
		return out;
	}

	drawEdgeContainer(vc: IEdgeContainer, func: (e: JEdge) => IDrawingParameters): I[] {
		let out: I[] = [];
		const polContainer = this.getPolygonContainer();
		vc.forEachEdge((edge: JEdge) => {
			if (!turf.booleanDisjoint(polContainer, edge.toTurfLineString())) {
				const points: IPoint[] = (this.zoomValue < 8) ? [edge.vpA, edge.vpB] : edge.points;
				const res = this.draw(points, { ...func(edge), fillColor: 'none' });
				if (typeof res == 'string') out.push(res);
			}
		})
		return out;
	}

	drawVertexContainer(vc: IVertexContainer, vde: /*func: (v: JVertex) =>*/ IDrawingParameters): I | undefined {
		const polContainer = this.getPolygonContainer();

		let lsin: turf.Position[] = [];
		vc.forEachVertex((v: JVertex) => lsin.push([v.point.x, v.point.y]));
		const lineString: turf.Feature<turf.LineString> = turf.lineString(lsin);

		if (!turf.booleanDisjoint(polContainer, lineString)) {
			const points: IPoint[] = [];
			if (this.zoomValue < 8) {
				vc.forEachVertex((v: JVertex) => points.push(v.point));
			}
			return this.draw(points, vde);
		}
	}


	drawMeridianAndParallels(cantMer: number = 19, cantPar: number = 37): I[] {
		let out: I[] = [];
		// meridianos
		for (let i = 0; i < cantMer; i++) {
			const val = 180 / (cantMer - 1) * (i) - 90;
			const dashPattern = (val === 0) ? [1, 0] : [5, 5]
			const res = this.draw([new Point(-200, val), new Point(200, val)], {
				fillColor: 'none',
				dashPattern,
				strokeColor: '#000000'
			})
			if (typeof res == 'string') out.push(res);
		}
		// paralelos
		for (let i = 0; i < cantPar; i++) {
			const val = 360 / (cantPar - 1) * (i) - 180;
			const dashPattern = (val === 0) ? [1] : [5, 5]
			const res = this.draw([new Point(val, -100), new Point(val, 100)], {
				fillColor: 'none',
				dashPattern,
				strokeColor: '#000000'
			})
			if (typeof res == 'string') out.push(res);
		}
		return out;
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

	drawBackground(color?: string): I {
		color = color || chroma.scale('Spectral').domain([1, 0])(0.05).hex();
		return this.draw(
			[
				{ x: -200, y: -100 }, { x: -200, y: 100 }, { x: 200, y: 100 }, { x: 200, y: -100 },
			], {
			strokeColor: color,
			fillColor: color
		}
		)
	}

	abstract draw(points: IPoint[], ent: IDrawingParameters): I;
	abstract drawDot(p: IPoint, ent: IDrawingParameters, w: number): I;

	clear(zoomValue: number = 0, center: IPoint = { x: 0, y: 0 }) {
		this.setZoomValue(zoomValue);
		this.setCenterpan(center);
	}
}