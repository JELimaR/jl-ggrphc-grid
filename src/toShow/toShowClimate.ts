import NaturalWorld from "../NaturalWorld";
import Shower from "./Shower";
import * as JCellToDrawEntryFunctions from '../Drawer/JCellToDrawEntryFunctions';

import JCell from "../Voronoi/JCell";
import { inRange } from "../utilFunctions";
import { lifeZonesList, TKoppenSubType, TKoppenType } from "../CellInformation/JCellClimate";
import JPoint from "../Geom/JPoint";

export default class ShowClimate extends Shower {

	constructor(world: NaturalWorld, area: number, folderSelected: string) {
		super(world, area, folderSelected, 'climate');
	}

	drawKoppen(zoom: number = 0, center?: JPoint) {
		this.d.clear(zoom, center);
		this.d.drawBackground()
		this.d.drawCellContainer(this.w.diagram, JCellToDrawEntryFunctions.koppen(1))
		this.d.drawMeridianAndParallels();
		this.d.saveDrawFile(`${this.a}koppen.png`);
	}

	drawLifeZones(zoom: number = 0, center?: JPoint) {
		this.d.clear(zoom, center);
		this.d.drawCellContainer(this.w.diagram, JCellToDrawEntryFunctions.lifeZones(1))
		this.d.drawMeridianAndParallels();
		this.d.saveDrawFile(`${this.a}lifeZones.png`);
	}

	drawPrecipMonth(month: number, zoom: number = 0, center?: JPoint) {
		this.d.clear(zoom, center);
		month = inRange(month, 1, 12);
		this.d.drawBackground()
		this.d.drawCellContainer(this.w.diagram, JCellToDrawEntryFunctions.precipitationMonth(month))
		this.d.drawMeridianAndParallels();
		this.d.saveDrawFile(`${this.a}precip${(month < 10 ? `0${month}` : `${month}`)}.png`);
	}

	drawPrecipMedia(zoom: number = 0, center?: JPoint) {
		this.d.clear(zoom, center);
		this.d.drawCellContainer(this.w.diagram, JCellToDrawEntryFunctions.precipitationMedia())
		this.d.drawMeridianAndParallels();
		this.d.saveDrawFile(`${this.a}precipMedia.png`);
	}

	drawTempMonth(month: number, zoom: number = 0, center?: JPoint) {
		this.d.clear(zoom, center);
		month = inRange(month, 1, 12);
		this.d.drawBackground()
		this.d.drawCellContainer(this.w.diagram, JCellToDrawEntryFunctions.temperatureMonth(month))
		this.d.drawMeridianAndParallels();
		this.d.saveDrawFile(`${this.a}temp${(month < 10 ? `0${month}` : `${month}`)}.png`);
	}

	drawTempMedia(zoom: number = 0, center?: JPoint) {
		this.d.clear(zoom, center);
		this.d.drawCellContainer(this.w.diagram, JCellToDrawEntryFunctions.temperatureMedia())
		this.d.drawMeridianAndParallels();
		this.d.saveDrawFile(`${this.a}tempMedia.png`);
	}

	drawAltitudinalBelts(zoom: number = 0, center?: JPoint) {
		this.d.clear(zoom, center);
		this.d.drawCellContainer(this.w.diagram, JCellToDrawEntryFunctions.altitudinalBelts(1))
		this.d.drawMeridianAndParallels();
		this.d.saveDrawFile(`${this.a}altitudinalBelts.png`)
	}

	drawHumidityProvinces(zoom: number = 0, center?: JPoint) {
		this.d.clear(zoom, center);
		this.d.drawCellContainer(this.w.diagram, JCellToDrawEntryFunctions.humidityProvinces(1))
		this.d.drawMeridianAndParallels();
		this.d.saveDrawFile(`${this.a}humidityProvinces.png`)
	}

	printKoppenData() { // separar
		this.printSeparator();

		let koppenArea = {
			Af: 0, AwAs: 0, Am: 0,
			BWh: 0, BWk: 0, BSh: 0, BSk: 0,
			Csa: 0, Csb: 0, Csc: 0,
			Cwa: 0, Cwb: 0, Cwc: 0,
			Cfa: 0, Cfb: 0, Cfc: 0,
			Dsa: 0, Dsb: 0, Dsc: 0, Dsd: 0,
			Dwa: 0, Dwb: 0, Dwc: 0, Dwd: 0,
			Dfa: 0, Dfb: 0, Dfc: 0, Dfd: 0,
			ET: 0, EF: 0,
		}
		let koppenBasicArea = { A: 0, B: 0, C: 0, D: 0, E: 0 }
		let totalArea: number = 0;
		// let annualMax: number = 0;

		this.w.diagram.forEachCell((cell: JCell) => {
			const ccl = cell.info.cellClimate;
			if (ccl.koppenSubType() !== 'O' && ccl.koppenType() !== 'O') {
				koppenArea[ccl.koppenSubType() as TKoppenSubType] += cell.areaSimple;
				koppenBasicArea[ccl.koppenType() as TKoppenType] += cell.areaSimple;
				totalArea += cell.areaSimple;
				// if (annualMax < ccl.annualPrecip) annualMax = ccl.annualPrecip;
			}
		})
		const subTypeArr = [];
		for (let p in koppenArea) {
			subTypeArr.push({
				type: p,
				area: koppenArea[p as TKoppenSubType].toLocaleString('de-DE'),
				areaPer: (koppenArea[p as TKoppenSubType] / totalArea * 100).toLocaleString('de-DE')
			});
		}

		const typeArr = [];
		for (let p in koppenBasicArea) {
			typeArr.push({
				type: p,
				area: koppenBasicArea[p as TKoppenType].toLocaleString('de-DE'),
				areaPer: (koppenBasicArea[p as TKoppenType] / totalArea * 100).toLocaleString('de-DE')
			});
		}

		console.table(subTypeArr);
		this.printSeparator();
		console.table(typeArr);
	}

	printLifeZonesData() {
		this.printSeparator();
		let lifeZonesArea = {
			1: 0, 2: 0, 3: 0, 4: 0,
			5: 0, 6: 0, 7: 0, 8: 0,
			9: 0, 10: 0, 11: 0, 12: 0,
			13: 0, 14: 0, 15: 0, 16: 0,
			17: 0, 18: 0, 19: 0, 20: 0,
			21: 0, 22: 0, 23: 0, 24: 0,
			25: 0, 26: 0, 27: 0, 28: 0,
			29: 0, 30: 0, 31: 0, 32: 0,
			33: 0, 34: 0, 35: 0, 36: 0,
			37: 0, 38: 0,
		}

		this.w.diagram.forEachCell((cell: JCell) => {
			const ccl = cell.info.cellClimate;
			if (ccl.koppenSubType() !== 'O' && ccl.koppenType() !== 'O') {
				lifeZonesArea[ccl.lifeZone.id as keyof typeof lifeZonesArea] += cell.areaSimple;
			}
		})

		const arr = [];
		for (let z = 1; z <= 38; z++) {
			const i = z as keyof typeof lifeZonesList;
			arr.push({
				id: i,
				desc: lifeZonesList[i].desc,
				area: lifeZonesArea[i].toLocaleString('de-DE')
			})
		}
		console.table(arr);

	}

}