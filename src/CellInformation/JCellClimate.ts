import JCell from "../Voronoi/JCell";

/**
 * A: Af, As, Aw Am
 * B: BWh, BWk, BSh, BSk
 * C: Cfa, Cfb, Cfc, Cwa, Cwb, Cwc, Csa, Csb, Csc
 * D: Dfa, Dfb, Dfc, Dfd, Dwa, Dwb, Dwc, Dwd, Dsa, Dsb, Dsc, Dsd
 * E: ET, EF
 */
type TKoppenType = 'A' | 'B' | 'C' | 'D' | 'E';
export type TKoppenSubType =
	| 'Af' | 'As' | 'Aw' | 'Am'
	| 'BWh' | 'BWk' | 'BSh' | 'BSk'
	| 'Cfa' | 'Cfb' | 'Cfc' | 'Cwa' | 'Cwb' | 'Cwc' | 'Csa' | 'Csb' | 'Csc'
	| 'Dfa' | 'Dfb' | 'Dfc' | 'Dfd' | 'Dwa' | 'Dwb' | 'Dwc' | 'Dwd' | 'Dsa' | 'Dsb' | 'Dsc' | 'Dsd'
	| 'ET' | 'EF';

export const koppenColors = {
	Af: '#0000FF',
	Am: '#0077FF',
	Aw: '#46A9FA',
	As: '#46A9FA',
	BWh: '#FF0000',
	BWk: '#FF9695',
	BSh: '#F5A301',
	BSk: '#FFDB63',
	Csa: '#FFFF00',
	Csb: '#C6C700',
	Csc: '#969600',
	Cwa: '#96FF96',
	Cwb: '#63C764',
	Cwc: '#329633',
	Cfa: '#C6FF4E',
	Cfb: '#66FF33',
	Cfc: '#33C701',
	Dsa: '#FF00FF',
	Dsb: '#C600C7',
	Dsc: '#963295',
	Dsd: '#966495',
	Dwa: '#ABB1FF',
	Dwb: '#5A77DB',
	Dwc: '#4C51B5',
	Dwd: '#320087',
	Dfa: '#00FFFF',
	Dfb: '#38C7FF',
	Dfc: '#007E7D',
	Dfd: '#00455E',
	ET: '#B2B2B2',
	EF: '#686868',
}

type TKoppen =
	| { type: 'A' }

export interface IJCellClimateInfo {
	id: number;
	tempMonth: number[];
	precipMonth: number[];
}

export default class JCellClimate {
	_cell: JCell;
	_tempMonth: number[];
	_precipMonth: number[];
	constructor(cell: JCell, info: IJCellClimateInfo) {
		this._cell = cell;
		this._tempMonth = info.tempMonth;
		this._precipMonth = info.precipMonth;
	}

	get tempMonth(): number[] { return this._tempMonth }
	// set tempMonth(tempArr: number[]) { this._tempMonth = [...tempArr] }
	get precipMonth(): number[] { return this._precipMonth }

	// temp
	get tmin() { return Math.min(...this._tempMonth) }
	get tmax() { return Math.max(...this._tempMonth) }
	get tmed() { return this._tempMonth.reduce((p: number, c: number) => c + p, 0) / 12 }

	// precip
	get totalPrecip(): number { return this._precipMonth.reduce((p: number, c: number) => c + p, 0) / 12 }
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

	/**
	 * Pumbral = 20 * T + 280		si el 70 % o más de las precipitaciones anuales caen en el semestre más 	cálido;
	 * Pumbral = 20 * T + 140   si el 70 % o más de las precipitaciones anuales caen en un lapso que abarca 	ambos semestres;
	 * Pumbral = 20 * T         si menos del 30 % de las precipitaciones anuales caen en el semestre 	más cálido;
	 */
	private get pumbral(): number {
		let constante: number;
		if (this.precipSemCalido >= 0.7 * this.totalPrecip) constante = 280;
		else if (this.precipSemCalido < 0.3 * this.totalPrecip) constante = 0;
		else constante = 140;
		return (20 * this.tmed + constante) / 10;
	}

