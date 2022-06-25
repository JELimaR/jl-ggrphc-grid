// import { Cell, Halfedge } from "voronoijs";
import JPoint from '../Geom/JPoint';
import JEdge from './JEdge';
import JHalfEdge from './JHalfEdge';
import JSite, { IJSiteInfo } from './JSite';

import * as turf from '@turf/turf';
//import JCellInformation, { IJCellInformation } from "./JCellInformation";
import JCellInformation from '../CellInformation/JCellInformation';
import JCellHeight, { IJCellHeightInfo } from '../CellInformation/JCellHeight';
import JCell from './JCell';

export default class JCellSecondary extends JCell {

	_cellFather: JCell;

	constructor(c: JCell, s: JSite, arrEdges: JEdge[]) {
		super(s, arrEdges);
		this._cellFather = c;
	}
	
}