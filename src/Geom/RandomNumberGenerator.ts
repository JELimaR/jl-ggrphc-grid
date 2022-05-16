
let A: Uint32Array = new Uint32Array(1);
export default class RandomNumberGenerator {

	static makeRandomInt(seed: number): (N: number) => number {
    	let i = 0;
		return (N: number): number => {
			i++;
			return hashInt(seed + i) % N;
		};
    };

	static makeRandomFloat = function(seed: number): () => number {
		let randInt = RandomNumberGenerator.makeRandomInt(seed);
		let divisor = 0x10000000;
		return (): number => {
			return randInt(divisor)/divisor;
		};
	};

}

function hashInt(x: number): number {
	A[0]  = x|0
	A[0] -= (A[0]<<6)
	A[0] ^= (A[0]>>>17)
	A[0] -= (A[0]<<9)
	A[0] ^= (A[0]<<4)
	A[0] -= (A[0]<<3)
	A[0] ^= (A[0]<<10)
	A[0] ^= (A[0]>>>15)
	return A[0]
}


