import Hex from './hex';
import Hsl from './hsl';
import Rgb from './rgb';

/**@type {CanvasRenderingContext2D} */
const ctx = (<canvas></canvas>).getContext('2d');

export default class Color {
  rgb = new Rgb(0, 0, 0, 1);

  constructor(color) {
    const { canvas } = ctx;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    this.rgb = new Rgb(r, g, b, a / 255);
  }

  darken(ratio) {
    const hsl = new Hsl.fromRgb(this.rgb);
    hsl.l = Math.max(0, hsl.l - ratio);
    this.rgb = hsl.rgb;
    return this;
  }

  lighten(ratio) {
    const hsl = new Hsl.fromRgb(this.rgb);
    hsl.l = Math.min(1, hsl.l + ratio);
    this.rgb = hsl.rgb;
    return this;
  }

  get lightness() {
    const { r, g, b } = this;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    return (max + min) / 2;
  }

  /**
   * Get the luminance of the color
   * Returns a value between 0 and 1
   */
  get luminance() {
    const { r, g, b } = this;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  get hex() {
    return new Hex.fromRgb(this.rgb);
  }

  get hsl() {
    return Hsl.fromRgb(this.rgb);
  }
}