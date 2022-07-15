import VoronoiDiagramCreator from './Voronoi/VoronoiDiagramCreator';
import JDiagram from './Voronoi/JDiagram';
import JHeightMap from './heightmap/JHeightMap';
import JGrid from './Geom/JGrid';
import JCell from './Voronoi/JCell';
import JClimateMap from './Climate/JClimateMap';
import JRiverMap from './Climate/JRiverMap';
import JPrecipGrid from './Climate/JPrecipGrid';
import { JIslandMap } from './RegionMap/JRegionMap';

export default class NaturalWorld {
	
	private _diagram: JDiagram;
	_heightMap: JHeightMap;
	// private _climateMap: JClimateMap;
	_riverMap: JRiverMap;

	_islands: JIslandMap[] = [];

	constructor(AREA: number, GRAN: number) {
		
		const gnw = this.generateNaturalWorld(GRAN, AREA);

		this._diagram = gnw.d;
		this._heightMap = gnw.h;
		// this._climateMap = gnw.c;
		this._riverMap = gnw.r;
		//
		this._islands = gnw.i;
		
	}

	get diagram(): JDiagram { return this._diagram }

	private generateNaturalWorld(GRAN: number, AREA: number): {
		d: JDiagram,
		h: JHeightMap,
		// c: JClimateMap,
		r: JRiverMap,

		i: JIslandMap[],
	} {
		console.time('Generate Natural World')
		const iniDiagram: JDiagram = this.createInitialVoronoiDiagram();
		const iniGrid: JGrid = this.createGrid(iniDiagram, GRAN)
		new JHeightMap(iniDiagram);
		const diagram = this.createPrincipalVoronoiDiagram(iniDiagram, AREA);
		
		const heightMap = new JHeightMap(diagram, iniDiagram);
		this.generateClimate(diagram, iniGrid);
		const riverMap = this.generateRivers(diagram);
		console.timeEnd('Generate Natural World')
		return {
			d: diagram,
			h: heightMap,
			// c: climateMap,
			r: riverMap,

			i: heightMap.islands,
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
		/*return*/ new JClimateMap(diagram, grid);
	}
	private generateRivers(diagram: JDiagram): JRiverMap {
		return new JRiverMap(diagram)
	}
}