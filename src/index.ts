console.time('all');
var newDate = new Date();
console.log(newDate.toLocaleTimeString());

import * as JCellToDrawEntryFunctions from './JCellToDrawEntryFunctions';
import DrawerMap, { IDrawEntry } from './Drawer/DrawerMap'

import JPoint, { IPoint } from './Geom/JPoint';
import JGrid, { JGridPoint } from './Geom/JGrid';
import JWorld from './JWorld';
import { createICellContainerFromCellArray } from './JWorldMap';
import DataInformationFilesManager from './DataInformationLoadAndSave';
import PNGDrawsDataManager from './PNGDrawsDataManager'
import { DivisionMaker } from './divisions/DivisionMaker';


import statesPointsLists from './divisions/countries/statesPointsLists';
import { JContinentMap, JCountryMap, JIslandMap } from './RegionMap/JRegionMap';
import JCell from './Voronoi/JCell';
import JVertex from './Voronoi/JVertex';
import chroma from 'chroma-js';

import { altitudinalBeltToNumber, humidityProvinceToNumber, ILifeZone, koppenColors, lifeZonesList, TAltitudinalBelt, THumidityProvinces, TKoppenSubType, TKoppenType } from './CellInformation/JCellClimate';

import fs from 'fs'
import JRiverMap from './Climate/JRiverMap';
import AzgaarReaderData from './AzgaarData/AzgaarReaderData';
import JRiver, {  } from './Climate/JRiver';
import JWaterRoute from './Climate/JWaterRoute';
import ShowWater from './toShow/toShowWater';
import ShowHeight from './toShow/toShowHeight';
import ShowClimate from './toShow/toShowClimate';

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
// console.log(world.diagram.cells.get(8)!.info.tempMonthArr)
// /*let jtm: JTempMap = */world.generateTemperatureMap();


// sh.drawHeight();
// sh.printMaxAndMinCellsHeight();

/****************************************************/

// nuevo

// climate map
// for (let month of monthArr12) {	sc.drawTempMonth(month); }
// sc.drawTempMedia()
// for (let month of monthArr12) {	sc.drawPrecipMonth(month); }
// sc.drawPrecipMedia()

sc.drawKoppen();
// sc.printKoppenData();

/**
 * LIFE ZONES
 */
sc.drawAltitudinalBelts();
sc.drawHumidityProvinces()
sc.drawLifeZones();
sc.printLifeZonesData();


console.log('vertex cant', world.diagram.vertices2.size)

/*
dm.clear();
dm.drawCellMap(world.diagram, ((cell: JCell) => {return {
	fillColor: chroma.random().hex(),
	strokeColor: '#001410'
}}))
dm.saveDrawFile('diagram.png')
*/
dm.clear()
dm.drawCellMap(world.diagram, ((cell: JCell) => {return {
	fillColor: chroma.random().hex(),
	strokeColor: '#001410'
}}))
dm.saveDrawFile(`${AREA}secDiagram.png`)


sw.printRiverDataLongers(5000);

sh.drawIslands();

console.time('convert to turf')
world._islands.forEach((isl: JIslandMap) => {
	isl.getLimitCells()
})
console.timeEnd('convert to turf')

console.timeEnd('all')