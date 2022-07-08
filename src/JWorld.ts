import VoronoiDiagramCreator from './Voronoi/VoronoiDiagramCreator';
import JDiagram from './Voronoi/JDiagram';
import JHeightMap from './heightmap/JHeightMap';
// import JTempMap from './heightmap/JTempMap';
import JGrid from './Geom/JGrid';
import { ICellContainer } from './JWorldMap';
import JCell from './Voronoi/JCell';
import JClimateMap from './Climate/JClimateMap';
import JRiverMap from './heightmap/JRiverMap';
import JTempGrid from './heightmap/JTempGrid';
import JPressureGrid from './heightmap/JPressureGrid';
import JPrecipGrid from './heightmap/JPrecipGrid';
// import JSubDiagram from './Voronoi/JSubDiagram';

export default class JWorld {
	/*
	private _primaryDiagram: JDiagram;
	private _secondaryDiagram: JDiagram;
	private _grid: JGrid;
	private _heightMap: JHeightMap;
	private _heightMap2: JHeightMap;
	// private _cellAreaProm: number;
	*/
	// nuevos
	private _diagram: JDiagram;
	private _grid: JGrid;
	private _heightMap: JHeightMap;
	private _climateMap: JClimateMap;
	private _riverMap: JRiverMap;

	constructor(AREA: number, GRAN: number) {
		/*
		// this._cellAreaProm = AREA;
		console.log('init voronoi');
		console.time('primary voronoi');
		this._primaryDiagram = VoronoiDiagramCreator.createDiagram();
		console.timeEnd('primary voronoi');

		// construir diagrama secundario
		this._heightMap = new JHeightMap(this._primaryDiagram);
		console.time('secondary voronoi');
		this._secondaryDiagram = VoronoiDiagramCreator.createSubDiagram(this._primaryDiagram, this._cellAreaProm);
		console.timeEnd('secondary voronoi');

		// generar heightMap2
		this._heightMap2 = new JHeightMap(this._secondaryDiagram, this._primaryDiagram);

		console.log('init grid');
		console.time('grid');
		this._grid = new JGrid(GRAN, this._secondaryDiagram);
		console.timeEnd('grid');
		*/
		// nuevo
		const gnw = this.generateNaturalWorld(GRAN, AREA);

		this._diagram = gnw.d;
		this._grid = gnw.g;
		this._heightMap = gnw.h;
		this._climateMap = gnw.c;
		this._riverMap = gnw.r;
		
	}

	get diagram(): JDiagram { return this._diagram/*this._primaryDiagram*/ }
	// get secondaryDiagram(): JDiagram { return this._secondaryDiagram! }
	get grid(): JGrid { return this._grid }
	/*
	generateHeightMap(): JHeightMap {
		if (!this._heightMap) {
			this._heightMap = new JHeightMap(this._primaryDiagram);
			console.time('secondary voronoi');
			this._secondaryDiagram = VoronoiDiagramCreator.createSubDiagram(this._primaryDiagram, this._cellAreaProm);
			console.timeEnd('secondary voronoi');	
		}
		return this._heightMap;
	}
	*/
	/*
	generateHeightMap2(): JHeightMap {
		return this._heightMap2;
	}
	*/
	// generateTemperatureMap(): JTempMap {
	// 	if (!this._temperatureMap)
	// 		this._temperatureMap = new JTempMap(this._diagram, this.generateHeightMap());
	// 	return this._temperatureMap;
	// }

	/*
	 * GENERATE NATURAL WORLD
	 */
	private generateNaturalWorld(GRAN: number, AREA: number): {d: JDiagram, g: JGrid, h: JHeightMap, c: JClimateMap, r: JRiverMap} {
		const iniDiagram: JDiagram = this.createInitialVoronoiDiagram();
		const iniHeightMap: JHeightMap = new JHeightMap(iniDiagram);
		const diagram = this.createPrincipalVoronoiDiagram(iniDiagram, AREA);
		const grid = this.createGrid(this._diagram, GRAN)
		const heightMap = new JHeightMap(this._diagram, iniDiagram);
		const climateMap = this.generateClimate();
		const riverMap = this.generateRivers();
		return {
			d: diagram,
			g: grid,
			h: heightMap,
			c: climateMap,
			r: riverMap,
		}
	}
	
	private createInitialVoronoiDiagram(): JDiagram {
		console.log('init voronoi');
		console.time('primary voronoi');
		const iniDiagram: JDiagram = VoronoiDiagramCreator.createDiagram(/*TOTAL, 1*/);
		console.timeEnd('primary voronoi');
		return iniDiagram;
	}
	private createPrincipalVoronoiDiagram(initialDiagram: JDiagram, AREA: number): JDiagram {
		console.time('secondary voronoi');
		const diagram: JDiagram = VoronoiDiagramCreator.createSubDiagram(initialDiagram, AREA);
		console.timeEnd('secondary voronoi');
		return diagram;
	}
	private createGrid(diagram: JDiagram, GRAN: number): JGrid {
		console.log('init grid');
		console.time('grid');
		const grid: JGrid = new JGrid(GRAN, diagram);
		console.timeEnd('grid');
		return grid;
	}
	private generateClimate(): JClimateMap {
		const tempGrid = new JTempGrid(this.grid);
		const pressGrid = new JPressureGrid(this.grid, tempGrid);
		const precipGrid: JPrecipGrid = new JPrecipGrid(pressGrid, tempGrid)

		return new JClimateMap(this._diagram, precipGrid, tempGrid);

	}
	private generateRivers(): JRiverMap {
		return new JRiverMap(this._diagram)
	}
}