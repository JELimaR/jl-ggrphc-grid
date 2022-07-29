import JDiagram from "../Voronoi/JDiagram";

export default abstract class MapGenerator {
  private _diagram: JDiagram;

  constructor(diagram: JDiagram) {
    this._diagram = diagram;
  }

  get diagram(): JDiagram { return this._diagram }
  abstract generate(): any;
}
