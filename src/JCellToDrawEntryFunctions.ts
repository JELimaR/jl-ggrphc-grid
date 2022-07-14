import chroma from 'chroma-js';
//import { koppenColors, TKoppenSubType } from './CellInformation/JCellClimate';
const colorScale: chroma.Scale = chroma.scale('Spectral').domain([1, 0]);
import { altitudinalBeltToNumber, humidityProvinceToNumber, ILifeZone, koppenColors, lifeZonesList, TAltitudinalBelt, THumidityProvinces, TKoppenSubType, TKoppenType } from './CellInformation/JCellClimate';

import { IDrawEntry } from './Drawer/DrawerMap';
import JCell from './Voronoi/JCell';


export const heigh = (alpha: number = 1) => {
	alpha = verifyAlpha(alpha);
	return (c: JCell): IDrawEntry => {
		const value: number = Math.round(c.info.height * 20) / 20;
		let color: string = colorScale(value).alpha(alpha).hex()
		return {
			fillColor: color,
			strokeColor: color
		}
	}
}

export const heighLand = (alpha: number = 1) => {
	alpha = verifyAlpha(alpha);
	return (c: JCell): IDrawEntry => {
		const value: number = Math.round(c.info.height * 20) / 20;
		let color: string = c.info.isLand ? colorScale(value).alpha(alpha).hex() : colorScale(0.05).alpha(alpha).hex();
		return {
			fillColor: color,
			strokeColor: color
		}
	}
}

export const colors = (dd: IDrawEntry) => {
	return (c: JCell) => { return dd }
}

export const land = (alpha: number = 1) => {
	alpha = verifyAlpha(alpha);
	return (c: JCell) => {
		let color: string = c.info.isLand ? chroma('#FFFFFF').alpha(alpha).hex() : colorScale(0.05).alpha(alpha).hex();
		return {
			fillColor: color,
			strokeColor: color
		}
	}
}

export const list = (alpha: number = 1) => {
	alpha = verifyAlpha(alpha);
	return (c: JCell) => {
		let color: string = c.info.isLand ? chroma('#FFFFFF').alpha(alpha).hex() : colorScale(0.05).alpha(alpha).hex();
		return {
			fillColor: color,
			strokeColor: color
		}
	}
}

// climate
export const koppen = (alpha = 1) => {
	alpha = verifyAlpha(alpha);
	return (c: JCell) => {
		let color: string;
		const ccl = c.info.cellClimate;
		if (ccl.koppenSubType() !== 'O' && ccl.koppenType() !== 'O') {
			color = koppenColors[ccl.koppenSubType() as TKoppenSubType]
			color = chroma(color).alpha(alpha).hex();
		}
		else
			color = '#FFFFFF'
		return {
			fillColor: color,
			strokeColor: color
		}
	}
}

export const altitudinalBelts = (alpha = 1) => {
	alpha = verifyAlpha(alpha);
	const colorScale = chroma.scale('Spectral').domain([6, 0]);
	let color: string;
	return (cell: JCell) => {
		const ccl = cell.info.cellClimate;
		if (ccl.koppenSubType() !== 'O' && ccl.koppenType() !== 'O') {
			const AB: TAltitudinalBelt = ccl.altitudinalBelt;
			color = colorScale(altitudinalBeltToNumber[AB]).hex();
		}
		else
			color = '#FFFFFF'
		return {
			fillColor: color,
			strokeColor: color,
		}
	}
}

export const humidityProvinces = (alpha = 1) => {
	alpha = verifyAlpha(alpha);
	const colorScale = chroma.scale('Spectral').domain([7, 0]);
	let color: string;
	return (cell: JCell) => {
		const ccl = cell.info.cellClimate;
		if (ccl.koppenSubType() !== 'O' && ccl.koppenType() !== 'O') {
			const HP: THumidityProvinces = ccl.humidityProvince;
			color = colorScale(humidityProvinceToNumber[HP]).hex();
		}
		else
			color = '#FFFFFF'
		return {
			fillColor: color,
			strokeColor: color,
		}
	}
}

export const lifeZones = (alpha = 1) => {
	alpha = verifyAlpha(alpha);
	return (c: JCell) => {
		let color: string;
		const ccl = c.info.cellClimate;
		if (ccl.koppenSubType() !== 'O' && ccl.koppenType() !== 'O') {
			color = chroma(ccl.lifeZone.color).alpha(alpha).hex();
		}
		else
			color = '#FFFFFF00'
		return {
			fillColor: color,
			strokeColor: color
		}
	}
}

export const precipitationMedia = () => {
	const colorScale = chroma.scale('Spectral').domain([2500, 0]);
	return (cell: JCell) => {
		const ccl = cell.info.cellClimate;
		const val = Math.round(ccl.mediaPrecip / 5) * 5;
		const color = colorScale(val).hex();
		return {
			fillColor: color,
			strokeColor: color,
		}
	}
}

export const precipitationMonth = (month: number) => {
	const colorScale = chroma.scale('Spectral').domain([2500, 0]);
	return (cell: JCell) => {
		const ccl = cell.info.cellClimate;
		const val = Math.round(ccl.precipMonth[month - 1] / 5) * 5;
		const color = colorScale(val).hex();
		return {
			fillColor: color,
			strokeColor: color,
		}
	}
}

export const temperatureMedia = () => {
	const colorScale = chroma.scale('Spectral').domain([30, -35]);
	return (cell: JCell) => {
		const ccl = cell.info.cellClimate;
		const val = Math.round(ccl.tmed / 5) * 5;
		const color = colorScale(val).hex();
		return {
			fillColor: color,
			strokeColor: color,
		}
	}
}

export const temperatureMonth = (month: number) => {
	const colorScale = chroma.scale('Spectral').domain([30, -35]);
	return (cell: JCell) => {
		const ccl = cell.info.cellClimate;
		const val = Math.round(ccl.tempMonth[month - 1] / 5) * 5;
		const color = colorScale(val).hex();
		return {
			fillColor: color,
			strokeColor: color,
		}
	}
}

const verifyAlpha = (a: number): number => {
	if (0 <= a && a <= 1) {
		return a;
	} else if (a < 0) {
		return 0;
	} else {
		return 1;
	}
}
