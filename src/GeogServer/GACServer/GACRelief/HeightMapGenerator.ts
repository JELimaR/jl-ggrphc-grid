import InformationFilesManager from "../../DataFileLoadAndSave/InformationFilesManager";
import JCellHeight, { IJCellHeightInfo } from "../../../BuildingModel/Voronoi/CellInformation/JCellHeight";
import JDiagram from "../../../BuildingModel/Voronoi/JDiagram";
import JVertexHeight, { IJVertexHeightInfo } from "../../../BuildingModel/Voronoi/VertexInformation/JVertexHeight";
import MapGenerator from "../MapGenerator";
import JCell from "../../../BuildingModel/Voronoi/JCell";
import JVertex from "../../../BuildingModel/Voronoi/JVertex";
import RandomNumberGenerator from "../../../Geom/RandomNumberGenerator";
import Point from "../../../Geom/Point";
import AzgaarReaderData from "../../DataFileLoadAndSave/AzgaarReaderData";

class JOceanMap {}
class JLakeMap {}

export default class HeightMapGenerator extends MapGenerator<void> {

	private _ancestor: JDiagram | undefined;

	// private _islands: IslandMap[] = [];

	constructor(d: JDiagram, a?: JDiagram) {
		super(d);
		this._ancestor = a;
	}

	generate() {
		const ifm = InformationFilesManager.instance;
		const a = this._ancestor;
		/*
		 * height cells
		 */
		console.log('calculate and setting height');
		console.time(`${a ? 's' : 'p'}-set height info`);
		// ver como se debe hacer esto
		// let loadedHeightInfo: IJCellHeightInfo[] = dataInfoManager.loadCellsHeigth(this.diagram.secAreaProm);
		let loadedHeightInfo: IJCellHeightInfo[] = ifm.loadMapElementData<IJCellHeightInfo, JCellHeight>(this.diagram.secAreaProm, JCellHeight.getTypeInformationKey());

		const isLoaded: boolean = loadedHeightInfo.length !== 0;
		if (!isLoaded) {
			if (a) {
				loadedHeightInfo = this.getCellsDataFromAncestor(a);
			} else {
				loadedHeightInfo = this.getCellsData();
			}
		}
		loadedHeightInfo.forEach((hinf: IJCellHeightInfo) => {
			const cell: JCell = this.diagram.getCellById(hinf.id) as JCell;
			cell.info.setHeightInfo(hinf);
		})
		this.diagram.forEachCell((c: JCell) => {
			if (!c.info.cellHeight) console.log(c.info.cellHeight)
		})

		// other cells calcs
		if (!isLoaded) {
			console.log('set ocean and lake cells')
			this.setOceanTypeCell();
			this.setLakeTypeCell();
			console.log('resolving cells depressions');
			console.time(`${a ? 's' : 'p'}-resolve cells depressions`)
			this.resolveCellsDepressions();
			console.timeEnd(`${a ? 's' : 'p'}-resolve cells depressions`)
			if (!!a) this.smootData()

			// dataInfoManager.saveCellsHeigth(this.diagram.cells, this.diagram.secAreaProm);
			const heightArr: JCellHeight[] = [...this.diagram.cells.values()].map((cell: JCell) => cell.info.cellHeight)
			ifm.saveMapElementData<IJCellHeightInfo, JCellHeight>(heightArr, this.diagram.secAreaProm, JCellHeight.getTypeInformationKey());
		}

		// vertices
		// let loadedVertexInfo: IJVertexHeightInfo[] = dataInfoManager.loadVerticesHeigth(this.diagram.secAreaProm);
		let loadedVertexInfo: IJVertexHeightInfo[] = ifm.loadMapElementData<IJVertexHeightInfo, JVertexHeight>(this.diagram.secAreaProm, JVertexHeight.getTypeInformationKey());
		const isVertexLoaded: boolean = loadedVertexInfo.length !== 0;
		if (!isVertexLoaded) {
			loadedVertexInfo = this.getVertexValues();
		}

		loadedVertexInfo.forEach((info: IJVertexHeightInfo) => {
			const vertex: JVertex = this.diagram.vertices.get(info.id) as JVertex;
			if (!vertex) console.log(this.diagram.vertices.size)
			vertex.info.setHeightInfo(info);
		})

		// other vertex calcs
		if (!isVertexLoaded) {
			console.log('resolving vertices depressions');
			console.time(`${a ? 's' : 'p'}-resolve vertices depressions`)
			this.resolveVertexDepressions();
			console.timeEnd(`${a ? 's' : 'p'}-resolve vertices depressions`)
			
			// dataInfoManager.saveVerticesHeigth(this.diagram.vertices, this.diagram.secAreaProm);
			const verticesArr: JVertexHeight[] = [...this.diagram.vertices.values()].map((vertex: JVertex) => vertex.info.vertexHeight)
			ifm.saveMapElementData<IJVertexHeightInfo, JVertexHeight>(verticesArr, this.diagram.secAreaProm, JVertexHeight.getTypeInformationKey());
		}

		console.timeEnd(`${a ? 's' : 'p'}-set height info`);

	}

