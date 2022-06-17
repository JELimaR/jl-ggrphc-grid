import JCell from "../Voronoi/JCell";

/**
 * A: Af, As, Aw Am
 * B: BWh, BWk, BSh, BSk
 * C: Cfa, Cfb, Cfc, Cwa, Cwb, Cwc, Csa, Csb, Csc
 * D: Dfa, Dfb, Dfc, Dfd, Dwa, Dwb, Dwc, Dwd, Dsa, Dsb, Dsc, Dsd
 * E: ET, EF
 */
export type TKoppenType = 'A' | 'B' | 'C' | 'D' | 'E';
export type TKoppenSubType =
	| 'Af' | 'AwAs' | 'Am'
	| 'BWh' | 'BWk' | 'BSh' | 'BSk'
	| 'Cfa' | 'Cfb' | 'Cfc' | 'Cwa' | 'Cwb' | 'Cwc' | 'Csa' | 'Csb' | 'Csc'
	| 'Dfa' | 'Dfb' | 'Dfc' | 'Dfd' | 'Dwa' | 'Dwb' | 'Dwc' | 'Dwd' | 'Dsa' | 'Dsb' | 'Dsc' | 'Dsd'
	| 'ET' | 'EF';

export const koppenColors = {
	Af: '#0000FF', Am: '#0077FF', AwAs: '#46A9FA',
	BWh: '#FF0000', BWk: '#FF9695', BSh: '#F5A301', BSk: '#FFDB63',
	Csa: '#FFFF00', Csb: '#C6C700', Csc: '#969600',
	Cwa: '#96FF96', Cwb: '#63C764', Cwc: '#329633',
	Cfa: '#C6FF4E', Cfb: '#66FF33', Cfc: '#33C701',
	Dsa: '#FF00FF', Dsb: '#C600C7', Dsc: '#963295', Dsd: '#966495',
	Dwa: '#ABB1FF', Dwb: '#5A77DB', Dwc: '#4C51B5', Dwd: '#320087',
	Dfa: '#00FFFF', Dfb: '#38C7FF', Dfc: '#007E7D', Dfd: '#00455E',
	ET: '#B2B2B2', EF: '#686868',
}

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
	get mediaPrecip(): number { return this.annualPrecip/12 }
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
		if (this.precipSemCalido >= 0.7 * this.mediaPrecip) constante = 280;
		else if (this.precipSemCalido < 0.3 * this.mediaPrecip) constante = 0;
		else constante = 140;
		return (20 * this.tmed + constante);
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
		if (this.annualPrecip < 1.2 * this.pumbral) return 'B';
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
				if (this.pseco >= 115 - this.annualPrecip/25) return 'Am'//100 - this.annualPrecip/25 return 'Am'
				return 'AwAs';
			// B
			case 'B':
				if (this.annualPrecip < 1.2*0.58 * this.pumbral) { //(this.mediaPrecip < .5 * this.pumbral) {
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
			// D
			case 'D':
				const tfd = (this.tmax >= 22) ? 'a' : 
					((this.tmon10 >= 4) ? 'b' : ( this.tmin < -25 ? 'd' : 'c')); //( this.tmin < -38 ? 'd' : 'c'));
				if (this.psseco < 40 && this.psseco < this.pwhum/3) return 'Ds' + tfd as TKoppenSubType;
				if (this.pwseco < this.pshum/10) return 'Dw' + tfd as TKoppenSubType;
				return 'Df' + tfd as TKoppenSubType;
			// E
			default:
				if (this.tmax > 0) return 'ET'
				return 'EF'
		}

	}

	// calculo de holdridge life zone
	get bioTemperature(): number {
		let out: number = 0;
		this._tempMonth.forEach((t: number) => {
			let temp = (t < 0) ? 0 : t;
			if (temp > 24)
				temp = temp  - 3 * this._cell.center.y/100 * ((t - 24) ** 2);
			out += inRange(temp/12, 0, 24);
		})
		return out;
	}
	get annualPrecip(): number {
		return this._precipMonth.reduce((p: number, c: number) => c + p, 0);
	}
	get potentialEvapotrasnpirationRate(): number {
		return (this.bioTemperature * 50)/this.annualPrecip;
	}

	get altitudinalBelt(): TAltitudinalBelt {
		const BT = this.bioTemperature;
		if (BT < 1.5) return 'Alvar'
		if (BT < 3) return 'Alpine'
		if (BT < 6) return 'Subalpine'
		if (BT < 12) return 'Montane'
		if (BT < 18) return 'LowerMontane'
		if (BT < 24) return 'Premontane'
		else return 'Basal'
	}

	get humidityProvince(): THumidityProvinces {
		const AP = this.annualPrecip;
		/*
		if (AP < 125) return 'SuperArid'
		if (AP < 250) return 'Perarid'
		if (AP < 500) return 'Arid'
		if (AP < 1000) return 'SemiArid'
		if (AP < 2000) return 'Subhumid'
		if (AP < 4000) return 'humid'
		if (AP < 8000) return 'Perhumid'
		*/
		/*
		if (AP < 78) return 'SuperArid'
		if (AP < 156) return 'Perarid'
		if (AP < 312) return 'Arid'
		if (AP < 625) return 'SemiArid'
		if (AP < 1250) return 'Subhumid'
		if (AP < 2500) return 'humid'
		if (AP < 5000) return 'Perhumid'
		else return 'SuperHumid'
		*/
		const PET = this.potentialEvapotrasnpirationRate;
		if (PET > 16) return 'SuperArid'
		if (PET > 8) return 'Perarid'
		if (PET > 4) return 'Arid'
		if (PET > 2) return 'SemiArid'
		if (PET > 1) return 'Subhumid'
		if (PET > 0.5) return 'humid'
		if (PET > 0.25) return 'Perhumid'
		else return 'SuperHumid'
	}

	get lifeZone(): ILifeZone {
		const AB = this.altitudinalBelt;
		const HP = this.humidityProvince;
		let maxHPIdx: number;
		let minABIdx: number;

		switch(AB) {				
			case 'Alvar':
				maxHPIdx = 0
				minABIdx = 1
				break;
			case 'Alpine':
				maxHPIdx = 3
				minABIdx = 2
				break;
			case 'Subalpine':
				maxHPIdx = 4
				minABIdx = 4
				break;
			case 'Montane':
				maxHPIdx = 5
				minABIdx = 11
				break;
			case 'LowerMontane':
				maxHPIdx = 6
				minABIdx = 17
				break;
			case 'Premontane':
				maxHPIdx = 6
				minABIdx = 24
				break;
			case 'Basal': default:
				maxHPIdx = 7
				minABIdx = 31
				break;
		}
		
		const id = minABIdx + inRange(humidityProvinceToNumber[HP], 0, maxHPIdx) as keyof typeof lifeZonesList;

		return lifeZonesList[id]
	}

	

}
/*
Polar (glacial)	0 a 1,5 ºC	Nival
Subpolar (tundra)	1,5 a 3 ºC	Alpino
Boreal	3 a 6 ºC	Subalpino
Templado frío	6 a 12 ºC	Montano
Templado cálido	12 a 18 ºC	Montano bajo
Subtropical	18 a 24 ºC	Premontano
Tropical	mayor de 24 ºC	Basal
*/
export type TAltitudinalBelt =
	| 'Alvar'
	| 'Alpine'
	| 'Subalpine'
	| 'Montane'
	| 'LowerMontane'
	| 'Premontane'
	| 'Basal'

