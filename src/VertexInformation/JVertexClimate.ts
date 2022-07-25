import JVertex from "../Voronoi/JVertex";
import JVertexGeneric, { IJVertexGenericInfo } from "./JVertexGeneric";

export interface IJVertexClimateInfo extends IJVertexGenericInfo {
	id: string;
	tempMonth: number[];
	precipMonth: number[];
}

export default class JVertexClimate extends JVertexGeneric {
	// private _vertex: JVertex;

	_tempMonth: number[];
	_precipMonth: number[];

	constructor(vertex: JVertex, info: IJVertexClimateInfo) {
		super(vertex);
		//this._vertex = vertex;
		this._tempMonth = [...info.tempMonth]
		this._precipMonth = [...info.precipMonth]
	}

	get tempMonth(): number[] { return this._tempMonth }
	// set tempMonth(tempArr: number[]) { this._tempMonth = [...tempArr] }
	get precipMonth(): number[] { return this._precipMonth }

	// temp
	get tmin() { return Math.min(...this._tempMonth) }
	get tmax() { return Math.max(...this._tempMonth) }
	get tmed() { return this._tempMonth.reduce((p: number, c: number) => c + p, 0) / 12 }

	// precip
	get mediaPrecip(): number { return this.annualPrecip / 12 }
	get precipSemCalido(): number {
		let out: number = 0;
		for (let m of this.getMonthsSet().calido) {
			out += this._precipMonth[m - 1];
		}
		return out;
	}
	get precipSemFrio() {
		let out: number = 0;
		for (let m of this.getMonthsSet().frio) {
			out += this._precipMonth[m - 1];
		}
		return out;
	}

	//
	get pumbral(): number {
		let constante: number;
		if (this.precipSemCalido >= 0.7 * this.mediaPrecip) constante = 280;
		else if (this.precipSemCalido < 0.3 * this.mediaPrecip) constante = 0;
		else constante = 140;
		return (20 * this.tmed + constante);
	}

	getMonthsSet(): { calido: number[], frio: number[] } {
		return {
			calido: (this.vertex.point.y < 0) ? [1, 2, 3, 4, 11, 12] : [5, 6, 7, 8, 9, 10],
			frio: (this.vertex.point.y < 0) ? [5, 6, 7, 8, 9, 10] : [1, 2, 3, 4, 11, 12]
		}
	}

	get annualPrecip(): number { return this._precipMonth.reduce((c: number, p: number) => c + p, 0) }

	getInterface(): IJVertexClimateInfo {
		return {
			id: this.vertex.id,
			precipMonth: [...this._precipMonth],
			tempMonth: [...this._tempMonth],
		}
	}

}