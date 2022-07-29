export default interface IDrawEntry {
	fillColor: string | 'none';
	strokeColor: string | 'none';
	lineWidth?: number;
	dashPattern?: number[];
	drawType?: 'line' | 'polygon'
}