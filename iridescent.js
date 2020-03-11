(function () {
    "use strict";

    const exports = {};

    //=========================================================================
    // Constants
    //=========================================================================

    // Formats
    const RGB_REGEXP = /rgb\(\d{1,3},\d{1,3},\d{1,3}\)/;
    const RGBA_REGEXP = /rgba\(\d{1,3},\d{1,3},\d{1,3}\,\d(\.\d{0,9})?\)/;
    const LONG_HEX_REGEXP = /[#]?[0-9a-f]{6}/i;
    const SHORT_HEX_REGEXP = /[#]?[0-9a-f]{3}/i;
    // Color names
    const RED_REGEXP = /r|red/i;
    const GREEN_REGEXP = /g|green/i;
    const BLUE_REGEXP = /b|blue/i;
    // Rainbow color values
    const RAINBOW_COLORS = [
        [255, 0, 0],
        [255, 255, 0],
        [0, 255, 0],
        [0, 255, 255],
        [0, 0, 255],
        [255, 0, 255],
        [255, 0, 0],
    ];

    //=========================================================================
    // Helpers
    //=========================================================================

    function toHex(int) {
        if (typeof int === 'string') {
            return int.padStart(2, '0');
        }
        return int.toString(16).padStart(2, '0');
    }

    function toInt(hex) {
        if (typeof hex === 'number') {
            return parseInt(hex, 10);
        }
        return parseInt(hex, 16);
    }

    /**
     * Class color
     * @class
     */
    class Color {
        /**
         * The actual setting of the value is done in another function: @see __setValue
         * @constructor
         * @param  {...*} args
         */
        constructor(...args) {
            this.__setValue(...args);
        }

        //=====================================================================
        // Properties
        //=====================================================================

        get r() { return this._r; }
        set r(r) { this.__setBand('_r', r); }
        get red() { return this._r; }
        set red(r) { this.__setBand('_r', r); }

        get g() { return this._g; }
        set g(g) { this.__setBand('_g', g); }
        get green() { return this._g; }
        set green(g) { this.__setBand('_g', g); }

        get b() { return this._b; }
        set b(b) { this.__setBand('_b', b); }
        get blue() { return this._b; }
        set blue(b) { this.__setBand('_b', b); }

        get array() { return this.toArray(); }
        get css() { return this.toCSS(); }
        get hex() { return this.toHex(); }
        get int() { return this.toInt(); }
        get rgb() { return this.toRGB(); }
        get rgba() { return this.toRGBA(); }
        get string() { return this.toString(); }

        get complementary() {
            return new this.constructor(255 - this._r, 255 - this._g, 255 - this._b);
        }

        //=====================================================================
        // Methods
        //=====================================================================

        /**
         * @public
         * @returns {Color}
         */
        clone() {
            return new this.constructor(this._r, this._g, this._b);
        }

        /**
         * @public
         * @param {...*} comparisonTarget
         * @returns {Boolean}
         */
        compare(...comparisonTarget) {
            const color = new this.constructor(...comparisonTarget);
            return (
                this._r === color.r &&
                this._g === color.g &&
                this._b === color.b
            );
        }

        /**
         * @public
         * @param {...*} mixTarget
         * @returns {Color}
         */
        mix(...mixTarget) {
            const color = new this.constructor(...mixTarget);
            const r = (this._r + color.r) / 2;
            const g = (this._g + color.g) / 2;
            const b = (this._b + color.b) / 2;
            return new this.constructor(r, g, b);
        }

        /**
         * @public
         * @param {Color} color
         * @param {Number} amount
         * @returns {Color[]}
         */
        range(color, amount) {
            color = new Color(color);
            amount -= 1;
            const colors = [];
            const steps = [
                (color.r - this._r) / amount,
                (color.g - this._g) / amount,
                (color.b - this._b) / amount,
            ];
            for (let i = 0; i <= amount; i++) {
                colors.push(new Color(
                    this._r + (steps[0]) * i,
                    this._g + (steps[1]) * i,
                    this._b + (steps[2]) * i,
                ));
            }
            return colors;
        }

        /**
         * @public
         * @returns {Number[]}
         */
        toArray() {
            return [this._r, this._g, this._b];
        }

        /**
         * @public
         * @returns {String}
         */
        toCSS() {
            return 'color: rgb(' + [this._r, this._g, this._b].join(", ") + ');';
        }

        /**
         * @public
         * @returns {String}
         */
        toHex() {
            return '#' + toHex(this._r) + toHex(this._g) + toHex(this._b);
        }

        /**
         * @public
         * @returns {Number}
         */
        toInt() {
            return toInt(toHex(this._r) + toHex(this._g) + toHex(this._b));
        }

        /**
         * @public
         * @returns {String}
         */
        toRGB() {
            return 'rgb(' + [this._r, this._g, this._b].join(", ") + ')';
        }

        /**
         * @public
         * @returns {String}
         */
        toRGBA() {
            return 'rgba(' + [this._r, this._g, this._b, 1].join(", ") + ')';
        }

        /**
         * @public
         * @returns {String}
         */
        toString() {
            return "{r:" + this._r + ",g:" + this._g + ",b:" + this._b + "}";
        }

        //=====================================================================
        // Private
        //=====================================================================

        /**
         * @private
         * @param {String} band
         * @param {Object} value
         */
        __setBand(band, value) {
            this[band] = Math.max(Math.min(Math.round(value), 255), 0);
        }

        /**
         * @private
         * @param {...*} args
         */
        __setValue(...args) {
            let rgb = [0, 0, 0];
            if (args.length === 1) {
                let rawValue = args[0];
                if (typeof rawValue === 'string') {
                    try {
                        // Might be a stringified value
                        rawValue = JSON.parse(rawValue);
                    } catch (err) { }
                }
                if (rawValue instanceof this.constructor) {
                    // Value as Color object
                    rgb = [rawValue.r, rawValue.g, rawValue.b];
                } else if (Array.isArray(rawValue)) {
                    // Value as array
                    rgb = rawValue.map(toInt);
                } else if (typeof rawValue === 'string') {
                    rawValue = rawValue.replace(/\s/g, '');
                    if (RGB_REGEXP.test(rawValue)) {
                        // RGB notation
                        rgb = rawValue.slice(4, -1).split(',');
                    } else if (RGBA_REGEXP.test(rawValue)) {
                        // RGB notation with alpha
                        rgb = rawValue.slice(5).split(',').slice(0, -1);
                    } else if (LONG_HEX_REGEXP.test(rawValue)) {
                        // Full hexadecimal notation
                        rgb[0] = toInt(rawValue.slice(1, 3));
                        rgb[1] = toInt(rawValue.slice(3, 5));
                        rgb[2] = toInt(rawValue.slice(5, 7));
                    } else if (SHORT_HEX_REGEXP.test(rawValue)) {
                        // Shorthand hexadecimal notation
                        rgb = rawValue.slice(1).split('').map(band => toInt(band + band));
                    } else {
                        // Shitty method: let HTML decide the color from its name
                        const node = document.createElement('div');
                        node.style.color = rawValue;
                        document.body.appendChild(node);
                        const color = window.getComputedStyle(node).color;
                        node.remove();
                        return this.__setValue(color);
                    }
                } else if (typeof rawValue === 'object') {
                    // Value as object
                    for (const key in rawValue) {
                        if (RED_REGEXP.test(key)) rgb[0] = rawValue[key];
                        else if (GREEN_REGEXP.test(key)) rgb[1] = rawValue[key];
                        else if (BLUE_REGEXP.test(key)) rgb[2] = rawValue[key];
                    }
                }
            } else if (args.length === 3) {
                rgb = args.map(toInt);
            } else if (args.length) {
                throw new Error(`Expected 1 or 3 arguments, got ${args.length}.`);
            }
            if (rgb.length !== 3) {
                throw new Error(`Incorrect amount of values given to new Color(): expected 3 and got ${rgb.length}.`);
            }

            this.__setBand('_r', rgb[0]);
            this.__setBand('_g', rgb[1]);
            this.__setBand('_b', rgb[2]);
        }

        //=====================================================================
        // Static
        //=====================================================================

        /**
         * @static
         * @param {...*} args
         * @returns {Color}
         */
        static create(...args) {
            return new this(...args);
        }

        /**
         * @static
         * @param {Number} [amount=6]
         * @returns {Color[]}
         */
        static rainbow(amount = 6) {
            const rainbowColors = [];
            const step = (RAINBOW_COLORS.length - 1) / amount;
            for (let i = 0; i < amount; i++) {
                const mult = step * i;
                const startIndex = Math.floor(mult);
                const [source, target] = RAINBOW_COLORS.slice(startIndex, startIndex + 2);
                const color = source.map(
                    (band, c) => band + (target[c] - band) * (mult % 1)
                );
                rainbowColors.push(new Color(color));
            }
            return rainbowColors;
        }

        /**
         * @static
         * @returns {Color}
         */
        static random() {
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);
            return new this(r, g, b);
        }
    }

    //=========================================================================
    // Exports
    //=========================================================================

    exports.Color = Color;

    window.top.iridescent = exports;
})();
