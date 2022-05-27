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
import JPressureGrid, {PressureData} from './heightmap/JPressureGrid'
import * as JTempFunctions from './Climate/JTempFunctions';

import * as turf from '@turf/turf';


import fs from 'fs';
import Jimp from 'jimp';
import GeoCoordGrid from './Geom/GeoCoordGrid';
import Coord from './Geom/Coord';
import HeightGridData from './heightmap/HeightGridData';
import AzgaarReaderData from './AzgaarData/AzgaarReaderData';
import { applyCoriolis, calcFieldInPoint } from './Climate/JPressureFieldFunctions';

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
	'Vabeaia100'
];
const folderSelected: string = azgaarFolder[4];

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

let hmax: JCell = world.diagram.cells.get(1)!;
let tempMax: JCell[] = [
	world.diagram.cells.get(1)!,
	world.diagram.cells.get(2)!,
	world.diagram.cells.get(3)!,
	world.diagram.cells.get(4)!,
	world.diagram.cells.get(5)!,
	world.diagram.cells.get(6)!,
	world.diagram.cells.get(7)!,
	world.diagram.cells.get(8)!,
	world.diagram.cells.get(9)!,
	world.diagram.cells.get(10)!,
	world.diagram.cells.get(11)!,
	world.diagram.cells.get(12)!
];
let tempMin: JCell[] = [...tempMax];

world.diagram.forEachCell((cell: JCell) => {
	if (cell.info.height > hmax.info.height) hmax = cell;
	tempMax.forEach((tmax: JCell, monthMinus: number) => {
		if (cell.info.tempMonthArr[monthMinus] > tmax.info.tempMonthArr[monthMinus]) tempMax[monthMinus] = cell
	})
	tempMin.forEach((tmin: JCell, monthMinus: number) => {
		if (cell.info.tempMonthArr[monthMinus] < tmin.info.tempMonthArr[monthMinus]) tempMin[monthMinus] = cell
	})
})

console.log('hmax', hmax.info.cellHeight.heightInMeters, hmax.center.x, hmax.center.y)
console.log('tmax', tempMax.map((cell: JCell, idx) => {
	return `${idx+1} - ${cell.info.tempMonthArr[idx]} - ${cell.center.x},${cell.center.y}`
}))
console.log('tmin', tempMin.map((cell: JCell, idx) => {
	return `${idx+1} - ${cell.info.tempMonthArr[idx]} - ${cell.center.x},${cell.center.y}`
}))

let tempGrid = new JClimateGrid(world.grid);
console.log(tempGrid.getPressureCenters(2).length)
const tempStep = 5;
const monthArr = [1,4,7,10];

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

/****************************************************/

/*** TEMPERATURE ***/

// tempGrid.smoothTemp(50);
let dm2: DrawerMap = new DrawerMap(SIZE, __dirname + `/../img/${folderSelected}/temp`);
colorScale = chroma.scale('Spectral').domain([30,-35]);
for (let i of monthArr) {
	dm2.clear()
	dm2.drawFondo()
	const month: number = i;
	world.grid._points.forEach((col: JGridPoint[], cidx: number) => {
		col.forEach((gp: JGridPoint, ridx: number) => {
			let val = tempGrid.getPointInfo(gp._point).tempMonth[month-1];
			val = Math.round(val/tempStep)*tempStep;
			color = colorScale(val).hex();
			dm2.drawDot(gp._point, {
				strokeColor: color, fillColor: color
			}, GRAN)
		})
	})
	tempGrid.getITCZPoints(month).forEach((gp: JGridPoint) => {
		color = '#00000F65'
		dm2.drawDot(gp._point, {
			strokeColor: color, fillColor: color
		}, GRAN/2)
	})
	tempGrid.getPolarFrontPoints(month, 's').concat(tempGrid.getPolarFrontPoints(month, 'n'))
		.forEach((gp: JGridPoint) => {
		color = '#0B000F65'
		dm2.drawDot(gp._point, {
			strokeColor: color, fillColor: color
		}, GRAN/2)
	})
	tempGrid.getHorseLatPoints(month, 's').concat(tempGrid.getHorseLatPoints(month, 'n'))
		.forEach((gp: JGridPoint) => {
		color = '#00000F65'
		dm2.drawDot(gp._point, {
			strokeColor: color, fillColor: color
		}, GRAN/2)
	})
	tempGrid.getPolarLinePoints(month, 's').concat(tempGrid.getPolarLinePoints(month, 'n'))
		.forEach((gp: JGridPoint) => {
		color = '#00000F65'
		dm2.drawDot(gp._point, {
			strokeColor: color, fillColor: color
		}, GRAN/2)
	})
	dm2.drawMeridianAndParallels();
	dm2.saveDrawFile(`tempGrid${(month < 10 ? `0${month}` : `${month}`)}.png`);
}

/*******************************************/

/****************************************************/


