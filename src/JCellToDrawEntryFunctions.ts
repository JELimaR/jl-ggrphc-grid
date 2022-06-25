import chroma from 'chroma-js';
import { koppenColors, TKoppenSubType } from './CellInformation/JCellClimate';
const colorScale: chroma.Scale = chroma.scale('Spectral').domain([1,0]);

import {IDrawEntry} from './DrawerMap';
import JCell from './Voronoi/JCell';


export const heigh = (alpha: number = 1) => {
	alpha = verifyAlpha(alpha);
	return (c: JCell): IDrawEntry => {
		const value: number = Math.round(c.info.height*20)/20;
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
		const value: number = Math.round(c.info.height*20)/20;
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

const verifyAlpha = (a: number): number => {
	if (0 <= a && a <= 1) {
		return a;
	} else if (a < 0) {
		return 0;		
	} else {
		return 1;
	}
}