	getMonthsSet(): { calido: number[], frio: number[] } {
		return {
			calido: (this._cell.center.y < 0) ? [1, 2, 3, 4, 11, 12] : [5, 6, 7, 8, 9, 10],
			frio: (this._cell.center.y < 0) ? [5, 6, 7, 8, 9, 10] : [1, 2, 3, 4, 11, 12]
		}
	}

	getInterface(): IJCellClimateInfo {
		return {
			id: this._cell.id,
			tempMonth: this._tempMonth,
			precipMonth: this._precipMonth
		}
	}

	/**
	 * El lugar tiene un clima seco, B, cuando la precipitación anual P es menor que el umbral de precipitación: P < Pumbral.
	 * Si no es el caso B, entonces se determina si es un caso A, C, D o E según la relación entre Tmín y Tmáx:
	 * A	si Tmín > 18;
	 * C	si Tmáx > 10 y 18 > Tmín > 0;
	 * D	si Tmáx > 10 y Tmín < 0;
	 * E	si Tmáx < 10.
	 */
	koppenType(): TKoppenType | 'O' {
		if (!this._cell.info.isLand) return 'O';
		if (this.totalPrecip < this.pumbral) return 'B';
		else if (this.tmin > 18) return 'A';
		else if (this.tmax >= 10 && this.tmin > -3) return 'C'
		else if (this.tmax < 10) return 'E';
		else return 'D'
	}

	/**
	 * Determinación de los subtipos de clima
		 Para la determinación de los subtipos de clima en un lugar son necesarios los siguientes datos adicionales a los anteriores:
			 Tmon10 número de meses en que la temperatura media es mayor que 10°C;
			 Pseco precipitaciones durante el mes más seco del año;
			 Psseco precipitaciones durante el mes más seco del verano;
			 Pwseco precipitaciones durante el mes más seco del invierno;
			 Pshum precipitaciones durante el mes más húmedo del verano;
			 Pwhum precipitaciones durante el mes más húmedo del invierno;
	 */
	get tmon10(): number {
		let out: number = 0;
		this._tempMonth.forEach((t: number) => out += t > 10 ? 1 : 0)
		return out;
	}
	get pseco(): number { return Math.min(...this._precipMonth) }
	get psseco(): number {
		let min: number = 9000;
		for (let m of this.getMonthsSet().calido) {
			if (min > this._precipMonth[m - 1]) min = this._precipMonth[m - 1];
		}
		return min
	}
	get pwseco(): number {
		let min: number = 9000;
		for (let m of this.getMonthsSet().frio) {
			if (min > this._precipMonth[m - 1]) min = this._precipMonth[m - 1];
		}
		return min
	}
	get pshum(): number {
		let max: number = 0;
		for (let m of this.getMonthsSet().calido) {
			if (max < this._precipMonth[m - 1]) max = this._precipMonth[m - 1];
		}
		return max
	}
	get pwhum(): number {
		let max: number = 0;
		for (let m of this.getMonthsSet().frio) {
			if (max < this._precipMonth[m - 1]) max = this._precipMonth[m - 1];
		}
		return max
	}

