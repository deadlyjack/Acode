import Rgb from "./rgb";

export default class Hex {
	r = 0;
	g = 0;
	b = 0;
	a = 1;

	/**
	 * Hex color constructor
	 * @param {number} r Red value in hexadecimals
	 * @param {number} g Green value in hexadecimals
	 * @param {number} b Blue value in hexadecimals
	 * @param {number} a Alpha value between 0 and 1
	 */
	constructor(r, g, b, a = 1) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}

	/**
	 * Creates a Hex color from an RGB color
	 * @param {Rgb} rgb
	 */
	static fromRgb(rgb) {
		const { r, g, b, a } = rgb;
		return new Hex(r, g, b, a * 255);
	}

	/**
	 * Gets the color as a string
	 * @param {boolean} alpha Whether to include alpha
	 */
	toString(alpha) {
		let r = this.r.toString(16);
		let g = this.g.toString(16);
		let b = this.b.toString(16);
		let a = this.a.toString(16);

		if (r.length === 1) r = `0${r}`;
		if (g.length === 1) g = `0${g}`;
		if (b.length === 1) b = `0${b}`;
		if (a.length === 1) a = `0${a}`;

		const hex = () => `#${r}${g}${b}`.toUpperCase();
		const hexA = () => `#${r}${g}${b}${a}`.toUpperCase();

		if (alpha === undefined) {
			return this.a === 255 ? hex() : hexA();
		}

		return alpha ? hexA() : hex();
	}

	/**
	 * Gets the color as an RGB object
	 * @returns {Rgb}
	 */
	get rgb() {
		return new Rgb(this.r, this.g, this.b, this.a);
	}
}
