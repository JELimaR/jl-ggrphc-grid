import turf from "./turf";

export const polInArrReg = (pol: turf.Feature<turf.Polygon>, ArrReg: turf.Feature<turf.Polygon>[]): boolean => {
    let out: boolean = false;
    for (let i = 0; i < ArrReg.length && !out; i++) {
        const ints: turf.Feature<turf.Polygon>[] = intersectTurfPolygon(ArrReg[i], pol);
        out = 0.5 < areaArrReg(ints) / areaArrReg([pol]);
    }
    return out;
}

export const polContainInArrReg = (pol: turf.Feature<turf.Polygon>, ArrReg: turf.Feature<turf.Polygon>[]): boolean => {
    let out: boolean = false;
    for (let i = 0; i < ArrReg.length && !out; i++) {
        out = turf.booleanContains(ArrReg[i], pol);
    }
    return out;
}

export const pointInArrReg = (pos: turf.Position, ArrReg: turf.Feature<turf.Polygon>[]): boolean => {
    let out: boolean = false;
    for (let i = 0; i < ArrReg.length && !out; i++) {
        out = turf.booleanPointInPolygon(turf.point(pos), ArrReg[i]);
    }
    return out;
}

export const areaArrReg = (ArrReg: turf.Feature<turf.Polygon>[]): number => {
    let out: number = 0
    ArrReg.forEach((pol: turf.Feature<turf.Polygon>) => {
        out += turf.area(pol) / 1000000;
    });
    return out;
}

export const intersectTurfPolygon = (pol1: turf.Feature<turf.Polygon>, pol2: turf.Feature<turf.Polygon>): turf.Feature<turf.Polygon>[] => {
    let out: turf.Feature<turf.Polygon>[];
    let union = turf.intersect(pol1, pol2);

    if (union) {
        if (union.geometry.type === 'Polygon') {
            let pol = union as turf.Feature<turf.Polygon>;
            out = [pol];
        } else {
            let mpol = union as turf.Feature<turf.MultiPolygon>;
            out = turfMultiPolygonToPolygonArray(mpol)
        }
    } else {
        out = [];
    }
    return out;
}

export const unionTurfPolygon = (pol1: turf.Feature<turf.Polygon>, pol2: turf.Feature<turf.Polygon>): turf.Feature<turf.Polygon>[] => {
    let out: turf.Feature<turf.Polygon>[];
    let union = turf.union(pol1, pol2);

    if (union) {
        if (union.geometry.type === 'Polygon') {
            let pol = union as turf.Feature<turf.Polygon>;
            out = [pol];
        } else {
            let mpol = union as turf.Feature<turf.MultiPolygon>;
            out = turfMultiPolygonToPolygonArray(mpol)
        }
    } else {
        out = [];
    }
    return out;
}

const turfMultiPolygonToPolygonArray = (mpol: turf.Feature<turf.MultiPolygon>): turf.Feature<turf.Polygon>[] => {
    let out: turf.Feature<turf.Polygon>[] = [];
    turf.getCoords(mpol).forEach((coords) => {
        out.push(turf.polygon(coords))
    });
    return out;
}