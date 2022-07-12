import JPoint from "../Geom/JPoint";
import JVertex from "../Voronoi/JVertex";

// cambiar road por otra cosa
export interface IJRiverInfo { // puede ser una interface o una clase
  id: number;
	vertices: string[];
}

export default class JRiver {
	private _id: number;
	_vertices: JVertex[]; // cambiar a vertices
	_allVertices: JPoint[] = [];

	_length: number;

  constructor(id: number, vertices: JVertex[]) {
		this._id = id;
		this._vertices = vertices;
		this._length = this.calcLength();
  }

	get id(): number { return this._id }
	get vertices(): JVertex[] { return this._vertices }
	get length(): number { return this._length }

	private calcLength() {
		let out: number = 0;
		this._vertices.forEach((vertex: JVertex, i: number, a: JVertex[]) => {
			if (i < a.length-1) {
				const edge = vertex.getEdgeFromNeighbour(a[i+1]);
				out += edge.length;
			}
		})
		return out;
	}

	getInterface(): IJRiverInfo {
		return {
			id: this._id,
			vertices: this._vertices.map((vertex: JVertex) => vertex.id)
		}
	}
}