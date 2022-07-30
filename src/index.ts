console.time('all');
const newDate = new Date();
console.log(newDate.toLocaleTimeString());
const formatMemoryUsage = (data: number) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`

import path from 'path';

import * as JCellToDrawEntryFunctions from './Drawing/JCellToDrawEntryFunctions';
import * as JEdgeToDrawEntryFunctions from './Drawing/JEdgeToDrawEntryFunctions';
import CanvasDrawingMap from './CanvasDrawing/CanvasDrawingMap'

import Point from './Geom/Point';
import NaturalMap from './BuildingModel/NaturalMap';
import RegionMap from './BuildingModel/MapContainerElements/RegionMap';
import JCell from './BuildingModel/Voronoi/JCell';
import JVertex from './BuildingModel/Voronoi/JVertex';
import chroma from 'chroma-js';

import ShowWater from './toShow/toShowWater';
import ShowHeight from './toShow/toShowHeight';
import ShowClimate from './toShow/toShowClimate';
import LineMap from './BuildingModel/MapContainerElements/LineMap';
import JEdge from './BuildingModel/Voronoi/JEdge';
import ShowTest from './toShow/toShowTest';
import ShowerManager from './toShow/ShowerManager';
import IslandMap from './BuildingModel/MapContainerElements/IslandMap';
import DrainageBasinMapGenerator from './GeogServer/GACServer/GACFlux/DrainageBasinMapGenerator';
import DrainageBasinMap from './BuildingModel/MapContainerElements/DrainageBasinMap';
import folderConfig from './GeogServer/DataFileLoadAndSave/folderConfig';
import RandomNumberGenerator from './Geom/RandomNumberGenerator';
import JDiagram, { LoaderDiagram } from './BuildingModel/Voronoi/JDiagram';
import VoronoiDiagramCreator from './GeogServer/GACServer/GACVoronoi/VoronoiDiagramCreator';
import InformationFilesManager from './GeogServer/DataFileLoadAndSave/InformationFilesManager';
import NaturalMapCreatorServer from './GeogServer/GACServer/NaturalMapCreatorServer';
import RiverMap from './BuildingModel/MapContainerElements/RiverMap';

const tam: number = 3600;
let SIZE: Point = new Point(tam, tam / 2);

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
	'Mones10', // 10
	'Civaland1', // 11
	'Shauland30', // 12
	'Lenzkirch50', // 13
	'Migny90', // 14
	'Zia20', // 15
	'Deneia60', // 16
	'Ouvyia70', // 17
];
const folderSelected: string = azgaarFolder[4];
console.log('folder:', folderSelected)

const rootPath = path.resolve(path.dirname('') + '/');
console.log('root:', rootPath)
folderConfig(rootPath, folderSelected);

let colorScale: chroma.Scale;
let color: string;

let cdm: CanvasDrawingMap = new CanvasDrawingMap(SIZE, ``); // borrar, se usa el de stest
cdm.setZoomValue(0);
cdm.setCenterpan(new Point(0, 0));
// navigate
console.log('zoom: ', cdm.zoomValue)
console.log('center: ', cdm.getCenterPan())

console.log('draw buff');
console.log(cdm.getPointsBuffDrawLimits());
console.log('center buff');
console.log(cdm.getPointsBuffCenterLimits());

const AREA: number = 2100; // 810
const nwmc = new NaturalMapCreatorServer();
const naturalMap: NaturalMap = new NaturalMap(AREA, nwmc);

const monthArrObj = {
	12: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
	6: [1, 3, 5, 7, 9, 11],
	4: [1, 4, 7, 10],
}
const monthCant: keyof typeof monthArrObj = 12;
/* SHOWERS */
const showerManager = new ShowerManager(naturalMap, AREA, folderSelected);

const sh = showerManager.sh;
const sc = showerManager.sc;
const sw = showerManager.sw;

const stest = showerManager.st;

/**
 * height map
 */
// sh.drawHeight();
// sh.drawIslands();
sh.printMaxAndMinCellsHeight();

/**
 * climate map
 */
// for (let month of monthArrObj[monthCant]) {	sc.drawTempMonth(month); }
// sc.drawTempMedia()
// for (let month of monthArrObj[monthCant]) {	sc.drawPrecipMonth(month); }
// sc.drawPrecipMedia()

sc.drawKoppen();
// sc.printKoppenData();

/**
 * LIFE ZONES
 */
// sc.drawAltitudinalBelts();
// sc.drawHumidityProvinces();
sc.drawLifeZones();
// sc.printLifeZonesData();

/**
 * river map
 */
// sw.drawRivers('h');
// sw.drawWaterRoutes('#000000', 'l')
// sw.printRiverData();
// sw.printRiverDataLongers(3000);
// sw.printRiverDataShorters(15);

console.time('test');

const isl = naturalMap.islands[5];
const coast = isl.getLimitLines()[0];

const pzr = cdm.getPanzoomForReg(isl);
cdm.setZoomValue(pzr.zoom);
cdm.setCenterpan(pzr.center);
console.log('zoom: ', cdm.zoomValue)
console.log('center: ', cdm.getCenterPan());

cdm.drawBackground('#FFFFFF');
cdm.drawCellContainer(isl, JCellToDrawEntryFunctions.heighLand());
cdm.drawEdgeContainer(coast, JEdgeToDrawEntryFunctions.colors({strokeColor: chroma.random().hex(), fillColor: 'none'}))
naturalMap.rivers.forEach((river: RiverMap) => {
	cdm.drawEdgeContainer(river, JEdgeToDrawEntryFunctions.fluxMedia())
})
cdm.drawMeridianAndParallels();
cdm.saveDrawFile('asdfsad.png');

console.log('area:', isl.area.toLocaleString('de-DE'), 'km2');
console.log('cant cells:', isl.cells.size);
console.log('costa:', coast.length.toLocaleString('de-DE'), 'km');

console.timeEnd('test')


console.timeEnd('all')