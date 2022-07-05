import JDiagram from "../Voronoi/JDiagram";
import DataInformationFilesManager from '../DataInformationLoadAndSave';
// import { IJCellInformation } from "../Voronoi/JCellInformation";
import { IJCellHeightInfo } from '../CellInformation/JCellHeight';
import JCell from "../Voronoi/JCell";
import JWMap from "../JWMap";
import JRegionMap, { IJIslandInfo, JIslandMap } from "../RegionMap/JRegionMap";
const dataInfoManager = DataInformationFilesManager.instance;

import AzgaarReaderData from '../AzgaarData/AzgaarReaderData';
import JPoint from "../Geom/JPoint";
import { IJVertexHeightInfo } from "../VertexInformation/JVertexHeight";
import JVertex from "../Voronoi/JVertex";
import RandomNumberGenerator from "../Geom/RandomNumberGenerator";
// import JSubCell from "../Voronoi/JSubCell";

const ard: AzgaarReaderData = AzgaarReaderData.instance;

export default class JHeightMap extends JWMap {
	
	private _islands: JIslandMap[] = [];

	constructor(d: JDiagram) {
		super(d);
		/*
		 * height cells
		 */
		console.log('calculate and setting height');
		console.time('set height info');
		// ver como se debe hacer esto
		let loadedHeightInfo: IJCellHeightInfo[] = (d.ancestor) ? this.getCellsDataFromAncestor() :  dataInfoManager.loadCellsHeigth(this.cells.size);
		const isLoaded: boolean = loadedHeightInfo.length !== 0;
		if (!isLoaded) {
			loadedHeightInfo = this.getCellsData();
		}
		this.forEachCell((cell: JCell) => {
			
			const hinf: IJCellHeightInfo = loadedHeightInfo[cell.id];
			cell.info.setHeightInfo(hinf);
			// ver como se debe hacer realmente
			/*
			cell.subCells.forEach((sc: JCell) => {
				let h: number = hinf.height * (1.05 - 0.1*randFunc());
				if (h > 0.2 && hinf.height <= 0.2) h = hinf.height;
				if (h <= 0.2 && hinf.height > 0.2) h = hinf.height;
				sc.info.setHeightInfo({...hinf, height: h});
			})
			*/
		})

		if (d.ancestor) this.smootData()

		// guardar info
		if (!isLoaded) {
			console.log('set ocean cells')
			this.setOceanTypeCell();
			this.setLakeTypeCell();
			console.log('resolving depressions');
			this.resolveCellsDepressions();

			// dataInfoManager.saveCellsHeigth(this.cells, this.cells.size);
		}

		this.setVertexValues();
		this.resolveVertexDepressions();
		console.timeEnd('set height info');

		/*
		 * islands
		 */
		console.log('calculate and setting island')
		console.time('set Islands');
		/*
		let regionInfoArr: IJIslandInfo[] = dataInfoManager.loadIslandsInfo(this.diagram.cells.size);
		if (regionInfoArr.length > 0) {
			regionInfoArr.forEach((iii: IJIslandInfo, i: number) => {
				this._islands.push(
					new JIslandMap(i, this.diagram, iii)
				);
			})
		} else {
			this.generateIslandList();
		}
		console.timeEnd('set Islands');

		// guardar info
		if (regionInfoArr.length === 0) {
			dataInfoManager.saveIslandsInfo(this._islands, cellsMap.size);
		}
		*/
	}

	private getCellsData(): IJCellHeightInfo[] {
		let out: IJCellHeightInfo[] = [];
		const azgaarHeight = ard.hs();
		azgaarHeight.forEach((elem: { id: number, x: number, y: number, h: number }, idx: number) => {
			const cellId = this.diagram.getCellFromCenter(new JPoint(elem.x, elem.y)).id;
			out[cellId] = {
				id: cellId,
				prevHeight: 0, // ya no se usa
				height: elem.h,
				heightType: 'land',
			};
			if (idx % 1000 == 0) {
				console.log(`van ${idx} de ${azgaarHeight.length}`)
				console.timeLog('set height info')
			}
		})
		return out;
	}

	private getCellsDataFromAncestor(): IJCellHeightInfo[] {
		let out: IJCellHeightInfo[] = [];
		this.diagram.ancestor!.forEachCell((cell: JCell) => {
			const randFunc = RandomNumberGenerator.makeRandomFloat(this.diagram.cells.size);
			const hinf: IJCellHeightInfo = cell.info.getHeightInfo()!;
			cell.subCells.forEach((sc: JCell) => {
				let h: number = hinf.height * (1.05 - 0.1*randFunc());
				if (h > 0.2 && hinf.height <= 0.2) h = hinf.height;
				if (h <= 0.2 && hinf.height > 0.2) h = hinf.height;
				out[sc.id] = {...hinf, height: h};
			})
		})
		return out;
	}

