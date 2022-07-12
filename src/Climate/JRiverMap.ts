import JDiagram from "../Voronoi/JDiagram";
import DataInformationFilesManager from '../DataInformationLoadAndSave';
import JCell from "../Voronoi/JCell";
import JWMap from "../JWMap";
import JRegionMap, { IJIslandInfo, JIslandMap } from "../RegionMap/JRegionMap";
import JCellClimate from '../CellInformation/JCellClimate'

import JPoint from "../Geom/JPoint";
import JVertex from "../Voronoi/JVertex";
import JRiver, { IWaterRoutePoint } from "./JRiver";
import { IJVertexFluxInfo } from "../VertexInformation/JVertexFlux";
import { getArrayOfN } from "../utilFunctions";

const FLUXMINRIVER = 200000;

export default class JRiverMap extends JWMap {
  // private _diagram: JDiagram;
  _fluxRoutes: Map<number, JVertex[]> = new Map<number, JVertex[]>();
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
        let route: JVertex[] = [];
        let curr: JVertex = v;
				// let currFlux: number = 0;
				let currFluxArr: number[] = getArrayOfN(12, 0);

				/*currFlux = */this.fluxCalcIteration(curr, /*currFlux,*/ currFluxArr, route);

        while (curr.info.vertexHeight.heightType !== 'coast' && curr.info.vertexHeight.heightType !== 'lakeCoast') {
          const mhv: JVertex = this.getMinHeightNeighbour(curr);
          if (mhv.info.height < curr.info.height) {
            curr = mhv;

						/*currFlux = */this.fluxCalcIteration(curr, /*currFlux,*/ currFluxArr, route);
          } else {
            break; // el vertex es lake
          }
        }

        this._fluxRoutes.set(id, route);
      }
    })

		console.log('roads cant', this._fluxRoutes.size)
		this.diagram.dismarkAllVertices();
	}

	private fluxCalcIteration(curr: JVertex, /*currFlux: number,*/ currFluxArr: number[], route: JVertex[]) {
		curr.mark();
		const vertexClimate = curr.info.vertexClimate;
		const vertexFlux = curr.info.vertexFlux;
		//currFlux += 100 * (vertexClimate.annualPrecip/JCellClimate.maxAnnual) - 10 * (vertexClimate.pumbral/JCellClimate.maxAnnual);
		vertexClimate.precipMonth.forEach((p: number, i: number) => {
			currFluxArr[i] += 100 * (12 * p / JCellClimate.maxAnnual) - 10 * (vertexClimate.pumbral/JCellClimate.maxAnnual);
			if (currFluxArr[i] < 0) currFluxArr[i] = 0;
		})
		// if (currFlux < 0) currFlux = 0;
		route.push(curr);
		// update flux
		const newFluxArr: number[] = /*this._fluxValuesVertices2.get(curr.id)!.fluxMonth.map((f: number, i: number) => {
			return f + currFluxArr[i];
		});*/
			vertexFlux.monthFlux.map((f: number, i: number) => {
			return f + currFluxArr[i];
		});
		// this._fluxValuesVertices.set(curr.id, this._fluxValuesVertices.get(curr.id)! + currFlux);
		// this._fluxValuesVertices2.set(curr.id, {...this._fluxValuesVertices2.get(curr.id)!, fluxMonth: newFluxArr})
		vertexFlux.monthFlux.forEach((f: number, i: number) => {
			vertexFlux.monthFlux[i] = newFluxArr[i];
		});
		// return currFlux;
	}

	private setRivers() {
		const FLUXLIMIT = 100*this.diagram.vertices2.size/FLUXMINRIVER;
		this._fluxRoutes.forEach((road: JVertex[], id: number) => {

			let river: IWaterRoutePoint[] = [];

			let vertex: JVertex;
			for (vertex of road) {
				// const vertex: JVertex = wrp.vertex;
				// const vertexFlux = this._fluxValuesVertices2.get(vertex.id) as IJVertexFluxInfo;
				const vertexFlux = vertex.info.vertexFlux
				const flux: number = vertexFlux.monthFlux.reduce((f,c) => f+c)/12;
				if ((flux > FLUXLIMIT || river.length > 0) && !vertex.isMarked()) {
					river.push({vertex, flux })
					vertex.mark()
				} else if (vertex.isMarked()) {
					river.push({vertex, flux })
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