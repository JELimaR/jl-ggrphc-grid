import JDiagram from "../Voronoi/JDiagram";
import DataInformationFilesManager from '../DataInformationLoadAndSave';
// import { IJCellInformation } from "../Voronoi/JCellInformation";
import { IJCellHeightInfo } from '../CellInformation/JCellHeight';
import JCell from "../Voronoi/JCell";
import JWMap from "../JWMap";
import JRegionMap from "../RegionMap/JRegionMap";
const dataInfoManager = DataInformationFilesManager.instance;

import JPoint from "../Geom/JPoint";
import JPrecipGrid, { IPrecipData } from "../heightmap/JPrecipGrid";

import JCellClimate, { IJCellClimateInfo } from '../CellInformation/JCellClimate'
import JTempGrid from "../heightmap/JTempGrid";
import { JGridPoint } from '../Geom/JGrid';

const emptyMonthArr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

export default class JClimateMap extends JWMap {
	constructor(d: JDiagram, precipGrid: JPrecipGrid, tempGrid: JTempGrid) {
		super(d);

		const climateData: IJCellClimateInfo[] = this.getClimateData(precipGrid, tempGrid);

		this.diagram.forEachCell((cell: JCell) => {
			if (!climateData[cell.id]) throw new Error(`no hay datos para ${cell.id}`)
			cell.info.setClimatetInfo(climateData[cell.id]);
		})

		let annualMax: number = 0;
		this.forEachCell((cell: JCell) => {
			const ccl = cell.info.cellClimate;
			if (ccl.koppenSubType() !== 'O' && ccl.koppenType() !== 'O') {
				if (annualMax < ccl.annualPrecip) annualMax = ccl.annualPrecip;
			}
		})
		JCellClimate.maxAnnual = annualMax;

	}

	getClimateData(precipGrid: JPrecipGrid, tempGrid: JTempGrid) {
		const climateData: IJCellClimateInfo[] = []; // dataInfoManager
		if (climateData.length == 0) {
			// agregar de los gridpoints
			/*precipGrid._grid.forEachPoint((gp: JGridPoint, cidx: number, ridx: number) => {
				const cell = gp._cell;
				const precData: IPrecipData = precipGrid._precipData[cidx][ridx];
				const temps = [...tempGrid._tempData[cidx][ridx].tempMonth]
				climateData[cell.id] = {
					id: cell.id,
					precipMonth: [...precData.precip],
					tempMonth: temps.map((t: number, i: number) => t + precData.deltaTemps[i])
				}
				cell.mark();
			})*/
			// para el resto hacer un promedio
			// let restList: JCell[] = []
			// this.forEachCell((c: JCell) => {
			// 	if (!c.isMarked()) {
			// 		restList.push(c);
			// 	}
			// })
			// while (restList.length > 0) {
			// 	const cell: JCell = restList.shift() as JCell;
			// 	let cant: number = 0,
			// 		tempArr: number[] = [...emptyMonthArr],
			// 		precipArr: number[] = [...emptyMonthArr];
			// 	const neighs: JCell[] = this.diagram.getNeighbors(cell);
			// 	neighs.forEach((nc: JCell) => {
			// 		if (!!climateData[nc.id]) {
			// 			cant++;
			// 			const nhf = 6.5 * nc.info.cellHeight.heightInMeters / 1000;
			// 			tempArr.forEach((t: number, i: number) => tempArr[i] += climateData[nc.id].tempMonth[i] + nhf); // este promedio no se puede hacer así!
			// 			precipArr.forEach((p: number, i: number) => precipArr[i] += climateData[nc.id].precipMonth[i]);
			// 		}
			// 	})

			// 	if (cant == 0) {restList.push(cell);}
			// 	else {
			// 		const chf = 6.5 * cell.info.cellHeight.heightInMeters / 1000;
			// 		climateData[cell.id] = {
			// 			id: cell.id,
			// 			tempMonth: tempArr.map((t: number) => t / cant - chf),
			// 			precipMonth: precipArr.map((p: number) => p / cant),
			// 		}
			// 	}
			// }
			// // ahora se debe hacer un smooth de todo
			// restList = []; // no necesario
			// this.forEachCell((c: JCell) => {
			// 	if (!c.isMarked()) {
			// 		restList.push(c);
			// 	}
			// })
			// restList.forEach((c: JCell) => {
			// 	const chf = 6.5 * c.info.cellHeight.heightInMeters / 1000;
			// 	let tempArr: number[] = [...climateData[c.id].tempMonth.map((t: number) => t + chf)],
			// 		precipArr: number[] = [...climateData[c.id].precipMonth];
			// 	const neighs: JCell[] = this.diagram.getNeighbors(c);
			// 	neighs.forEach((nc: JCell) => {
			// 		const nhf = 6.5 * nc.info.cellHeight.heightInMeters / 1000;
			// 		tempArr.forEach((t: number, i: number) => tempArr[i] += climateData[nc.id].tempMonth[i] + nhf); // este promedio no se puede hacer así!
			// 			precipArr.forEach((p: number, i: number) => precipArr[i] += climateData[nc.id].precipMonth[i]);
			// 	})

			// 	climateData[c.id] = {
			// 		id: c.id,
			// 		precipMonth: precipArr.map((p: number) => p / (neighs.length + 1)),
			// 		tempMonth: tempArr.map((t: number) => t / (neighs.length + 1) - chf)
			// 	}
			// })

			this.forEachCell((c: JCell) => { // hacer unico for
				//if (!c.isMarked()) {
					const gp = tempGrid._grid.getGridPoint(c.center);
					const cidx = gp.colValue, ridx = gp.rowValue;
					const precData: IPrecipData = precipGrid._precipData[cidx][ridx];
					const temps = [...tempGrid._tempData[cidx][ridx].tempMonth];
					const chf = c.info.isLand ? 6.5 * c.info.cellHeight.heightInMeters / 1000 : 0;
					const ghf = gp._cell.info.isLand ? 6.5 * gp._cell.info.cellHeight.heightInMeters / 1000 : 0;
					climateData[c.id] = { 
						id: c.id,
						precipMonth: [...precData.precip],
						tempMonth: temps.map((t: number, i: number) => t + precData.deltaTemps[i] + ghf - chf)
					}
				//}
			})

			this.forEachCell((c: JCell) => { c.dismark() })

		}

		return climateData;

	}

}