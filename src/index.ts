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
import JPressureGrid, { PressureData } from './heightmap/JPressureGrid'
import * as JTempFunctions from './Climate/JTempFunctions';

import * as turf from '@turf/turf';


import fs from 'fs';
import Jimp from 'jimp';
import GeoCoordGrid from './Geom/GeoCoordGrid';
import Coord from './Geom/Coord';
import HeightGridData from './heightmap/HeightGridData';
import AzgaarReaderData from './AzgaarData/AzgaarReaderData';
import { applyCoriolis, calcCoriolisForce, calcFieldInPoint } from './Climate/JPressureFieldFunctions';
import { IMovementState, calcMovementState } from "./Geom/Movement";

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
const folderSelected: string = azgaarFolder[9];

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
const GRAN: number = 2//0.5;
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
	return `${idx + 1} - ${cell.info.tempMonthArr[idx]} - ${cell.center.x},${cell.center.y}`
}))
console.log('tmin', tempMin.map((cell: JCell, idx) => {
	return `${idx + 1} - ${cell.info.tempMonthArr[idx]} - ${cell.center.x},${cell.center.y}`
}))

let tempGrid = new JClimateGrid(world.grid);
console.log(tempGrid.getPressureCenters(2).pressCenter.length)
const tempStep = 5;
const monthArr = [1, 2];

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
	tempGrid.getPolarLinePoints(month, 's').concat(tempGrid.getPolarLinePoints(month, 'n'))
		.forEach((gp: JGridPoint) => {
			color = '#00000F65'
			dm2.drawDot(gp._point, {
				strokeColor: color, fillColor: color
			}, GRAN / 2)
		})
	dm2.drawMeridianAndParallels();
	dm2.saveDrawFile(`tempGrid${(month < 10 ? `0${month}` : `${month}`)}.png`);
}

/*******************************************/

/****************************************************/


// grid
// nuevo
const month = 1;

const pressGrid = new JPressureGrid(world.grid, tempGrid);
let mmm = pressGrid.getMaxMedMin(month - 1);
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
colorScale = chroma.scale('Spectral').domain([mmm.max, mmm.min]);
for (let i of monthArr) {
	dm2.clear()
	dm2.drawFondo()
	const month: number = i;

	world.grid._points.forEach((col: JGridPoint[], cidx: number) => {
		col.forEach((gp: JGridPoint, ridx: number) => {
			let val = pressGrid.getPointInfo(gp._point).pots[month - 1];
			// let val = pressGrid.getPointInfo(gp._point).vecs[month - 1].y * 10;
			/*
			if (val < mmm.min * 0.75) color = '#F11313';
			else if (val > mmm.max * 0.5) color = '#F0F0F0';
			else {
				//val = Math.round(val*tempStep)/tempStep;
				color = colorScale(val).hex();
			}
			*/
			color = colorScale(val).hex();
			dm2.drawDot(gp._point, {
				strokeColor: color, fillColor: color
			}, GRAN)
		})
	})
	dm2.drawMeridianAndParallels();
	dm2.saveDrawFile(`pressGrid${(month < 10 ? `0${month}` : `${month}`)}.png`);
}

/*******************************************/

dm2.clear()
// dm2.drawFondo()

tempGrid.getPressureCenters(month).pressCenter.forEach((val: any) => {
	color = (val.mag < 0) ? '#00FF0020' : '#FF000020';
	dm2.drawDot(val.point, {
		strokeColor: color, fillColor: color
	}, GRAN)
})

let currPos: JPoint;
let currVel: JPoint;
interface IWindRoute {
	point: JPoint,
	precipOut: number,
	evapOut: number,
	accOut: number,
}
let route: IWindRoute[];

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

const sat: number = 60000;
const TOTALPRECIPMAX = 400000;
const MASS = 1;
const time = .05;
const roz = 0.7;
const MAXEVAP = 10;
const MAXRAIN = 10;

