import MapGenerator from "../MapGenerator";
import JCell from "../../Voronoi/JCell";
import JDiagram from "../../Voronoi/JDiagram";
import JVertex from "../../Voronoi/JVertex";
import DrainageBasinMap from "../../MapContainerElements/DrainageBasinMap";
import FluxRouteMap from "../../MapContainerElements/FluxRouteMap";

export default class DrainageBasinMapGenerator extends MapGenerator {
	private _fluxRouteMap: Map<number, FluxRouteMap>
	constructor(d: JDiagram, fluxRouteMap: Map<number, FluxRouteMap>) {
		super(d);
		this._fluxRouteMap = fluxRouteMap;
	}

	generate() {
		console.log('aun no implementado');
	}

	generateIndividual(initialVertex: JVertex): DrainageBasinMap {
		if (!initialVertex.info.vertexFlux) throw new Error(`Se debe correr RiverMapGenerator`);
		const vertexFlux = initialVertex.info.vertexFlux;
		if
			(initialVertex.info.vertexHeight.heightType !== 'land' &&
			initialVertex.info.vertexHeight.heightType !== 'coast' &&
			initialVertex.info.vertexHeight.heightType !== 'lakeCoast')
			throw new Error(`El vertex no es valido. Debe ser 'land, 'coast' o 'lakeCoast'.`);
		
		const out: DrainageBasinMap = new DrainageBasinMap(initialVertex.id, this.diagram);

		const vertexList: Map<string, JVertex> = new Map<string, JVertex>();
		vertexFlux.fluxRouteIds.forEach((frId: number) => {
			const frm = this._fluxRouteMap.get(frId) as FluxRouteMap;
			frm.forEachVertex((v: JVertex) => vertexList.set(v.id, v));
		})

		vertexList.forEach((vl: JVertex) => {
			this.diagram.getCellsAssociated(vl).forEach((cell: JCell) => {
				if (cell.info.isLand) out.addCell(cell);
			})
		})
		
		return out;
	}
}