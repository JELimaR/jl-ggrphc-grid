import {WRADIUS, GRAN} from './constants'
import Coord from './Coord';

export class GridCoord {
	_id: number;
	_coord: Coord;
	constructor(row: number, col: number) {
		const lat = row * GRAN - 89;
		const lon = col * GRAN - 180;
		this._coord = new Coord(lat, lon);
		this._id = row + col * ((2 * 89)/GRAN + 1);
	}

	get id(): number{ return this._id }

	get rowValue() {
		return Math.round((89 + this._coord.lat)/GRAN);
	}

	get colValue() {
		return Math.round((180 + this._coord.lon)/GRAN);
	}

	isBorder(): boolean {
		if (this.rowValue === 0 || this.rowValue === (2 * 89)/GRAN + 1)
			return true;
		if (this.colValue === 0 || this.colValue === (360-GRAN)/GRAN + 1)
			return true
		return false;
	}

	getPixelAreaAprox(): number {
		const grad2radConst = Math.PI/180;
		
		let out = WRADIUS * (GRAN * grad2radConst);
		out *= WRADIUS * Math.cos(this._coord.lat * grad2radConst) * (GRAN * grad2radConst)		
		
		return out;
	}

	getPixelBox() {
		return {
			minLat: this._coord.lat - GRAN/2,
			maxLat: this._coord.lat + GRAN/2,
			minLon: this._coord.lon - GRAN/2,
			maxLon: this._coord.lon + GRAN/2		
		}
	}
}

export default class GeoCoordGrid {
	_matrix: GridCoord[][] = [];
	_map: Map<number, GridCoord> = new Map<number, GridCoord>();
	constructor() {
		let row: number = 0;
		for (let lat = -89; lat <= 89; lat+=GRAN) {
			this._matrix[row] = [];
			let col: number = 0;
			for (let lon = -180; lon <= 180-GRAN; lon+=GRAN) {
				const gridcoord: GridCoord = new GridCoord(row, col);
				this._matrix[row][col] = gridcoord;
				this._map.set(gridcoord.id, gridcoord)
				col++;
			}
			row++;
		}
	}

	get rowsNumber(): number { return this._matrix.length }
	get colsNumber(): number { return this._matrix[0].length }
	getRow(r: number): GridCoord[] {
		return this._matrix[r];
	}
	getCol(c: number): GridCoord[] {
		return this._matrix.map((row: GridCoord[]) => row[c])
	}

	getIndexsFromCoord(coord: Coord) {
		let r = Math.round((89 + coord.lat)/GRAN);
		let c =  Math.round((180 + coord.lon)/GRAN);
		return {
			r: inRange(r, 0, this.rowsNumber - 1),
			c: inRange(c, 0, this.colsNumber - 1),
		}
	}

	isRowValid(r: number) {
		return (r >= 0 && r <= (2 * 89)/GRAN)
	}

	isColValid(c: number) {
		return (c >= 0 && c <= (360 - GRAN)/GRAN)
	}

	getAdjacents(gc: GridCoord): GridCoord[] {
		let out: GridCoord[] = [];
		const ROW = gc.rowValue;
		const COL = gc.colValue;

		[-1, 0, 1].forEach((rowTraslate: number) => {
			if (this.isRowValid(ROW+rowTraslate)) {
				[-1, 0, 1].forEach((colTraslate: number) => {
					if (this.isColValid(COL+colTraslate) && !(rowTraslate === colTraslate && rowTraslate === 0)) {
						out.push(this._matrix[ROW+rowTraslate][COL+colTraslate])
					}
				})	
			}
		})

		return out;
	}

	getNeighbours(gc: GridCoord): GridCoord[] {
		let out: GridCoord[] = [];

		[-GRAN, 0, GRAN].forEach((lonTraslate: number) => {
			[-GRAN, 0, GRAN].forEach((latTraslate: number) => {

				let curr: Coord = new Coord(gc._coord.lat + latTraslate, gc._coord.lon + lonTraslate);

				const idxs = this.getIndexsFromCoord(curr);
				
				out.push(this._matrix[idxs.r][idxs.c])
				
			})
		})


		return out;
	}

	getRowsIndexInWindow(row: number, win: number): number[] {
		let out: number[] = [];
		const minVal = inRange(row - Math.round(win/2/GRAN), 0, this.rowsNumber - 1);
		const maxVal = inRange(row + Math.round(win/2/GRAN), 0, this.rowsNumber - 1);
		for (let r = minVal; r <= maxVal; r++) out.push(r);
		return out;
	}

	getColsIndexInWindow(col: number, win: number): number[] {
		let out: number[] = [];
		const minVal = inRange(col - Math.round(win/2/GRAN), 0, this.colsNumber - 1);
		const maxVal = inRange(col + Math.round(win/2/GRAN), 0, this.colsNumber - 1);
		for (let c = minVal; c <= maxVal; c++) out.push(c);
		return out;
	}
	
	getCoordsInWindow(gc: GridCoord, win: number): GridCoord[] {
		let out: GridCoord[] = [];


		return out;
	}
}

const inRange = (value: number, minimo: number, maximo: number): number => {
	let out = value;

	if (out > maximo) out = maximo;
	if (out < minimo) out = minimo;
	
	return out;
}