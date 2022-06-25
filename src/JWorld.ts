import VoronoiDiagramCreator from './Voronoi/VoronoiDiagramCreator';
import JDiagram from './Voronoi/JDiagram';
import JHeightMap from './heightmap/JHeightMap';
// import JTempMap from './heightmap/JTempMap';
import JGrid from './Geom/JGrid';
import { ICellContainer } from './JWorldMap';
import JCell from './Voronoi/JCell';

export default class JWorld implements ICellContainer {
	
	private _diagram: JDiagram;
	// private _primaryDiagram: JDiagram;
	private _grid: JGrid;
	private _heightMap: JHeightMap | undefined;
	// private _temperatureMap: JTempMap | undefined;
	
	constructor(TOTAL: number, GRAN: number) {
		if (TOTAL < 5) TOTAL = 5;
		console.log('init voronoi');
		console.time('voronoi');
		this._diagram = VoronoiDiagramCreator.createDiagram(TOTAL, 1);
		console.timeEnd('voronoi');
		console.log('init grid');
		console.time('grid');
		this._grid = new JGrid(GRAN, this._diagram);
		console.timeEnd('grid');
	}

	get diagram(): JDiagram { return this._diagram }
	get grid(): JGrid { return this._grid }
	forEachCell(func: (cell: JCell)=>void) {
		this.diagram.forEachCell(func);
	}

	generateHeightMap(): JHeightMap {
		if (!this._heightMap)
			this._heightMap = new JHeightMap(this._diagram);
		return this._heightMap;
	}
	// generateTemperatureMap(): JTempMap {
	// 	if (!this._temperatureMap)
	// 		this._temperatureMap = new JTempMap(this._diagram, this.generateHeightMap());
	// 	return this._temperatureMap;
	// }
}