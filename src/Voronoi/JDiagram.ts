import { Cell, Diagram, Halfedge, Edge } from 'voronoijs';
import * as turf from '@turf/turf';
import Point, { IPoint } from '../Geom/Point';
import JCell from "./JCell";
import JEdge from "./JEdge";
import JSite from './JSite';
import JVertex from './JVertex';
import { ICellContainer, IVertexContainer } from '../containerInterfaces';

export default class JDiagram implements ICellContainer, IVertexContainer {
	// private _diagram: Diagram;
	private _cells: Map<number, JCell> = new Map<number, JCell>();
	private _cells2: Map<string, JCell> = new Map<string, JCell>();

	private _vertices: Map<string, JVertex> = new Map<string, JVertex>();
	private _edges: JEdge[] = []; //cambiar

	private _secAreaProm: number | undefined;

	constructor(d: Diagram, ancestor?: { d: JDiagram, a: number, s: { p: IPoint, cid: number }[] }) {
		console.log('Setting JDiagram values');
		console.time('set JDiagram values');
		JEdge.diagram = this;

		this.setDiagramValuesContructed(d);
		// ancestor data
		if (ancestor) {

			this._secAreaProm = ancestor.a;

			ancestor.s.forEach((value: { p: IPoint; cid: number; }) => {
				const subCell: JCell = this.getCellFromCenter(Point.fromInterface(value.p));
				const ancCell: JCell = ancestor.d.cells.get(value.cid) as JCell;

				ancCell.addSubCell(subCell);
			})

		}

		console.timeEnd('set JDiagram values');
	}

	private setDiagramValuesContructed(d: Diagram): void {

		if (d.cells.length == 0) throw new Error(`no hay cells`)
		// setear sites
		let sitesMap: Map<number, JSite> = new Map<number, JSite>();
		d.cells.forEach((c: Cell) => {
			const js: JSite = new JSite(c.site);
			sitesMap.set(js.id, js);
		});

		let edgesMap = new Map<string, JEdge>();
		let verticesPointMap = new Map<string, Point>();
		let verticesEdgeMap = new Map<string, JEdge[]>();
		d.edges.forEach((e: Edge) => {
			// obtener vertices: va y vb
			let vaId: string = Point.getIdfromVertex(e.va);
			if (!verticesPointMap.get(vaId)) {
				verticesPointMap.set(vaId, Point.fromVertex(e.va));
			}
			let va: Point = verticesPointMap.get(vaId) as Point;
			let vbId: string = Point.getIdfromVertex(e.vb);
			if (!verticesPointMap.get(vbId)) {
				verticesPointMap.set(vbId, Point.fromVertex(e.vb));
			}
			let vb: Point = verticesPointMap.get(vbId) as Point;

			// obtener los sites: lSite y rSite
			const ls: JSite = sitesMap.get(e.lSite.id) as JSite;
			const rs: JSite | undefined = e.rSite ? sitesMap.get(e.rSite.id) : undefined;

			let je = new JEdge({
				va: va,
				vb: vb,
				ls: ls,
				rs: rs
			});

			this._edges.push(je);
			edgesMap.set(je.id, je);
			//
			if (!verticesEdgeMap.get(vaId)) verticesEdgeMap.set(vaId, []);
			verticesEdgeMap.get(vaId)!.push(je);

			if (!verticesEdgeMap.get(vbId)) verticesEdgeMap.set(vbId, []);
			verticesEdgeMap.get(vbId)!.push(je);
		})
		// setear vertices
		verticesPointMap.forEach((p: Point) => {
			const edges: JEdge[] = verticesEdgeMap.get(p.id) as JEdge[];
			const jv: JVertex = new JVertex(p, edges);
			this._vertices.set(p.id, jv)
		})

		// setear cells
		d.cells.forEach((c: Cell) => {
			const js: JSite = sitesMap.get(c.site.id) as JSite;
			let arrEdges: JEdge[] = [];

			c.halfedges.forEach((he: Halfedge) => {
				const jeid: string = JEdge.getId(he.edge)
				const je: JEdge = edgesMap.get(jeid) as JEdge;
				arrEdges.push(je)
			})

			const cell = new JCell(/*c,*/ js, arrEdges/*info*/);
			this._cells.set(js.id, cell);
			this._cells2.set(js.point.id, cell);
		});
	}

	get secAreaProm(): number | undefined { return this._secAreaProm }

	get sites(): JSite[] {
		let out: JSite[] = [];
		this._cells.forEach((c: JCell) => {
			out.push(c.site);
		})
		return out;
	}

	get vertices(): Map<string, JVertex> { return this._vertices }

