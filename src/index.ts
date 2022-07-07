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

import JRegionMap, { IJRegionTreeNode, JStateMap } from './RegionMap/JRegionMap';
import statesPointsLists from './divisions/countries/statesPointsLists';
import { JContinentMap, JCountryMap } from './RegionMap/JRegionMap';
import JCell from './Voronoi/JCell';
import JVertex from './Voronoi/JVertex';
import chroma from 'chroma-js';

import JTempGrid from './heightmap/JTempGrid'
import JPressureGrid, { PressureData } from './heightmap/JPressureGrid'

import * as turf from '@turf/turf';
import AzgaarReaderData from './AzgaarData/AzgaarReaderData';

import JPrecipGrid from './heightmap/JPrecipGrid';
import JClimateMap from './Climate/JClimateMap';
import { altitudinalBeltToNumber, humidityProvinceToNumber, ILifeZone, koppenColors, lifeZonesList, TAltitudinalBelt, THumidityProvinces, TKoppenSubType, TKoppenType } from './CellInformation/JCellClimate';

import fs from 'fs'
import JRiverMap, { IWaterRoutePoint, JRiver } from './heightmap/JRiverMap';

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
	'Morvar100', // 7
	'Mont100', // 8
	'Itri100', // 9
	'Mones5', // 10
	'Civaland1', // 11
	'Shauland30', // 12
];
const folderSelected: string = azgaarFolder[4];

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

const AREA: number = 12100; // 1100
const GRAN: number = 2;
const world: JWorld = new JWorld(AREA, GRAN);
const tempStep = 5;
// const monthArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const monthArr = [1, 3, 5, 7, 9, 11];

/*let jhm: JHeightMap = */world.generateHeightMap();
world.generateHeightMap2();
// console.log(world.diagram.cells.get(8)!.info.tempMonthArr)
// /*let jtm: JTempMap = */world.generateTemperatureMap();
console.log('cells cant', world.secondaryDiagram.cells.size)
let areaLand: number = 0, cantLand: number = 0;
let maxAreaLand: JCell = world.secondaryDiagram.cells.get(3255)!;
let minAreaLand: JCell = world.secondaryDiagram.cells.get(3255)!;
world.secondaryDiagram.forEachCell((c: JCell) => {
	if (c.info.isLand) {
		areaLand += c.areaSimple;
		cantLand ++;		
		if (c.areaSimple < minAreaLand.areaSimple) minAreaLand = c
		if (c.areaSimple > maxAreaLand.areaSimple) maxAreaLand = c
	}
})
console.log('area total', areaLand);
console.log('area prom', areaLand/cantLand);
console.log('area max', maxAreaLand.area);
console.log(maxAreaLand)

console.log('area min', minAreaLand.area);
console.log(minAreaLand)
console.log(minAreaLand.info.isLand)

let tempGrid = new JTempGrid(world.grid);
// temperatura antes del cambio por precip

let dm2: DrawerMap = new DrawerMap(SIZE, __dirname + `/../img/${folderSelected}/${GRAN}temp`);
/*
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
	dm2.drawMeridianAndParallels();
	dm2.saveDrawFile(`tempGrid${(month < 10 ? `0${month}` : `${month}`)}-prev.png`);
}
*/

const pressGrid = new JPressureGrid(world.grid, tempGrid);
const precipGrid: JPrecipGrid = new JPrecipGrid(pressGrid, tempGrid)

// const gcg = new GeoCoordGrid();
// const hgd = new HeightGridData(gcg);


dm.drawFondo()
dm.drawCellMap(world.diagram, JCellToDrawEntryFunctions.heighLand(1))
dm.drawMeridianAndParallels();
dm.saveDrawFile(`hh.png`);

dm.drawFondo()
dm.drawCellMap(world.secondaryDiagram, JCellToDrawEntryFunctions.heighLand(1))
dm.drawCellMap(createICellContainerFromCellArray([minAreaLand, maxAreaLand]), JCellToDrawEntryFunctions.colors({
	fillColor: '#000000',
	strokeColor: '#000000',
}))
dm.drawMeridianAndParallels();
dm.saveDrawFile(`${AREA}sechh.png`);

/****************************************************/

