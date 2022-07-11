import { Voronoi, BoundingBox, Site, Cell, Diagram } from 'voronoijs';
import DataInformationFilesManager from '../DataInformationLoadAndSave';
// import GenerateMapVoronoiSites from './GenerateMapVoronoiSites';

import AzgaarReaderData from '../AzgaarData/AzgaarReaderData';


import JDiagram from './JDiagram';
import JPoint, { IPoint } from '../Geom/JPoint';
import JCell from './JCell';

export default class VoronoiDiagramCreator {

	static createDiagram(/*tam: number, rel: number = 0*/): JDiagram {
		const ard: AzgaarReaderData = AzgaarReaderData.instance;
		console.time('compute prim')

		let diagram: Diagram;
		
		let bbox: BoundingBox = { xl: -180, xr: 180, yt: -90, yb: 90 };
		let vor = new Voronoi();
		console.time('Generate Sites');
		let sites: Site[] = ard.sites();
		console.timeEnd('Generate Sites');
		
		diagram = vor.compute(sites, bbox);
		console.timeEnd('compute prim')

		return new JDiagram(diagram);
	}

	static createSubDiagram(jd: JDiagram, AREA: number): JDiagram {
		const dataInfoManager = DataInformationFilesManager._instance;
		console.time('compute sec')

		let diagram: Diagram;
		
		let bbox: BoundingBox = { xl: -180, xr: 180, yt: -90, yb: 90 };
		let vor = new Voronoi();

		console.log('Generating sub sites');
		console.time('Generate sub sites');
		let subSitesData: {p: IPoint, cid: number}[] = dataInfoManager.loadSites(AREA);
		if (subSitesData.length == 0) {
			subSitesData = jd.getSubSites(AREA);
			dataInfoManager.saveSites(subSitesData, AREA);
		}
		console.timeEnd('Generate sub sites');

		const sites: Site[] = subSitesData.map((elem: {p: IPoint, cid: number}) => {
			return {id: 0, x: elem.p.x, y: elem.p.y}
		})
		console.log('sites cant', sites.length)
		diagram = vor.compute(sites, bbox);
		console.timeEnd('compute sec')

		return new JDiagram(diagram, {d: jd, a: AREA, s: subSitesData})
	}

}