	private setVertexValues() {
		this.diagram.forEachVertex((vertex: JVertex) => {
			let info: IJVertexHeightInfo;//  = { height: 0, heightType: 'land' }
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
				info = { id: vertex.id, height: hprom / cells.length, heightType: (cantOcean > 0) ? 'ocean' : 'lake'}
			}
			else {
				info = { id: vertex.id, height: 0.2, heightType: (cantOcean > 0) ? 'coast' : 'lakeCoast' }
			}

			vertex.info.setHeightInfo(info)
		})
	}

	private resolveVertexDepressions() {
		let verticesArr: JVertex[] = [];
		this.forEachVertex((v: JVertex) => {
			if (v.info.vertexHeight.heightType == 'land') {
				verticesArr.push(v);
			}
		})
		let hay = true, it: number = 0;
		while (it < 100 && hay) {
			hay = false;
			verticesArr.forEach((v: JVertex) => {
				const mhn = this.getMinHeightVertexNeighbour(v);
				if (mhn.info.height >= v.info.height) {
					hay = true;
					const difH = 0.00022//(mhn.info.height - v.info.height)*3.04;
					v.info.height = v.info.height + difH;
					this.diagram.getCellsAssociated(v).forEach((c: JCell) => c.info.height = c.info.height + difH);
				}			
			})
			it++;
		}
	}

	private getMinHeightVertexNeighbour(vertex: JVertex): JVertex {
    const narr: JVertex[] = this.diagram.getVertexNeighbours(vertex);
    let out: JVertex = narr[0], minH = 2;
    narr.forEach((nc: JVertex) => {
      if (nc.info.height < minH) {
				out = nc;
				minH = nc.info.height;
			}
    })
    return out;
  }

	private resolveCellsDepressions() {
		let cellArr: JCell[] = [];
		this.forEachCell((c: JCell) => {
			if (c.info.cellHeight.heightType === 'land') {
				cellArr.push(c);
			}
		})
		let hay = true, it: number = 0;
		while (/*it < 1 &&*/ hay) {
			hay = false;
			cellArr.forEach((c: JCell) => {
				const mhn = this.getMinHeightCellNeighbour(c);
				if (mhn.info.height >= c.info.height) {
					hay = true;
					c.info.height = c.info.height /*(mhn.info.height - c.info.height)*/ + 0.000122;
				}
			})
			it++;
		}
	}

	private getMinHeightCellNeighbour(cell: JCell): JCell {
		const narr: JCell[] = this.diagram.getCellNeighbours(cell);
		let out: JCell = narr[0], minH = 2;
		narr.forEach((nc: JCell) => {
			if (nc.info.height < minH) {
				out = nc;
				minH = nc.info.height;
			}
		})
		return out;
	}

	private setOceanTypeCell() {
		// this.diagram.dismarkAllCells();
		const initCell = this.diagram.getCellFromPoint(new JPoint(-180, 0));
		if (initCell.info.height >= 0.2) throw new Error('en initCell de ocean type');

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

	smootData() {
		this.forEachCell((c: JCell) => {
			c.mark();
			let h: number = 0, cant = 0;
			this.diagram.getCellNeighbours(c).forEach((n: JCell) => {
				cant++;
				h+= (n.isMarked()) ? n.info.prevHeight : n.info.height;
			})
			c.info.height = 0.5 * h/cant + 0.5 * c.info.height;
		})
	}

	/***************************************************************************** */
	get islands() { return this._islands }

	get landRegion(): JRegionMap {
		let out: JRegionMap = new JRegionMap(this.diagram);
		this._islands.forEach((isl: JIslandMap) => {
			out.addRegion(isl);
		})
		return out;
	}

	private generateIslandList(): void {
		let lista: Map<number, JCell> = new Map<number, JCell>();
		this.diagram.forEachCell((c: JCell) => {
			if (c.info.isLand) lista.set(c.id, c);
		})

		let currentId = -1;
		while (lista.size > 0) {
			currentId++;
			const cell: JCell = lista.entries().next().value[1];
			cell.mark();
			lista.delete(cell.id);

			let reg: JIslandMap = new JIslandMap(currentId, this.diagram);
			reg.addCell(cell);
			cell.info.islandId = reg.id; // nuevo

			let qeue: Map<number, JCell> = new Map<number, JCell>();
			this.diagram.getCellNeighbours(cell).forEach((ncell: JCell) => {
				qeue.set(ncell.id, ncell)
			});

			console.log('island:', currentId);
			let times: number = 0;
			while (qeue.size > 0 && times < this.diagram.cells.size) {
				times++;
				const neigh: JCell = qeue.entries().next().value[1];
				qeue.delete(neigh.id);
				lista.delete(neigh.id);
				neigh.mark();
				reg.addCell(neigh);
				neigh.info.islandId = reg.id; // nuevo

				this.diagram.getCellNeighbours(neigh).forEach((nnn: JCell) => {
					if (nnn.info.isLand && !nnn.isMarked() && !qeue.has(nnn.id)) {
						qeue.set(nnn.id, nnn);
					}
				})
				if (reg.cells.size % 10000 == 0) console.log('island:', currentId, `hay ${reg.cells.size}`)
			}

			if (qeue.size > 0) throw new Error(`se supero el numero de cells: ${this.diagram.cells.size} en generateIslandList`)
			console.log('area:', reg.area)
			this._islands.push(reg);
		}
		// ordenar
		console.log(`sorting island`)
		this._islands.sort((a: JIslandMap, b: JIslandMap) => { return b.area - a.area });

		this.diagram.dismarkAllCells();
	}

}