	get cells(): Map<number, JCell> { return this._cells }
	// getCellsMapStringKey(): Map<string, JCell> {
	// 	return this._cells2;
	// }

	forEachCell(func: (c: JCell) => void) {
		this._cells.forEach((c: JCell) => {
			func(c);
		})
	}

	forEachVertex(func: (v: JVertex) => void) {
		this._vertices.forEach((v: JVertex) => {
			func(v);
		})
	}

	getCellNeighbours(cell: JCell): JCell[] { // cambiar a getCellNeighbours
		let out: JCell[] = [];
		for (let id of cell.neighborsId) {
			const n: JCell | undefined = this._cells.get(id);
			if (n)
				out.push(n);
			else
				throw new Error('cell tiene neghbor que no existe');
		}
		return out;
	}

	getTwoLevelsCellNeighbours(cell: JCell): JCell[] {
		let mapOut: Map<number, JCell> = new Map<number, JCell>();
		let ns: JCell[] = this.getCellNeighbours(cell);
		ns.forEach((neig: JCell) => {
			mapOut.set(neig.id, neig);
			this.getCellNeighbours(neig).forEach((nn: JCell) => {
				if (cell.id !== nn.id)
					mapOut.set(nn.id, nn);
			})
		})
		let out: JCell[] = [];
		mapOut.forEach((c: JCell) => { out.push(c) })
		return out;
	}

	getCellsAssociated(v: JVertex) {
		let out: JCell[] = [];
		for (let id of v.cellIds) {
			const n: JCell | undefined = this._cells.get(id);
			if (n)
				out.push(n);
			else
				throw new Error('vertex tiene cell que no existe');
		}
		return out;
	}

	getVertexNeighbours(v: JVertex): JVertex[] {
		let out: JVertex[] = [];
		for (let vid of v.neighborsId) {
			const vn: JVertex | undefined = this._vertices.get(vid)
			if (vn)
				out.push(vn);
			else
				throw new Error('vertex tiene neghbor que no existe');
		}
		return out;
	}

	getVerticesAssociated(cell: JCell): JVertex[] {
		let out: JVertex[] = [];
		for (let vid of cell.verticesId) {
			const vn: JVertex | undefined = this._vertices.get(vid)
			if (vn)
				out.push(vn);
			else
				throw new Error('cell tiene vertex que no existe');
		}
		return out;
	}

	getCellById(id: number): JCell | undefined {
		return this._cells.get(id);
	}

	getCellFromPoint(p: Point): JCell {
		// se puede verificar si el punto se encuentra en la cell
		let out: JCell | undefined;
		let minDis: number = Infinity;

		this._cells.forEach((vp: JCell) => {
			let c: Point = vp.center;
			let dis: number = Point.distance(c, p);
			if (dis < minDis) {
				out = vp;
				minDis = dis;
			}
		})
		if (out)
			return out;
		else {
			console.log('cells', this._cells.size)
			throw new Error('no se encontro cell');
		}
	}

	getVertexFromPoint(p: Point): JVertex {
		let out: JVertex | undefined;
		const cellAso: JCell = this.getCellFromPoint2(p);
		let minDis: number = Infinity;

		this.getVerticesAssociated(cellAso).forEach((vp: JVertex) => {
			let dis: number = Point.distance(vp.point, p);
			if (dis < minDis) {
				out = vp;
				minDis = dis;
			}
		})
		if (out)
			return out;
		else {
			console.log('cells', this._cells.size)
			throw new Error('no se encontro cell');
		}
	}

	getCellFromPoint2(p: Point): JCell {
		let out: JCell | undefined;
		let founded: boolean = false;
		let i: number = 0;
		while (!founded && i < this._cells.size) {
			if (turf.booleanPointInPolygon(turf.point(p.toTurfPosition()), this._cells.get(i)!.toTurfPolygonSimple())) {
				out = this._cells.get(i);
				founded = true;
			}
			i++;
		}
		if (out)
			return out;
		else {
			throw new Error('no se encontro cell');
		}
	}

