
import JDiagram from "../../../BuildingModel/Voronoi/JDiagram";
import InformationFilesManager from '../../DataFileLoadAndSave/InformationFilesManager';
import JCell from "../../../BuildingModel/Voronoi/JCell";
import MapGenerator from "../MapGenerator";
import IslandMap, { IIslandMapInfo } from "../../../BuildingModel/MapContainerElements/IslandMap";

export default class IslandMapGenerator extends MapGenerator<void> {
	constructor(d: JDiagram) {
		super(d);
	}

	generate(): IslandMap[] {
		const dim = InformationFilesManager.instance;

		let out: IslandMap[] = [];

		console.log('calculate and setting island')
		console.time(`set Islands`);

		let islandInfoArr: IIslandMapInfo[] = dim.loadMapElementData<IIslandMapInfo, IslandMap>(this.diagram.secAreaProm, IslandMap.getTypeInformationKey());
		if (islandInfoArr.length > 0) {
			islandInfoArr.forEach((iii: IIslandMapInfo, i: number) => {
				out.push(
					new IslandMap(i, this.diagram, iii)
				);
			})
		} else {
			out = this.generateIslandList();
		}
		// guardar info

		if (islandInfoArr.length === 0) {
			dim.saveMapElementData(out, this.diagram.secAreaProm, IslandMap.getTypeInformationKey());
		}
		console.timeEnd(`set Islands`);
		return out;
	}

	/*
		private getOceanCoastCell() {
			let out: JCell[] = [];
			this._islands.forEach((isl: IslandMap) => {
				let add: boolean = false;
				isl.getLimitCells().forEach((c: JCell) => {
					this.diagram.getCellNeighbours(c).forEach((nc: JCell) => {
						add = add || nc.info.cellHeight.heightType === 'ocean';
					})
					if (add) out.push(c);
				})
			})
			return out;
		}
	*/

	private generateIslandList(): IslandMap[] {

		let out: IslandMap[] = [];
		let lista: Map<number, JCell> = new Map<number, JCell>();
		this.diagram.forEachCell((c: JCell) => {
			if (c.info.isLand) lista.set(c.id, c);
		})

		let currentId = -1;
		while (lista.size > 0) {
			currentId++;
			const cell: JCell = lista.entries().next().value[1];
			let isl: IslandMap = new IslandMap(currentId, this.diagram);

			let nqeue: Map<number, JCell> = new Map<number, JCell>();
			nqeue.set(cell.id, cell)

			console.log('island:', currentId);
			let times: number = 0;
			while (nqeue.size > 0 && times < this.diagram.cells.size) {
				times++;
				const neigh: JCell = nqeue.entries().next().value[1];
				nqeue.delete(neigh.id);
				lista.delete(neigh.id);
				neigh.mark();
				isl.addCell(neigh);
				neigh.info.islandId = isl.id; // nuevo

				this.diagram.getCellNeighbours(neigh).forEach((nnn: JCell) => {
					if (nnn.info.isLand && !nnn.isMarked() && !nqeue.has(nnn.id)) {
						nqeue.set(nnn.id, nnn);
					}
				})
				if (isl.cells.size % 10000 == 0) console.log('island:', currentId, `hay ${isl.cells.size}`)
			}

			if (nqeue.size > 0)
				throw new Error(`se supero el numero de cells: ${this.diagram.cells.size} en generateIslandList`)
			console.log('area:', isl.area.toLocaleString('de-DE'));
			console.timeLog(`set Islands`);
			out.push(isl);
		}
		// ordenar
		console.log(`sorting island`)
		out.sort((a: IslandMap, b: IslandMap) => { return b.area - a.area });

		this.diagram.dismarkAllCells();

		return out;
	}

}