/*** TEMPERATURE ***/
/*
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
	dm2.drawMeridianAndParallels();
	dm2.saveDrawFile(`tempGrid${(month < 10 ? `0${month}` : `${month}`)}.png`);
}
*/
/*******************************************/

/****************************************************/


// grid
// nuevo
const month = 1;

let mmm = pressGrid.getMaxMedMin(month);
dm.clear()
dm.drawFondo()

/*
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
*/
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
/*
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
*/
// anual
/*
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
*/
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
	Af: 0, AwAs: 0, Am: 0,
	BWh: 0, BWk: 0, BSh: 0, BSk: 0,
	Csa: 0, Csb: 0, Csc: 0,
	Cwa: 0, Cwb: 0, Cwc: 0,
	Cfa: 0, Cfb: 0, Cfc: 0,
	Dsa: 0, Dsb: 0, Dsc: 0, Dsd: 0,
	Dwa: 0, Dwb: 0, Dwc: 0, Dwd: 0,
	Dfa: 0, Dfb: 0, Dfc: 0, Dfd: 0,
	ET: 0, EF: 0,
}
let koppenArea = {
	Af: 0, AwAs: 0, Am: 0,
	BWh: 0, BWk: 0, BSh: 0, BSk: 0,
	Csa: 0, Csb: 0, Csc: 0,
	Cwa: 0, Cwb: 0, Cwc: 0,
	Cfa: 0, Cfb: 0, Cfc: 0,
	Dsa: 0, Dsb: 0, Dsc: 0, Dsd: 0,
	Dwa: 0, Dwb: 0, Dwc: 0, Dwd: 0,
	Dfa: 0, Dfb: 0, Dfc: 0, Dfd: 0,
	ET: 0, EF: 0,
}
let koppenBasicArea = { A: 0, B: 0, C: 0, D: 0, E: 0 }
let totalArea: number = 0;
let annualMax: number = 0;
// const jcm: JClimateMap = new JClimateMap(world.diagram, precipGrid, tempGrid);
const jcm2: JClimateMap = new JClimateMap(world.secondaryDiagram, precipGrid, tempGrid);

monthArr.forEach((month: number) => {
	dm2.clear();
	dm2.drawCellMap(world.secondaryDiagram, JCellToDrawEntryFunctions.precipitationMonth(month))
	
	dm2.drawMeridianAndParallels();
	dm2.saveDrawFile(`${AREA}precip${(month < 10 ? `0${month}` : `${month}`)}.png`)
})

/*
dm2.clear();
world.grid.forEachPoint((gp: JGridPoint, col: number, row: number) => {
	const ccl = gp._cell.info.cellClimate;
	if (ccl.koppenSubType() !== 'O') {
		color = koppenColors[ccl.koppenSubType() as TKoppenSubType];
		dm2.drawDot(gp._point, {
			strokeColor: color,
			fillColor: color,
		}, GRAN)
	}
})

dm2.drawMeridianAndParallels();
dm2.saveDrawFile(`${GRAN}climateClass.png`)
// console.log('anual max:', max)
*/

let dmclim: DrawerMap = new DrawerMap(SIZE, __dirname + `/../img/${folderSelected}/climate`);
dmclim.drawCellMap(world.secondaryDiagram, JCellToDrawEntryFunctions.koppen(1))

dmclim.drawMeridianAndParallels();
dmclim.saveDrawFile(`${AREA}climateClass.png`)

world.secondaryDiagram.forEachCell((cell: JCell) => {
	const ccl = cell.info.cellClimate;
	if (ccl.koppenSubType() !== 'O' && ccl.koppenType() !== 'O') {
		koppenCant[ccl.koppenSubType() as TKoppenSubType]++;
		koppenArea[ccl.koppenSubType() as TKoppenSubType] += cell.areaSimple;
		koppenBasicArea[ccl.koppenType() as TKoppenType] += cell.areaSimple;
		totalArea += cell.areaSimple;
		if (annualMax < ccl.annualPrecip) annualMax = ccl.annualPrecip;
	}
})
for (let p in koppenCant) {
	console.log(p, koppenCant[p as TKoppenSubType], koppenArea[p as TKoppenSubType])
	console.log((koppenArea[p as TKoppenSubType] / totalArea * 100).toLocaleString())
}
console.log('----------------------------------------------------------------------------------')
for (let p in koppenBasicArea) {
	console.log(p, koppenBasicArea[p as TKoppenType])
	console.log((koppenBasicArea[p as TKoppenType] / totalArea * 100).toLocaleString())
}

