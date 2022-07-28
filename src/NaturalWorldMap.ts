import JDiagram from './Voronoi/JDiagram';
import { IRiverMapGeneratorOut } from './GeneratorsAndCreators/Flux/RiverMapGenerator';
import IslandMap from './MapContainerElements/IslandMap';
import RiverMap from './MapContainerElements/RiverMap';
import FluxRouteMap from './MapContainerElements/FluxRouteMap';
import INaturalWorldMapCreator from './INaturalWorldMapCreator';

export default class NaturalWorldMap {

	private _diagram: JDiagram;
	private _creator: INaturalWorldMapCreator

	// map elements estos elementos son generados despues y no en el constructor
	private _islands: IslandMap[] = [];
	private _fluxRoutes: Map<number, FluxRouteMap> = new Map<number, FluxRouteMap>();
	private _rivers: Map<number, RiverMap> = new Map<number, RiverMap>();

	constructor(AREA: number, nwmc: INaturalWorldMapCreator) {
		// this.generateVoronoiDiagramInfo(AREA);
		this._creator = nwmc;
		this._diagram = this._creator.generateVoronoiDiagramInfo(AREA)
	}

	constructor2() {
	}

	get diagram(): JDiagram { return this._diagram }
	get islands(): IslandMap[] {
		if (this._islands.length === 0) 
			this._islands = this._creator.generateIslandMaps(this._diagram);
		return this._islands;
	}
	get fluxRoutes() {
		if (this._fluxRoutes.size === 0) {
			this.setFluxElements();
		}
		return this._fluxRoutes;
	}
	get rivers() {
		if (this._rivers.size === 0) {
			this.setFluxElements();
		}
		return this._rivers;
	}

	private setFluxElements() {
		const iro: IRiverMapGeneratorOut = this._creator.generateRiverMaps(this._diagram);
		this._fluxRoutes = iro.fluxRoutes;
		this._rivers = iro.rivers;
	}
	/**/
/*
	private generateVoronoiDiagramInfo(AREA: number): JDiagram {
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
	// se generan fuera del constructor
	private generateRiverMaps(): void {//IRiverMapGeneratorOut {
		const rmg = new RiverMapGenerator(this.diagram);
		// return rmg.generate();
		const iro: IRiverMapGeneratorOut = rmg.generate();
		this._fluxRoutes = iro.fluxRoutes;
		this._rivers = iro.rivers;
	}
	private generateIslandMaps(): void {
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