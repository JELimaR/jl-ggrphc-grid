import VoronoiDiagramCreator from './Voronoi/VoronoiDiagramCreator';
import JDiagram from './Voronoi/JDiagram';
import JHeightMap from './heightmap/JHeightMap';
// import JTempMap from './heightmap/JTempMap';
import JGrid from './Geom/JGrid';
import { ICellContainer } from './JWorldMap';
import JCell from './Voronoi/JCell';
// import JSubDiagram from './Voronoi/JSubDiagram';

export default class JWorld {
	
	private _primaryDiagram: JDiagram;
	private _secondaryDiagram: JDiagram;
	private _grid: JGrid;
	private _heightMap: JHeightMap | undefined;
	private _heightMap2: JHeightMap | undefined;
	// private _temperatureMap: JTempMap | undefined;
	
	constructor(AREA: number, GRAN: number) {
		// if (AREA < 5) AREA = 5;
		console.log('init voronoi');
		console.time('primary voronoi');
		this._primaryDiagram = VoronoiDiagramCreator.createDiagram(/*TOTAL, 1*/);
		console.timeEnd('primary voronoi');
		console.log('init grid');
		console.time('grid');
		this._grid = new JGrid(GRAN, this._primaryDiagram);
		console.timeEnd('grid');
		console.time('secondary voronoi');
		this._secondaryDiagram = VoronoiDiagramCreator.createSubDiagram(this._primaryDiagram, AREA);
		console.timeEnd('secondary voronoi');
	}

	get diagram(): JDiagram { return this._primaryDiagram }
	get secondaryDiagram(): JDiagram { return this._secondaryDiagram }
	get grid(): JGrid { return this._grid }

	generateHeightMap(): JHeightMap {
		if (!this._heightMap)
			this._heightMap = new JHeightMap(this._primaryDiagram);
		return this._heightMap;
	}
	generateHeightMap2(): JHeightMap {
		if (!this._heightMap2)
			this._heightMap2 = new JHeightMap(this._secondaryDiagram);
		return this._heightMap2;
	}
	// generateTemperatureMap(): JTempMap {
	// 	if (!this._temperatureMap)
	// 		this._temperatureMap = new JTempMap(this._diagram, this.generateHeightMap());
	// 	return this._temperatureMap;
	// }
}