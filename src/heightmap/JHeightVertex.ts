import JDiagram from "../Voronoi/JDiagram";
import JVertex from "../Voronoi/JVertex";
import JCell from "../Voronoi/JCell";
import JWMap from "../JWMap";
import {IJVertexHeightInfo} from '../VertexInformation/JVertexHeight';

// dejar en heighMap ?

export default class JHeightVertex extends JWMap {
	constructor(d: JDiagram) {
		super(d);
		this.diagram.forEachVertex((vertex: JVertex) => {
			let info: IJVertexHeightInfo;//  = { height: 0, heightType: 'land' }
			let hmin: number = 2, hprom: number = 0;
			let cantLand: number = 0, cantOcean: number = 0;
			const cells: JCell[] = this.diagram.getCellsAssociated(vertex);
			cells.forEach((c: JCell) => {
				const ch = c.info.cellHeight;
				if (ch.heightType == 'land') {
					cantLand++
					if (hmin > ch.height) hmin = ch.height
				}
				else cantOcean++;
				hprom += ch.height;
			})
			if (cantOcean == 0) {
				if (hmin == 0) console.log(vertex.id, cantLand)
				info = {
					id: vertex.id,
					height: (hmin - 0.005 < 0.2) ? (hmin - 0.2) * 0.5 + 0.2 : hmin - 0.005, // siempre mayor a 0.2
					heightType: 'land'
				}			
			}
			else if (cantLand == 0) {
				info = {id: vertex.id,height: hprom/cells.length, heightType: 'ocean'}
			}
			else {
				info = {id: vertex.id, height: 0.2, heightType: 'coast'}
			}

			vertex.info.setHeightInfo(info)
			
		})

		this.resolveDepressions()
	}

	private resolveDepressions() {
		let verticesArr: JVertex[] = [];
		this.forEachVertex((v: JVertex) => {
			if (v.info.vertexHeight.heightType == 'land') {
				verticesArr.push(v);
			}
		})
		let hay = true, it: number = 0;
		while (it < 250 && hay) {
			hay = false;
			verticesArr.forEach((v: JVertex) => {
				const mhn = this.getMinHeightNeighbour(v);
				if (mhn.info.height >= v.info.height) {
					hay = true;
					v.info.height += (mhn.info.height - v.info.height) + 0.01011;
				}			
			})
			it++;
		}
	}

	private getMinHeightNeighbour(vertex: JVertex): JVertex {
    const narr: JVertex[] = this.diagram.getVertexNeighbours(vertex);
    let out: JVertex = narr[0], minH = 2;
    narr.forEach((nc: JVertex) => {
      if (nc.info.height < minH) {
				out = nc;
				minH = nc.info.height;
			}
    })
    return out;
  }
}