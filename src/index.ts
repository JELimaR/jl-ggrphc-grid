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
import * as JTempFunctions from './heightmap/JTempFunctions';

import * as turf from '@turf/turf';


import fs from 'fs';
import Jimp from 'jimp';
import GeoCoordGrid from './Geom/GeoCoordGrid';
import Coord from './Geom/Coord';
import HeightGridData from './heightmap/HeightGridData2';
import AzgaarReaderData from './AzgaarData/AzgaarReaderData';

const tam: number = 3600;
let SIZE: JVector = new JVector({ x: tam, y: tam / 2 });

const azgaarFolder: string[] = ['Mordaia100'];

PNGDrawsDataManager.configPath(__dirname + `/../pngdraws`);
DataInformationFilesManager.configPath(__dirname + `/../data`);
AzgaarReaderData.configPath(__dirname + `/../AzgaarData/${azgaarFolder[0]}`);

let dm: DrawerMap = new DrawerMap(SIZE, __dirname + `/../img`);
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
let jhm: JHeightMap = world.generateHeightMap();

console.log()
jhm.diagram.forEachCell((cell: JCell) => {
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

const colorScale: chroma.Scale = chroma.scale('Spectral').domain([1,0]);
//console.log(AzgaarReaderData.instance.sites())

dm.drawCellMap(jhm, (cell: JCell): IDrawEntry => {

	const cellH = cell.info.cellHeight;

	// const stringColor = /*(cellH.heightType !== 'land') ? colorScale(cellH.height).hex() /*: '#FFFFFFFF'
	const value = Math.round(cellH.height*20)/20;
	const stringColor = colorScale(value).hex()
		
	return {
		strokeColor: stringColor,
		fillColor: stringColor
	}
	
})
dm.drawMeridianAndParallels()
dm.saveDrawFile('hhh.png')

dm.drawFondo();
dm.drawCellMap(jhm, JCellToDrawEntryFunctions.heighLand(1))
dm.drawMeridianAndParallels()
dm.saveDrawFile('hhh2.png')


// diagram info
let minArea = Infinity;
let idMin = 0;
let maxArea = 0;
let idMax = 0;

jhm.diagram.forEachCell((cell: JCell) => {
	const area = cell.area;
	if (area > maxArea) {
		maxArea = area;
		idMax = cell.id;
	}
	if (area < minArea) {
		minArea = area;
		idMin = cell.id;
	}
})

console.log('min area:', minArea)
console.log('cell min area:', jhm.diagram.getCellById(idMin))
console.log('max area:', maxArea)
console.log('cell max area:', jhm.diagram.getCellById(idMax))


console.timeEnd('all')