console.log('annual precipitation max', annualMax)
/*
colorScale = chroma.scale('Spectral').domain([6, 0]);
dmclim.clear();
dmclim.drawCellMap(world, (cell: JCell) => {
	const ccl = cell.info.cellClimate;
	if (ccl.koppenSubType() !== 'O' && ccl.koppenType() !== 'O') {
		const AB: TAltitudinalBelt = ccl.altitudinalBelt;
		color = colorScale(altitudinalBeltToNumber[AB]).hex();
	}
	else
		color = '#FFFFFF'
	return {
		fillColor: color,
		strokeColor: color,
	}
})

dmclim.drawMeridianAndParallels();
dmclim.saveDrawFile(`${GRAN}altitudinalBelts.png`)
*/
/*
colorScale = chroma.scale('Spectral').domain([7, 0]);
dmclim.clear();
dmclim.drawCellMap(world, (cell: JCell) => {
	const ccl = cell.info.cellClimate;
	if (ccl.koppenSubType() !== 'O' && ccl.koppenType() !== 'O') {
		const HP: THumidityProvinces = ccl.humidityProvince;
		color = colorScale(humidityProvinceToNumber[HP]).hex();
	}
	else
		color = '#FFFFFF'
	return {
		fillColor: color,
		strokeColor: color,
	}
})

dmclim.drawMeridianAndParallels();
dmclim.saveDrawFile(`${GRAN}humidityProvinces.png`)
*/
//
/*
colorScale = chroma.scale('Spectral').domain([30, -35]);
dmclim.clear()
dmclim.drawCellMap(world, (cell: JCell) => {
	const ccl = cell.info.cellClimate;
	const val = Math.round(ccl.tmed / tempStep) * tempStep;
	color = colorScale(val).hex();
	return {
		fillColor: color,
		strokeColor: color,
	}
})
dmclim.drawMeridianAndParallels();
dmclim.saveDrawFile(`tempMedia.png`)
*/
/*
for (let month of monthArr) {
	dmclim.clear()
	dmclim.drawCellMap(world, (cell: JCell) => {
		const ccl = cell.info.cellClimate;
		const val = Math.round(ccl.tempMonth[month-1] / tempStep) * tempStep;
		color = colorScale(val).hex();
		return {
			fillColor: color,
			strokeColor: color,
		}
	})
	dmclim.drawMeridianAndParallels();
	dmclim.saveDrawFile(`temp${(month < 10 ? `0${month}` : `${month}`)}.png`)
}
/*/
//
/*
colorScale = chroma.scale('Spectral').domain([2500, 0]);
dmclim.clear()
dmclim.drawCellMap(world, (cell: JCell) => {
	const ccl = cell.info.cellClimate;
	let val = Math.round(ccl.annualPrecip / tempStep) * tempStep;
	color = colorScale(ccl.mediaPrecip).hex();
	return {
		fillColor: color,
		strokeColor: color,
	}
})
dmclim.drawMeridianAndParallels();
dmclim.saveDrawFile(`precipMedia.png`)
for (let month of monthArr) {
	dmclim.clear()
	dmclim.drawCellMap(world, JCellToDrawEntryFunctions.precipMonth(month))
	dmclim.drawMeridianAndParallels();
	dmclim.saveDrawFile(`precip${(month < 10 ? `0${month}` : `${month}`)}.png`)
}
*/

/**
 * LIFE ZONES
 */
let lifeZonesCant = {
	1: 0, 2: 0, 3: 0, 4: 0,
	5: 0, 6: 0, 7: 0, 8: 0,
	9: 0, 10: 0, 11: 0, 12: 0,
	13: 0, 14: 0, 15: 0, 16: 0,
	17: 0, 18: 0, 19: 0, 20: 0,
	21: 0, 22: 0, 23: 0, 24: 0,
	25: 0, 26: 0, 27: 0, 28: 0,
	29: 0, 30: 0, 31: 0, 32: 0,
	33: 0, 34: 0, 35: 0, 36: 0,
	37: 0, 38: 0,
}

