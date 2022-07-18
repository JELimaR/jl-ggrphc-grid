
import JCell from "./Voronoi/JCell";
import JDiagram from "./Voronoi/JDiagram";
import JPoint from "./Geom/JPoint";
import JRegionMap, { IJContinentInfo, IJIslandInfo, JContinentMap, JCountryMap, JIslandMap, JStateMap } from './RegionMap/JRegionMap';

import DataInformationFilesManager from './DataInformationLoadAndSave';
import { ICellContainer } from "./generalInterfaces";
const dataInfoManager = DataInformationFilesManager.instance;

export default class JWorldMap {

	private _diagram: JDiagram;
	private _islands: JIslandMap[] = [];
	private _continents: JContinentMap[] = [];

	constructor(d: JDiagram) {
		this._diagram = d;

		// islands
		console.log('calculate and setting island')
		console.time('set Islands');
		let regionInfoArr: IJIslandInfo[] = dataInfoManager.loadIslandsInfo(this.diagram.cells.size);
		if (regionInfoArr.length > 0) {
			regionInfoArr.forEach((iii: IJIslandInfo, i: number) => {
				this._islands.push(
					new JIslandMap(i, this._diagram, iii)
				);
			})
		} else {
			this.generateIslandList();
			dataInfoManager.saveIslandsInfo(this._islands, this.diagram.cells.size);
		}
		console.timeEnd('set Islands');

		// continents

		// console.log('calculate and setting continents')
		// console.time('set continents');
		// let continentsInfoArr: IJContinentInfo[] = dataInfoManager.loadContinentsInfo(this.diagram.cells.size);
		// if (continentsInfoArr.length > 0) {
		// 	continentsInfoArr.forEach((ici: IJContinentInfo, i: number) => {
		// 		this._continents.push(
		// 			new JContinentMap(i, this._diagram, ici)
		// 		);
		// 	})
		// } else {
		// 	this.generateContinentList();
		// 	dataInfoManager.saveContinentsInfo(this._continents, this.diagram.cells.size);
		// }
		// console.timeEnd('set continents');


		// countries and states
		// console.log('calculating and setting states')
		// console.time('set states');
		// this._continents.forEach((jcm: JContinentMap, idx: number) => {
		// 	jcm.generateStates();
		// 	jcm.setCountries();
		// })
		// console.timeEnd('set states');

	}

	private generateIslandList(): void {
		let lista: Map<number, JCell> = new Map<number, JCell>();
		this._diagram.forEachCell((c: JCell) => {
			if (c.info.isLand) lista.set(c.id, c);
		})

		let currentId = -1;
		while (lista.size > 0) {
			currentId++;
			const cell: JCell = lista.entries().next().value[1];
			cell.mark();
			lista.delete(cell.id);

			let reg: JIslandMap = new JIslandMap(currentId, this.diagram);
			reg.addCell(cell);

			let qeue: Map<number, JCell> = new Map<number, JCell>();
			this._diagram.getCellNeighbours(cell).forEach((ncell: JCell) => {
				qeue.set(ncell.id, ncell)
			});

			console.log('island:', currentId);
			let times: number = 0;
			while (qeue.size > 0 && times < this._diagram.cells.size) {
				times++;
				const neigh: JCell = qeue.entries().next().value[1];
				qeue.delete(neigh.id);
				lista.delete(neigh.id);
				neigh.mark();
				reg.addCell(neigh);

				this._diagram.getCellNeighbours(neigh).forEach((nnn: JCell) => {
					if (nnn.info.isLand && !nnn.isMarked() && !qeue.has(nnn.id)) {
						qeue.set(nnn.id, nnn);
					}
				})
				if (reg.cells.size % 10000 == 0) console.log('island:', currentId, `hay ${reg.cells.size}`)
			}

			if (qeue.size > 0) throw new Error(`se supero el numero de cells: ${this._diagram.cells.size} en generateIslandList`)
			console.log('area:', reg.area)
			this._islands.push(reg);
		}
		// ordenar
		console.log(`sorting island`)
		this._islands.sort((a: JIslandMap, b: JIslandMap) => { return b.area - a.area });

		this._diagram.forEachCell((c: JCell) => { c.dismark(); })
	}

