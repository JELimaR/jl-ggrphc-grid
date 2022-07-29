import FluxRouteMap, { IFluxRouteMapInfo } from "../MapContainerElements/FluxRouteMap";
import IslandMap, { IIslandMapInfo } from "../MapContainerElements/IslandMap";
import RiverMap, { IRiverMapInfo } from "../MapContainerElements/RiverMap";
import { IJCellClimateInfo } from "../Voronoi/CellInformation/JCellClimate";
import { IJCellHeightInfo } from "../Voronoi/CellInformation/JCellHeight";
import JCell from "../Voronoi/JCell";
import JDiagram, { LoaderDiagram } from "../Voronoi/JDiagram";
import JVertex from "../Voronoi/JVertex";
import { IJVertexClimateInfo } from "../Voronoi/VertexInformation/JVertexClimate";
import { IJVertexFluxInfo } from "../Voronoi/VertexInformation/JVertexFlux";
import { IJVertexHeightInfo } from "../Voronoi/VertexInformation/JVertexHeight";
import INaturalMapCreator, { IRiverMapGeneratorOut } from "../GACInterfaces/INaturalMapCreator";

const AREA = 12100;

interface ICellInfoLoaded {
	climate: IJCellClimateInfo[],
	height: IJCellHeightInfo[]
};

interface IVertexInfoLoaded {
	height: IJVertexHeightInfo[], // ver cuales son necesarios
	climate: IJVertexClimateInfo[], // ver cuales son necesarios
	flux: IJVertexFluxInfo[],
}

interface IConsult {
	getDiagram: (AREA: number) => LoaderDiagram;

	getCellInfo: (AREA: number) => ICellInfoLoaded;
	getVertexInfo: (AREA: number) => IVertexInfoLoaded;

	getIslands: (AREA: number) => IIslandMapInfo[];
	getRivers: (AREA: number) => IRiverMapInfo[];
	getFluxRoutes: (AREA: number) => IFluxRouteMapInfo[];
}

// mover a otro lugar
export default class NaturalMapCreatorClient implements INaturalMapCreator {
	constructor(private _consult: IConsult) { }

	generateVoronoiDiagramInfo(): JDiagram {
		const ld = this._consult.getDiagram(AREA);
		const diag = new JDiagram(ld);

		this.setCellInfo(diag);
		this.setVertexInfo(diag);
		return diag;
	}

	private setCellInfo(diag: JDiagram) {

		const info: ICellInfoLoaded = this._consult.getCellInfo(AREA);

		info.height.forEach((ichi: IJCellHeightInfo) => {
			const cell: JCell = diag.getCellById(ichi.id) as JCell;
			cell.info.setHeightInfo(ichi);
		})
		info.climate.forEach((icci: IJCellClimateInfo) => {
			const cell: JCell = diag.getCellById(icci.id) as JCell;
			cell.info.setClimatetInfo(icci);
		})
	}

	private setVertexInfo(diag: JDiagram) {

		const info: IVertexInfoLoaded = this._consult.getVertexInfo(AREA);

		info.height.forEach((ivhi: IJVertexHeightInfo) => {
			const vertex: JVertex = diag.getVertexById(ivhi.id) as JVertex;
			vertex.info.setHeightInfo(ivhi);
		})
		info.climate.forEach((ivci: IJVertexClimateInfo) => {
			const vertex: JVertex = diag.getVertexById(ivci.id) as JVertex;
			vertex.info.setClimateInfo(ivci);
		})
		info.flux.forEach((ivfi: IJVertexFluxInfo) => {
			const vertex: JVertex = diag.getVertexById(ivfi.id) as JVertex;
			vertex.info.setFluxInfo(ivfi);
		})
	}

	generateIslandMaps(diag: JDiagram): IslandMap[] {
		let out: IslandMap[] = [];
		this._consult.getIslands(AREA).forEach((iii: IIslandMapInfo) => out.push(new IslandMap(iii.id, diag, iii)));
		return out;
	}

	generateRiverMaps(diag: JDiagram): IRiverMapGeneratorOut {
		const rivers = new Map<number, RiverMap>();
		const fluxRoutes = new Map<number, FluxRouteMap>();

		this._consult.getRivers(AREA).forEach((iri: IRiverMapInfo) =>
			rivers.set(iri.id, new RiverMap(iri.id, diag, iri))
		)
		this._consult.getFluxRoutes(AREA).forEach((ifri: IFluxRouteMapInfo) =>
			fluxRoutes.set(ifri.id, new FluxRouteMap(ifri.id, diag, ifri))
		)

		return { rivers, fluxRoutes };
	}
}