	koppenSubType(): TKoppenSubType | 'O' {
		if (!this._cell.info.isLand) return 'O';
		
		switch (this.koppenType()) {
			// A
			case 'A':
				if (this.pseco >= 60) return 'Af'
				if (this.pseco >= 50 - this.totalPrecip/25) return 'Am'//100 - this.totalPrecip/25) return 'Am'
				return 'Aw';
			// B
			case 'B':
				if (this.totalPrecip < 0.5 * this.pumbral) {
					if (this.tmed >= 15) return 'BWh' //if (this.tmed >= 18) return 'BWh'
					else return 'BWk'
				} else {
					if (this.tmed >= 15) return 'BSh'// if (this.tmed >= 18) return 'BSh'
					else return 'BSk'
				}
			// C
			case 'C':
				const tfc = (this.tmax >= 22) ? 'a' : ((this.tmon10 >= 4) ? 'b' : 'c');
				if (this.psseco < 40 && this.psseco < this.pwhum/3) return 'Cs' + tfc as TKoppenSubType;
				if (this.pwseco < this.pshum/10) return 'Cw' + tfc as TKoppenSubType;
				return 'Cf' + tfc as TKoppenSubType;
			case 'D':
				const tfd = (this.tmax >= 22) ? 'a' : 
					((this.tmon10 >= 4) ? 'b' : ( this.tmin < -25 ? 'd' : 'c')); //( this.tmin < -38 ? 'd' : 'c'));
				if (this.psseco < 40 && this.psseco < this.pwhum/3) return 'Ds' + tfd as TKoppenSubType;
				if (this.pwseco < this.pshum/10) return 'Dw' + tfd as TKoppenSubType;
				return 'Df' + tfd as TKoppenSubType;
			default:
				if (this.tmax > 0) return 'ET'
				return 'EF'
		}

	}


}
/*
Para determinar la clase de clima de una localidad, primero se debe obtener los siguientes datos de ella:
	Tmin la temperatura media del mes más frío, en grados Celsius (°C);
	Tmax la temperatura media del mes más cálido (°C);
	Tmed la temperatura media anual (°C);

	P la precipitación medial anual en centímetros (cm!);
	el hemisferio en que se encuentra el lugar (norte o sur) y con ello el semestre más cálido (octubre a marzo 	en el sur [5,6,7,8,9,10], abril a septiembre en el norte [1,2,3,4,11,12]) y el más frío (abril a septiembre 	en el sur [1,2,3,4,11,12], octubre a marzo en el norte [5,6,7,8,9,10]);

	Pumbral, umbral de precipitación, esto es la precipitación mínima necesaria para contrarrestar la 	evaporación debida a la temperatura. Se estima que en los meses fríos se evaporan 20 mm por cada 10°C de 	temperatura media, en el semestre cálido se le deben agregar en total 280 mm y si la lluvia se reparte bien 	entre ambos semestres se le debe agregar solo 140 mm. Estas premisas llevan a la siguiente fórmula para el 	cálculo del umbral de precipitación:
	Pumbral = 20 * T + 280           si el 70 % o más de las precipitaciones anuales caen en el semestre más 	cálido;
	Pumbral = 20 * T + 140           si el 70 % o más de las precipitaciones anuales caen en un lapso que abarca 	ambos semestres;
	Pumbral = 20 * T                      si menos del 30 % de las precipitaciones anuales caen en el semestre 	más cálido;


calcular:
tmin, tmax, tmed, precipSemCalido, precipSemFrio;


El lugar tiene un clima seco, B, cuando la precipitación anual P es menor que el umbral de precipitación: P < Pumbral.

Si no es el caso B, entonces se determina si es un caso A, C, D o E según la relación entre Tmín y Tmáx:

A           si Tmín > 18;
C           si Tmáx > 10 y 18 > Tmín > 0 ;
D           si Tmáx > 10 y Tmín < 0;
E           si Tmáx < 10.

Determinación de los subtipos de clima
Para la determinación de los subtipos de clima en un lugar son necesarios los siguientes datos adicionales a los anteriores:

	Tmon10 número de meses en que la temperatura media es mayor que 10°C;
	Pseco precipitaciones durante el mes más seco del año;
	Psseco precipitaciones durante el mes más seco del verano;
	Pwseco precipitaciones durante el mes más seco del invierno;
	Pshum precipitaciones durante el mes más húmedo del verano;
	Pwhum precipitaciones durante el mes más húmedo del invierno;

*/