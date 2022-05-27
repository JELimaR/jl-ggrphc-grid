console.time('all');

var newDate = new Date();
console.log(newDate.toLocaleTimeString());

import * as JCellToDrawEntryFunctions from './JCellToDrawEntryFunctions';
import DrawerMap, { IDrawEntry } from './DrawerMap'
import JPoint, { JVector } from './Geom/JPoint';
import JGrid, { JGridPoint } from './Geom/JGrid';
import JWorld from './JWorld';
import { createICellContainerFromCellArray } from './JWorldMap';
import DataInformationFilesManager from './DataInformationLoadAndSave';
import PNGDrawsDataManager from './PNGDrawsDataManager'
import { DivisionMaker } from './divisions/DivisionMaker';
import { Tree } from 'jl-utlts';
import JRegionMap, { IJRegionTreeNode, JStateMap } from './RegionMap/JRegionMap';
import statesPointsLists from './divisions/countries/statesPointsLists';
import { JContinentMap, JCountryMap } from './RegionMap/JRegionMap';
import JCell from './Voronoi/JCell';
import chroma from 'chroma-js';
import JHeightMap from './heightmap/JHeightMap';
import JTempMap from './heightmap/JTempMap';
import JClimateGrid from './heightmap/JClimateGrid'
import * as JTempFunctions from './Climate/JTempFunctions';

import * as turf from '@turf/turf';


import fs from 'fs';
import Jimp from 'jimp';
import GeoCoordGrid from './Geom/GeoCoordGrid';
import Coord from './Geom/Coord';
import HeightGridData from './heightmap/HeightGridData2';
import AzgaarReaderData from './AzgaarData/AzgaarReaderData';

const tam: number = 3600;
let SIZE: JVector = new JVector({ x: tam, y: tam / 2 });

const azgaarFolder: string[] = [
	'Latiyia30',
	'Boreland30',
	'Bakhoga40',
	'Betia40',
	'Vilesland40',
	'Braia100',
	'Toia100',
	'Vabeaia100',
	'Mont100',
	'Itri100'
];
const folderSelected: string = azgaarFolder[8];

console.log('folder:', folderSelected)

let colorScale: chroma.Scale;
let color: string;

PNGDrawsDataManager.configPath(__dirname + `/../pngdraws`);
DataInformationFilesManager.configPath(__dirname + `/../data/${folderSelected}`);
AzgaarReaderData.configPath(__dirname + `/../AzgaarData/${folderSelected}`);

let dm: DrawerMap = new DrawerMap(SIZE, __dirname + `/../img/${folderSelected}`);
dm.setZoom(0) // 5
dm.setCenterpan(new JPoint(0, 0));
// navigate
console.log('zoom: ', dm.zoomValue)
console.log('center: ', dm.centerPoint)

console.log('draw buff');
console.log(dm.getPointsBuffDrawLimits());
console.log('center buff');
console.log(dm.getPointsBuffCenterLimits());

const TOTAL: number = 10;
const GRAN: number = 0.5;
const world: JWorld = new JWorld(TOTAL, GRAN);
/*let jhm: JHeightMap = */world.generateHeightMap();
/*let jtm: JTempMap = */world.generateTemperatureMap();

console.log()
world.diagram.forEachCell((cell: JCell) => {
	// console.log(cell.id)
})


// const gcg = new GeoCoordGrid();
// const hgd = new HeightGridData(gcg);


dm.drawFondo()
/*
const colorScale: chroma.Scale = chroma.scale('Spectral').domain([1,0]);
hgd._heightData.forEach((data: {
	height: number
}, id: number) => {
	let val = Math.pow((5000+data.height)/11000, Math.log(0.2)/Math.log(5/11));
	//val = Math.round(val*100)/100;
	const gc = gcg._map.get(id)!;
	const stringColor = '#' + hgd._rawData.getPixelColor(gc.colValue, gc.rowValue).toString(16).padStart(6, '0');
	
	const color: string = colorScale(val).hex();
	
	dm.drawDot(
		gcg._map.get(id)!._coord.toPoint(),
		{
			strokeColor: stringColor,
			fillColor: stringColor
		},
		GRAN
	)
})
*/

colorScale = chroma.scale('Spectral').domain([1,0]);
//console.log(AzgaarReaderData.instance.sites())

dm.drawCellMap(world, JCellToDrawEntryFunctions.heigh(1))
dm.drawMeridianAndParallels()
dm.saveDrawFile('hhh.png')

dm.drawFondo();
dm.drawCellMap(world, JCellToDrawEntryFunctions.heighLand(1))
dm.drawMeridianAndParallels()
dm.saveDrawFile('hhh2.png')


/*******************************************************/

const tempStep = 5;
colorScale = chroma.scale('Spectral').domain([30, -30]);
let meds: number[] = [];
// temp med
dm.clear();
dm.drawCellMap(world, (c: JCell): IDrawEntry => {
 	let tarr: number[] = c.info.tempMonthArr;
 	let val: number = 0;
 	tarr.forEach((t: number) => val += t / 12)

	val = tarr[6]

// 	meds.push(val);

 	color = colorScale(tempStep * Math.round(val / tempStep)).hex();

 	return {
 		fillColor: color,
 		strokeColor: color
 	}
})

dm.drawMeridianAndParallels();
dm.saveDrawFile(`tempMapMed.png`);

/*********************************************/

const cell1: JCell = world.diagram.getCellFromPoint2(new JPoint(0,0));
//console.log(cell.info)
console.log('center', cell1.center)
console.log('temp media', cell1.info.tempMedia)
console.log('temp mensual', cell1.info.tempMonthArr)

const cell2: JCell = world.diagram.getCellFromPoint2(new JPoint(-120,0));
//console.log(cell.info)
console.log('center', cell2.center)
console.log('temp media', cell2.info.tempMedia)
console.log('temp mensual', cell2.info.tempMonthArr)

/****************************************************/

// grid
// nuevo
dm.clear()
let tempGrid = new JClimateGrid(world.grid);

tempGrid._grid._points.forEach((col: JGridPoint[], cidx: number) => {
	col.forEach((gp: JGridPoint, ridx: number) => {
		if (gp._cell.info.isLand) {
			let tempValue: number;
			tempValue = tempGrid._tempData[cidx][ridx].tempMonth[6];
			meds.push(tempValue)
			tempValue = tempStep * Math.round(tempValue / tempStep);
			color = colorScale(tempValue).hex();
			dm.drawDot(
				gp._point, {
				fillColor: color,
				strokeColor: color
			}, GRAN
			);
		}
	})
})
dm.drawMeridianAndParallels();
dm.saveDrawFile(`tempGridMed.png`);

console.timeEnd('all')