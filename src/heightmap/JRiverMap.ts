
import JDiagram from "../Voronoi/JDiagram";
import DataInformationFilesManager from '../DataInformationLoadAndSave';
import JCell from "../Voronoi/JCell";
import JWMap from "../JWMap";
import JRegionMap, { IJIslandInfo, JIslandMap } from "../RegionMap/JRegionMap";
import JCellClimate from '../CellInformation/JCellClimate'
const dataInfoManager = DataInformationFilesManager.instance;

import JPoint from "../Geom/JPoint";

const FLUXMINRIVER = 50000;

// cambiar road por otra cosa
export interface IWaterRoadPoint { // puede ser una interface o una clase
  cell: JCell;
  flux: number; // innecesario mantener
}

export class JRiver {
  _cells: IWaterRoadPoint[]
	_id: number

  constructor(id: number, points: IWaterRoadPoint[]) {
		this._id = id;
    this._cells = points;
  }
}

export default class JRiverMap extends JWMap {
  // private _diagram: JDiagram;
  _roads: Map<number, IWaterRoadPoint[]> = new Map<number, IWaterRoadPoint[]>();
  _rivers: Map<number, JRiver> = new Map<number, JRiver>();
	_fluxArr: number[] = [];

  constructor(d: JDiagram) {
    super(d);
    this.generate();
  }

  generate(): void {
    this.setFluxValuesAndRoads();
		this.setRivers();
  }

	private setFluxValuesAndRoads() {
		let cellsArr: JCell[] = [];
    this.forEachCell((c: JCell) => {
			if (c.info.isLand) {
	      cellsArr.push(c);
			}
			this._fluxArr[c.id] = 0;
    });
    cellsArr.sort((a: JCell, b: JCell) => a.info.height - b.info.height);
    let id = -1;

		// generate roads
    cellsArr.forEach((c: JCell, i: number) => {
      if (!c.isMarked() /*&& it < 800*/) {
        id++;
        let road: IWaterRoadPoint[] = [];
        let curr: JCell = c;
				
				curr.mark();
				const cellClimate = curr.info.cellClimate;
				let currFlux: number = 100 * (cellClimate.annualPrecip/JCellClimate.maxAnnual); // 0
				road.push({ cell: curr, flux: 0 });
				this._fluxArr[curr.id] += currFlux;

        while (curr.info.isLand /*&& !curr.isMarked()*/) {
          const mh: JCell = this.getMinHeightNeighbour(curr);
          if (mh.info.height < curr.info.height) {
            curr = mh;
          } else {
            break; // la celda es lake
          }
					curr.mark();
					const cellClimate = curr.info.cellClimate;
					currFlux += 100 * (cellClimate.annualPrecip/JCellClimate.maxAnnual);
					road.push({ cell: curr, flux: 0 });
					this._fluxArr[curr.id] += currFlux;
        }

        this._roads.set(id, road);
      }
    })

		this.diagram.dismarkAllCells();
	}

	private setRivers() {
		let id: number = -1;
		const FLUXLIMIT = 100*this.diagram.cells.size/FLUXMINRIVER;
		this._roads.forEach((road: IWaterRoadPoint[]) => {
			let river: IWaterRoadPoint[] = [];
			
			road.forEach((wrp: IWaterRoadPoint) => {
				const cell: JCell = wrp.cell;
				const flux: number = this._fluxArr[cell.id] as number;
				if (flux > FLUXLIMIT/* && !cell.isMarked()*/) {
					river.push({cell, flux })
					cell.mark()
				} else if (cell.isMarked()) {
					
				}
			})
			
			if (river.length > 0) {
				this._rivers.set(id++, new JRiver(id, river))
			}
		})

		this.diagram.dismarkAllCells();
		console.log('river cant', this._rivers.size)
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


}