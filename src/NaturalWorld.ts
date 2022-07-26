import VoronoiDiagramCreator from './Voronoi/VoronoiDiagramCreator';
import JDiagram from './Voronoi/JDiagram';
import HeightMapGenerator from './heightmap/HeightMapGenerator';
import JGrid from './Geom/JGrid';
import ClimateMapGenerator from './Climate/ClimateMapGenerator';
import RiverMapGenerator, { IRiverMapGeneratorOut } from './River/RiverMapGenerator';
import IslandMap from './heightmap/IslandMap';
import IslandMapGenerator from './heightmap/IslandMapGenerator';
import FluxRouteMap from './River/FluxRouteMap';
import RiverMap from './River/RiverMap';

export default class NaturalWorld {

	private _diagram: JDiagram;
	// _heightMap: HeightMapGenerator;
	// private _climateMap: JClimateMap;
	// _riverMap: RiverMapGenerator;

	// map elements estos elementos pueden ser generados despues y no en el constructor
	private _islands: IslandMap[] = [];
	private _fluxRoutes: Map<number, FluxRouteMap> = new Map<number, FluxRouteMap>();
	private _rivers: Map<number, RiverMap> = new Map<number, RiverMap>();

	constructor(AREA: number) {

		const gnw = this.generateNaturalWorld(AREA);
		this._diagram = gnw.d;
		// this._heightMap = gnw.h;
		// this._fluxRoutes = gnw.iro.fluxRoutes;
		// this._rivers = gnw.iro.rivers;
		// this._riverMap = gnw.r;
		//
		// this._islands = gnw.i;

	}

	get diagram(): JDiagram { return this._diagram }
	get islands(): IslandMap[] {
		if (this._islands.length === 0) /*this._islands = */this.generateIslandMaps();
		return this._islands;
	}
	get fluxRoutes() {
		if (this._fluxRoutes.size === 0) {
			/*const iro: IRiverMapGeneratorOut = */this.generateRiverMaps();
			// this._fluxRoutes = iro.fluxRoutes;
			// this._rivers = iro.rivers;
		}
		return this._fluxRoutes;
	}
	get rivers() {
		if (this._rivers.size === 0) {
			/*const iro: IRiverMapGeneratorOut = */this.generateRiverMaps();
			// this._fluxRoutes = iro.fluxRoutes;
			// this._rivers = iro.rivers;
		}
		return this._rivers;
	}
	/**/

	private generateNaturalWorld(AREA: number): {
		d: JDiagram,
		// h: HeightMapGenerator,

		// iro: IRiverMapGeneratorOut,

		// i: IslandMap[],
	} {
		console.time('Generate Natural World')
		const iniDiagram: JDiagram = this.createInitialVoronoiDiagram();
		const iniGrid: JGrid = this.createGrid(iniDiagram)
		const diagram = this.createPrincipalVoronoiDiagram(iniDiagram, AREA);
		this.generateHeightMap(diagram, iniDiagram);
		this.generateClimateMap(diagram, iniGrid);

		// const islandsArr = this.generateIslandMaps(diagram);
		// const rmgout = this.generateRiverMaps(diagram);
		console.timeEnd('Generate Natural World')
		return {
			d: diagram,
			// h: heightMap,
			// c: climateMap,
			// iro: rmgout,

			// i: islandsArr,
		}
	}

	private createInitialVoronoiDiagram(): JDiagram {
		console.log('-----init voronoi-------');
		console.time('primary voronoi');
		const iniDiagram: JDiagram = VoronoiDiagramCreator.createAzgaarInitialDiagram();
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
	private createGrid(diagram: JDiagram): JGrid {
		console.log('-----init grid------');
		console.time('grid');
		const grid: JGrid = new JGrid(diagram);
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
	// se generan fuera del constructor
	private generateRiverMaps(): void {//IRiverMapGeneratorOut {
		const rmg = new RiverMapGenerator(this.diagram);
		// return rmg.generate();
		const iro: IRiverMapGeneratorOut = rmg.generate();
		this._fluxRoutes = iro.fluxRoutes;
		this._rivers = iro.rivers;
	}
	private generateIslandMaps(): void{
		const img: IslandMapGenerator = new IslandMapGenerator(this.diagram);
		this._islands = img.generate();
	}

	/* otras funciones genericas */
	get riverLengthSorted(): RiverMap[] { // mover esta funcion a algo superior a world
		let out: RiverMap[] = [];
		this.rivers.forEach((river: RiverMap) => out.push(river));
		out = out.sort((a: RiverMap, b: RiverMap) => b.length - a.length)
		return out;
	}
}