// -------------------- Unit Converter --------------------

/**
 * Utility for converting between units of measurement
 */
const unitConverter = {
  /**
   * Converts a value from one unit to another
   * @param {number} value - The value to convert
   * @param {string} fromUnit - The unit to convert from
   * @param {string} toUnit - The unit to convert to
   * @returns {number} The converted value
   * @throws {Error} If the conversion is not supported
   */
  convert(value, fromUnit, toUnit) {
    const conversions = {
      // Volume
      ml_to_cups: (ml) => ml / 236.588,
      cups_to_ml: (cups) => cups * 236.588,
      // Weight
      g_to_oz: (g) => g / 28.34952,
      oz_to_g: (oz) => oz * 28.34952,
      // Temperature
      c_to_f: (c) => (c * 9) / 5 + 32,
      f_to_c: (f) => ((f - 32) * 5) / 9,
    };

    const conversionKey = `${fromUnit}_to_${toUnit}`.toLowerCase();
    const conversion = conversions[conversionKey];

    if (!conversion) {
      throw new Error(
        `Conversion from ${fromUnit} to ${toUnit} is not supported`
      );
    }

    return conversion(value);
  },
};

export default unitConverter;
