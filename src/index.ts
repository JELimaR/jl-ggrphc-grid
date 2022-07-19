console.time('all');
const newDate = new Date();
console.log(newDate.toLocaleTimeString());

import * as JCellToDrawEntryFunctions from './JCellToDrawEntryFunctions';
import DrawerMap, { IDrawEntry } from './Drawer/DrawerMap'

import JPoint from './Geom/JPoint';
import NaturalWorld from './NaturalWorld';
import DataInformationFilesManager from './DataInformationLoadAndSave';
import PNGDrawsDataManager from './PNGDrawsDataManager'
import AzgaarReaderData from './AzgaarData/AzgaarReaderData';
import { DivisionMaker } from './divisions/DivisionMaker';


import statesPointsLists from './divisions/countries/statesPointsLists';
import RegionMap, { } from './MapElements/RegionMap';
import JCell from './Voronoi/JCell';
import JVertex from './Voronoi/JVertex';
import chroma from 'chroma-js';

import fs from 'fs'
import * as turf from '@turf/turf';
import RiverMapGenerator from './River/RiverMapGenerator';
import RiverMap, { } from './River/RiverMap';
import FluxRoute from './River/FluxRoute';
import ShowWater from './toShow/toShowWater';
import ShowHeight from './toShow/toShowHeight';
import ShowClimate from './toShow/toShowClimate';
import LineMap from './MapElements/LineMap';
import JEdge from './Voronoi/JEdge';
import ShowTest from './toShow/toShowTest';
import ShowerManager from './toShow/ShowerManager';

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

let colorScale: chroma.Scale;
let color: string;

PNGDrawsDataManager.configPath(__dirname + `/../pngdraws`);
DataInformationFilesManager.configPath(__dirname + `/../data/${folderSelected}`);
AzgaarReaderData.configPath(__dirname + `/../AzgaarData/${folderSelected}`);

let dm: DrawerMap = new DrawerMap(SIZE, __dirname + `/../img/${folderSelected}`);
dm.setZoom(0);
dm.setCenterpan(new JPoint(0, 0));
// navigate
console.log('zoom: ', dm.zoomValue)
console.log('center: ', dm.centerPoint)

console.log('draw buff');
console.log(dm.getPointsBuffDrawLimits());
console.log('center buff');
console.log(dm.getPointsBuffCenterLimits());

const AREA: number = 12100; // 810
const GRAN: number = 2;
const naturalWorld: NaturalWorld = new NaturalWorld(AREA, GRAN); // ver si agregar el dm para ver el hh orginal

const monthArrObj = {
	12: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
	6: [1, 3, 5, 7, 9, 11],
	4: [1, 4, 7, 10],
}
const monthCant: keyof typeof monthArrObj = 12;
/* SHOWERS */
const showerManager = new ShowerManager(naturalWorld, AREA, GRAN, folderSelected)
const sh = showerManager.sh;
const sc = showerManager.sc;
const sw = showerManager.sw;

const stest = showerManager.st;

/*******************************************************************/

sh.drawHeight();
// sh.printMaxAndMinCellsHeight();

/******************** climate map ********************/
// for (let month of monthArrObj[monthCant]) {	sc.drawTempMonth(month); }
sc.drawTempMedia()
// for (let month of monthArrObj[monthCant]) {	sc.drawPrecipMonth(month); }
sc.drawPrecipMedia()

sc.drawKoppen();
// sc.printKoppenData();

/**
 * LIFE ZONES
 */
// sc.drawAltitudinalBelts();
// sc.drawHumidityProvinces()
sc.drawLifeZones();
// sc.printLifeZonesData();

/*
dm.drawCellMap(world.diagram, ((cell: JCell) => {return {
	fillColor: chroma.random().hex(),
	strokeColor: '#001410'
}}))
dm.drawMeridianAndParallels(181,361)
dm.saveDrawFile(`${AREA}secDiagram.png`)
*/
sw.drawRivers('#1112EA', 'h');
// sw.printRiverData();
// sw.printRiverDataLongers(3000);
// sw.printRiverDataShorters(15);


// sh.drawIslands();

console.time('convert to line')
/*
dm.clear()
world._islands.forEach((isl: JIslandMap) => {
	dm.drawCellMap(isl, JCellToDrawEntryFunctions.colors({
		fillColor: '#001410',
		strokeColor: '#001410'
	}))

	color = chroma.random().hex();
	isl.getLimitLines().forEach((limit: JLine) => {
		const points: JPoint[] = limit.vertices.map((v: JVertex) => v.point);
		dm.draw(points, {
			fillColor: 'none',
			strokeColor: color
		})
	})
	console.log(`cantidad de lines limits en isla: ${isl.id}`, isl.getLimitLines().length)
})
dm.saveDrawFile(`${AREA}islandsLimits1.png`)
*/

// const landReg = world._heightMap.landRegion;
dm.clear(2, new JPoint(-10, 2))
/*
dm.drawCellContainer(landReg, JCellToDrawEntryFunctions.colors({
	fillColor: '#00141042',
	strokeColor: '#001410'
}))
*/
/*
console.log(JRegionMap.existIntersection(landReg, world._islands[0]))
const inter: JRegionMap = JRegionMap.intersect(landReg,world._islands[0] )
dm.drawCellContainer(inter, JCellToDrawEntryFunctions.colors({
	fillColor: '#00141042',
	strokeColor: '#001410'
}))
*/
/*
landReg.getLimitLines().forEach((limit: JLine) => {
	dm.drawVertexContainer(limit, {
		fillColor: '#00141042',
		strokeColor: '#001410'
	})
})
color = '#B8021F'

landReg.getLimitLines().forEach((limit: JLine) => {
	color = chroma.random().hex();
	dm.drawEdgeContainer(limit, (edge: JEdge) => {
		return {
			fillColor: 'none',
			strokeColor: color
		}
	})
})
*/
/*
dm.drawMeridianAndParallels();
dm.saveDrawFile(`${AREA}landInter.png`)
*/

console.timeEnd('convert to line')

console.timeEnd('all')