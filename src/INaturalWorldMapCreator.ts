import JDiagram from './Voronoi/JDiagram';
import { IRiverMapGeneratorOut } from './GeneratorsAndCreators/Flux/RiverMapGenerator';
import IslandMap from './MapContainerElements/IslandMap';


export default interface INaturalWorldMapCreator {
	generateVoronoiDiagramInfo: (AREA: number) => JDiagram;
	generateRiverMaps: (diag: JDiagram) => IRiverMapGeneratorOut;
	generateIslandMaps: (diag: JDiagram) => IslandMap[];
}
