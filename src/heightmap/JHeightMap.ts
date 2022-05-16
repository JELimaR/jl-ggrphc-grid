import JDiagram from "../Voronoi/JDiagram";
import DataInformationFilesManager from '../DataInformationLoadAndSave';
// import { IJCellInformation } from "../Voronoi/JCellInformation";
import  {IJCellHeightInfo } from '../CellInformation/JCellHeight';
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

   let loadedInfo: IJCellHeightInfo[] = dataInfoManager.loadCellsHeigth(cellsMap.size); // cambiar por heightinfo
		if (loadedInfo.length == 0) {
			ard.hs().forEach((elem: {id: number, x:number, y:number, h: number}) => {
	
				const cellId = this.diagram.getCellFromPoint(new JPoint(elem.x, elem.y)).id;
				loadedInfo[cellId] = {
					id: 0,
					prevHeight: 0,
					height: elem.h,
					heightType: elem.h > 0.2 ? 'land' : 'ocean',
				}
			})
		}
    cellsMap.forEach((cell: JCell) => {
      const hinf: IJCellHeightInfo | undefined = loadedInfo[cell.site.id];
      cell.info.setHeightInfo(hinf);
    })

    console.timeEnd('set height info');
		// guardar info
		if (loadedInfo.length === 0) {
      this.smoothHeight();
      dataInfoManager.saveCellsHeigth(cellsMap, cellsMap.size);
    }

    /*
		 * islands
		 */
		/*console.log('calculate and setting island')
		console.time('set Islands');
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
		}*/
  }

  private smoothHeight() {
    this.forEachCell((c: JCell) => {
      c.mark();
      let ht: number = c.info.height;
      let cant: number = 1;
      let ns: JCell[] = this.diagram.getNeighbors(c)
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
			this.diagram.getNeighbors(cell).forEach((ncell: JCell) => {
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

				this.diagram.getNeighbors(neigh).forEach((nnn: JCell) => {
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

	get islands() {return this._islands }

	get landRegion(): JRegionMap {
		let out: JRegionMap = new JRegionMap(this.diagram);
		this._islands.forEach((isl: JIslandMap) => {
			out.addRegion(isl);
		})
		return out;
	}
}