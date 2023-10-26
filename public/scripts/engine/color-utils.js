export class Color {
    /**
     * @param {Number} r
     * @param {Number} g
     * @param {Number} b
     * @param {Number} a
     */
    constructor(r = 0.0, g = 0.0, b = 0.0, a = 1.0) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    /**
     * @return {Float32Array}
     */
    asVector() {
        return new Float32Array([this.r, this.g, this.b, this.a]);
    }
}

/**
 * Конвертирует HEX-представление цвета в цвет.
 * @param {string} hex
 * @return {Color}
 */
export function hexToColor(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return new Color(parseInt(result[1], 16) / 255.0, parseInt(result[2], 16) / 255.0, parseInt(result[3], 16) / 255.0);
}

/**
 * Конвертирует канал цвета в его HEX-представление.
 * @param {Number} c
 * @return {string}
 */
export function componentToHex(c) {
    let hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

/**
 * Конвертирует цвет в его HEX-представление.
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @return {string}
 */
export function colorToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