	getCellFromCenter(p: Point): JCell {
		let out: JCell | undefined;
		out = this._cells2.get(p.id);
		if (out)
			return out;
		else {
			throw new Error('no se encontro cell');
		}
	}
	/*
	getNeighborsInWindow(cell: JCell, grades: number): JCell[] { // mejorar esta funcion

		let out: JCell[] = [];
		const center: JPoint = cell.center;
		const polContainer = turf.polygon([[
			[center.x - grades, center.y - grades],
			[center.x - grades, center.y + grades],
			[center.x + grades, center.y + grades],
			[center.x + grades, center.y - grades],
			[center.x - grades, center.y - grades],
		]]);

		let qeue: Map<number, JCell> = new Map<number, JCell>();
		qeue.set(cell.id, cell);

		while (qeue.size > 0) {
			let elem: JCell = qeue.entries().next().value[1];
			qeue.delete(elem.id)

			if (!turf.booleanDisjoint(polContainer, elem.toTurfPolygonSimple())) {
				out.push(elem);
				elem.mark();
				this.getCellNeighbours(elem).forEach((neighElem: JCell) => {
					if (!neighElem.isMarked()) {
						qeue.set(neighElem.id, neighElem);
					}
				})
			}
		}

		this.dismarkAllCells();

		return out;
	}
	*/
	/*
	getNeighboursInRadius(cell: JCell, radiusInKm: number): JCell[] { // mejorar esta funcion
		let out: JCell[] = [];
		const center: JPoint = cell.center;

		let qeue: Map<number, JCell> = new Map<number, JCell>();
		qeue.set(cell.id, cell);

		while (qeue.size > 0) {
			let elem: JCell = qeue.entries().next().value[1];
			qeue.delete(elem.id)

			if (JPoint.geogDistance(elem.center, center) < radiusInKm) {
				out.push(elem);
				elem.mark();
				this.getCellNeighbours(elem).forEach((neighElem: JCell) => {
					if (!neighElem.isMarked()) {
						qeue.set(neighElem.id, neighElem);
					}
				})
			}
		}

		this.dismarkAllCells();

		return out;
	}
	*/
	getCellsInSegment(ini: Point, end: Point, condFunc: (c: JCell) => boolean = (_) => true): JCell[] { // tratar de implementar dijkstra
		let out: JCell[] = [];
		const iniCell: JCell = this.getCellFromPoint(ini);
		const endCell: JCell = this.getCellFromPoint(end);

		out.push(iniCell);
		let currCell = iniCell;
		let finished: boolean = endCell.id === currCell.id;
		while (!finished) {
			let arr: { cell: JCell; dist: number }[] = [];
			this.getCellNeighbours(currCell).forEach((n: JCell) => {
				if (condFunc(n) && !n.isMarked())
					arr.push({ cell: n, dist: Point.geogDistance(n.center, end) });
			})
			if (arr.length == 0) {
				finished = true;
			} else {
				arr.sort((a, b) => a.dist - b.dist); // puede simplificarse

				currCell = arr[0].cell;
				out.push(currCell);
				currCell.mark();

				finished = endCell.id === currCell.id;
			}
		}
		this.dismarkAllCells();
		return out;
	}

	getVerticesInSegment(ini: Point, end: Point, condFunc: (v: JVertex) => boolean = (_) => true): JVertex[] {
		let out: JVertex[] = [];
		const iniVertex: JVertex = this.getVertexFromPoint(ini);
		const endVertex: JVertex = this.getVertexFromPoint(end);

		out.push(iniVertex);
		let currVertex = iniVertex;
		let finished: boolean = endVertex.id === currVertex.id;
		while (!finished) {
			let arr: { vertex: JVertex; dist: number }[] = [];
			this.getVertexNeighbours(currVertex).forEach((n: JVertex) => {
				if (condFunc(n) && !n.isMarked())
					arr.push({ vertex: n, dist: Point.geogDistance(n.point, end) });
			})
			if (arr.length == 0) {
				finished = true;
			} else {
				arr.sort((a, b) => a.dist - b.dist); // puede simplificarse

				currVertex = arr[0].vertex;
				out.push(currVertex);
				currVertex.mark();

				finished = endVertex.id === currVertex.id;
			}
		}
		this.dismarkAllVertices();
		return out;
	}

	dismarkAllCells(): void {
		this.forEachCell((c: JCell) => {
			c.dismark();
		})
	}
	dismarkAllVertices(): void {
		this.forEachVertex((v: JVertex) => {
			v.dismark();
		})
	}

	getSubSites(AREA: number): { p: IPoint, cid: number }[] {
		let out: { p: IPoint, cid: number }[] = [];
		this.forEachCell((cell: JCell) => {
			let b: boolean = false;
			this.getTwoLevelsCellNeighbours(cell).forEach((nc: JCell) => b = b || nc.info.isLand)
			if (b || cell.info.isLand) {
				const ss: Point[] = cell.getSubSites(AREA);
				ss.forEach((p: Point) => out.push({ p: p.getInterface(), cid: cell.id }));
			}
			else
				out.push({ p: cell.center.getInterface(), cid: cell.id })
		})
		return out;
	}

}