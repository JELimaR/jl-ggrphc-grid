
export interface AzgaarFullData {
    info:      Info;
    settings:  Settings;
    coords:    Coords;
    cells:     Cells;
    biomes:    Biomes;
    notes:     Note[];
    nameBases: NameBasis[];
}

export interface Biomes {
    i:            number[];
    name:         string[];
    color:        string[];
    biomesMartix: { [key: string]: number }[];
    habitability: number[];
    iconsDensity: number[];
    icons:        Array<string[]>;
    cost:         number[];
    cells:        number[];
    area:         number[];
    rural:        number[];
    urban:        number[];
}

export interface Cells {
    cells:     Cell[];
    features:  Array<FeatureClass | number>;
    cultures:  Culture[];
    burgs:     Burg[];
    states:    State[];
    provinces: number[];
    religions: Religion[];
    rivers:    River[];
    markers:   Marker[];
}

export interface Burg {
}

export interface Cell {
    i:         number;
    v:         number[];
    c:         number[];
    p:         number[];
    g:         number;
    h:         number;
    area:      number;
    f:         number;
    t:         number;
    haven:     number;
    harbor:    number;
    fl:        number;
    r:         number;
    conf:      number;
    biome:     number;
    s:         number;
    pop:       number;
    culture:   number;
    burg:      number;
    road:      number;
    crossroad: number;
    state:     number;
    religion:  number;
    province:  number;
}

export interface Culture {
    name:          string;
    i:             number;
    base:          number;
    origin:        number | null;
    shield:        string;
    center?:       number;
    color?:        string;
    type?:         string;
    expansionism?: number;
    code?:         string;
}

export interface FeatureClass {
    i:            number;
    land:         boolean;
    border:       boolean;
    type:         string;
    cells:        number;
    firstCell:    number;
    group:        string;
    area?:        number;
    vertices?:    number[];
    shoreline?:   number[];
    height?:      number;
    flux?:        number;
    temp?:        number;
    evaporation?: number;
    inlets?:      number[];
    outlet?:      number;
    name?:        string;
}

export interface Marker {
    icon: string;
    type: string;
    dy?:  number;
    px?:  number;
    x:    number;
    y:    number;
    cell: number;
    i:    number;
}

export interface Religion {
    i:        number;
    name:     string;
    color?:   string;
    culture?: number;
    type?:    string;
    form?:    string;
    deity?:   string;
    center?:  number;
    origin?:  number;
    code?:    string;
}

export interface River {
    i:           number;
    source:      number;
    mouth:       number;
    discharge:   number;
    length:      number;
    width:       number;
    widthFactor: number;
    sourceWidth: number;
    parent:      number;
    cells:       number[];
    basin:       number;
    name:        string;
    type:        Type;
}

export enum Type {
    Fork = "Fork",
    River = "River",
}

export interface State {
    i:         number;
    name:      string;
    urban:     number;
    rural:     number;
    burgs:     number;
    area:      number;
    cells:     number;
    neighbors: any[];
    diplomacy: any[];
    provinces: any[];
}

export interface Coords {
    latT: number;
    latN: number;
    latS: number;
    lonT: number;
    lonW: number;
    lonE: number;
}

export interface Info {
    version:     string;
    description: string;
    exportedAt:  Date;
    mapName:     string;
    seed:        string;
    mapId:       number;
}

export interface NameBasis {
    name: string;
    i:    number;
    min:  number;
    max:  number;
    d:    string;
    m:    number;
    b:    string;
}

export interface Note {
    id:     string;
    name:   string;
    legend: string;
}

export interface Settings {
    distanceUnit:       string;
    distanceScale:      string;
    areaUnit:           string;
    heightUnit:         string;
    heightExponent:     string;
    temperatureScale:   string;
    barSize:            string;
    barLabel:           string;
    barBackOpacity:     string;
    barBackColor:       string;
    barPosX:            string;
    barPosY:            string;
    populationRate:     number;
    urbanization:       number;
    mapSize:            string;
    latitudeO:          string;
    temperatureEquator: string;
    temperaturePole:    string;
    prec:               string;
    options:            Options;
    mapName:            string;
    hideLabels:         boolean;
    stylePreset:        string;
    rescaleLabels:      boolean;
    urbanDensity:       number;
}

export interface Options {
    pinNotes:        boolean;
    showMFCGMap:     boolean;
    winds:           number[];
    stateLabelsMode: string;
    year:            number;
    era:             string;
    eraShort:        string;
    military:        Military[];
}

export interface Military {
    icon:     string;
    name:     string;
    rural:    number;
    urban:    number;
    crew:     number;
    power:    number;
    type:     string;
    separate: number;
}
