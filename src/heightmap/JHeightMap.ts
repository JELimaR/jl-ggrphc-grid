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

const ard: AzgaarReaderData = AzgaarReaderData.instance;

export default class JHeightMap extends JWMap {
	// private _diagram: JDiagram;
	private _islands: JIslandMap[] = [];

	constructor(d: JDiagram) {
		super(d);
		const cellsMap = this.diagram.cells;

		/*
		 * height cells
		 */
		console.log('calculate and setting height');
		console.time('set height info');

		let loadedHeightInfo: IJCellHeightInfo[] = dataInfoManager.loadCellsHeigth(cellsMap.size);
		const isLoaded: boolean = loadedHeightInfo.length !== 0;
		if (!isLoaded) {
			const azgaarHeight = ard.hs();
			azgaarHeight.forEach((elem: { id: number, x: number, y: number, h: number }, idx: number) => {
				const cellId = this.diagram.getCellFromCenter(new JPoint(elem.x, elem.y)).id;
				loadedHeightInfo[cellId] = {
					id: cellId,
					prevHeight: 0,
					height: elem.h,
					heightType: 'land',
				};
				if (idx % 1000 == 0) {
					console.log(`van ${idx} de ${azgaarHeight.length}`)
					console.timeLog('set height info')
				}
			})
		}
		cellsMap.forEach((cell: JCell) => {
			const hinf: IJCellHeightInfo = loadedHeightInfo[cell.id];
			cell.info.setHeightInfo(hinf);
		})

		// depresiones aquí
		// definir correctamente los oceanos

		console.timeEnd('set height info');
		// guardar info
		if (!isLoaded) {
			console.log('set ocean cells')
			this.setOceanTypeCell();
			console.log('resolving depressions')
			this.resolveDepressions();
			dataInfoManager.saveCellsHeigth(cellsMap, cellsMap.size);
		}


		/*
		 * islands
		 */
		console.log('calculate and setting island')
		console.time('set Islands');
		/*let regionInfoArr: IJIslandInfo[] = dataInfoManager.loadIslandsInfo(this.diagram.cells.size);
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
		}*/
	}

	private smoothHeight() {
		this.forEachCell((c: JCell) => {
			c.mark();
			let ht: number = c.info.height;
			let cant: number = 1;
			let ns: JCell[] = this.diagram.getCellNeighbours(c)
			ns.forEach((n: JCell) => {
				cant++;
				if (n.isMarked()) {
					ht += n.info.prevHeight;
				} else {
					ht += n.info.height;
				}
			})
			ht = ht / cant;
			if (c.info.isLand)
				c.info.height = ht < 0.2 ? 0.2 : ht;
			else
				c.info.height = ht > 0.15 ? 0.15 : ht;
		})
		this.forEachCell((c: JCell) => {
			c.dismark();
		})
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

		this.diagram.forEachCell((c: JCell) => { c.dismark(); })
	}

	private resolveDepressions() {
		let cellArr: JCell[] = [];
		this.forEachCell((c: JCell) => {
			if (c.info.cellHeight.heightType !== 'ocean') {
				cellArr.push(c);
			}
		})
		let hay = true, it: number = 0;
		while (it < 250 && hay) {
			hay = false;
			cellArr.forEach((c: JCell) => {
				const mhn = this.getMinHeightNeighbour(c);
				if (mhn.info.height >= c.info.height) {
					hay = true;
					c.info.height += (mhn.info.height - c.info.height) + 0.01011;
				}			
			})
			it++;
		}
	}

	private getMinHeightNeighbour(cell: JCell): JCell {
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
		this.diagram.dismarkAllCells();
		const initCell = this.diagram.getCellFromPoint(new JPoint(-180,0));
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
		console.log('lista', lista.length);

		this.diagram.dismarkAllCells();
	}

	get islands() { return this._islands }

	get landRegion(): JRegionMap {
		let out: JRegionMap = new JRegionMap(this.diagram);
		this._islands.forEach((isl: JIslandMap) => {
			out.addRegion(isl);
		})
		return out;
	}
}