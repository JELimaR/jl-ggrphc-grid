import { Voronoi, BoundingBox, Site, Cell, Diagram } from 'voronoijs';
import DataInformationFilesManager from '../DataInformationLoadAndSave';
// import GenerateMapVoronoiSites from './GenerateMapVoronoiSites';
const dataInfoManager = DataInformationFilesManager._instance;
import AzgaarReaderData from '../AzgaarData/AzgaarReaderData';

const ard: AzgaarReaderData = AzgaarReaderData.instance;

import JDiagram from './JDiagram';

export default class VoronoiDiagramCreator {

	static createDiagram(tam: number, rel: number = 0): JDiagram {
		console.time('compute')
		

		let diagram: Diagram;
		
		let bbox: BoundingBox = { xl: -180, xr: 180, yt: -90, yb: 90 };
		let vor = new Voronoi();
		console.time('Generate Sites');

		let sites: Site[] = ard.sites();
		
		diagram = vor.compute(sites, bbox);
		console.timeEnd('compute')

		return new JDiagram(diagram);
	}

}


