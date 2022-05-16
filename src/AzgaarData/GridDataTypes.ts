export interface AzgaarGridData {
    info:      Info;
    gridCells: GridCells;
}

export interface GridCells {
    spacing:  number;
    cellsY:   number;
    cellsX:   number;
    points:   Array<number[]>;
    boundary: Array<number[]>;
}

export interface Info {
    version:     string;
    description: string;
    exportedAt:  Date;
    mapName:     string;
    seed:        string;
    mapId:       number;
}
