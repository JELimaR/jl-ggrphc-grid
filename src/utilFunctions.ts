
export const getArrayOfN = (tam: number, value: number): number[] => {
	let out: number[] = [];
	for (let i = 0; i<tam; i++) out.push(value);
	return out;
}

export const inRange = (value: number, minimo: number, maximo: number): number => {
	let out = value;

	if (out > maximo) out = maximo;
	if (out < minimo) out = minimo;

	return out;
}