import { Site } from 'voronoijs';
import * as turf from '@turf/turf';
import AzgaarReaderData from '../AzgaarData/AzgaarReaderData';
import InformationFilesManager from '../DataInformationLoadAndSave';
import { IPoint } from '../Geom/Point';
import JDiagram from './JDiagram';
import RandomNumberGenerator from '../Geom/RandomNumberGenerator';

const XDIF = 360;
const YDIF = 180;

export default class VoronoiSitesGenerator {
	static getAzgaarSites(): Site[] {
		const ard: AzgaarReaderData = AzgaarReaderData.instance;
		return ard.sites();
	}

	static getSecSites(jd: JDiagram, AREA: number) {
		const ifm = InformationFilesManager._instance;

		let subSitesData: { p: IPoint, cid: number }[] = ifm.loadSubSites(AREA);
		if (subSitesData.length == 0) {
			subSitesData = jd.getSubSites(AREA);
			ifm.saveSubSites(subSitesData, AREA);
		}

		return subSitesData;
	}

	static getRandomSites(count: number): Site[] {
		let out: Site[] = [];
		const randFunc = RandomNumberGenerator.makeRandomFloat(count);

		for (let i = 0; i < count; i++) {
			let pos: turf.Position = this.randomSite(randFunc);
			out.push({ id: i, x: pos[0], y: pos[1] });
		}
		return out;
	}

	private static randomSite(randFloat: () => number): turf.Position {
		let xx = Math.round(randFloat() * XDIF * 1000000) / 1000000 - XDIF/2;
		let yy = Math.round(randFloat() * YDIF * 1000000) / 1000000 - YDIF/2;
		return [xx, yy];
	}
}
