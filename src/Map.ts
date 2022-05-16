/*import OCanvas from './OCanvas'
import JPoint, { JVector } from './Geom/JPoint';
import VoronoiDiagramMapCreator from './Voronoi/VoronoiDiagramMapCreator';
import RandomNumberGenerator from './Geom/RandomNumberGenerator'
import VorDiagram from './Voronoi/VorDiagram';
import VorPolygon from './Voronoi/VorPolygon';
import IslandCenters from './CentersGenerator';
import { makeNoise2D } from 'fast-simplex-noise';

interface IVoronoiConstructorEntry {
	seed: number;
	rel: number;
	cant: number
}

export default class Map {
	static _SIZE: JVector = new JVector( {x: 3600, y: 1800} );

	private _diagram: VorDiagram;
	private _oc: OCanvas; // usar canvas distintos?
	// private _rndInt: (N: number) => number; // no es necesario
	// private _rnd: () => number;

	constructor(diag: VorDiagram, pathName: string) {
		
		this._diagram = diag;

		this._oc = new OCanvas(Map._SIZE);
		this._oc.saveDraw( pathName );
	}

	static createVoronoi(entry: IVoronoiConstructorEntry): VoronoiDiagramMapCreator {

		const vdc: VoronoiDiagramMapCreator = new VoronoiDiagramMapCreator(Map._SIZE, entry.seed, entry.cant);
		vdc.createDiagram( entry.rel );
		return vdc;
	}

	generateHeigh(otherSeed: number) {
		console.log('generating heighmap');
		const rnd = RandomNumberGenerator.makeRandomFloat(otherSeed);

		let centers: { indx: number, p: JPoint, r: number, h: number, addH: boolean}[] = IslandCenters(rnd);
		for (let c of centers) {
			// console.log(c.indx, c)
			let center: VorPolygon = this._diagram.getPolygonFromPoint( c.p );
			this.addIsland(
				RandomNumberGenerator.makeRandomFloat(otherSeed),
				center,
				c.r,
				c.h,
				c.addH,
			);
		}

		this.smoothHeight();
		this._diagram.setMaxHeight();
		this.setBorderHeigh();

	}

	private setBorderHeigh() {
		this._diagram.forEachPolygon((p: VorPolygon) => {
			if (p.isBorder) {
				p.height = 0;
				p.typeHeight = 'water';
				this._diagram.getNeighbors(p).forEach((n: VorPolygon) => {
					n.height = 0;
					n.typeHeight = 'water';
				})
			}
		})
		this.smoothHeight();
	}

	private smoothHeight() {
		this._diagram.forEachPolygon((p: VorPolygon) => {
			p.mark = true;
			let ht: number = 0;
			let ns: VorPolygon[] = this._diagram.getNeighbors(p)
			ns.forEach((n: VorPolygon) => {
				if (n.mark) {
					ht = ht + n.prevHeight;
				} else {
					ht = ht + n.height;
				}
			})
			p.height = (p.height+ht)/(ns.length+1);
		})
		this._diagram.forEachPolygon((p: VorPolygon) => {
			p.mark = false;
		})
	}

	private addIsland(rnd: ()=>number, polStart: VorPolygon, radio: number, peakH: number, addH: boolean): void {
		// decr per km
		const decr: number = Math.exp(Math.log(0.01)/radio);
		// qeue
		interface QItem {
			h: number;
			p: VorPolygon;
		}
		let qeue: QItem[] = [];
		qeue.push({h: peakH, p: polStart});
		polStart.mark = true;
		for (let i = 0; i<qeue.length; i++) {
			const {p: pol, h}: QItem = qeue[i];
			if (!(addH && (pol.typeHeight === 'water')))
				pol.height = h + pol.height;
			if (pol.height > 0.2) pol.typeHeight = 'land';
			if (h > 0.01) {
				this._diagram.getNeighbors(pol).forEach((n: VorPolygon) => {
					if (!n.mark) {
						const parentDis: number = JPoint.geogDistance( n.center, pol.center );
						const height: number = Math.pow(decr, parentDis) * h  * (rnd()*0.1+0.95);
						qeue.push({h: height, p: n});
						n.mark = true;
					}
				});
			}
		}
		for (let i = 0; i<qeue.length; i++) {
			qeue[i].p.mark = false;
		}
	}

	generateMoisture(): void {
		console.log('generating moisture');
		const borderPol: VorPolygon[] = this._diagram.getBorderPolygons();
		borderPol.sort( (a: VorPolygon, b: VorPolygon) => a.center.x - b.center.x)
		// borderPol.forEach((p: VorPolygon) => {
		// 	p.height=1;
		// 	p.typeHeight='land'
		// })
		let startPol: VorPolygon = borderPol[0];
		let nb: VorPolygon;
		const dir: JVector = new JVector({x: 1, y:0});
		startPol.height = 1;
		startPol.typeHeight = 'land';
		this._diagram.getNeighbors(startPol).forEach((n: VorPolygon)=>{
			if (!nb) {
				nb = n;
			} else {
				if ( JVector.angleDif(dir, new JVector( n.center, startPol.center )) <  JVector.angleDif(dir, new JVector( nb.center, startPol.center ))) {
					nb = n;
				}
			}
		})
		nb!.height = 1;
		nb!.typeHeight = 'land'
		startPol.mark = true;
	}

	drawLandmap(): void {
		this._diagram.drawL(this._oc.context)
	}

	drawHeighmap(drawHeighWater: boolean): void {
		this._diagram.drawH( this._oc.context, drawHeighWater );
	}

}
*/