	private getCellsData(): IJCellHeightInfo[] {
		let out: IJCellHeightInfo[] = [];
		const ard: AzgaarReaderData = AzgaarReaderData.instance;
		const azgaarHeight = ard.hs();
		azgaarHeight.forEach((elem: { id: number, x: number, y: number, h: number }) => {
			const cellId = this.diagram.getCellFromCenter(new Point(elem.x, elem.y)).id;
			out.push({
				id: cellId,
				prevHeight: 0, // ya no se usa
				height: elem.h,
				heightType: 'land',
				islandId: -1,
			});
		})
		return out;
	}

	private getCellsDataFromAncestor(ancestor: JDiagram): IJCellHeightInfo[] {
		let out: IJCellHeightInfo[] = [];
		ancestor.forEachCell((cell: JCell) => {
			const randFunc = RandomNumberGenerator.makeRandomFloat(this.diagram.cells.size);
			const hinf: IJCellHeightInfo = cell.info.getHeightInfo()!;
			cell.subCells.forEach((sc: JCell) => {
				let h: number = hinf.height * (1.05 - 0.1 * randFunc());
				if (h > 0.2 && hinf.height <= 0.2) h = hinf.height;
				if (h <= 0.2 && hinf.height > 0.2) h = hinf.height;
				out.push({...hinf, id: sc.id, height: h, heightType: 'land' });
			})
		})
		return out;
	}

	private getVertexValues(): IJVertexHeightInfo[] {
		let out: IJVertexHeightInfo[] = [];
		this.diagram.forEachVertex((vertex: JVertex) => {
			let info: IJVertexHeightInfo// = { id: vertex.id, height: 0, heightType: 'ocean' }
			let hmin: number = 2, hprom: number = 0;
			let cantLand: number = 0, cantOcean: number = 0, cantLake: number = 0;
			const cells: JCell[] = this.diagram.getCellsAssociated(vertex);
			cells.forEach((c: JCell) => {
				const ch = c.info.cellHeight;
				if (ch.heightType == 'land') {
					cantLand++
					if (hmin > ch.height) hmin = ch.height
				}
				else if (ch.heightType == 'lake') cantLake++;
				else cantOcean++;
				hprom += ch.height;
			})
			if (cantOcean == 0 && cantLake == 0) {
				if (hmin == 0) console.log(vertex.id, cantLand)
				info = {
					id: vertex.id,
					height: (hmin - 0.005 < 0.2) ? (hmin - 0.2) * 0.5 + 0.20001 : hmin - 0.005, // siempre mayor a 0.2
					heightType: 'land'
				}
			}
			else if (cantLand == 0) {
				info = { id: vertex.id, height: hprom / cells.length, heightType: (cantOcean > 0) ? 'ocean' : 'lake' }
			}
			else {
				info = { id: vertex.id, height: 0.2, heightType: (cantOcean > 0) ? 'coast' : 'lakeCoast' }
			}

			out.push(info);
		})

		return out;
	}

