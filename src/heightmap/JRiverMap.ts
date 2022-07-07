
import JDiagram from "../Voronoi/JDiagram";
import DataInformationFilesManager from '../DataInformationLoadAndSave';
import JCell from "../Voronoi/JCell";
import JWMap from "../JWMap";
import JRegionMap, { IJIslandInfo, JIslandMap } from "../RegionMap/JRegionMap";
import JCellClimate from '../CellInformation/JCellClimate'
const dataInfoManager = DataInformationFilesManager.instance;

import JPoint from "../Geom/JPoint";
import JVertex from "../Voronoi/JVertex";

const FLUXMINRIVER = 200000;

// cambiar road por otra cosa
export interface IWaterRoutePoint { // puede ser una interface o una clase
  vertex: JVertex;
  flux: number; // innecesario mantener
}

export class JRiver {
  _vertices: IWaterRoutePoint[];
	_allVertices: JPoint[] = [];
	_id: number;

  constructor(id: number, points: IWaterRoutePoint[]) {
		this._id = id;
    this._vertices = points;
  }
}

export default class JRiverMap extends JWMap {
  // private _diagram: JDiagram;
  _roads: Map<number, IWaterRoutePoint[]> = new Map<number, IWaterRoutePoint[]>();
  _rivers: Map<number, JRiver> = new Map<number, JRiver>();
	_fluxMap: Map<string, number> = new Map<string, number>();

  constructor(d: JDiagram) {
    super(d);
    this.generate();
  }

  generate(): void {
    this.setFluxValuesAndRoads();
		this.setRivers();
  }

	private setFluxValuesAndRoads() {
		let verticesArr: JVertex[] = [];
    this.forEachVertex((v: JVertex) => {
			if (v.info.vertexHeight.heightType == 'land') {
	      verticesArr.push(v);
			}
			this._fluxMap.set(v.id, 0);
    });
    verticesArr.sort((a: JVertex, b: JVertex) => b.info.height - a.info.height);
    let id = -1;

		// generate roads
    verticesArr.forEach((v: JVertex, i: number) => {
      if (!v.isMarked() /*&& it < 800*/) {
        id++;
        let route: IWaterRoutePoint[] = [];
        let curr: JVertex = v;
				
				curr.mark();
				const vertexClimate = curr.info.vertexClimate;
				let currFlux: number = 100 * (vertexClimate.annualPrecip/JCellClimate.maxAnnual); // 0
				route.push({ vertex: curr, flux: 0 });
				// update flux
				const newFlux: number = this._fluxMap.get(curr.id)! + currFlux;
				this._fluxMap.set(curr.id, newFlux);

        while (curr.info.vertexHeight.heightType !== 'coast' && curr.info.vertexHeight.heightType !== 'lakeCoast') {
          const mhv: JVertex = this.getMinHeightNeighbour(curr);
          if (mhv.info.height < curr.info.height) {
            curr = mhv;
						curr.mark();

						const vertexClimate = curr.info.vertexClimate;
						currFlux += 100 * (vertexClimate.annualPrecip/JCellClimate.maxAnnual);
						route.push({ vertex: curr, flux: 0 });
						// update flux
						const newFlux: number = this._fluxMap.get(curr.id)! + currFlux;
						this._fluxMap.set(curr.id, newFlux);
          } else {
            break; // el vertex es lake
          }
        }

        this._roads.set(id, route);
      }
    })

		console.log('roads cant', this._roads.size)
		this.diagram.dismarkAllVertices();
	}

	private setRivers() {
		const FLUXLIMIT = 100*this.diagram.vertices2.size/FLUXMINRIVER;
		this._roads.forEach((road: IWaterRoutePoint[], id: number) => {

			let river: IWaterRoutePoint[] = [];

			let wrp: IWaterRoutePoint;
			for (wrp of road) {
				const vertex: JVertex = wrp.vertex;
				const vertexFlux = this._fluxMap.get(vertex.id) as number;
				const flux: number = vertexFlux;
				if (flux > FLUXLIMIT && !vertex.isMarked()) {
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