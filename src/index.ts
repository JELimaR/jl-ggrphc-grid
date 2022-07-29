console.time('all');
const newDate = new Date();
console.log(newDate.toLocaleTimeString());
const formatMemoryUsage = (data: number) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`

import * as JCellToDrawEntryFunctions from './Drawing/JCellToDrawEntryFunctions';
import * as JEdgeToDrawEntryFunctions from './Drawing/JEdgeToDrawEntryFunctions';
import CanvasDrawingMap from './Drawing/CanvasDrawingMap'

import Point from './Geom/Point';
import NaturalWorldMap from './NaturalWorldMap';
import RegionMap from './MapContainerElements/RegionMap';
import JCell from './Voronoi/JCell';
import JVertex from './Voronoi/JVertex';
import chroma from 'chroma-js';

import ShowWater from './toShow/toShowWater';
import ShowHeight from './toShow/toShowHeight';
import ShowClimate from './toShow/toShowClimate';
import LineMap from './MapContainerElements/LineMap';
import JEdge from './Voronoi/JEdge';
import ShowTest from './toShow/toShowTest';
import ShowerManager from './toShow/ShowerManager';
import IslandMap from './MapContainerElements/IslandMap';
import DrainageBasinMapGenerator from './GACServer/Flux/DrainageBasinMapGenerator';
import DrainageBasinMap from './MapContainerElements/DrainageBasinMap';
import folderConfig from './folderConfig';
import RandomNumberGenerator from './Geom/RandomNumberGenerator';
import JDiagram, { LoaderDiagram } from './Voronoi/JDiagram';
import VoronoiDiagramCreator from './GACServer/Voronoi/VoronoiDiagramCreator';
import InformationFilesManager from './DataFileLoadAndSave/InformationFilesManager';
import NaturalWorldMapCreator from './GACServer/NaturalWorldMapCreator';

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
const folderSelected: string = azgaarFolder[10];
console.log('folder:', folderSelected)

folderConfig(folderSelected);

let colorScale: chroma.Scale;
let color: string;

let dm: CanvasDrawingMap = new CanvasDrawingMap(SIZE, ``); // borrar, se usa el de stest
dm.setZoomValue(0);
dm.setCenterpan(new Point(0, 0));
// navigate
console.log('zoom: ', dm.zoomValue)
console.log('center: ', dm.getCenterPan())

console.log('draw buff');
console.log(dm.getPointsBuffDrawLimits());
console.log('center buff');
console.log(dm.getPointsBuffCenterLimits());

const AREA: number = 12100; // 810
const nwmc = new NaturalWorldMapCreator();
const naturalWorld: NaturalWorldMap = new NaturalWorldMap(AREA, nwmc);

const monthArrObj = {
	12: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
	6: [1, 3, 5, 7, 9, 11],
	4: [1, 4, 7, 10],
}
const monthCant: keyof typeof monthArrObj = 12;
/* SHOWERS */
const showerManager = new ShowerManager(naturalWorld, AREA, folderSelected);

const sh = showerManager.sh;
const sc = showerManager.sc;
const sw = showerManager.sw;

const stest = showerManager.st;

/**
 * height map
 */
// sh.drawHeight();
sh.drawIslands();
// sh.printMaxAndMinCellsHeight();

/**
 * climate map
 */
// for (let month of monthArrObj[monthCant]) {	sc.drawTempMonth(month); }
// sc.drawTempMedia()
// for (let month of monthArrObj[monthCant]) {	sc.drawPrecipMonth(month); }
// sc.drawPrecipMedia()

// sc.drawKoppen();
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

const isl = naturalWorld.islands[2];
const pzr = dm.getPanzoomForReg(isl);
dm.setZoomValue(pzr.zoom);
dm.setCenterpan(pzr.center);
dm.drawCellContainer(isl, JCellToDrawEntryFunctions.heighLand(1))
dm.drawMeridianAndParallels();
dm.saveDrawFile('asdfsad.png');

console.timeEnd('test')


console.timeEnd('all')