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
// import JHeightMap from './heightmap/JHeightMap';
// import JTempMap from './heightmap/JTempMap';
import JTempGrid from './heightmap/JTempGrid'
import JPressureGrid, { PressureData } from './heightmap/JPressureGrid'
import * as JTempFunctions from './Climate/JTempFunctions';

import * as turf from '@turf/turf';


import fs from 'fs';
import Jimp from 'jimp';
import GeoCoordGrid from './Geom/GeoCoordGrid';
import Coord from './Geom/Coord';
import HeightGridData from './heightmap/HeightGridData';
import AzgaarReaderData from './AzgaarData/AzgaarReaderData';
import { calcCoriolisForce, calcFieldInPoint } from './Climate/JPressureFieldFunctions';

import JPrecipGrid from './heightmap/JPrecipGrid';
import JClimateMap from './Climate/JClimateMap';
import { koppenColors, TKoppenSubType } from './CellInformation/JCellClimate';

const tam: number = 3600;
let SIZE: JVector = new JVector({ x: tam, y: tam / 2 });

const azgaarFolder: string[] = [
	'Latiyia30', // 0
	'Boreland30', // 1
	'Bakhoga40', // 2
	'Betia40', // 3
	'Vilesland40', // 4
	'Braia100', // 5
	'Toia100', // 6
	'Vabeaia100', // 7
	'Mont100', // 8
	'Itri100' // 9
];
const folderSelected: string = azgaarFolder[9];

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

const TOTAL: number = 10;
const GRAN: number = 2//0.5;
const world: JWorld = new JWorld(TOTAL, GRAN);
/*let jhm: JHeightMap = */world.generateHeightMap();
// console.log(world.diagram.cells.get(8)!.info.tempMonthArr)
// /*let jtm: JTempMap = */world.generateTemperatureMap();

let tempGrid = new JTempGrid(world.grid);
const pressGrid = new JPressureGrid(world.grid, tempGrid);
const precipGrid: JPrecipGrid = new JPrecipGrid(pressGrid, tempGrid)



console.log(tempGrid.getPressureCenters(2).pressCenter.length)
const tempStep = 5;
// const monthArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const monthArr = [1, 3, 5, 7, 9, 11];

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

// tempGrid.smoothTemp(1000);
let dm2: DrawerMap = new DrawerMap(SIZE, __dirname + `/../img/${folderSelected}/temp`);
colorScale = chroma.scale('Spectral').domain([30, -35]);
for (let i of monthArr) {
	dm2.clear()
	dm2.drawFondo()
	const month: number = i;
	world.grid._points.forEach((col: JGridPoint[], cidx: number) => {
		col.forEach((gp: JGridPoint, ridx: number) => {
			let val = tempGrid.getPointInfo(gp._point).tempMonth[month - 1];
			val = Math.round(val / tempStep) * tempStep;
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
		}, GRAN / 2)
	})
	tempGrid.getPolarFrontPoints(month, 's').concat(tempGrid.getPolarFrontPoints(month, 'n'))
		.forEach((gp: JGridPoint) => {
			color = '#0B000F65'
			dm2.drawDot(gp._point, {
				strokeColor: color, fillColor: color
			}, GRAN / 2)
		})
	tempGrid.getHorseLatPoints(month, 's').concat(tempGrid.getHorseLatPoints(month, 'n'))
		.forEach((gp: JGridPoint) => {
			color = '#00000F65'
			dm2.drawDot(gp._point, {
				strokeColor: color, fillColor: color
			}, GRAN / 2)
		})
	/*tempGrid.getPolarLinePoints(month, 's').concat(tempGrid.getPolarLinePoints(month, 'n'))
		.forEach((gp: JGridPoint) => {
			color = '#00000F65'
			dm2.drawDot(gp._point, {
				strokeColor: color, fillColor: color
			}, GRAN / 2)
		})*/
	dm2.drawMeridianAndParallels();
	dm2.saveDrawFile(`tempGrid${(month < 10 ? `0${month}` : `${month}`)}.png`);
}

/*******************************************/

/****************************************************/


