// -------------------- Type Definitions --------------------

/**
 * @typedef {Object} Duration
 * @property {number} value - The duration value
 * @property {string} unit - The unit of the duration
 */

/**
 * @typedef {Object} Temperature
 * @property {number} value - The temperature value
 * @property {string} unit - The unit of the temperature
 */

// -------------------- Measurement Utilities --------------------

/**
 * Creates a Duration object
 * @param {number} value - The duration value
 * @param {string} unit - The unit of the duration
 * @returns {Duration}
 */
const Duration = (value, unit) => ({ value, unit });

/**
 * Creates a Duration object in minutes
 * @param {number} value - The number of minutes
 * @returns {Duration}
 */
const minutes = (value) => Duration(value, 'minutes');

/**
 * Creates a Duration object in seconds
 * @param {number} value - The number of seconds
 * @returns {Duration}
 */
const seconds = (value) => Duration(value, 'seconds');

/**
 * Creates a Duration object in hours
 * @param {number} value - The number of hours
 * @returns {Duration}
 */
const hours = (value) => Duration(value, 'hours');

/**
 * Creates a Temperature object
 * @param {number} value - The temperature value
 * @param {string} unit - The unit of the temperature
 * @returns {Temperature}
 */
const Temperature = (value, unit) => ({ value, unit });

/**
 * Creates a Temperature object in Fahrenheit
 * @param {number} value - The temperature in Fahrenheit
 * @returns {Temperature}
 */
const fahrenheit = (value) => Temperature(value, 'F');

/**
 * Creates a Temperature object in Celsius
 * @param {number} value - The temperature in Celsius
 * @returns {Temperature}
 */
const celsius = (value) => Temperature(value, 'C');

/**
 * Creates a Temperature object in Gas Mark
 * @param {number} value - The Gas Mark value
 * @returns {Temperature}
 */
const gasMarkr = (value) => Temperature(value, 'Gas Mark');

export {
  Duration,
  minutes,
  seconds,
  hours,
  Temperature,
  fahrenheit,
  celsius,
  gasMarkr,
};