export const altitudinalBeltToNumber = {
	'Alvar': 0,
	'Alpine': 1,
	'Subalpine': 2,
	'Montane': 3,
	'LowerMontane': 4,
	'Premontane': 5,
	'Basal': 6
}

export type THumidityProvinces =
	| 'SuperArid'
	| 'Perarid'
	| 'Arid'
	| 'SemiArid'
	| 'Subhumid'
	| 'humid'
	| 'Perhumid'
	| 'SuperHumid'

export const humidityProvinceToNumber = {
	'SuperArid': 0,
	'Perarid': 1,
	'Arid': 2,
	'SemiArid': 3,
	'Subhumid': 4,
	'humid': 5,
	'Perhumid': 6,
	'SuperHumid': 7
}

interface ILifeZone {desc: string, desc2: string, color: string}

export const lifeZonesList = {
	1:{ desc: 'Desierto polar', desc2: 'Polar desert', color: ''},
	2:{ desc: 'Tundra seca', desc2: 'Subpolar dry tundra', color: ''},
	3:{ desc: 'Tundra húmeda', desc2: 'Subpolar moist tundra', color: ''},
	4:{ desc: 'Tundra muy húmeda', desc2: 'Subpolar wet tundra', color: ''},
	5:{ desc: 'Tundra pluvial', desc2: 'Subpolar rain tundra', color: ''},
	6:{ desc: 'Desierto boreal', desc2: 'Boreal desert', color: ''},
	7:{ desc: 'Matorral boreal seco', desc2: 'Boreal dry scrub', color: ''},
	8:{ desc: 'Bosque boreal húmedo', desc2: 'Boreal moist forest', color: ''},
	9:{ desc: 'Bosque boreal muy húmedo', desc2: 'Boreal wet forest', color: ''},
	10:{ desc: 'Bosque boreal pluvial', desc2: 'Boreal rain forest', color: ''},
	11:{ desc: 'Desierto templado frío', desc2: 'Cool temperate desert', color: ''},
	12:{ desc: 'Matorral templado frío', desc2: 'Cool temperate desert scrub', color: ''},
	13:{ desc: 'Estepa templada fría', desc2: 'Cool temperate steppe', color: ''},
	14:{ desc: 'Bosque húmedo templado frío', desc2: 'Cool temperate moist forest', color: ''},
	15:{ desc: 'Bosque muy húmedo templado frío', desc2: 'Cool temperate wet forest', color: ''},
	16:{ desc: 'Bosque pluvial templado frío', desc2: 'Cool temperate rain forest', color: ''},
	17:{ desc: 'Desierto templado cálido', desc2: 'Warm temperate desert', color: ''},
	18:{ desc: 'Matorral xerófilo templado cálido', desc2: 'Warm temperate desert scrub', color: ''},
	19:{ desc: 'Matorral espinoso templado cálido', desc2: 'Warm temperate thorn scrub', color: ''},
	20:{ desc: 'Bosque seco templado cálido', desc2: 'Warm temperate dry forest', color: ''},
	21:{ desc: 'Bosque húmedo templado cálido', desc2: 'Warm temperate moist forest', color: ''},
	22:{ desc: 'Bosque muy húmedo templado cálido', desc2: 'Warm temperate wet forest', color: ''},
	23:{ desc: 'Bosque pluvial templado cálido', desc2: 'Warm temperate rain forest', color: ''},
	24:{ desc: 'Desierto subtropical', desc2: 'Subtropical desert', color: ''},
	25:{ desc: 'Matorral xerófilo subtropical', desc2: 'Subtropical desert scrub', color: ''},
	26:{ desc: 'Floresta espinosa subtropical', desc2: 'Subtropical thorn woodland', color: ''},
	27:{ desc: 'Bosque seco subtropical', desc2: 'Subtropical dry forest', color: ''},
	28:{ desc: 'Selva húmeda subtropical', desc2: 'Subtropical moist forest', color: ''},
	29:{ desc: 'Selva muy húmeda subtropical', desc2: 'Subtropical wet forest', color: ''},
	30:{ desc: 'Selva pluvial subtropical', desc2: 'Subtropical rain forest', color: ''},
	31:{ desc: 'Desierto tropical', desc2: 'Tropical desert', color: ''},
	32:{ desc: 'Matorral xerófilo tropical', desc2: 'Tropical desert scrub', color: ''},
	33:{ desc: 'Floresta espinosa tropical', desc2: 'Tropical thorn woodland', color: ''},
	34:{ desc: 'Bosque muy seco tropical', desc2: 'Tropical very dry forest', color: ''},
	35:{ desc: 'Bosque seco tropical', desc2: 'Tropical dry forest', color: ''},
	36:{ desc: 'Selva húmeda tropical', desc2: 'Tropical moist forest', color: ''},
	37:{ desc: 'Selva muy húmeda tropical', desc2: 'Tropical wet forest', color: ''},
	38:{ desc: 'Selva pluvial tropical', desc2: 'Tropical rain forest', color: ''},
}

console.log(lifeZonesList[8])
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

const inRange = (value: number, minimo: number, maximo: number): number => {
	let out = value;

	if (out > maximo) out = maximo;
	if (out < minimo) out = minimo;
	
	return out;
}