// grid
// nuevo
const pressGrid = new JPressureGrid(world.grid, tempGrid)
dm.clear()
dm.drawFondo()
/*
getPressureCenters().forEach((val: any) => {
	color = (val.mag < 10) ? '#00FF00' : '#FF0000';
	dm.drawDot(val.point, {
		strokeColor: color, fillColor: color
	}, GRAN)
})
*/
colorScale = chroma.scale('Spectral').domain([2,0]);
for (let i of monthArr) {
	dm2.clear()
	dm2.drawFondo()
	const month: number = i;
	
	world.grid._points.forEach((col: JGridPoint[], cidx: number) => {
		col.forEach((gp: JGridPoint, ridx: number) => {
			let val = pressGrid.getPointInfo(gp._point).pots[month];
			//val = Math.round(val*tempStep)/tempStep;
			color = colorScale(val).hex();
			dm.drawDot(gp._point, {
				strokeColor: color, fillColor: color
			}, GRAN)
		})
	})
	dm.drawMeridianAndParallels();
	dm.saveDrawFile(`pressGrid${(month < 10 ? `0${month}` : `${month}`)}.png`);
}

/*******************************************/

dm.clear()
dm.drawFondo()
const month = 4;
tempGrid.getPressureCenters(month).forEach((val: any) => {
	color = (val.mag < 10) ? '#00FF0020' : '#FF000020';
	dm.drawDot(val.point, {
		strokeColor: color, fillColor: color
	}, GRAN*2)
})

let curr: JPoint;
let route: JPoint[];

/*
let initPoints: JPoint[] = [
	new JPoint(-165, 31),
	new JPoint(-165, 29),
	new JPoint(-105, 31),
	new JPoint(-105, 29),
	new JPoint(-45, 31),
	new JPoint(-45, 29),
	new JPoint(45, 31),
	new JPoint(45, 29),
	new JPoint(105, 31),
	new JPoint(105, 29),
	new JPoint(165, 31),
	new JPoint(165, 29),
];

initPoints.forEach((curr: JPoint) => {
	
	route = [];
	for (let it = 0; it < 500; it++) {
		const vec: JPoint = calcFieldInPoint(curr);
		if (it === 0) console.log(vec)
		curr = JPoint.pointToCoord(curr.add(vec));
		route.push(curr)
	}
	dm.draw(route, {
			strokeColor: '#F4FFF0',
			fillColor: 'none'
		}
	)
})
*/

world.grid._points.forEach((col: JGridPoint[], cidx: number) => {
	col.forEach((gp: JGridPoint, ridx: number) => {
		if ( cidx*ridx == 360*240 && cidx == 360) {		
			route = [];
			curr = new JPoint(gp._point.x, gp._point.y);

			// const color: string = '#F0F0F080'//`${chroma.random()}`
			
			for (let it = 0; it < 700; it++) {

				let pd: PressureData = pressGrid.getPointInfo(curr);
				let vec: JPoint = pd.vecs[month];
				vec = applyCoriolis(curr.y, vec).normalize();

				console.log(it, pd.pots[month]);
				color = colorScale(pd.pots[month]).hex();
				
				curr = JPoint.pointToCoord(curr.add(vec));
				route.push(curr)
				dm.drawDot(curr, {
					strokeColor: color,
					fillColor: color,
				}, GRAN/4)
			}
		}
	})
	if (cidx % 50 == 0) console.log('van:', cidx, ', de:', world.grid.colsNumber)
})

/*
lowPointArr.forEach((pz: JPoint, i: number) => {
	if ( i % 10 ) {		
		route = [];
		let curr = new JPoint(pz.x, pz.y);
		for (let it = 0; it < 500; it++) {
			const vec: JPoint = calcFieldInPoint(curr);
			
			curr = JPoint.pointToCoord(curr.add(vec));
			route.push(curr)
			dm.drawDot(curr, {
				strokeColor: '#000000',
				fillColor: '#000000'
			}, GRAN/4)
		}
	}
})
*/
/*
const gc = JPoint.greatCircle(lowPoint, highPoint)
gc.forEach((p: JPoint) => {
	dm.drawDot(p,
	 {
		 strokeColor: '#000000',
		fillColor: '#000000'
	 },
		GRAN);
})
*/
dm.drawMeridianAndParallels();
dm.saveDrawFile(`tempWind.png`);

const a = new JPoint(168,15);
const b = new JPoint(-168,15);
const c = b.point2(a);

console.log('d1', JPoint.distance(a,b))
console.log('d2', JPoint.distance2(a,b))
console.log('d22', JPoint.distance(c,b))
console.log('dg', JPoint.geogDistance(a,b))

console.log(pressGrid.getPointInfo(new JPoint(14,-30)))
console.log(pressGrid.getPointInfo(new JPoint( 11, 0)))
console.log(pressGrid.getPointInfo(new JPoint( 11, 60)))
console.log(pressGrid.getPointInfo(new JPoint( 111, 90)))

console.timeEnd('all')