// crear una funcion combinada qu devuelva: acc, evapTotal, precipTotal
const calcMoistureValuseIter = (nextHeight: number, pressValue: number, acc: number, temp: number, isLand: boolean): {
	precipOut: number,
	evapOut: number,
	accOut: number,
} => {
	let precipOut: number = 0;
	let evapOut: number = 0;
	let accOut: number = 0;
	const tempMin = -10;

	// pressValue
	let pval: number = 0;
	pval = /*(pressValue > 0 ? 0.3 : .3) **/ (-pressValue + mmm.max * 1.1) / (mmm.max - mmm.min) ** 1;

	// nextHeight
	if (nextHeight >= 0.8) {
		precipOut = (nextHeight) ** 0.25 * acc * pval;
	} else if (nextHeight >= 0.2) {
		let exponent = (nextHeight < 0.5)
			? 3 : ((nextHeight < 0.7) ? 2 : 0.5);
		//exponent = 0.5;
		precipOut = (nextHeight) ** exponent * acc * pval;

		if (temp - tempMin > 0) {
			evapOut = ((temp - tempMin) / (35 - tempMin)) * (precipOut + MAXRAIN * pval * 0.15);
		}
	} else {
		precipOut = (/*nextHeight*/0.1) ** 3 * acc * pval;
		evapOut = ((temp - tempMin) / (35 - tempMin)) * (MAXEVAP + MAXRAIN * pval * 0.25);
	}

	if (precipOut > MAXRAIN) precipOut = MAXRAIN;
	if (evapOut > MAXEVAP) evapOut = MAXEVAP;
	accOut = (nextHeight >= 0.8) ? 0 : acc + evapOut - precipOut;
	if (accOut > sat) accOut = sat;
	if (accOut < 0) accOut = 0;


	return {
		precipOut,
		evapOut,
		accOut,
	}
}

const windSimIteration = (
	initPoint: JPoint,
	month: number,
	dataPrecip: { value: number, cant: number }[][],
	route: IWindRoute[]): {
		dataPrecip: { value: number, cant: number }[][],
		route: IWindRoute[]
	} => {
	route = [];
	let currPos = initPoint;
	let currVel = new JPoint(0, 0);
	let acc = 0;

	let gpprev: JGridPoint | undefined,  gpnew: JGridPoint | undefined;

	let cont: number = 0;
	let it: number = 0;
	for (it = 0; it < 50000 && cont < 100; it++) {
		if (pressGrid.isCloseLowPressure(currPos, month)) cont++;
		if ((!!gpprev && !!gpnew && gpprev === gpnew)) cont += 0.005;

		gpprev = pressGrid._grid.getGridPoint(currPos);
		gpprev._cell.mark();

		// calc force
		let pd: PressureData = pressGrid.getPointInfo(currPos);
		let vec: JPoint = pd.vecs[month - 1];
		let cor: JPoint = /*new JPoint(0,0) //*/calcCoriolisForce({ pos: currPos, vel: currVel }, MASS);
		let netForce = vec.add(cor).sub(currVel.scale(roz));
		// new state
		const newState: IMovementState = calcMovementState({ pos: currPos, vel: currVel }, netForce, MASS, time);
		currPos = JPoint.pointToCoord(newState.pos);
		currVel = newState.vel;
		gpnew = world.grid.getGridPoint(currPos);
		// calc iter : evap and precip for currPos
		const {
			precipOut,
			evapOut,
			accOut,
		} = calcMoistureValuseIter(gpnew._cell.info.height, pd.pots[month - 1], acc, gpprev._cell.info.tempMonthArr[month - 1], gpprev._cell.info.isLand);
		acc = accOut;
		route.push({ point: currPos, accOut, evapOut, precipOut })

		// asignar
		dataPrecip[gpprev.colValue][gpprev.rowValue].value += Math.cos(gpprev._point.y * Math.PI / 180) * precipOut;
		dataPrecip[gpprev.colValue][gpprev.rowValue].cant++;
		// if (dataPrecip[gpprev.colValue][gpprev.rowValue].value > TOTALPRECIPMAX)
		// 	dataPrecip[gpprev.colValue][gpprev.rowValue].value = TOTALPRECIPMAX;
		world.grid.getGridPointsInWindowGrade(currPos, GRAN).forEach((gpn: JGridPoint) => {
			dataPrecip[gpn.colValue][gpn.rowValue].value += Math.cos(gpprev!._point.y * Math.PI / 180) * precipOut * 0.85;
			dataPrecip[gpn.colValue][gpn.rowValue].cant++;
			// if (dataPrecip[gpn.colValue][gpn.rowValue].value > TOTALPRECIPMAX)
			// 	dataPrecip[gpn.colValue][gpn.rowValue].value = TOTALPRECIPMAX;
		})
	}

	return {
		dataPrecip,
		route
	}

}

colorScale = chroma.scale('Spectral').domain([1, 0]);
let dataPrecip: { value: number, cant: number }[][] = [];
world.grid._points.forEach((col: JGridPoint[], cidx: number) => {
	dataPrecip[cidx] = [];
	col.forEach((gp: JGridPoint, ridx: number) => {
		dataPrecip[cidx][ridx] = { value: 0, cant: 0 };
	})
})

console.log(mmm)

