import { Site } from 'voronoijs';
import fs from 'fs';
import Jimp from 'jimp';

import JCell from './Voronoi/JCell';
import { IJContinentInfo, IJCountryInfo, IJIslandInfo, IJStateInfo, JContinentMap, JCountryMap, JIslandMap, JStateMap } from './RegionMap/RegionMap';
// import { IJDiagramInfo } from './Voronoi/JDiagram';
// import { IJEdgeInfo } from './Voronoi/JEdge';
import { IJGridPointInfo, JGridPoint } from './Geom/JGrid';
// import { IJCellInformation } from './Voronoi/JCellInformation';
// import { IJCellInformation } from './CellInformation/JCellInformation';
import { IJCellHeightInfo } from './CellInformation/JCellHeight';
// import JCellTemp, { IJCellTempInfo } from './CellInformation/JCellTemp';

export default class PNGDrawsDataManager {
	static _instance: PNGDrawsDataManager;

	private _dirPath: string = '';

	private constructor() {}

	static get instance(): PNGDrawsDataManager {
		if (!this._instance) {
			this._instance = new PNGDrawsDataManager();
		}
		return this._instance;
	}

	static configPath(path: string): void {
		this.instance._dirPath = path;
		fs.mkdirSync(this.instance._dirPath, {recursive: true});
	}

	// height drawing
	readHeight(): Jimp {
		let out: Jimp;
		try {
			const type = 'image/png'
			const buffer = fs.readFileSync(this._dirPath + `/h.png`);
			const imageData = Jimp.decoders[type](buffer);
			out =  new Jimp(imageData);
		
			return out;		
		} catch (e) {
			throw e;
		}
	}

	readHeight2(): Jimp {
		let out: Jimp;
		try {
			const type = 'image/png'
			const buffer = fs.readFileSync(this._dirPath + `/hazgaar.png`);
			const imageData = Jimp.decoders[type](buffer);
			out =  new Jimp(imageData);
		
			return out;		
		} catch (e) {
			throw e;
		}
	}

}

