import { Voronoi, BoundingBox, Site, Cell, Diagram } from 'voronoijs';
/// import DataInformationFilesManager from '../DataInformationLoadAndSave';


import JDiagram from './JDiagram';
import { IPoint } from '../Geom/JPoint';
import VoronoiSitesGenerator from './VoronoiSitesGenerator';

export default class VoronoiDiagramCreator {

	static createAzgaarInitialDiagram(): JDiagram {
		console.time('compute prim')

		let diagram: Diagram;
		
		let bbox: BoundingBox = { xl: -180, xr: 180, yt: -90, yb: 90 };
		let vor = new Voronoi();
		console.time('Generate Sites');
		let sites: Site[] = VoronoiSitesGenerator.getAzgaarSites();
		console.timeEnd('Generate Sites');
		
		diagram = vor.compute(sites, bbox);
		console.timeEnd('compute prim')

		return new JDiagram(diagram);
	}

	static createSubDiagram(jd: JDiagram, AREA: number): JDiagram {
		
		console.time('compute sec')

		let diagram: Diagram;
		
		let bbox: BoundingBox = { xl: -180, xr: 180, yt: -90, yb: 90 };
		let vor = new Voronoi();

		console.log('Generating sub sites');
		console.time('Generate sub sites');
	
		let subSitesData: {p: IPoint, cid: number}[] = VoronoiSitesGenerator.getSecSites(jd, AREA);
		const sites: Site[] = subSitesData.map((elem: {p: IPoint, cid: number}) => {
			return {id: 0, x: elem.p.x, y: elem.p.y}
		})
		
		console.timeEnd('Generate sub sites');
		console.log('sites cant', sites.length)
		diagram = vor.compute(sites, bbox);
		console.timeEnd('compute sec')

		return new JDiagram(diagram, {d: jd, a: AREA, s: subSitesData})
	}

}


