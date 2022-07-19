import VoronoiDiagramCreator from './Voronoi/VoronoiDiagramCreator';
import JDiagram from './Voronoi/JDiagram';
import HeightMapGenerator from './heightmap/HeightMapGenerator';
import JGrid from './Geom/JGrid';
import ClimateMapGenerator from './Climate/ClimateMapGenerator';
import RiverMapGenerator from './River/RiverMapGenerator';
import IslandMap from './heightmap/IslandMap';

export default class NaturalWorld {
	
	private _diagram: JDiagram;
	_heightMap: HeightMapGenerator;
	// private _climateMap: JClimateMap;
	_riverMap: RiverMapGenerator;

	private _islands: IslandMap[] = [];

	constructor(AREA: number, GRAN: number) {
		
		const gnw = this.generateNaturalWorld(GRAN, AREA);

		this._diagram = gnw.d;
		this._heightMap = gnw.h;
		this._riverMap = gnw.r;
		//
		this._islands = gnw.i;
		
	}

	get diagram(): JDiagram { return this._diagram }
	get islands(): IslandMap[] {
		if (this._islands.length == 0) {
			
		}
		return this._islands;
	}

	private generateNaturalWorld(GRAN: number, AREA: number): {
		d: JDiagram,
		h: HeightMapGenerator,

		r: RiverMapGenerator,

		i: IslandMap[],
	} {
		console.time('Generate Natural World')
		const iniDiagram: JDiagram = this.createInitialVoronoiDiagram();
		const iniGrid: JGrid = this.createGrid(iniDiagram, GRAN)
		const diagram = this.createPrincipalVoronoiDiagram(iniDiagram, AREA);
		
		const heightMap = new HeightMapGenerator(diagram, iniDiagram);
		const islandsArr = heightMap.generate();
		this.generateClimate(diagram, iniGrid);
		const riverMap = this.generateRivers(diagram);
		console.timeEnd('Generate Natural World')
		return {
			d: diagram,
			h: heightMap,
			// c: climateMap,
			r: riverMap,

			i: islandsArr,
		}
	}
	
	private createInitialVoronoiDiagram(): JDiagram {
		console.log('-----init voronoi-------');
		console.time('primary voronoi');
		const iniDiagram: JDiagram = VoronoiDiagramCreator.createDiagram();
		console.timeEnd('primary voronoi');
		return iniDiagram;
	}
	private createPrincipalVoronoiDiagram(initialDiagram: JDiagram, AREA: number): JDiagram {
		console.log('-----second voronoi-------');
		const inihmg = new HeightMapGenerator(initialDiagram);
		inihmg.generate();
		console.time('second voronoi');
		const diagram: JDiagram = VoronoiDiagramCreator.createSubDiagram(initialDiagram, AREA);
		console.timeEnd('second voronoi');
		return diagram;
	}
	private createGrid(diagram: JDiagram, GRAN: number): JGrid {
		console.log('-----init grid------');
		console.time('grid');
		const grid: JGrid = new JGrid(GRAN, diagram);
		console.timeEnd('grid');
		return grid;
	}
	private generateClimate(diagram: JDiagram, grid: JGrid): void {
		const cmg = new ClimateMapGenerator(diagram, grid);
		cmg.generate();
	}
	private generateRivers(diagram: JDiagram): RiverMapGenerator {
		const rmg = new RiverMapGenerator(diagram);
		rmg.generate();
		return rmg;
	}
}