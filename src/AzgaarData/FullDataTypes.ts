
export interface AzgaarFullData {
    info:      AzgaarInfo;
    settings:  AzgaarSettings;
    coords:    AzgaarCoords;
    cells:     AzgaarCells;
    biomes:    AzgaarBiomes;
    notes:     AzgaarNote[];
    nameBases: AzgaarNameBasis[];
}

export interface AzgaarBiomes {
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

export interface AzgaarCells {
    cells:     AzgaarCell[];
    features:  Array<AzgaarFeatureClass | number>;
    cultures:  AzgaarCulture[];
    burgs:     AzgaarBurg[];
    states:    AzgaarState[];
    provinces: number[];
    religions: AzgaarReligion[];
    rivers:    AzgaarRiver[];
    markers:   AzgaarMarker[];
}

export interface AzgaarBurg {
}

export interface AzgaarCell {
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

export interface AzgaarCulture {
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

export interface AzgaarFeatureClass {
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

export interface AzgaarMarker {
    icon: string;
    type: string;
    dy?:  number;
    px?:  number;
    x:    number;
    y:    number;
    cell: number;
    i:    number;
}

export interface AzgaarReligion {
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

export interface AzgaarRiver {
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
    type:        AzgaarRiverType;
}

export enum AzgaarRiverType {
    Fork = "Fork",
    River = "River",
}

export interface AzgaarState {
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

export interface AzgaarCoords {
    latT: number;
    latN: number;
    latS: number;
    lonT: number;
    lonW: number;
    lonE: number;
}

export interface AzgaarInfo {
    version:     string;
    description: string;
    exportedAt:  Date;
    mapName:     string;
    seed:        string;
    mapId:       number;
}

export interface AzgaarNameBasis {
    name: string;
    i:    number;
    min:  number;
    max:  number;
    d:    string;
    m:    number;
    b:    string;
}

export interface AzgaarNote {
    id:     string;
    name:   string;
    legend: string;
}

export interface AzgaarSettings {
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
    options:            AzgaarOptions;
    mapName:            string;
    hideLabels:         boolean;
    stylePreset:        string;
    rescaleLabels:      boolean;
    urbanDensity:       number;
}

export interface AzgaarOptions {
    pinNotes:        boolean;
    showMFCGMap:     boolean;
    winds:           number[];
    stateLabelsMode: string;
    year:            number;
    era:             string;
    eraShort:        string;
    military:        AzgaarMilitary[];
}

export interface AzgaarMilitary {
    icon:     string;
    name:     string;
    rural:    number;
    urban:    number;
    crew:     number;
    power:    number;
    type:     string;
    separate: number;
}
