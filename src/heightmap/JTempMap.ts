import JPoint from "../Geom/JPoint";
import JWMap from "../JWMap";
import JDiagram from "../Voronoi/JDiagram";
import JCell from "../Voronoi/JCell";
import JCellTemp, { IJCellTempInfo } from '../CellInformation/JCellTemp';
import JHeightMap from './JHeightMap';
import JRegionMap, { JIslandMap } from '../RegionMap/JRegionMap';
import * as TempFunctions from '../Climate/JTempFunctions';
import * as turf from '@turf/turf';
import DataInformationFilesManager from '../DataInformationLoadAndSave';
const dataInfoManager = DataInformationFilesManager.instance;

export interface ICellTempLat {
	tempLatMed: number;
	// tempLatMin: number;
	// tempLatMax: number;
	tempLatMonth: number[];
}

export default class JTempMap extends JWMap {

	// _temperaturesCellMap: Map<number, ICellTempLat> = new Map<number, ICellTempLat>(); // map de id y temp - borrar no se debe guardar todos esos datos
	// _tempCellMonth: Map<number, number[]> = new Map<number, number[]>();
	// _tempCellCap: Map<number, number> = new Map<number, number>();

	// _cellClimate: Map<number, JCellTemp> = new Map<number, JCellTemp>();

	constructor(d: JDiagram, hm: JHeightMap) { // no se precisa el hm?
		super(d);
		const cellsMap = this.diagram.cells;

		// temp cells
		console.log('calculate and setting temp');
		console.time('set temp info');

		const loadedInfo: IJCellTempInfo[] = dataInfoManager.loadCellsTemperature(cellsMap.size);

		if (loadedInfo.length > 0) {
			this.forEachCell((c: JCell) => {
				c.info.setTempInfo( loadedInfo[c.id] );
			})
			/*
			loadedInfo.forEach((data: IJCellTempInfo) => {
				this._cellClimate.set(data.id, new JCellTemp(cellsMap.get(data.id)!, data))
			})
			*/
		} else {
			/*
			 * capability
			 */
			let cap: number[] = this.calculateCapCell(hm);
			for (let k=0;k<3;k++)	cap = this.smoothCap(cap);
			
			/*
			 * temp
			 */
			cellsMap.forEach((cell: JCell) => {
				// console.log(TempFunctions.calculateTempPromPerLat(cell.center.y));
				const ict: ICellTempLat = {
					tempLatMed: TempFunctions.calculateTempPromPerLat(cell.center.y),
					// tempLatMin: TempFunctions.calculateTempMinPerLat(cell.center.y),
					// tempLatMax: TempFunctions.calculateTempMaxPerLat(cell.center.y),
					tempLatMonth: TempFunctions.generateTempLatArrPerMonth(cell.center.y).map((v) => v.tempLat)
				}
				
			

				let tarr: number[] = [];
				ict.tempLatMonth.forEach((mt: number) => {
					let tv: number = ict.tempLatMed + (ict.tempLatMed - mt) * cap[cell.id]!;
					tv = TempFunctions.parametertoRealTemp(tv);
					if (cell.info.isLand)
						tv -= 6.5 * cell.info.cellHeight.heightInMeters/1000;

					tarr.push(tv);
				})

				cell.info.setTempInfo({
					id: cell.id,
					tempCap: cap[cell.id]!,
					tempMonth: tarr,
				});

			})
			this.smoothTemp();
			this.smoothTemp();
		}

		if (loadedInfo.length === 0) {
			dataInfoManager.saveCellsTemperature(cellsMap, cellsMap.size);
		}
		console.timeEnd('set temp info');
	}

	calculateCapCell(h: JHeightMap): number[] {
		let capOut: number[] = [];
		const distWind: number = 1000;
		// const islands: JIslandMap[] = h.islands;
		this.forEachCell((cell: JCell) => {
			let captotal: number = 0//10 * (cell.isLand ? 1.0 : 0.44);
			let areaTotal: number = 0;

			// const neigs: JCell[] = this.diagram.getNeighborsInWindow(cell, 20);
			const neigs: JCell[] = this.diagram.getNeighborsInRadius(cell, distWind);
			neigs.forEach((nw: JCell) => {
				const d: number = distWind*1.2 - JPoint.geogDistance(nw.center, cell.center);
				captotal += (nw.info.isLand ? 1.0 : 0.44) * d;
				areaTotal += d;
			});
			/*
			if (!cell.isLand) {
				this._tempCellCap.set(cell.id, 0.8);
			} else {
				
				const dist = islands[cell.islandId].minDistanceToCell(cell);
				this._tempCellCap.set(cell.id, 0.5 + 0.5 * dist/4500);
				
			}
			*/
			// this._tempCellCap.set(cell.id, captotal / (neigs.length + 0));
			capOut[cell.id] = captotal / (areaTotal) * 0.75 + 0.25 * (cell.info.isLand ? 1.0 : 0.44);
			if (cell.id % 1000 == 0) console.log(`van ${cell.id}: neigh: ${neigs.length}`)
		})
		console.log('cap cells calculada');
		return capOut;
	}

	smoothCap(capIn: number[]): number[] {
		let capOut: number[] = [];
		this.forEachCell((cell: JCell) => {			
			let capt: number = capIn[cell.id];
			let cant: number = 1;
			
			if (cell.info.isLand) {
				let ns: JCell[] = this.diagram.getNeighbors(cell)
				ns.forEach((n: JCell) => {
					cant++;
					capt += capIn[n.id]!;
				})				
			}
			
			capOut[cell.id] = capt/cant;
		})
		return capOut;
	}

	smoothTemp(): void {
		this.forEachCell((cell: JCell) => {			
			// const cellClimate = this._cellClimate.get(cell.id);
			const cellClimate = cell.info.cellTemp;
			const neigs = this.diagram.getNeighbors(cell);

			let tempTotal: number[] = cellClimate!.tempMonth;
			let cant: number = 1;

			neigs.forEach((nc: JCell) => {
				// const neigClimate = this._cellClimate.get(nc.id);
				const neigClimate = nc.info.cellTemp;
				cant++;
				neigClimate!.tempMonth.forEach((temp: number, idx: number) => tempTotal[idx] += temp);
			})

			cellClimate!.tempMonth = tempTotal.map((t: number) => t / cant)

		})
		
	}

}