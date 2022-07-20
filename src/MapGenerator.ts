import JDiagram from "./Voronoi/JDiagram";

export default class MapGenerator {
  private _diagram: JDiagram;
  // private _isGenerated: boolean = false;

  constructor(diagram: JDiagram) {
    this._diagram = diagram;
  }

  get diagram(): JDiagram { return this._diagram }
  // get isGenerated(): boolean { return this._isGenerated }
  // generate(): void {
  // 	this._isGenerated = true;
  // }
}
