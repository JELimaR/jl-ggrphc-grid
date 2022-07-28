import JDiagram from './Voronoi/JDiagram';
import Grid from './Grid/Grid';
import RiverMapGenerator, { IRiverMapGeneratorOut } from './GeneratorsAndCreators/Flux/RiverMapGenerator';
import IslandMap from './MapContainerElements/IslandMap';
import IslandMapGenerator from './GeneratorsAndCreators/Relief/IslandMapGenerator';
import GridCreator from './GeneratorsAndCreators/GridCreator';
import ClimateMapGenerator from './GeneratorsAndCreators/Climate/ClimateMapGenerator';
import HeightMapGenerator from './GeneratorsAndCreators/Relief/HeightMapGenerator';
import VoronoiDiagramCreator from './GeneratorsAndCreators/Voronoi/VoronoiDiagramCreator';

export default class NaturalWorldMapCreator { // debe tener su diagram?
	
	generateVoronoiDiagramInfo(AREA: number): JDiagram {
		console.time('Generate Natural World')
		const iniDiagram: JDiagram = this.createInitialVoronoiDiagram();
		const iniGrid: Grid = this.createGrid(iniDiagram)
		const diagram = this.createPrincipalVoronoiDiagram(iniDiagram, AREA);
		this.generateHeightMap(diagram, iniDiagram);
		this.generateClimateMap(diagram, iniGrid);
		console.timeEnd('Generate Natural World')
		return diagram;
	}

	private createInitialVoronoiDiagram(): JDiagram {
		console.log('-----init voronoi-------');
		console.time('primary voronoi');
		const vdc = new VoronoiDiagramCreator();
		const iniDiagram: JDiagram = vdc.createAzgaarInitialDiagram();
		console.timeEnd('primary voronoi');
		return iniDiagram;
	}
	private createPrincipalVoronoiDiagram(initialDiagram: JDiagram, AREA: number): JDiagram {
		console.log('-----second voronoi-------');
		const inihmg = new HeightMapGenerator(initialDiagram);
		inihmg.generate();
		console.time('second voronoi');
		const vdc = new VoronoiDiagramCreator();
		const diagram: JDiagram = vdc.createSubDiagram(initialDiagram, AREA);
		console.timeEnd('second voronoi');
		return diagram;
	}
	private createGrid(diagram: JDiagram): Grid {
		console.log('-----init grid------');
		console.time('grid');
		const grid: Grid = GridCreator.createGrid(diagram);
		console.timeEnd('grid');
		return grid;
	}
	private generateHeightMap(diagram: JDiagram, iniDiagram: JDiagram) {
		const hmg = new HeightMapGenerator(diagram, iniDiagram);
		hmg.generate();
	}
	private generateClimateMap(diagram: JDiagram, grid: Grid): void {
		const cmg = new ClimateMapGenerator(diagram, grid);
		cmg.generate();
	}
	//
	generateRiverMaps(diag: JDiagram): IRiverMapGeneratorOut {
		const rmg = new RiverMapGenerator(diag);
		return rmg.generate();
		/*const iro: IRiverMapGeneratorOut = rmg.generate();
		this._fluxRoutes = iro.fluxRoutes;
		this._rivers = iro.rivers;*/
	}
	generateIslandMaps(diag: JDiagram): IslandMap[] {
		const img: IslandMapGenerator = new IslandMapGenerator(diag);
		return img.generate();
	}
}