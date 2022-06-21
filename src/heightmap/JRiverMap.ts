
import JDiagram from "../Voronoi/JDiagram";
import DataInformationFilesManager from '../DataInformationLoadAndSave';
import JCell from "../Voronoi/JCell";
import JWMap from "../JWMap";
import JRegionMap, { IJIslandInfo, JIslandMap } from "../RegionMap/JRegionMap";
const dataInfoManager = DataInformationFilesManager.instance;

import JPoint from "../Geom/JPoint";

export interface IWaterRoadPoint { // puede ser una interface o una clase
  cell: JCell;
  flux: number;
}

export class JRiver {
  _cells: JCell[]

  constructor() {
    this._cells = [];
  }
}

export default class JRiverMap extends JWMap {
  // private _diagram: JDiagram;
  _roads: Map<number, IWaterRoadPoint[]> = new Map<number, IWaterRoadPoint[]>();
  private _rivers: JRiver[] = [];

  constructor(d: JDiagram) {
    super(d);
    this.generate();
  }

  generate(): void {
    let cellsArr: JCell[] = [];
    let fluxMap: Map<number, number> = new Map<number, number>();
    this.forEachCell((c: JCell) => {
      cellsArr.push(c);
      fluxMap.set(c.id, 0);
    });
    cellsArr.sort((a: JCell, b: JCell) => b.info.height - a.info.height);
    let id = 0;

    cellsArr.forEach((c: JCell, i: number) => {
      if (!c.isMarked() && i < 800) {
        id++;
        let road: IWaterRoadPoint[] = [];
        let curr: JCell = c;

        while (curr.info.isLand || !curr.isMarked()) {
          curr.mark();
          road.push({ cell: curr, flux: 0 });
          //fluxMap.set(curr.id, fluxMap.get(curr.id)! + 1);
          const mh: JCell = this.getMinHeightNeighbour(curr);
          if (mh.info.height < curr.info.height) {
            curr = mh;
          } else {
            break;
          }

        }

        this._roads.set(id, road);

      }
    })

  }



  getMinHeightNeighbour(cell: JCell): JCell {
    const narr: JCell[] = this.diagram.getNeighbors(cell);
    let out: JCell = narr[0], minH = 2;
    narr.forEach((nc: JCell) => {
      if (nc.info.height < minH) out = nc;
    })
    return out;
  }


}