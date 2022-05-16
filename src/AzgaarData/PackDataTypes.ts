export interface AzgaarPackData {
    info:  Info;
    cells: Cells;
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
    type:         FeatureType;
    cells:        number;
    firstCell:    number;
    group:        Group;
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

export enum Group {
    Freshwater = "freshwater",
    Island = "island",
    Isle = "isle",
    Ocean = "ocean",
}

export enum FeatureType {
    Island = "island",
    Lake = "lake",
    Ocean = "ocean",
}

export interface Marker {
    icon: string;
    type: string;
    dx?:  number;
    px?:  number;
    x:    number;
    y:    number;
    cell: number;
    i:    number;
    dy?:  number;
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
    type:        RiverType;
}

export enum RiverType {
    Branch = "Branch",
    Brook = "Brook",
    Creek = "Creek",
    Fork = "Fork",
    River = "River",
    Stream = "Stream",
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

export interface Info {
    version:     string;
    description: string;
    exportedAt:  Date;
    mapName:     string;
    seed:        string;
    mapId:       number;
}
