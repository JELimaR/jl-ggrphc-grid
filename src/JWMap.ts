import {  } from "./JWorldMap";
import JCell from "./Voronoi/JCell";
import JVertex from "./Voronoi/JVertex";
import JDiagram from "./Voronoi/JDiagram";
import { IDiagramContainer } from "./generalInterfaces";


export default abstract class JWMap implements IDiagramContainer { // cambiar nombre
  private _diagram: JDiagram;
  constructor(d: JDiagram) {
    this._diagram = d;
  }
  get diagram(): JDiagram { return this._diagram }
	// get cells(): any { return this._diagram.cells }
	
}