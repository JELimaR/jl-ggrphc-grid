import JDiagram from "../Voronoi/JDiagram";
import DataInformationFilesManager from '../DataInformationLoadAndSave';
import JCell from "../Voronoi/JCell";
import JWMap from "../JWMap";
import JRegionMap, { IJIslandInfo, JIslandMap } from "../RegionMap/JRegionMap";
import JCellClimate from '../CellInformation/JCellClimate'
const dataInfoManager = DataInformationFilesManager.instance;

import JPoint from "../Geom/JPoint";
import JVertex from "../Voronoi/JVertex";
import JRiver, { IWaterRoutePoint } from "./JRiver";

const FLUXMINRIVER = 200000;

export default class JRiverMap extends JWMap {
  // private _diagram: JDiagram;
  _fluxRoutes: Map<number, JVertex[]> = new Map<number, JVertex[]>();
  _rivers: Map<number, JRiver> = new Map<number, JRiver>();
	_fluxValuesVertices: Map<string, number> = new Map<string, number>();

  constructor(d: JDiagram) {
    super(d);
    this.generate();
  }

  generate(): void {
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
			this._fluxValuesVertices.set(v.id, 0);
    });
    verticesArr.sort((a: JVertex, b: JVertex) => b.info.height - a.info.height);
    let id = -1;

		// generate roads
    verticesArr.forEach((v: JVertex, i: number) => {
      if (!v.isMarked()) {
        id++;
        let route: JVertex[] = [];
        let curr: JVertex = v;
				let currFlux: number = 0;				

				currFlux = this.fluxCalcIteration(curr, currFlux, route);

        while (curr.info.vertexHeight.heightType !== 'coast' && curr.info.vertexHeight.heightType !== 'lakeCoast') {
          const mhv: JVertex = this.getMinHeightNeighbour(curr);
          if (mhv.info.height < curr.info.height) {
            curr = mhv;

						currFlux = this.fluxCalcIteration(curr, currFlux, route);
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

	private fluxCalcIteration(curr: JVertex, currFlux: number, route: JVertex[]): number {
		curr.mark();
		const vertexClimate = curr.info.vertexClimate;
		currFlux += 100 * (vertexClimate.annualPrecip/JCellClimate.maxAnnual) - 10 * (vertexClimate.pumbral/JCellClimate.maxAnnual);
		if (currFlux < 0) currFlux = 0;
		route.push(curr);
		// update flux
		const newFlux: number = this._fluxValuesVertices.get(curr.id)! + currFlux;
		this._fluxValuesVertices.set(curr.id, newFlux);
		return currFlux;
	}

	private setRivers() {
		const FLUXLIMIT = 100*this.diagram.vertices2.size/FLUXMINRIVER;
		this._fluxRoutes.forEach((road: JVertex[], id: number) => {

			let river: IWaterRoutePoint[] = [];

			let vertex: JVertex;
			for (vertex of road) {
				// const vertex: JVertex = wrp.vertex;
				const vertexFlux = this._fluxValuesVertices.get(vertex.id) as number;
				const flux: number = vertexFlux;
				if ((flux > FLUXLIMIT || river.length > 0) && !vertex.isMarked()) {
					river.push({vertex, flux })
					vertex.mark()
				} else if (vertex.isMarked()) {
					river.push({vertex, flux })
					break;
				}
			}
			
			if (river.length > 0) {
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