// grid
// nuevo
const month = 1;

let mmm = pressGrid.getMaxMedMin(month);
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
console.log(mmm);

colorScale = chroma.scale('Spectral').domain([mmm.max, mmm.min]);
for (let i of monthArr) {
	dm2.clear()
	dm2.drawFondo()
	const month: number = i;

	world.grid._points.forEach((col: JGridPoint[], cidx: number) => {
		col.forEach((gp: JGridPoint, ridx: number) => {
			let val = pressGrid.getPointInfo(gp._point).pots[month - 1];
			// let val = pressGrid.getPointInfo(gp._point).vecs[month - 1].y * 10;
			color = colorScale(val).hex();
			dm2.drawDot(gp._point, {
				strokeColor: color, fillColor: color
			}, GRAN)
		})
	})
	dm2.drawMeridianAndParallels();
	dm2.saveDrawFile(`${GRAN}pressGrid${(month < 10 ? `0${month}` : `${month}`)}.png`);
}

/*******************************************/
/*
dm2.clear()
// dm2.drawFondo()

tempGrid.getPressureCenters(month).pressCenter.forEach((val: any) => {
	color = (val.mag < 0) ? '#00FF0020' : '#FF000020';
	dm2.drawDot(val.point, {
		strokeColor: color, fillColor: color
	}, GRAN)
})

colorScale = chroma.scale('Spectral').domain([1, 0]);

dataPrecip = ws.precip.get(month) as { value: number; cant: number; }[][];

// dm2.drawMeridianAndParallels();
dm2.saveDrawFile(`tempWind.png`);
*/
// moisture

const dataPrecip = precipGrid._precipData;
colorScale = chroma.scale('Spectral').domain([750, 0]);

for (let month of monthArr) {
	dm2.clear();

	world.grid.forEachPoint((gp: JGridPoint, cidx: number, ridx: number) => {

		const val: number = dataPrecip[cidx][ridx].precip[month - 1];
		if (val === -Infinity || val == Infinity || val == undefined) console.log(cidx, ridx, val)

		const alpha = (gp._cell.info.isLand) ? 1 : 0.5;

		color = colorScale(val).alpha(alpha).hex();

		dm2.drawDot(gp._point, {
			strokeColor: color,
			fillColor: color,
		}, GRAN)

	})

	dm2.drawMeridianAndParallels();
	dm2.saveDrawFile(`${GRAN}moisture${(month < 10 ? `0${month}` : `${month}`)}.png`);
}
/*
colorScale = chroma.scale('Spectral').domain([1, 0]);
for (let month of monthArr) {
	dm2.clear();
	
	world.grid.forEachPoint((gp: JGridPoint, cidx: number, ridx: number) => {
		if (cidx % 6 == 3 && ridx % 6 == 3) {			
			const route = dataPrecip[cidx][ridx].routes[month-1];
			if (route.length > 0) {
				route.forEach((elem: JWindRoutePoint) => {
					color = colorScale(1).hex();
					dm2.drawDot(elem.point, {
						strokeColor: color,
						fillColor: color,
					}, GRAN/8)
				})
			}	
		}
	})
	
	dm2.drawMeridianAndParallels();
	dm2.saveDrawFile(`${GRAN}windSim${(month < 10 ? `0${month}` : `${month}`)}.png`);
}
*/
// anual
dm2.clear();
//dm2.drawCellMap(world, JCellToDrawEntryFunctions.heighLand(1));
colorScale = chroma.scale('Spectral').domain([750 * 9, 0]);
let max: number = 0;
world.grid.forEachPoint((gp: JGridPoint, cidx: number, ridx: number) => {
	let val = 0;
	precipGrid._precipData[cidx][ridx].precip.forEach((m: number) => val += m);

	if (max < val) max = val;
	const alpha = (gp._cell.info.isLand) ? 1 : 0.8;
	color = colorScale(val).alpha(alpha).hex();
	dm2.drawDot(gp._point, {
		strokeColor: color,
		fillColor: color,
	}, GRAN)
})
dm2.drawMeridianAndParallels();
dm2.saveDrawFile(`${GRAN}moistureAnual.png`)
console.log('anual max:', max)

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
/*
console.log('  2', pressGrid.getPointInfo(new JPoint(10, 2)))
console.log('-32', pressGrid.getPointInfo(new JPoint(14, -32)))
console.log(' 58', pressGrid.getPointInfo(new JPoint(12, 58)))
console.log('-58', pressGrid.getPointInfo(new JPoint(12, -58)))
console.log(' 88', pressGrid.getPointInfo(new JPoint(110, 88)))
console.log('-88', pressGrid.getPointInfo(new JPoint(110, -88)))
*/

