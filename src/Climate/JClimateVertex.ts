
import JDiagram from "../Voronoi/JDiagram";
import JVertex from "../Voronoi/JVertex";
import JCell from "../Voronoi/JCell";
import JWMap from "../JWMap";
import {IJVertexClimateInfo} from '../VertexInformation/JVertexClimate';

export default class JClimateVertex extends JWMap {
	constructor(d: JDiagram) {
		super(d);
		this.diagram.forEachVertex((vertex: JVertex) => {
			let info: IJVertexClimateInfo = {
				id: vertex.id,
				tempMonth: [0,0,0,0,0,0,0,0,0,0,0,0],
				precipMonth: [0,0,0,0,0,0,0,0,0,0,0,0],
			}
			
			const cells: JCell[] = this.diagram.getCellsAssociated(vertex);
			cells.forEach((c: JCell) => {
				const ch = c.info.cellClimate;
				info.tempMonth = ch.tempMonth.map((t: number, i: number) => info.tempMonth[i] + t);
				info.precipMonth = ch.precipMonth.map((p: number, i: number) => info.precipMonth[i] + p);
			})
			info.tempMonth = info.tempMonth.map((t: number) => t/cells.length);
			info.precipMonth = info.precipMonth.map((p: number) => p/cells.length);

			vertex.info.setClimateInfo(info)
			
		})
	}

	
}