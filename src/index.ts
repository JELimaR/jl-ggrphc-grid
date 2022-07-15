console.time('all');
var newDate = new Date();
console.log(newDate.toLocaleTimeString());

import * as JCellToDrawEntryFunctions from './JCellToDrawEntryFunctions';
import DrawerMap, { IDrawEntry } from './Drawer/DrawerMap'

import JPoint from './Geom/JPoint';
import JWorld from './JWorld';
import { createICellContainerFromCellArray } from './JWorldMap';
import DataInformationFilesManager from './DataInformationLoadAndSave';
import PNGDrawsDataManager from './PNGDrawsDataManager'
import AzgaarReaderData from './AzgaarData/AzgaarReaderData';
import { DivisionMaker } from './divisions/DivisionMaker';


import statesPointsLists from './divisions/countries/statesPointsLists';
import { JIslandMap } from './RegionMap/JRegionMap';
import JCell from './Voronoi/JCell';
import JVertex from './Voronoi/JVertex';
import chroma from 'chroma-js';

import fs from 'fs'
import * as turf from '@turf/turf';
import JRiverMap from './Climate/JRiverMap';
import JRiver, { } from './Climate/JRiver';
import JWaterRoute from './Climate/JWaterRoute';
import ShowWater from './toShow/toShowWater';
import ShowHeight from './toShow/toShowHeight';
import ShowClimate from './toShow/toShowClimate';
import JLine from './RegionMap/JLine';

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
const world: JWorld = new JWorld(AREA, GRAN); // ver si agregar el dm para ver el hh orginal

const monthArr12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const monthArr6 = [1, 3, 5, 7, 9, 11];
const monthArr4 = [1, 4, 7, 10];

const sh = new ShowHeight(world, AREA, GRAN, folderSelected);
const sc = new ShowClimate(world, AREA, GRAN, folderSelected);
const sw = new ShowWater(world, AREA, GRAN, folderSelected);


// sh.drawHeight();
// sh.printMaxAndMinCellsHeight();

/******************** climate map ********************/
// for (let month of monthArr12) {	sc.drawTempMonth(month); }
// sc.drawTempMedia()
// for (let month of monthArr12) {	sc.drawPrecipMonth(month); }
// sc.drawPrecipMedia()

// sc.drawKoppen();
// sc.printKoppenData();

/**
 * LIFE ZONES
 */
// sc.drawAltitudinalBelts();
// sc.drawHumidityProvinces()
// sc.drawLifeZones();
// sc.printLifeZonesData();

/*
dm.drawCellMap(world.diagram, ((cell: JCell) => {return {
	fillColor: chroma.random().hex(),
	strokeColor: '#001410'
}}))
dm.drawMeridianAndParallels(181,361)
dm.saveDrawFile(`${AREA}secDiagram.png`)
*/
// sw.drawRivers('#1112EA', 'h');
sw.printRiverData();
sw.printRiverDataLongers(3000);
sw.printRiverDataShorters(15);


sh.drawIslands();
/*
console.time('convert to line')
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

dm.clear()


const landReg = world._heightMap.landRegion;
dm.clear()
dm.drawCellMap(landReg, JCellToDrawEntryFunctions.colors({
	fillColor: '#001410',
	strokeColor: '#001410'
}))

color = '#B8021F'
landReg.getLimitLines().forEach((limit: JLine) => {
	
	const points: JPoint[] = limit.vertices.map((v: JVertex) => v.point);
	dm.draw(points, {
		fillColor: 'none',
		strokeColor: color
	})
	
})

console.log('cantidad de lines limits en landReg', landReg.getLimitLines().length)

dm.saveDrawFile(`${AREA}landLimits1.png`)

console.timeEnd('convert to line')
*/
console.timeEnd('all')