import { Cell, Diagram, Halfedge, Edge, Vertex } from 'voronoijs';
import * as turf from '@turf/turf';
import JPoint, { JVector } from '../Geom/JPoint';
import JCell from "./JCell";
import JEdge from "./JEdge";
import JSite from './JSite';
import DataInformationFilesManager from '../DataInformationLoadAndSave';
// import { IJCellInformation } from './JCellInformation';
const dataInfoManager = DataInformationFilesManager.instance;


export default class JDiagram {
	// private _diagram: Diagram;
	private _cells: Map<number, JCell> = new Map<number, JCell>();
	private _vertices: JPoint[] = [];
	private _edges: JEdge[] = []; //cambiar

	constructor(d: Diagram) {
		console.log('Setting JDiagram values');
		console.time('set JDiagram values');

		this.setDiagramValuesContructed(d);

		console.timeEnd('set JDiagram values');
	}

	private setDiagramValuesContructed(d: Diagram): void {
		// setear sites
		let sites: Map<number, JSite> = new Map<number, JSite>();
		d.cells.forEach((c: Cell) => {
			const js: JSite = new JSite(c.site);
			sites.set(js.id, js);
		});
		// setear vertices
		let verticesMap = new Map<Vertex, JPoint>();
		d.vertices.forEach((v: Vertex) => {
			const p = new JPoint(v.x, v.y);
			this._vertices.push(p);
			verticesMap.set(v, p);
		})
		// setear edges
		JEdge.diagramSize = d.cells.length;
		let edgesMap = new Map<Edge, JEdge>();
		d.edges.forEach((e: Edge) => {
			// obtener vertices: va y vb
			let va: JPoint = verticesMap.get(e.va) as JPoint;
			let vb: JPoint = verticesMap.get(e.vb) as JPoint;

			// obtener los sites: lSite y rSite
			const ls: JSite = sites.get(e.lSite.id) as JSite;
			const rs: JSite | undefined = e.rSite ? sites.get(e.rSite.id) : undefined;

			let je = new JEdge({
				va: va,
				vb: vb,
				ls: ls,
				rs: rs
			});

			this._edges.push(je);
			edgesMap.set(e, je);
		})

		// setear cells
		// const loadedInfo: IJCellInformation[] = dataInfoManager.loadCellsInfo(d.cells.length);
		d.cells.forEach((c: Cell) => {
			const js: JSite = sites.get(c.site.id) as JSite;
			let arrEdges: JEdge[] = [];

			c.halfedges.forEach((he: Halfedge) => {
				const je: JEdge = edgesMap.get(he.edge) as JEdge;
				arrEdges.push(je)
			})

			// const info: IJCellInformation | undefined = loadedInfo[c.site.id];

			const cell = new JCell(/*c,*/ js, arrEdges/*info*/);
			this._cells.set(js.id, cell);
		});

		// if (loadedInfo.length === 0) {
			// this.smoothHeight();
			// dataInfoManager.saveCellsInfo(this._cells, this._cells.size);
		// }

		// dataInfoManager.saveDiagram(this.getInterface(), this._cells.size);
	}

	get sites(): JSite[] {
		let out: JSite[] = [];
		this._cells.forEach((c: JCell) => {
			out.push(c.site);
		})
		return out;
	}
	get vertices(): JPoint[] { return this._vertices }
	get edges(): JEdge[] { return this._edges }
	get cells(): Map<number, JCell> { return this._cells }

	forEachCell(func: (c: JCell) => void) {
		this._cells.forEach((c: JCell) => {
			func(c);
		})
	}

	getNeighbors(cell: JCell): JCell[] {
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

	getCellById(id: number): JCell | undefined {
		return this._cells.get(id);
	}

	getCellFromPoint(p: JPoint): JCell {
		// se puede verificar si el punto se encuentra en la cell
		let out: JCell | undefined;
		let minDis: number = Infinity;

		this._cells.forEach((vp: JCell) => {
			let c: JPoint = vp.center;
			let dis: number = JPoint.distance(c, p);
			if (dis < minDis) {
				out = vp;
				minDis = dis;
			}
		})
		if (out)
			return out;
		else {
			throw new Error('no se encontro cell');
		}
	}

	getNeighborsInWindow(cell: JCell, grades: number): JCell[] {
		this.forEachCell((cell: JCell) => cell.dismark())
		let out: JCell[] = [];
		const center: JPoint = cell.center;
		const polContainer = turf.polygon([[
			[center.x-grades, center.y-grades],
			[center.x-grades, center.y+grades],
			[center.x+grades, center.y+grades],
			[center.x+grades, center.y-grades],
			[center.x-grades, center.y-grades],
		]]);

		let qeue: Map<number, JCell> = new Map<number, JCell>();
		qeue.set(cell.id, cell);		
		
		while (qeue.size > 0) {
			let elem: JCell = qeue.entries().next().value[1];
			qeue.delete(elem.id)
			
			if (!turf.booleanDisjoint(polContainer, elem.toTurfPolygonSimple())) {
			// if (elem.center.x <= center.x + grades && elem.center.x >= center.x - grades &&
			// 	elem.center.y <= center.y + grades && elem.center.y >= center.y - grades ) {
				out.push(elem);
				elem.mark();
				this.getNeighbors(elem).forEach((neighElem: JCell) => {
					if (!neighElem.isMarked()) {
						qeue.set(neighElem.id, neighElem);
					}
				})
			}			
		}


		this.forEachCell((cell: JCell) => cell.dismark())
		//console.log(cell.id, 'out', out.length)

		return out;
	}

	getCellsInSegment(ini: JPoint, end: JPoint): JCell[] {
		let out: JCell[] = [];
		const iniCell: JCell = this.getCellFromPoint(ini);
		const endCell: JCell = this.getCellFromPoint(end);

		out.push(iniCell);
		let currCell = out[0];
		let finished: boolean = endCell.id === currCell.id;
		while (!finished) {
			let arr: { cell: JCell; dist: number }[] = [];
			this.getNeighbors(currCell).forEach((n: JCell) => {
				arr.push({ cell: n, dist: JPoint.geogDistance(n.center, end) });
				finished = true;
			})
			arr.sort((a, b) => a.dist - b.dist);

			out.push(arr[0].cell);

			currCell = arr[0].cell;
			finished = endCell.id === currCell.id;
		}
		// out.push(endCell);
		return out;
	}
}