// climate map
let koppenCant = {
	Af: 0,
	Am: 0,
	Aw: 0,
	As: 0,
	BWh: 0,
	BWk: 0,
	BSh: 0,
	BSk: 0,
	Csa: 0,
	Csb: 0,
	Csc: 0,
	Cwa: 0,
	Cwb: 0,
	Cwc: 0,
	Cfa: 0,
	Cfb: 0,
	Cfc: 0,
	Dsa: 0,
	Dsb: 0,
	Dsc: 0,
	Dsd: 0,
	Dwa: 0,
	Dwb: 0,
	Dwc: 0,
	Dwd: 0,
	Dfa: 0,
	Dfb: 0,
	Dfc: 0,
	Dfd: 0,
	ET: 0,
	EF: 0,
}
const jcm: JClimateMap = new JClimateMap(world.diagram, precipGrid, tempGrid);
dm2.clear();
// dm2.drawCellMap(world.diagram, (cell: JCell) => {
// 	const ccl = cell.info.cellClimate;
// 	if (ccl && ccl.koppenSubType() !== 'O') {
// 		color = koppenColors[ccl.koppenSubType() as TKoppenSubType];
// 		koppenCant[ccl.koppenSubType() as TKoppenSubType]++;
// 		return {
// 			fillColor: color,
// 			strokeColor: color,
// 		}

// 	} else {
// 		return {
// 			fillColor: '#FFFFFF',
// 			strokeColor: '#FFFFFF',
// 		}
// 	}
// })
world.grid.forEachPoint((gp: JGridPoint, col: number, row: number) => {
	const ccl = gp._cell.info.cellClimate;
	if (ccl.koppenSubType() !== 'O') {
		color = koppenColors[ccl.koppenSubType() as TKoppenSubType];
		koppenCant[ccl.koppenSubType() as TKoppenSubType]++;
		dm2.drawDot(gp._point, {
			strokeColor: color,
			fillColor: color,
		}, GRAN)
	}
})

dm2.drawMeridianAndParallels();
dm2.saveDrawFile(`${GRAN}climateClass.png`)
console.log(koppenCant)



let hmax: JCell = world.diagram.cells.get(1)!;
let tempMaxArr: JCell[] = [
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
let tempMinArr: JCell[] = [...tempMaxArr];

world.diagram.forEachCell((cell: JCell) => {
	if (cell.info.height > hmax.info.height) hmax = cell;
	// tempMaxArr.forEach((tmax: JCell, monthMinus: number) => {
	// 	if (cell.info.tempMonthArr[monthMinus] > tmax.info.tempMonthArr[monthMinus]) tempMaxArr[monthMinus] = cell
	// })
	// tempMinArr.forEach((tmin: JCell, monthMinus: number) => {
	// 	if (cell.info.tempMonthArr[monthMinus] < tmin.info.tempMonthArr[monthMinus]) tempMinArr[monthMinus] = cell
	// })
})

console.log('hmax', hmax.info.cellHeight.heightInMeters, hmax.center.x, hmax.center.y)
// console.log('tmax', tempMaxArr.map((cell: JCell, idx) => {
// 	return `${idx + 1} - ${cell.info.tempMonthArr[idx]} - ${cell.center.x},${cell.center.y}`
// }))
// console.log('tmin', tempMinArr.map((cell: JCell, idx) => {
// 	return `${idx + 1} - ${cell.info.tempMonthArr[idx]} - ${cell.center.x},${cell.center.y}`
// }))


console.timeEnd('all')