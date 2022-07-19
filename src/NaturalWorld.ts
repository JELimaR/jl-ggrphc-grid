import VoronoiDiagramCreator from './Voronoi/VoronoiDiagramCreator';
import JDiagram from './Voronoi/JDiagram';
import HeightMapGenerator from './heightmap/HeightMapGenerator';
import JGrid from './Geom/JGrid';
import ClimateMapGenerator from './Climate/ClimateMapGenerator';
import RiverMapGenerator, { IRiverMapGeneratorOut } from './River/RiverMapGenerator';
import IslandMap from './heightmap/IslandMap';
import IslandMapGenerator from './heightmap/IslandMapGenerator';
import FluxRoute from './River/FluxRoute';
import RiverMap from './River/RiverMap';

export default class NaturalWorld {
	
	private _diagram: JDiagram;
	// _heightMap: HeightMapGenerator;
	// private _climateMap: JClimateMap;
	// _riverMap: RiverMapGenerator;

	private _islands: IslandMap[] = [];
	private _fluxRoutes: Map<number, FluxRoute> = new Map<number, FluxRoute>();
  private _rivers: Map<number, RiverMap> = new Map<number, RiverMap>();

	constructor(AREA: number, GRAN: number) {
		
		const gnw = this.generateNaturalWorld(GRAN, AREA);

		this._diagram = gnw.d;
		// this._heightMap = gnw.h;
		this._fluxRoutes = gnw.iro.fluxRoutes;
		this._rivers = gnw.iro.rivers;
		// this._riverMap = gnw.r;
		//
		// this._islands = gnw.i;
		
	}

	get diagram(): JDiagram { return this._diagram }
	get islands(): IslandMap[] {
		if (this._islands.length == 0) {
			const img: IslandMapGenerator = new IslandMapGenerator(this._diagram);
			this._islands = img.generate();
		}
		return this._islands;
	}
	get fluxRoutes() {
		return this._fluxRoutes;
	}
	get rivers() {
		return this._rivers;
	}
	/**/

	private generateNaturalWorld(GRAN: number, AREA: number): {
		d: JDiagram,
		// h: HeightMapGenerator,

		iro: IRiverMapGeneratorOut,

		// i: IslandMap[],
	} {
		console.time('Generate Natural World')
		const iniDiagram: JDiagram = this.createInitialVoronoiDiagram();
		const iniGrid: JGrid = this.createGrid(iniDiagram, GRAN)
		const diagram = this.createPrincipalVoronoiDiagram(iniDiagram, AREA);
		this.generateHeightMap(diagram, iniDiagram);
		this.generateClimateMap(diagram, iniGrid);
		const rmgout = this.generateRiverMaps(diagram);
		console.timeEnd('Generate Natural World')
		return {
			d: diagram,
			// h: heightMap,
			// c: climateMap,
			iro: rmgout,

			// i: islandsArr,
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
	private generateHeightMap(diagram: JDiagram, iniDiagram: JDiagram) {
		const hmg = new HeightMapGenerator(diagram, iniDiagram);
		hmg.generate();
	}
	private generateClimateMap(diagram: JDiagram, grid: JGrid): void {
		const cmg = new ClimateMapGenerator(diagram, grid);
		cmg.generate();
	}
	private generateRiverMaps(diagram: JDiagram): IRiverMapGeneratorOut {
		const rmg = new RiverMapGenerator(diagram);
		return rmg.generate();
	}

	/* otras funciones genericas */
	get riverLengthSorted(): RiverMap[] { // mover esta funcion a algo superior a world
		let out: RiverMap[] = [];
		this._rivers.forEach((river: RiverMap) => out.push(river));
		out = out.sort((a: RiverMap, b: RiverMap) => b.length - a.length)
		return out;
	}
}