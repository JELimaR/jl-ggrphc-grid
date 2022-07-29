import JDiagram from '../Voronoi/JDiagram';
import IslandMap from '../MapContainerElements/IslandMap';
import FluxRouteMap from "../MapContainerElements/FluxRouteMap";
import RiverMap from "../MapContainerElements/RiverMap";


export default interface INaturalMapCreator {
	generateVoronoiDiagramInfo: (AREA: number) => JDiagram;
	generateRiverMaps: (diag: JDiagram) => IRiverMapGeneratorOut;
	generateIslandMaps: (diag: JDiagram) => IslandMap[];
}

export interface IRiverMapGeneratorOut {
	fluxRoutes: Map<number, FluxRouteMap>;
	rivers: Map<number, RiverMap>;
}