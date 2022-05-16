import { Voronoi, BoundingBox, Site, Cell, Diagram, Edge, Vertex } from 'voronoijs';
import DataInformationFilesManager from '../DataInformationLoadAndSave';
import GenerateMapVoronoiSites from './GenerateMapVoronoiSites';
const dataInfoManager = DataInformationFilesManager._instance;

import JDiagram from './JDiagram';

export default class VoronoiDiagramMapCreator {

    static createDiagram(tam: number, rel: number = 0): JDiagram {
        console.time('compute')
        //let sites = VoronoiDiagramMapCreator.randomSites( seed, n)

        let diagram: Diagram/* | JDiagramInfo;
        const data: IJDiagramInfo | undefined = dataInfoManager.loadDiagram(tam*1000);
        
        if (!data) {*/
        let bbox: BoundingBox = { xl: -180, xr: 180, yt: -90, yb: 90 };
        let vor = new Voronoi();
        console.time('Generate Sites');

        let sites: Site[];
        const loaded: Site[] = dataInfoManager.loadSites(tam * 1000);
        if (loaded.length > 0) {
            sites = loaded;
            diagram = vor.compute(sites, bbox);
        } else {
            sites = GenerateMapVoronoiSites.randomOnBuffRegsSites(tam * 1000);
            diagram = vor.compute(sites, bbox);

            for (let i = 1; i <= rel; i++) {
                sites = VoronoiDiagramMapCreator.improveSites(diagram.cells);
                diagram = vor.compute(sites, bbox);
            }
            dataInfoManager.saveSites(sites, tam * 1000);
        }
        /*} else {
            diagram = new JDiagramInfo(data);
        }*/

        console.timeEnd('compute')

        return new JDiagram(diagram);
    }

    private static improveSites(cells: Cell[]): Site[] {
        let out: Site[] = [];
        for (let c of cells) {
            out.push(VoronoiDiagramMapCreator.getCentroid(c));
        }
        return out;
    }

    private static getCentroid(c: Cell): Site {
        const hes = c.halfedges;
        let lrg: number = hes.length;
        let xx: number = 0, yy: number = 0;
        for (let i = 0; i < lrg; i++) {
            xx += hes[i].getEndpoint().x
            yy += hes[i].getEndpoint().y
        }

        return { id: c.site.id, x: xx / lrg, y: yy / lrg }
    }

}