	private resolveVertexDepressions() {
		let verticesArr: JVertex[] = [];
		this.diagram.forEachVertex((v: JVertex) => {
			if (v.info.vertexHeight.heightType == 'land') {
				verticesArr.push(v);
			}
		})
		let hay = true, it: number = 0;
		while (/*it < 100 &&*/ hay) {
			hay = false;
			let cantHayIt: number = 0;
			verticesArr.forEach((v: JVertex) => {
				const mhn = this.getMinHeightVertexNeighbour(v);
				if (mhn.info.height >= v.info.height) {
					hay = true;
					const nh = mhn.info.height + 0.00022;
					const difH = nh - v.info.height;
					v.info.height = nh;
					// const difH = 0.00022//(mhn.info.height - v.info.height)*3.04;
					// v.info.height = v.info.height + difH;
					this.diagram.getCellsAssociated(v).forEach((c: JCell) => c.info.height = c.info.height + difH);
					cantHayIt++;
				}
			})
			it++;
			if (it % 5 == 0) {
				console.log(`hay ${cantHayIt} depresiones y van ${it} iteraciones`)
			}
		}
		console.log('------------------------')
		console.log(`iteraciones: ${it}`)
	}

	private getMinHeightVertexNeighbour(vertex: JVertex): JVertex {
			const narr: JVertex[] = this.diagram.getVertexNeighbours(vertex);
			let out: JVertex = narr[0], minH = 2;
			narr.forEach((nc: JVertex) => {
				if (nc.info.height < minH && vertex.id !== nc.id) { // la segunda condicion se debe a que un vertex puede ser vecino de si mismo
					out = nc;
					minH = nc.info.height;
				}
			})
			return out;
		}

	private resolveCellsDepressions() {
		let cellArr: JCell[] = [];
		this.diagram.forEachCell((c: JCell) => {
			if (c.info.cellHeight.heightType === 'land') {
				cellArr.push(c);
			}
		})
		let hay = true, it: number = 0;
		while (/*it < 2000 &&*/ hay) {
			hay = false;
			let cantHayIt: number = 0;
			cellArr.forEach((c: JCell) => {
				const mhn = this.getMinHeightCellNeighbour(c);
				if (mhn.info.height >= c.info.height) {
					hay = true;
					c.info.height = mhn.info.height /*c.info.height /*(mhn.info.height - c.info.height)*/ + 0.000122;
					cantHayIt++;
				}
			})
			it++;

			if (it % 10 == 0) {
				console.log(`hay ${cantHayIt} depresiones y van ${it} iteraciones`)
			}
		}
		console.log('------------------------')
		console.log(`iteraciones: ${it}`)
	}

	private getMinHeightCellNeighbour(cell: JCell): JCell {
		const narr: JCell[] = this.diagram.getCellNeighbours(cell);
		let out: JCell = narr[0], minH = 2;
		narr.forEach((nc: JCell) => {
			if (nc.info.height < minH ) {
				out = nc;
				minH = nc.info.height;
			}
		})
		return out;
	}


	private setOceanTypeCell() {
		const initCell = this.diagram.getCellFromPoint(new Point(-180, 0));
		if (initCell.info.height > 0.2) throw new Error('en initCell de ocean type');

		let lista: JCell[] = [initCell];
		initCell.mark();
		let times: number = 0;
		while (lista.length > 0 && times < this.diagram.cells.size) {
			times++;
			const currCell: JCell = lista.shift() as JCell;
			currCell.info.cellHeight.heightType = 'ocean';
			this.diagram.getCellNeighbours(currCell).forEach((neig: JCell) => {
				if (!neig.isMarked() && neig.info.height <= 0.20) {
					lista.push(neig);
					neig.mark();
				}
			})
		}

		console.log('times', times);

		this.diagram.dismarkAllCells();
	}

