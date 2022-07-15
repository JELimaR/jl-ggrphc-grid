
import * as JCellToDrawEntryFunctions from '../JCellToDrawEntryFunctions';
import DrawerMap, { IDrawEntry } from '../Drawer/DrawerMap'

import JPoint, { IPoint } from '../Geom/JPoint';
import JGrid, { JGridPoint } from '../Geom/JGrid';
import JWorld from '../JWorld';


import statesPointsLists from '../divisions/countries/statesPointsLists';
import { JContinentMap, JCountryMap, JIslandMap } from '../RegionMap/JRegionMap';
import JCell from '../Voronoi/JCell';
import JVertex from '../Voronoi/JVertex';
import chroma from 'chroma-js';

import JRiverMap from '../Climate/JRiverMap';

import JRiver, {  } from '../Climate/JRiver';
import JWaterRoute from '../Climate/JWaterRoute';
import Shower from './Shower';
import { switchCase } from '@babel/types';

let colorScale: chroma.Scale;
let color: string;

/*
const tam: number = 3600;
let SIZE: JPoint = new JPoint(tam, tam / 2);

const azgaarFolder: string[] = [
	'Latiyia30', // 0
	'Boreland30', // 1
	'Bakhoga40', // 2
	'Betia40', // 3
	'Vilesland40', // 4
	'Braia100', // 5
	'Toia100', // 6
	'Morvar100', // 7
	'Mont100', // 8
	'Itri100', // 9
	'Mones5', // 10
	'Civaland1', // 11
	'Shauland30', // 12
	'Lenzkirch50', // 13
];
const folderSelected: string = azgaarFolder[10];

console.log('folder:', folderSelected)


const AREA: number = 12100; // 810
const GRAN: number = 2;
const world: JWorld = new JWorld(AREA, GRAN); // ver si agregar el dm para ver el hh orginal
const tempStep = 5;

const rm = world.riverMap;
let riverLongers = 0;
const dmr: DrawerMap = new DrawerMap(SIZE, __dirname + `/../img/${folderSelected}/river`);

dmr.clear();
dmr.drawCellMap(world.diagram, JCellToDrawEntryFunctions.heighLand(1));
rm._waterRoutesMap.forEach((route: JWaterRoute) => {
	color = '#000000';
	// color = chroma.random().hex();
	const points: JPoint[] = [];//route.map((elem: JVertex) => elem.point)
	route.forEachVertex((v: JVertex) => points.push(v.point)) // agregar una funcion que obtenga los puntos en JFluxRoute
	// console.log(route.map((elem: JVertex) => elem.point))
	dmr.draw(points, {
		fillColor: 'none',
		strokeColor: color
	})
})
dmr.saveDrawFile(`${AREA}routes.png`)

dmr.clear();
dmr.drawCellMap(world.diagram, JCellToDrawEntryFunctions.heighLand(1));
dmr.drawMeridianAndParallels();
const riverSorted = rm.riverLengthSorted;
console.log('sorted')

rm._rivers.forEach((river: JRiver, key: number) => {
	if (river.length > 1000) {
		color = '#0000E1';
		riverLongers++;
		// color = chroma.random().hex();
		// console.log(river._vertices.map((elem: IWaterRoutePoint) => elem.vertex.point))
		const points: JPoint[] = river.vertices.map((vertex: JVertex) => vertex.point)
		dmr.draw(points, {
			fillColor: 'none',
			strokeColor: color,
			dashPattern: [1, 0]
		})
	} else {
		color = chroma.random().hex();
		// console.log(river._vertices.map((elem: IWaterRoutePoint) => elem.vertex.point))
		const points: JPoint[] = river.vertices.map((vertex: JVertex) => vertex.point)
		dmr.draw(points, {
			fillColor: 'none',
			strokeColor: color
		})
	}
})
dmr.saveDrawFile(`${AREA}rivers.png`)
*/

export default class ShowWater extends Shower {

	constructor(world: JWorld, area: number, gran: number, folderSelected: string) {
		super(world, area, gran, folderSelected, 'river');
	}

	drawRivers(color: string | 'random', backGround: 'h') { // crear el JCellToDrawEntryFunction
		this.d.clear();
		// fondo
		switch (backGround) {
			case 'h':
				this.d.drawCellMap(this.w.diagram, JCellToDrawEntryFunctions.heighLand(1));
				break;
			default:
				this.d.drawCellMap(this.w.diagram, JCellToDrawEntryFunctions.land(1));
		}

		// rivers
		this.w.riverMap._rivers.forEach((river: JRiver) => {
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

		// rivers
		this.w.riverMap._waterRoutesMap.forEach((waterRoute: JWaterRoute) => {			
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
				this.d.drawCellMap(this.w.diagram, JCellToDrawEntryFunctions.heighLand(1));
				break;
			default:
				this.d.drawCellMap(this.w.diagram, JCellToDrawEntryFunctions.land(1));
		}
	}

	printRiverData() {
		this.printSeparator();
		console.log('total water route cant', this.w.riverMap._waterRoutesMap.size)
		console.log('total river cant', this.w.riverMap._rivers.size)
	}
	printRiverDataLongers(minL: number) {
		this.printSeparator();
		const riverSorted: JRiver[] = this.w.riverMap.riverLengthSorted;
		let cant: number = 0;
		let curr: JRiver = riverSorted[0];
		while (curr.length > minL && cant < riverSorted.length) {
			curr = riverSorted[cant]
			cant++;
		}
		cant--;
		console.log(`rivers longer than ${minL} km`, cant);
		
		const arr = [];
		for (let i = 0; i<cant;i++) {
			const rs: JRiver = riverSorted[i];
			const rlength = rs.vertices.length;
			const ini: IPoint = rs.vertices[0].point.getInterface();
			const fin: IPoint = rs.vertices[rlength-1].point.getInterface();
			arr.push({
				riverId: rs.id,
				len: Math.round(rs.length),
				verts: rs.vertices.length,
				ini: `${ini.x.toLocaleString('de-DE')};${ini.y.toLocaleString('de-DE')}`,
				fin: `${fin.x.toLocaleString('de-DE')};${fin.y.toLocaleString('de-DE')}`,
				desemb: rs.vertices[rlength-1].info.vertexHeight.heightType
			})
		}
		console.table(arr)
	}

	printRiverDataShorters(maxL: number) {
		this.printSeparator();
		const riverSorted: JRiver[] = this.w.riverMap.riverLengthSorted;
		let cant: number = 0;
		let curr: JRiver = riverSorted[0];
		while (curr.length > maxL && cant < riverSorted.length) {
			curr = riverSorted[cant]
			cant++;
		}
		console.log(`rivers shorter than ${maxL} km`, riverSorted.length - cant);
		
		const arr = [];
		for (let i = cant; i < riverSorted.length;i++) {
			const rs: JRiver = riverSorted[i];
			const rlength = rs.vertices.length;
			const ini: IPoint = rs.vertices[0].point.getInterface();
			const fin: IPoint = rs.vertices[rlength-1].point.getInterface();
			arr.push({
				riverId: rs.id,
				len: Math.round(100*rs.length)/100,
				verts: rs.vertices.length,
				ini: `${ini.x.toLocaleString('de-DE')};${ini.y.toLocaleString('de-DE')}`,
				fin: `${fin.x.toLocaleString('de-DE')};${fin.y.toLocaleString('de-DE')}`,
				desemb: rs.vertices[rlength-1].info.vertexHeight.heightType
			})
		}
		console.table(arr)
	}
}