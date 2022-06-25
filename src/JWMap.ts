import { ICellContainer } from "./JWorldMap";
import JCell from "./Voronoi/JCell";
import JVertex from "./Voronoi/JVertex";
import JDiagram from "./Voronoi/JDiagram";


export default abstract class JWMap implements ICellContainer {
  private _diagram: JDiagram;
  constructor(d: JDiagram) {
    this._diagram = d;
  }
  get diagram(): JDiagram { return this._diagram }
	get cells(): any { return this._diagram.cells }
	
	forEachCell(func: (c: JCell) => void) {
		this._diagram.forEachCell(func);
	}

	forEachVertex(func: (v: JVertex) => void) {
		this._diagram.forEachVertex(func);
	}
}