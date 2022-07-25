import JDiagram from "../Voronoi/JDiagram";
import InformationFilesManager from '../DataInformationLoadAndSave';
import JCell from "../Voronoi/JCell";
import JCellClimate from '../CellInformation/JCellClimate'

import JPoint from "../Geom/JPoint";
import JVertex from "../Voronoi/JVertex";
import RiverMap, { IRiverMapInfo } from "./RiverMap";
import JVertexFlux, { IJVertexFluxInfo } from "../VertexInformation/JVertexFlux";
import { getArrayOfN } from "../utilFunctions";
import FluxRouteMap, { IFluxRouteMapInfo } from "./FluxRouteMap";
import MapGenerator from "../MapGenerator";

export interface IRiverMapGeneratorOut {
	fluxRoutes: Map<number, FluxRouteMap>;
	rivers: Map<number, RiverMap>;
}

export default class RiverMapGenerator extends MapGenerator {

	constructor(d: JDiagram) {
		super(d);
	}

	generate(): IRiverMapGeneratorOut {
		const fluxRoutesMap: Map<number, FluxRouteMap> = new Map<number, FluxRouteMap>();
		const rivers: Map<number, RiverMap> = new Map<number, RiverMap>();
		// cargar datos
		const dataInfoManager = InformationFilesManager.instance;
		// const fluxVerticesDataLoaded = dataInfoManager.loadVerticesFlux(this.diagram.secAreaProm);
		const fluxVerticesDataLoaded = dataInfoManager.loadVerticesData<IJVertexFluxInfo, JVertexFlux>(this.diagram.secAreaProm, JVertexFlux.getTypeInformationKey());
		const waterRoutesDataLoaded = dataInfoManager.loadWaterRoutesInfo(this.diagram.secAreaProm);
		const riversDataLoaded = dataInfoManager.loadRiversInfo(this.diagram.secAreaProm);

		console.log(`Generating flux and water drain route`)
		console.time(`flux and water drain route`)
		if (fluxVerticesDataLoaded.length == 0 || waterRoutesDataLoaded.length == 0) {
			this.setFluxValuesAndRoads(fluxRoutesMap);
		} else {
			// setear vertices flux data
			fluxVerticesDataLoaded.forEach((ivfi: IJVertexFluxInfo) => {
				const v: JVertex = this.diagram.vertices.get(ivfi.id) as JVertex;
				v.info.setFluxInfo(ivfi);
			})
			// setear flux routes
			waterRoutesDataLoaded.forEach((ifri: IFluxRouteMapInfo) => {
				const fr: FluxRouteMap = new FluxRouteMap(ifri.id, this.diagram, ifri);
				/*this.*/fluxRoutesMap.set(fr.id, fr);
			})
		}
		console.timeEnd(`flux and water drain route`)

		console.log(`Generating rivers`)
		console.time(`rivers`)
		if (riversDataLoaded.length === 0) {
			this.setRivers(fluxRoutesMap, rivers);
		} else {
			riversDataLoaded.forEach((iri: IRiverMapInfo) => {
				const river: RiverMap = new RiverMap(iri.id, this.diagram, iri);
				/*this.*/rivers.set(river.id, river);
			})
		}

		// gruardar todo
		if (fluxVerticesDataLoaded.length === 0) {
			// dataInfoManager.saveVerticesFlux(this.diagram.vertices, this.diagram.secAreaProm);
			const verticesArr: JVertexFlux[] = [...this.diagram.vertices.values()].map((vertex: JVertex) => vertex.info.vertexFlux)
			dataInfoManager.saveVerticesData<IJVertexFluxInfo, JVertexFlux>(verticesArr, this.diagram.secAreaProm, JVertexFlux.getTypeInformationKey());
		}
		if (waterRoutesDataLoaded.length === 0) {
			dataInfoManager.saveWaterRoutesInfo(/*this.*/fluxRoutesMap, this.diagram.secAreaProm);
		}
		if (riversDataLoaded.length === 0) {
			dataInfoManager.saveRiversInfo(/*this.*/rivers, this.diagram.secAreaProm);
		}
		console.timeEnd(`rivers`)

		// console.log('routes cant', this._waterRoutesMap.size)
		// console.log('rivers cant', this._rivers.size)
		return {
			fluxRoutes: fluxRoutesMap,
			rivers: rivers
		}
	}

	private setFluxValuesAndRoads(_fluxRoutesMap: Map<number, FluxRouteMap>) {
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
		verticesArr.forEach((v: JVertex) => {
			if (!v.isMarked()) {
				id++;

				const route: FluxRouteMap = new FluxRouteMap(id, this.diagram);
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
        /*this.*/_fluxRoutesMap.set(id, route);
			}
		})

		this.diagram.dismarkAllVertices();
	}

	private fluxCalcIteration(curr: JVertex, currFluxArr: number[], route: FluxRouteMap) {
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
		vFlux.monthFlux.forEach((_f: number, i: number) => {
			vFlux.monthFlux[i] = newFluxArr[i];
		});
		vFlux.fluxRouteIds.push(route.id);
	}

	private setRivers(_fluxRoutesMap: Map<number, FluxRouteMap>, _rivers: Map<number, RiverMap>) {
		const FLUXLIMIT = this.diagram.vertices.size / 2000;
		/*this.*/_fluxRoutesMap.forEach((fluxRoute: FluxRouteMap, id: number) => {

			let river: RiverMap = new RiverMap(id, this.diagram);

			let vertex: JVertex;
			for (vertex of fluxRoute.vertices) {

				const medFlux: number = vertex.info.vertexFlux.annualFlux / 12;
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
				/*this.*/_rivers.set(id, river);
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