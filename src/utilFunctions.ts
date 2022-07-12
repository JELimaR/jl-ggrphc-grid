
export const getArrayOfN = (tam: number, value: number): number[] => {
	let out: number[] = [];
	for (let i = 0; i<tam; i++) out.push(value);
	return out;
}