world.grid.forEachPoint((gp: JGridPoint) => {
	gp._cell.dismark();
})
let sortedList: JGridPoint[] = pressGrid.getPointsSorted(month);
while (sortedList.length > 0) {
	if (sortedList.length % 1000 == 0) console.log('faltan:', sortedList.length)
	const gp: JGridPoint = sortedList.shift() as JGridPoint;
	if (gp._cell.isMarked()) continue
	// console.log(gp._cell.id)
	route = [];
	currPos = new JPoint(gp._point.x, gp._point.y);
	// currVel = new JPoint(0, 0);
	// acc = 0;
	if (!(gp._point.y == 0 || Math.abs(gp._point.y) == 30 || Math.abs(gp._point.y) == 60 || Math.abs(gp._point.y) == 90)) {
		const wsOut = windSimIteration(currPos, month, dataPrecip, route);
		dataPrecip = wsOut.dataPrecip;
		route = wsOut.route;
	}
	
	// if (route.length > 0) console.log(route.length)
	if (gp.colValue % 6 == 0 && gp.rowValue % 6 == 0) {

		route.forEach((elem: { point: JPoint; precipOut: number; evapOut: number; accOut: number; }, index: number) => {
			color = colorScale(elem.evapOut / MAXEVAP).hex();
			dm2.drawDot(elem.point, {
				strokeColor: color,
				fillColor: color,
			}, GRAN / 8)
		})
	}
}

// world.grid._points.forEach((col: JGridPoint[], cidx: number) => {
// 	col.forEach((gp: JGridPoint, ridx: number) => {
// 		//if (true || (ridx == 3/GRAN && cidx == 180/GRAN)) {
// 		// HACER UNA FUNCION DE ESTA SECCION DE CODICO CON ENTRADAS CURR, ACC SALIDA ROUTE CON LOS RESPECTIVOS DATOS
// 		route = [];
// 		currPos = new JPoint(gp._point.x, gp._point.y);
// 		// currVel = new JPoint(0, 0);
// 		// acc = 0;
// 		if (!(gp._point.y == 0 || Math.abs(gp._point.y) == 30 || Math.abs(gp._point.y) == 60 || Math.abs(gp._point.y) == 90)) {
// 			windSimIteration(currPos, month, dataPrecip, route);
// 		}
// 		// color = '#F0F0F080'
// 		const colorChroma = chroma.random();

// 		// let cont: number = 0;
// 		// // const subGran = 1;
// 		// let it: number = 0;
// 		// for (it = 0; it < 50000 && cont < 100; it++) {
// 		// 	// mover este if más arriba
// 		// 	// if (gp._point.y == 0 || Math.abs(gp._point.y) == 30 || Math.abs(gp._point.y) == 60 || Math.abs(gp._point.y) == 90)
// 		// 		// continue;

// 		// 	// if (pressGrid.getPointInfo(currPos).pots[month - 1] < mmm.min * 0.85) cont++
// 		// 	if (pressGrid.isCloseLowPressure(currPos, month)) cont++;
// 		// 	//else cont = 0;

// 		// 	const gpprev: JGridPoint = world.grid.getGridPoint(currPos);

// 		// 	let pd: PressureData = pressGrid.getPointInfo(currPos);
// 		// 	let vec: JPoint = pd.vecs[month - 1];
// 		// 	let cor: JPoint = /*new JPoint(0,0) //*/calcCoriolisForce({ pos: currPos, vel: currVel }, MASS);
// 		// 	let netForce = vec.add(cor).sub(currVel.scale(roz));

// 		// 	const newState: IMovementState = calcMovementState({ pos: currPos, vel: currVel }, netForce, MASS, time);

// 		// 	//vec = applyCoriolis(currPos, vec, tempGrid);
// 		// 	//vec = vec.scale(1/vec.mod/subGran);

// 		// 	//currPos = JPoint.pointToCoord(currPos.add(vec));
// 		// 	currPos = JPoint.pointToCoord(newState.pos);
// 		// 	currVel = newState.vel;
// 		// 	if (Math.abs(currPos.y) > 90) console.log(currPos)
// 		// 	const gpnew: JGridPoint = world.grid.getGridPoint(currPos);


// 		// 	// const precip = calcPrecip(gpnew._cell.info.height, pd.pots[month - 1], acc);

// 		// 	// // let pval: number = 0.05 * (-pd.pots[month-1]+mmm.max)/(mmm.max-mmm.min) ** 0.99;
// 		// 	// const totalPrecip = precip * acc// + pval;

// 		// 	// const evap = calcEvap(gpprev._cell.info.tempMonthArr[month - 1], precip, gpprev._cell.info.isLand);
// 		// 	// const totalEvap = Math.cos(gpprev._point.y * Math.PI / 180) * evap * MAXEVAP;

// 		// 	// acc = acc + totalEvap - totalPrecip;

// 		// 	const {
// 		// 		precipOut,
// 		// 		evapOut,
// 		// 		accOut,
// 		// 	} = calcMoistureValuseIter(gpnew._cell.info.height, pd.pots[month - 1], acc, gpprev._cell.info.tempMonthArr[month - 1], gpprev._cell.info.isLand)
// 		// 	acc = accOut;
// 		// 	route.push({ point: currPos, accOut, evapOut, precipOut })

