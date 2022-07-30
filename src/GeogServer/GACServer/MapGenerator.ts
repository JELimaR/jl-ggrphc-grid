import JDiagram from "../../BuildingModel/Voronoi/JDiagram";

export default abstract class MapGenerator<T> {
  private _diagram: JDiagram;

  constructor(diagram: JDiagram) {
    this._diagram = diagram;
  }

  get diagram(): JDiagram { return this._diagram }
  abstract generate(): T;
}
