
import * as JCellToDrawEntryFunctions from '../JCellToDrawEntryFunctions';
import DrawerMap, { IDrawEntry } from '../Drawer/DrawerMap'

import JPoint, { IPoint } from '../Geom/JPoint';
import JGrid, { JGridPoint } from '../Geom/JGrid';
import NaturalWorld from '../NaturalWorld';


import statesPointsLists from '../divisions/countries/statesPointsLists';
import { JContinentMap, JCountryMap, JIslandMap } from '../RegionMap/RegionMap';
import JCell from '../Voronoi/JCell';
import JVertex from '../Voronoi/JVertex';
import chroma from 'chroma-js';

import RiverMapGenerator from '../Climate/RiverMapGenerator';

import RiverMap, { } from '../Climate/RiverMap';
import FluxRoute from '../Climate/FluxRoute';
import Shower from './Shower';
import { switchCase } from '@babel/types';

let colorScale: chroma.Scale;
// let color: string;


export default class ShowWater extends Shower {

	constructor(world: NaturalWorld, area: number, gran: number, folderSelected: string) {
		super(world, area, gran, folderSelected, 'river');
	}

	drawRivers(color: string | 'random', backGround: 'h' | 'l') { // crear el JCellToDrawEntryFunction
		this.d.clear();
		// fondo
		switch (backGround) {
			case 'h':
				this.d.drawCellContainer(this.w.diagram, JCellToDrawEntryFunctions.heighLand(1));
				break;
			case 'l':
				this.d.drawCellContainer(this.w.diagram, JCellToDrawEntryFunctions.land(1));
				break;
			default:
				this.d.drawCellContainer(this.w.diagram, JCellToDrawEntryFunctions.land(1));
		}

		// rivers
		this.w._riverMap._rivers.forEach((river: RiverMap) => {
			color = (color == 'random') ? chroma.random().hex() : color;
			const points: JPoint[] = river.vertices.map((vertex: JVertex) => vertex.point)
			this.d.draw(points, {
				fillColor: 'none',
				strokeColor: color,
				dashPattern: [1, 0]
			})
		})
		this.d.drawMeridianAndParallels();
		this.d.saveDrawFile(`${this.a}rivers.png`)
	}

	drawWaterRoutes(color: string | 'random', background: 'h') { // crear el JCellToDrawEntryFunction
		this.d.clear();
		// fondo
		this.drawFondo(background);

		// water routes
		this.w._riverMap._waterRoutesMap.forEach((waterRoute: FluxRoute) => {
			color = (color == 'random') ? chroma.random().hex() : color;
			const points: JPoint[] = waterRoute.vertices.map((vertex: JVertex) => vertex.point)
			this.d.draw(points, {
				fillColor: 'none',
				strokeColor: color,
				dashPattern: [1, 0]
			})
		})
		this.d.drawMeridianAndParallels();
		this.d.saveDrawFile(`${this.a}waterRoute.png`)
	}

	private drawFondo(background: 'h') {
		switch (background) {
			case 'h':
				this.d.drawCellContainer(this.w.diagram, JCellToDrawEntryFunctions.heighLand(1));
				break;
			default:
				this.d.drawCellContainer(this.w.diagram, JCellToDrawEntryFunctions.land(1));
		}
	}

	printRiverData() {
		this.printSeparator();
		console.log('total water route cant', this.w._riverMap._waterRoutesMap.size)
		console.log('total river cant', this.w._riverMap._rivers.size)
	}
	printRiverDataLongers(minL: number) {
		this.printSeparator();
		const riverSorted: RiverMap[] = this.w._riverMap.riverLengthSorted;
		let cant: number = 0;
		let curr: RiverMap = riverSorted[0];
		while (curr.length > minL && cant < riverSorted.length) {
			curr = riverSorted[cant]
			cant++;
		}
		cant--;
		console.log(`rivers longer than ${minL} km`, cant);

		const arr = [];
		for (let i = 0; i < cant; i++) {
			const rs: RiverMap = riverSorted[i];
			const rlength = rs.vertices.length;
			const ini: IPoint = rs.vertices[0].point.getInterface();
			const fin: IPoint = rs.vertices[rlength - 1].point.getInterface();
			arr.push({
				riverId: rs.id,
				len: Math.round(rs.length),
				verts: rs.vertices.length,
				ini: `${ini.x.toLocaleString('de-DE')};${ini.y.toLocaleString('de-DE')}`,
				fin: `${fin.x.toLocaleString('de-DE')};${fin.y.toLocaleString('de-DE')}`,
				desemb: rs.vertices[rlength - 1].info.vertexHeight.heightType
			})
		}
		console.table(arr)
	}

	printRiverDataShorters(maxL: number) {
		this.printSeparator();
		const riverSorted: RiverMap[] = this.w._riverMap.riverLengthSorted;
		let cant: number = 0;
		let curr: RiverMap = riverSorted[0];
		while (curr.length > maxL && cant < riverSorted.length) {
			curr = riverSorted[cant]
			cant++;
		}
		console.log(`rivers shorter than ${maxL} km`, riverSorted.length - cant);

		const arr = [];
		for (let i = cant; i < riverSorted.length; i++) {
			const rs: RiverMap = riverSorted[i];
			const rlength = rs.vertices.length;
			const ini: IPoint = rs.vertices[0].point.getInterface();
			const fin: IPoint = rs.vertices[rlength - 1].point.getInterface();
			arr.push({
				riverId: rs.id,
				len: Math.round(100 * rs.length) / 100,
				verts: rs.vertices.length,
				ini: `${ini.x.toLocaleString('de-DE')};${ini.y.toLocaleString('de-DE')}`,
				fin: `${fin.x.toLocaleString('de-DE')};${fin.y.toLocaleString('de-DE')}`,
				desemb: rs.vertices[rlength - 1].info.vertexHeight.heightType
			})
		}
		console.table(arr)
	}
}