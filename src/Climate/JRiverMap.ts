import JDiagram from "../Voronoi/JDiagram";
import DataInformationFilesManager from '../DataInformationLoadAndSave';
import JCell from "../Voronoi/JCell";
import JWMap from "../JWMap";
import JRegionMap, { IJIslandInfo, JIslandMap } from "../RegionMap/JRegionMap";
import JCellClimate from '../CellInformation/JCellClimate'

import JPoint from "../Geom/JPoint";
import JVertex from "../Voronoi/JVertex";
import JRiver, { IJRiverInfo } from "./JRiver";
import { IJVertexFluxInfo } from "../VertexInformation/JVertexFlux";
import { getArrayOfN } from "../utilFunctions";
import JWaterRoute, { IJWaterRouteInfo } from "./JWaterRoute";

export default class JRiverMap extends JWMap {
  
  _waterRoutesMap: Map<number, JWaterRoute> = new Map<number, JWaterRoute>();
  _rivers: Map<number, JRiver> = new Map<number, JRiver>();
	// _fluxValuesVertices: Map<string, number> = new Map<string, number>();
	// _fluxValuesVertices2: Map<string, IJVertexFluxInfo> = new Map<string, IJVertexFluxInfo>();

  constructor(d: JDiagram) {
    super(d);
    this.generate(); // eliminar esta llamada
  }

  generate(): void {
		// cargar datos
		const dataInfoManager = DataInformationFilesManager.instance;
		const fluxVerticesDataLoaded = dataInfoManager.loadVerticesFlux(this.diagram.secAreaProm);
		const waterRoutesDataLoaded = dataInfoManager.loadWaterRoutesInfo(this.diagram.secAreaProm);
		const riversDataLoaded = dataInfoManager.loadRiversInfo(this.diagram.secAreaProm);
		
		console.log(`Generating flux and water drain route`)
		console.time(`flux and water drain route`)
		if (fluxVerticesDataLoaded.length == 0 || waterRoutesDataLoaded.length == 0) {
			this.setFluxValuesAndRoads();			
		} else {
			// setear vertices flux data
			fluxVerticesDataLoaded.forEach((ivfi: IJVertexFluxInfo) => {
				const v: JVertex = this.diagram.vertices.get(ivfi.id) as JVertex;
				v.info.setFluxInfo(ivfi);
			})
			// setear flux routes
			waterRoutesDataLoaded.forEach((iwri: IJWaterRouteInfo) => {
				const jwr: JWaterRoute = new JWaterRoute(iwri.id, this.diagram, iwri);
				this._waterRoutesMap.set(jwr.id, jwr);
			})
		}
		console.timeEnd(`flux and water drain route`)

		console.log(`Generating rivers`)
		console.time(`rivers`)
		if (riversDataLoaded.length === 0) {
			this.setRivers();
		} else {
			riversDataLoaded.forEach((iri: IJRiverInfo) => {
				const river: JRiver = new JRiver(iri.id, this.diagram, iri);
				this._rivers.set(river.id, river);
			})
		}

		// gruardar todo
		if (fluxVerticesDataLoaded.length === 0) {
			dataInfoManager.saveVerticesFlux(this.diagram.vertices, this.diagram.secAreaProm);
		}
		if (waterRoutesDataLoaded.length === 0) {
			dataInfoManager.saveWaterRoutesInfo(this._waterRoutesMap, this.diagram.secAreaProm);
		}
		if (riversDataLoaded.length === 0) {
			dataInfoManager.saveRiversInfo(this._rivers, this.diagram.secAreaProm);
		}		
		console.timeEnd(`rivers`)

		// console.log('routes cant', this._waterRoutesMap.size)
		// console.log('rivers cant', this._rivers.size)
  }

	get riverLengthSorted(): JRiver[] { // tal vez mover esta funcion a algo superior a world
		let out: JRiver[] = [];
		this._rivers.forEach((river: JRiver) => out.push(river));
		out = out.sort((a: JRiver, b: JRiver) => b.length - a.length)
		return out;
	}

	private setFluxValuesAndRoads() {
		let verticesArr: JVertex[] = [];
    this.diagram.forEachVertex((v: JVertex) => {
			if (v.info.vertexHeight.heightType == 'land') {
	      verticesArr.push(v);
			}
			let finfo: IJVertexFluxInfo = {
				id: v.id,
				fluxMonth: getArrayOfN(12, 0),
				fluxRouteIds: [],
				riverIds: [],
			};
			v.info.setFluxInfo(finfo);
    });
    verticesArr.sort((a: JVertex, b: JVertex) => b.info.height - a.info.height);
    let id = -1;

		// generate roads
    verticesArr.forEach((v: JVertex, i: number) => {
      if (!v.isMarked()) {
        id++;
				
        const route: JWaterRoute = new JWaterRoute(id, this.diagram);
        let curr: JVertex = v;
				let currFluxArr: number[] = getArrayOfN(12, 0);

				this.fluxCalcIteration(curr, currFluxArr, route);

        while (curr.info.vertexHeight.heightType !== 'coast' && curr.info.vertexHeight.heightType !== 'lakeCoast') {
          const mhv: JVertex = this.getMinHeightNeighbour(curr);
          if (mhv.info.height < curr.info.height) {
            curr = mhv;

						this.fluxCalcIteration(curr, currFluxArr, route);
          } else {
            break; // el vertex es lake?
          }
        }
        this._waterRoutesMap.set(id, route);
      }
    })

		this.diagram.dismarkAllVertices();
	}

	private fluxCalcIteration(curr: JVertex, currFluxArr: number[], route: JWaterRoute) {
		curr.mark();
		const vClimate = curr.info.vertexClimate;
		const vFlux = curr.info.vertexFlux;

		if (vFlux.fluxRouteIds.length == 0) {
			vClimate.precipMonth.forEach((p: number, i: number) => {
				currFluxArr[i] += (100 * (12 * p) - 10 * (vClimate.pumbral)) / JCellClimate.maxAnnual;
				if (currFluxArr[i] < 0) currFluxArr[i] = 0;
			})
		}
		route.addVertex(curr);
		// update flux
		const newFluxArr: number[] = vFlux.monthFlux.map((f: number, i: number) => {
			return f + currFluxArr[i];
		});

		// update vertexFlux
		vFlux.monthFlux.forEach((f: number, i: number) => {
			vFlux.monthFlux[i] = newFluxArr[i];
		});
		vFlux.fluxRouteIds.push(route.id);
	}

	private setRivers() {
		const FLUXLIMIT = this.diagram.vertices.size/2000;
		this._waterRoutesMap.forEach((fluxRoute: JWaterRoute, id: number) => {

			let river: JRiver = new JRiver(id, this.diagram);

			let vertex: JVertex;
			for (vertex of fluxRoute.vertices) {

				const medFlux: number = vertex.info.vertexFlux.annualFlux/12;
				if ((medFlux > FLUXLIMIT || river.vertices.length > 0) && !vertex.isMarked()) {
					river.addVertex(vertex)
					vertex.mark()
				} else if (vertex.isMarked()) {
					river.addVertex(vertex)
					break;
				}
			}
			
			if (river.vertices.length > 1) {
				river.forEachVertex((v: JVertex) => {
					v.info.vertexFlux.riverIds.push(river.id);
				})
				this._rivers.set(id, river);
			}
		})

		this.diagram.dismarkAllVertices();
	}

  private getMinHeightNeighbour(vertex: JVertex): JVertex {
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

}