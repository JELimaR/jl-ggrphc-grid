
export interface ISaveInformation {
	subFolder: string[];
	file: string;
}
export type TypeInformationKey =
	| 'islands' | 'rivers' | 'fluxRoutes' // Container
	| 'cellHeight' | 'cellClimate' // cell info
	| 'vertexHeight' | 'vertexFlux' // vertex info
	| 'temperature' | 'precip' | 'pressure';; // grid info

export type TypeInformationObject = { [key in TypeInformationKey]: ISaveInformation } // sirve para crear una constante con todo

export const DATA_INFORMATION: TypeInformationObject = {
	cellHeight: {
		file: 'height',
		subFolder: ['CellsInfo'],
	},
	cellClimate: {
		file: 'climate',
		subFolder: ['CellsInfo'],
	},
	vertexHeight: {
		file: 'height',
		subFolder: ['VerticesInfo'],
	},
	vertexFlux: {
		file: 'flux',
		subFolder: ['VerticesInfo'],
	},
	islands: {
		file: 'islandsInfo',
		subFolder: []
	},
	rivers: {
		file: 'riversInfo',
		subFolder: ['RiverAndFlux']
	},
	fluxRoutes: {
		file: 'fluxRoutesInfo',
		subFolder: ['RiverAndFlux']
	},
	temperature: {
		file: 'temperature',
		subFolder: ['GridInfo'],
	},
	pressure: {
		file: 'pressure',
		subFolder: ['GridInfo'],
	},
	precip: {
		file: 'precip',
		subFolder: ['GridInfo'],
	}
}
