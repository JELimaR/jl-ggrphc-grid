import chroma from 'chroma-js';

import JEdge from '../BuildingModel/Voronoi/JEdge';
import JVertex from '../BuildingModel/Voronoi/JVertex';

import IDrawingParameters from './IDrawingParameters';

export const fluxMedia = () => {
	const colorScale: chroma.Scale = chroma.scale('Spectral').domain([1, 0]);
	return (edge: JEdge): IDrawingParameters => {
		let verts: JVertex[] = edge.vertices;
		const fluxPromValue: number = Math.log((verts[0].info.vertexFlux.annualFlux/12 + verts[1].info.vertexFlux.annualFlux/12)/2);
		return {
			fillColor: 'none',
			strokeColor: colorScale(0.15).hex(),
			// lineWidth: fluxPromValue,
			dashPattern: [1, 0]
		}
	}
}

export const fluxMonth = (month: number) => {
	const colorScale: chroma.Scale = chroma.scale('Spectral').domain([1, 0]);
	return (edge: JEdge): IDrawingParameters => {
		let verts: JVertex[] = edge.vertices;
		const fluxPromValue: number = (verts[0].info.vertexFlux.monthFlux[month-1] + verts[1].info.vertexFlux.monthFlux[month-1])/2;
		return {
			fillColor: 'none',
			strokeColor: colorScale(0.15).hex(),
			// lineWidth: fluxPromValue,
			dashPattern: [1, 0]
		}
	}
}

export const colors = (dd: IDrawingParameters) => {
	return (_e: JEdge) => { return dd }
}