	private setLakeTypeCell() {
		this.diagram.forEachCell((c: JCell) => {
			if (c.info.height <= 0.2 && c.info.cellHeight.heightType !== 'ocean') {
				c.info.cellHeight.heightType = 'lake';
			}
		})
	}
/*
	private getOceanCoastCell() {
		let out: JCell[] = [];
		this._islands.forEach((isl: IslandMap) => {
			let add: boolean = false;
			isl.getLimitCells().forEach((c: JCell) => {
				this.diagram.getCellNeighbours(c).forEach((nc: JCell) => {
					add = add || nc.info.cellHeight.heightType === 'ocean';
				})
				if (add) out.push(c);
			})
		})
		return out;
	}
*/
	private smootData() {
		this.diagram.forEachCell((c: JCell) => {
			c.mark();
			let h: number = 0, cant = 0;
			this.diagram.getCellNeighbours(c).forEach((n: JCell) => {
				cant++;
				h += (n.isMarked()) ? n.info.prevHeight : n.info.height;
			})
			c.info.height = 0.5 * h / cant + 0.5 * c.info.height;
		})
		
		this.diagram.dismarkAllCells();
	}

	/***************************************************************************** */
	// get islands() { return this._islands }
/*
	get landRegion(): RegionMap {
		let out: RegionMap = new RegionMap(this.diagram);
		this._islands.forEach((isl: IslandMap) => {
			out.addRegion(isl);
		})
		return out;
	}
*/
	/*
	private generateIslandList(): IslandMap[] {
		/**
		 * no calcula bien cuando debe calcular los datos de height
		 * /
		let out: IslandMap[] = [];
		let lista: Map<number, JCell> = new Map<number, JCell>();
		this.diagram.forEachCell((c: JCell) => {
			if (c.info.isLand) lista.set(c.id, c);
		})

		let currentId = -1;
		while (lista.size > 0) {
			currentId++;
			const cell: JCell = lista.entries().next().value[1];
			// cell.mark();
			// lista.delete(cell.id);

			let isl: IslandMap = new IslandMap(currentId, this.diagram);
			// isl.addCell(cell);
			// cell.info.islandId = isl.id; // nuevo

			let nqeue: Map<number, JCell> = new Map<number, JCell>();
			// this.diagram.getCellNeighbours(cell).forEach((ncell: JCell) => nqeue.set(ncell.id, ncell) );
			nqeue.set(cell.id, cell)

			console.log('island:', currentId);
			let times: number = 0;
			while (nqeue.size > 0 && times < this.diagram.cells.size) {
				times++;
				const neigh: JCell = nqeue.entries().next().value[1];
				nqeue.delete(neigh.id);
				lista.delete(neigh.id);
				neigh.mark();
				isl.addCell(neigh);
				neigh.info.islandId = isl.id; // nuevo

				this.diagram.getCellNeighbours(neigh).forEach((nnn: JCell) => {
					if (nnn.info.isLand && !nnn.isMarked() && !nqeue.has(nnn.id)) {
						nqeue.set(nnn.id, nnn);
					}
				})
				if (isl.cells.size % 10000 == 0) console.log('island:', currentId, `hay ${isl.cells.size}`)
			}

			if (nqeue.size > 0) throw new Error(`se supero el numero de cells: ${this.diagram.cells.size} en generateIslandList`)
			console.log('area:', isl.area.toLocaleString('de-DE'));
			console.timeLog(`set Islands`);
			out.push(isl);
		}
		// ordenar
		console.log(`sorting island`)
		out.sort((a: IslandMap, b: IslandMap) => { return b.area - a.area });

		this.diagram.dismarkAllCells();

		return out;
	}
	*/

}
