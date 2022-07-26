console.time('all');
const newDate = new Date();
console.log(newDate.toLocaleTimeString());
const formatMemoryUsage = (data: number) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`

import * as JCellToDrawEntryFunctions from './Drawer/JCellToDrawEntryFunctions';
import * as JEdgeToDrawEntryFunctions from './Drawer/JEdgeToDrawEntryFunctions';
import DrawerMap, { IDrawEntry } from './Drawer/DrawerMap'

import JPoint from './Geom/JPoint';
import NaturalWorld from './NaturalWorld';
import { DivisionMaker } from './divisions/DivisionMaker';


import statesPointsLists from './divisions/countries/statesPointsLists';
import RegionMap, { } from './MapElements/RegionMap';
import JCell from './Voronoi/JCell';
import JVertex from './Voronoi/JVertex';
import chroma from 'chroma-js';

import * as turf from '@turf/turf';
import RiverMapGenerator from './River/RiverMapGenerator';
import RiverMap, { } from './River/RiverMap';
import FluxRouteMap from './River/FluxRouteMap';
import ShowWater from './toShow/toShowWater';
import ShowHeight from './toShow/toShowHeight';
import ShowClimate from './toShow/toShowClimate';
import LineMap from './MapElements/LineMap';
import JEdge from './Voronoi/JEdge';
import ShowTest from './toShow/toShowTest';
import ShowerManager from './toShow/ShowerManager';
import { createICellContainer, createIVertexContainer } from './utilFunctions';
import IslandMap from './heightmap/IslandMap';
import DrainageBasinMapGenerator from './River/DrainageBasinMapGenerator';
import DrainageBasinMap from './River/DrainageBasinMap';
import config from './config';

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
	'Migny90', // 14
	'Zia20', // 15
	'Deneia60', // 16
];
const folderSelected: string = azgaarFolder[4];
console.log('folder:', folderSelected)

config(folderSelected);

let colorScale: chroma.Scale;
let color: string;

let dm: DrawerMap = new DrawerMap(SIZE, ``); // borrar, se usa el de stest
dm.setZoom(0);
dm.setCenterpan(new JPoint(0, 0));
// navigate
console.log('zoom: ', dm.zoomValue)
console.log('center: ', dm.centerPoint)

console.log('draw buff');
console.log(dm.getPointsBuffDrawLimits());
console.log('center buff');
console.log(dm.getPointsBuffCenterLimits());

const AREA: number = 4100; // 810
const GRAN: number = 2;
const naturalWorld: NaturalWorld = new NaturalWorld(AREA, GRAN); // ver si agregar el dm para ver el hh orginal

const monthArrObj = {
	12: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
	6: [1, 3, 5, 7, 9, 11],
	4: [1, 4, 7, 10],
}
const monthCant: keyof typeof monthArrObj = 12;
/* SHOWERS */
const showerManager = new ShowerManager(naturalWorld, AREA, GRAN, folderSelected);

const sh = showerManager.sh;
const sc = showerManager.sc;
const sw = showerManager.sw;

const stest = showerManager.st;

/**
 * height map
 */
sh.drawHeight();
sh.drawIslands();
// sh.printMaxAndMinCellsHeight();

/**
 * climate map
 */
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
// sc.drawHumidityProvinces();
sc.drawLifeZones();
sc.printLifeZonesData();

/**
 * river map
 */
sw.drawRivers('h');
sw.drawWaterRoutes('#000000', 'l')
// sw.printRiverData();
sw.printRiverDataLongers(3000);
// sw.printRiverDataShorters(15);

console.time('test');

naturalWorld.generateRiverMaps();
naturalWorld.generateIslandMaps();
/*
const isl: IslandMap = naturalWorld.islands[1];
const lineCoast: LineMap = isl.getLimitLines()[0];

console.log('area:', isl.area.toLocaleString('de-DE'), 'km2');
console.log('coast:', lineCoast.length.toLocaleString('de-DE'), 'km');

const dp = dm.calculatePanzoomForReg(isl);

dm.clear(dp.zoom, dp.center);
dm.drawBackground();
dm.drawCellContainer(isl, JCellToDrawEntryFunctions.land(0.9));

const dbmg = new DrainageBasinMapGenerator(naturalWorld.diagram, naturalWorld.fluxRoutes);
const dbArr: DrainageBasinMap[] = [];
lineCoast.vertices.forEach((vertex: JVertex, i: number) => {
	if (vertex.info.vertexFlux?.fluxRouteIds.length > 0) {
		const db: DrainageBasinMap = dbmg.generateIndividual(vertex);
		dbArr.push(db);
	}
})

dbArr.forEach((drainageBasin: DrainageBasinMap) => {
	color = chroma.random().alpha(0.5).hex();
	dm.drawCellContainer(drainageBasin, JCellToDrawEntryFunctions.colors({
		strokeColor: color,
		fillColor: color,
	}))
})
*/
// dm.saveDrawFile('riverIsland3.png')

console.timeEnd('test')

console.timeEnd('all')