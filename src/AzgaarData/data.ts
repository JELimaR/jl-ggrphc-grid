// cambiar nombre argchivo
/*
import * as JCellToDrawEntryFunctions from './JCellToDrawEntryFunctions';
import DrawerMap, { IDrawEntry } from './DrawerMap'
import JPoint, { JVector } from '../Geom/JPoint';
import JGrid, { JGridPoint } from './Geom/JGrid';
import JWorld from './JWorld';
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

import fs from 'fs';
import Jimp from 'jimp';
import GeoCoordGrid from './Geom/GeoCoordGrid';
import Coord from './Geom/Coord';
import HeightGridData from './heightmap/HeightGridData';
// azgaar data
const packData = JSON.parse(fs.readFileSync(__dirname + '/../azgaarData/Baria PackCells 2022-04-29-13-51.json').toString());

console.log('cells keys', Object.keys( packData.cells ))
console.log('cell item keys', Object.keys( packData.cells.cells[0] ))
console.log('cell items', packData.cells.cells.length )
console.log('feature item keys', Object.keys( packData.cells.features[1] ))
console.log()

const gridData = JSON.parse(fs.readFileSync(__dirname + '/../azgaarData/Baria GridCells 2022-04-29-13-51.json').toString());

console.log('gridcells', Object.keys(gridData.gridCells))
console.log('points',gridData.gridCells.points.length)

console.log()

const fullData = JSON.parse(fs.readFileSync(__dirname + '/../azgaarData/Baria Full 2022-04-29-14-38.json').toString());

console.log('full data', Object.keys(fullData))
console.log('cells', Object.keys(fullData.cells))
console.log('cells-cells', Object.keys(fullData.cells.cells[0]))
console.log('cells-cells number', fullData.cells.cells.length)
console.log('campo', fullData.cells.cells[0].i)


console.log(459)
const cell459 = fullData.cells.cells.find((c: any) => c.i === 459);
console.log(cell459)

const point459 = gridData.gridCells.points[cell459.g] // cell459.p
console.log(gridData.gridCells.points[cell459.g])

console.log([point459[0]/1920*360-180, -1 * (point459[1]/880*180-90)])


///
const colorScale: chroma.Scale = chroma.scale('Spectral').domain([100,0]);
fullData.cells.cells.forEach((cell: any) => {
	const point = cell.p;

	if (cell.h < 20) {
		let jp: JPoint = new JPoint(point[0]/1920*360-180, -1 * (point[1]/880*180-90));
	
		const color: string = colorScale(cell.h).hex();
	
		dm.drawDot(
			jp,
			{
				strokeColor: color,
				fillColor: color
			},
			4
		)
	}
})

dm.saveDrawFile('dibujo.png')
*/