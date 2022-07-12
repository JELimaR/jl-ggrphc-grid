import JDiagram from "../Voronoi/JDiagram";
import DataInformationFilesManager from '../DataInformationLoadAndSave';
import JCell from "../Voronoi/JCell";
import JWMap from "../JWMap";
import JRegionMap, { IJIslandInfo, JIslandMap } from "../RegionMap/JRegionMap";
import JCellClimate from '../CellInformation/JCellClimate'

import JPoint from "../Geom/JPoint";
import JVertex from "../Voronoi/JVertex";
import JRiver, {  } from "./JRiver";
import { IJVertexFluxInfo } from "../VertexInformation/JVertexFlux";
import { getArrayOfN } from "../utilFunctions";
import JFluxRoute from "./JFluxRoute";

const FLUXMINRIVER = 200000;

export interface IJRiverMapInfo {
	rid: number;
}

export default class JRiverMap extends JWMap {
  // private _diagram: JDiagram;
  _fluxRoutesMap: Map<number, JFluxRoute> = new Map<number, JFluxRoute>();
  _rivers: Map<number, JRiver> = new Map<number, JRiver>();
	// _fluxValuesVertices: Map<string, number> = new Map<string, number>();
	// _fluxValuesVertices2: Map<string, IJVertexFluxInfo> = new Map<string, IJVertexFluxInfo>();

  constructor(d: JDiagram) {
    super(d);
    this.generate();
  }

  generate(): void {
		const dataInfoManager = DataInformationFilesManager.instance;
		const fluxVerticesDataLoaded = dataInfoManager.loadVerticesFlux(this.diagram.secAreaProm);
    this.setFluxValuesAndRoads();
		this.setRivers();
  }

	get riverLengthSorted(): JRiver[] {
		let out: JRiver[] = [];
		this._rivers.forEach((river: JRiver) => out.push(river));
		out = out.sort((a: JRiver, b: JRiver) => b.length - a.length)
		return out;
	}

	private setFluxValuesAndRoads() {
		let verticesArr: JVertex[] = [];
    this.forEachVertex((v: JVertex) => {
			if (v.info.vertexHeight.heightType == 'land') {
	      verticesArr.push(v);
			}
			// this._fluxValuesVertices.set(v.id, 0);
			let finfo: IJVertexFluxInfo = {
				id: v.id,
				fluxMonth: getArrayOfN(12, 0),
				fluxRoute: [],
				riverIds: [],
			};
			// this._fluxValuesVertices2.set(v.id, finfo);
			v.info.setFluxInfo(finfo);
    });
    verticesArr.sort((a: JVertex, b: JVertex) => b.info.height - a.info.height);
    let id = -1;

		// generate roads
    verticesArr.forEach((v: JVertex, i: number) => {
      if (!v.isMarked()) {
        id++;
				
        const route: JFluxRoute = new JFluxRoute(id, this.diagram);
        let curr: JVertex = v;
				let currFluxArr: number[] = getArrayOfN(12, 0);

				this.fluxCalcIteration(curr, currFluxArr, route);

        while (curr.info.vertexHeight.heightType !== 'coast' && curr.info.vertexHeight.heightType !== 'lakeCoast') {
          const mhv: JVertex = this.getMinHeightNeighbour(curr);
          if (mhv.info.height < curr.info.height) {
            curr = mhv;

						this.fluxCalcIteration(curr, currFluxArr, route);
          } else {
            break; // el vertex es lake
          }
        }
        this._fluxRoutesMap.set(id, route);
      }
    })

		console.log('roads cant', this._fluxRoutesMap.size)
		this.diagram.dismarkAllVertices();
	}

	private fluxCalcIteration(curr: JVertex, /*currFlux: number,*/ currFluxArr: number[], route: JFluxRoute) {
		curr.mark();
		const vertexClimate = curr.info.vertexClimate;
		const vertexFlux = curr.info.vertexFlux;

		vertexClimate.precipMonth.forEach((p: number, i: number) => {
			currFluxArr[i] += 100 * (12 * p / JCellClimate.maxAnnual) - 10 * (vertexClimate.pumbral/JCellClimate.maxAnnual);
			if (currFluxArr[i] < 0) currFluxArr[i] = 0;
		})
		route.addVertex(curr);
		// update flux
		const newFluxArr: number[] = vertexFlux.monthFlux.map((f: number, i: number) => {
			return f + currFluxArr[i];
		});
		vertexFlux.monthFlux.forEach((f: number, i: number) => {
			vertexFlux.monthFlux[i] = newFluxArr[i];
		});
	}

	private setRivers() {
		const FLUXLIMIT = 100*this.diagram.vertices2.size/FLUXMINRIVER;
		this._fluxRoutesMap.forEach((fluxRoute: JFluxRoute, id: number) => {

			let river: JVertex[] = [];
			let vertices: JVertex[] = fluxRoute.vertices;

			let vertex: JVertex;
			for (vertex of vertices) {

				const vertexFlux = vertex.info.vertexFlux
				const flux: number = vertexFlux.monthFlux.reduce((f,c) => f+c)/12;
				if ((flux > FLUXLIMIT || river.length > 0) && !vertex.isMarked()) {
					river.push(vertex)
					vertex.mark()
				} else if (vertex.isMarked()) {
					river.push(vertex)
					break;
				}
			}
			
			if (river.length > 1) {
				this._rivers.set(id, new JRiver(id, river))
			}
		})

		this.diagram.dismarkAllVertices();
		console.log('river cant', this._rivers.size)
	}

  private getMinHeightNeighbour(vertex: JVertex): JVertex {
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

}