/*import { Site } from 'voronoijs';
import * as turf from '@turf/turf';

import RandomNumberGenerator from '../Geom/RandomNumberGenerator';
import DataInformationFilesManager from '../DataInformationLoadAndSave';
// import {BuffRegs} from '../zones/BuffRegs';
import { pointInArrReg } from '../Geom/utilsTurfFunctions';
import AzgaarReaderData from '../AzgaarData/AzgaarReaderData';

const dataInfoManager = DataInformationFilesManager.instance;

const XDIF: number = 360;
const YDIF: number = 180;

export default class GenerateMapVoronoiSites {
	static randomSimpleSites(n: number): Site[] {
		let out: Site[] = [];

		const randFunc = RandomNumberGenerator.makeRandomFloat(n);

		for (let i=0; i<n; i++ ) {
			const pos = this.randomSite(randFunc);
			out.push( {id: i%2, x: pos[0], y: pos[1]} );
		}
		return out;
	}

	static randomOnBuffRegsSites(total: number): Site[] {
		const loaded: Site[] = dataInfoManager.loadSites(total);
		if (loaded.length > 0) {
			return loaded;
		} else {
			let out: Site[] = [];
			const nr: number = Math.round(total*0.001);
			const nz: number = Math.round(total*0.999);
			console.log('entnum', {nr, nz});
			const randFunc = RandomNumberGenerator.makeRandomFloat(nr*nz);

			for (let i=0; i<nr; i++ ) {
				const pos = this.randomSite(randFunc)
				out.push( {id: nz+i, x: pos[0], y: pos[1]});
			}

			for (let i=0; i<nz; i++ ) {
				let ok: boolean = false;
				let pos: turf.Position;
				while (!ok) {
					pos = this.randomSite(randFunc);
					ok = this.isInBuffZone(pos);
					if (ok)
					out.push({id: i, x: pos[0], y: pos[1]});
				}
			
			}

			// dataInfoManager.saveSites(out, total);
			return out;
		}
	}

	static isInBuffZone(pos: turf.Position): boolean {
		return true;//pointInArrReg(pos, BuffRegs);
	}

	private static randomSite(randFloat: () => number): turf.Position {
		let xx = Math.round( randFloat()*XDIF*1000000 )/1000000 - 180;
		let yy = Math.round( randFloat()*YDIF*1000000 )/1000000 - 90;
		return [xx, yy];
	}
}
*/