// 		// 	// asignar
// 		// 	dataPrecip[gpprev.colValue][gpprev.rowValue].value += Math.cos(gpprev._point.y * Math.PI / 180) * precipOut;
// 		// 	dataPrecip[gpprev.colValue][gpprev.rowValue].cant++;
// 		// 	// if (dataPrecip[gpprev.colValue][gpprev.rowValue].value > TOTALPRECIPMAX)
// 		// 	// 	dataPrecip[gpprev.colValue][gpprev.rowValue].value = TOTALPRECIPMAX;
// 		// 	world.grid.getGridPointsInWindowGrade(currPos, GRAN).forEach((gpn: JGridPoint) => {
// 		// 		dataPrecip[gpn.colValue][gpn.rowValue].value += Math.cos(gpprev._point.y * Math.PI / 180) * precipOut * 0.75;
// 		// 		dataPrecip[gpn.colValue][gpn.rowValue].cant++;
// 		// 		// if (dataPrecip[gpn.colValue][gpn.rowValue].value > TOTALPRECIPMAX)
// 		// 		// 	dataPrecip[gpn.colValue][gpn.rowValue].value = TOTALPRECIPMAX;
// 		// 	})

// 		// }
// 		if (cidx % 12 == 0 && ridx % 12 == 0) {
// 			route.forEach((elem: { point: JPoint; precipOut: number; evapOut: number; accOut: number; }, index: number) => {
// 				color = colorScale(elem.evapOut / MAXEVAP).hex();
// 				dm2.drawDot(elem.point, {
// 					strokeColor: color,
// 					fillColor: color,
// 				}, GRAN / 8)
// 			})
// 		}
// 	})
// 	if (cidx % 20 == 0) console.log('van:', cidx, ', de:', world.grid.colsNumber)
// })
world.grid.forEachPoint((gp: JGridPoint) => {
	gp._cell.dismark();
})
// dm2.drawMeridianAndParallels();
dm2.saveDrawFile(`tempWind.png`);

// moisture

dm2.clear();
let mmax: number = -Infinity;
world.grid._points.forEach((col: JGridPoint[], cidx: number) => {
	col.forEach((gp: JGridPoint, ridx: number) => {
		const prom = dataPrecip[cidx][ridx].value / dataPrecip[cidx][ridx].cant
		if (gp._cell.info.isLand) {
			if (mmax < prom) mmax = prom;
		}
	})
})

console.log(mmax)
colorScale = chroma.scale('Spectral').domain([mmax, 0]);
world.grid._points.forEach((col: JGridPoint[], cidx: number) => {
	col.forEach((gp: JGridPoint, ridx: number) => {
		let pd: number = pressGrid._pressureData[cidx][ridx]._pots[month - 1] - mmm.med;
		let temp: number = tempGrid._tempData[cidx][ridx].tempMonth[month - 1] + 15;
		if (pd < (mmm.min - mmm.med) * 0.5) pd = (mmm.min - mmm.med) * 0.5;
		if (pd > (mmm.max - mmm.med) * 0.5) pd = (mmm.max - mmm.med) * 0.5;
		const val = dataPrecip[cidx][ridx] //+ 0.25 * mmax * (-pd/(mmm.max-mmm.min) * 0.5 + 0.5 ) // * temp/50);

		const alpha = (gp._cell.info.isLand) ? 1 : 0.6;

		color = colorScale(val.value / val.cant).alpha(alpha).hex();

		dm2.drawDot(gp._point, {
			strokeColor: color,
			fillColor: color,
		}, GRAN)

		if (ridx % 5 == 0 && cidx % 5 == 0) {
			//console.log(cidx, ridx, val)
		}
	})
})

dm2.drawMeridianAndParallels();
dm2.saveDrawFile(`moisture.png`);

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

console.log('  2', pressGrid.getPointInfo(new JPoint(10, 2)))
console.log('-32', pressGrid.getPointInfo(new JPoint(14, -32)))
console.log(' 58', pressGrid.getPointInfo(new JPoint(12, 58)))
console.log('-58', pressGrid.getPointInfo(new JPoint(12, -58)))
console.log(' 88', pressGrid.getPointInfo(new JPoint(110, 88)))
console.log('-88', pressGrid.getPointInfo(new JPoint(110, -88)))

let gp: JGridPoint;
gp = world.grid.getGridPoint(new JPoint(15, 87));
console.log(gp.getPixelArea())
gp = world.grid.getGridPoint(new JPoint(15, 0));
console.log(gp.getPixelArea())

console.timeEnd('all')