	private generateContinentList(): void {
		this._continents[4] = new JContinentMap(4, this._diagram);
		this._islands.forEach((isl: JIslandMap, i: number) => {
			if (i < 3) {
				this._continents[i] = new JContinentMap(i, this._diagram);
				this._continents[i].addRegion(isl);
			} else {
				const c: JCell = isl.cells.entries().next().value[1];
				if (c.center.x > 120) this._continents[4].addRegion(isl);
				else {
					const dist0: number = JRegionMap.minDistanceBetweenRegions(isl, this._continents[0]);
					const dist1: number = JRegionMap.minDistanceBetweenRegions(isl, this._continents[1]);
					const dist2: number = JRegionMap.minDistanceBetweenRegions(isl, this._continents[2]);
					if (dist0 < dist1 && dist0 < dist2) {
						this._continents[0].addRegion(isl)
					} else if (dist1 < dist2) {
						this._continents[1].addRegion(isl);
					} else {
						this._continents[2].addRegion(isl);
					}
				}
			}
		});
		// cont 0 divir en 2
		console.log('dividing cont 0')
		let plist: JPoint[][] = [
			[new JPoint(40, -30), new JPoint(22, -45), new JPoint(40, -60)],
			[new JPoint(50, -20), new JPoint(45, -30), new JPoint(47, -37), new JPoint(60, -60)],
		];

		const twoConts = this._continents[0].divideInSubregions(plist);
		this._continents[0] = new JContinentMap(0, this._diagram, twoConts[1]);
		this._continents[3] = new JContinentMap(3, this._diagram, twoConts[0]);
	}

	get diagram(): JDiagram { return this._diagram }
	get cells(): any { return this._diagram.cells }
	get continents(): JContinentMap[] { return this._continents }
	get countries(): JCountryMap[] {
		let out: JCountryMap[] = [];
		this._continents.forEach((continent: JContinentMap) => {
			continent.countries.forEach((jcm: JCountryMap) => {
				out.push(jcm);
			})
		})
		return out;
	}
	get states(): Map<string, JStateMap> {
		let out: Map<string, JStateMap> = new Map<string, JStateMap>();
		this._continents.forEach((continent: JContinentMap) => {
			continent.states.forEach((jsm: JStateMap) => {
				out.set(jsm.id, jsm);
			})
		})
		return out;
	}

	forEachCell(func: (c: JCell) => void) {
		this._diagram.forEachCell(func);
	}

	// private generateMoisture(): void {
	// 	console.log('generating moisture');
	// }
}

// const generatePieceList = (element: JRegionMap/*, regionGenerator: () => JRegionMap*/): JRegionMap[] => {
// 	let out = [];
// 	let lista: Map<number, JCell> = new Map<number, JCell>();
// 	element.forEachCell((c: JCell) => {
// 		if (c.isLand) lista.set(c.id, c);
// 	})

// 	while (lista.size > 0) {
// 		const cell: JCell = lista.entries().next().value[1];
// 		cell.mark();
// 		lista.delete(cell.id);

// 		let reg: JRegionMap = new JRegionMap(element.diagram);
// 		reg.addCell(cell);

// 		let qeue: Map<number, JCell> = new Map<number, JCell>();
// 		element.diagram.getNeighbors(cell).forEach((ncell: JCell) => {
// 			qeue.set(ncell.id, ncell)
// 		});
// 		while (qeue.size > 0) {
// 			const neigh: JCell = qeue.entries().next().value[1];
// 			qeue.delete(neigh.id);
// 			lista.delete(neigh.id);
// 			neigh.mark();
// 			reg.addCell(neigh);

// 			element.diagram.getNeighbors(neigh).forEach((nnn: JCell) => {
// 				if (nnn.isLand && !nnn.isMarked() && !qeue.has(nnn.id)) {
// 					qeue.set(nnn.id, nnn);
// 				}
// 			})
// 		}
// 		out.push(reg);
// 	}
// 	// ordenar
// 	out.sort((a: JRegionMap, b: JRegionMap) => { return b.area - a.area });

// 	element.forEachCell((c: JCell) => { c.dismark(); })
// 	return out;
// }