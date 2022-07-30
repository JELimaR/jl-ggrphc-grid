export default interface IDrawingParameters {
	fillColor: string | 'none';
	strokeColor: string | 'none';
	lineWidth?: number;
	dashPattern?: number[];
	drawType?: 'line' | 'polygon'
}