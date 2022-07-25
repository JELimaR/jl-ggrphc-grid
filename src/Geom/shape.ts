import * as turf from '@turf/turf'
import RandomNumberGenerator from '../Geom/RandomNumberGenerator';
import JPoint from '../Geom/JPoint';


export const genUni = (center: JPoint, rad: number, m: number): JPoint[] => {

	const randf: () => number = RandomNumberGenerator.makeRandomFloat(center.x*center.y);

	let out: JPoint[] = [];
	let r: number = turf.lengthToDegrees(rad, 'kilometers');
	const initialAngle: number = randf()*2*Math.PI;
	
	for (let i=0;i<m;i++) {
		const ang = 2*Math.PI*i/m + initialAngle;
        const rr = r * (0.8+0.4*randf());
		const X = center.x + rr * Math.cos(ang);
		const Y = center.y + rr * Math.sin(ang);
		out.push(new JPoint(X,Y))
	}

	// out.push(out[0])

	return out;
}