dmclim.clear()
dmclim.drawCellMap(world.secondaryDiagram, (cell: JCell) => {
	const ccl = cell.info.cellClimate;
	if (ccl.koppenSubType() !== 'O' && ccl.koppenType() !== 'O') {
		color = ccl.lifeZone.color;
		lifeZonesCant[ccl.lifeZone.id as keyof typeof lifeZonesCant]++;
	}
	else
		color = '#FFFFFF00'
	return {
		fillColor: color,
		strokeColor: color,
	}
})
dmclim.drawMeridianAndParallels();
dmclim.saveDrawFile(`${AREA}lifeZones.png`)
for (let z = 1; z <= 38; z++) {
	const i = z as keyof typeof lifeZonesList;
	console.log(`${i}: ${lifeZonesList[i].desc}	-	${lifeZonesCant[i]}`)
}

/**
 * RIVER
 */
const rm = new JRiverMap(world.secondaryDiagram);

const dmr: DrawerMap = new DrawerMap(SIZE, __dirname + `/../img/${folderSelected}/river`);

dmr.clear();
dmr.drawCellMap(world.secondaryDiagram, JCellToDrawEntryFunctions.heighLand(1));
rm._roads.forEach((route: IWaterRoutePoint[], key: number) => {
	color = '#000000';
	const points: JPoint[] = route.map((elem: IWaterRoutePoint) => elem.vertex.point)
	// console.log(route.map((elem: IWaterRoutePoint) => elem.vertex.point))
	dmr.draw(points, {
		fillColor: 'none',
		strokeColor: color
	})
})
dmr.saveDrawFile(`${AREA}roads.png`)

dmr.clear();
dmr.drawCellMap(world.secondaryDiagram, JCellToDrawEntryFunctions.heighLand(1));
rm._rivers.forEach((river: JRiver, key: number) => {
	// color = '#0000E1';
	color = chroma.random().hex();
	// console.log(river._vertices.map((elem: IWaterRoutePoint) => elem.vertex.point))
	const points: JPoint[] = river._vertices.map((elem: IWaterRoutePoint) => elem.vertex.point)
	dmr.draw(points, {
		fillColor: 'none',
		strokeColor: color
	})
})
dmr.saveDrawFile(`${AREA}rivers.png`)

// dmr.clear();
// colorScale = chroma.scale('Spectral').domain([1000, 0]);
// rv._fluxMap.forEach((flux: number, key: string) => {
// 	color = colorScale(flux).hex();
// 	const point: JPoint = world.diagram.vertices2.get(key)!.point;
// 	dmr.drawDot(point, {
// 		fillColor: color,
// 		strokeColor: color
// 	}, 0.25)
// })
// dmr.saveDrawFile(`fluxVertex.png`)


const infoPrint: {v: JVertex, cs: number[]}[] = [];
world.secondaryDiagram.forEachVertex((vertex: JVertex) => {
	if (Math.random() < 1.1) {
		const cellIds = vertex.cellIds;
		const cells: JCell[] = [];
		cellIds.forEach((i: number) => {
			cells.push(world.diagram.cells.get(i)!)
		})
		infoPrint.push({
			v: vertex, cs: cellIds//cells
		})
	}
})

// fs.writeFileSync(__dirname + '/../prueba.txt', JSON.stringify(infoPrint, null, 2));
console.log('vertex cant', world.secondaryDiagram.vertices2.size)

dm.clear();
dm.drawCellMap(world.diagram, ((cell: JCell) => {return {
	fillColor: chroma.random().hex(),
	strokeColor: '#001410'
}}))
dm.saveDrawFile('diagram.png')

dm.clear()
dm.drawCellMap(world.secondaryDiagram, ((cell: JCell) => {return {
	fillColor: chroma.random().hex(),
	strokeColor: '#001410'
}}))
dm.saveDrawFile(`${AREA}secDiagram.png`)

const eqcell = world.diagram.getCellFromPoint(new JPoint(11,0));
const pocell = world.diagram.getCellFromPoint(new JPoint(11,85));

console.log('eq', eqcell.subCells.length)
console.log('po', pocell.subCells.length)

console.timeEnd('all')