import JPoint from "../Geom/JPoint";
import JVertex from "../Voronoi/JVertex";

// cambiar road por otra cosa
export interface IWaterRoutePoint { // puede ser una interface o una clase
  vertex: JVertex;
  flux: number;
}

export default class JRiver {
	_id: number;
  _vertices: IWaterRoutePoint[];
	_allVertices: JPoint[] = [];

	_length: number;

  constructor(id: number, points: IWaterRoutePoint[]) {
		this._id = id;
    this._vertices = points;
		this._length = this.calcLength();
  }

	get id(): number { return this._id }
	get length(): number { return this._length }

	private calcLength() {
		let out: number = 0;
		this._vertices.forEach((wrp: IWaterRoutePoint, i: number, a: IWaterRoutePoint[]) => {
			if (i < a.length-1) {
				const edge = wrp.vertex.getEdgeFromNeighbour(a[i+1].vertex);
				out += edge.length;
			}
		})
		return out;
	}
}