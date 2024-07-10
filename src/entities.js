// -------------------- Type Definitions --------------------

/**
 * @typedef {Object} Entity
 * @property {string} type - The type of the entity
 * @property {string} name - The name of the entity
 */

// -------------------- Entity Creators --------------------

/**
 * Creates an entity with a specific type
 * @param {string} type - The type of the entity
 * @returns {function(string, Object): Entity} A function that creates an entity
 */
const createEntity =
  (type) =>
  (name, properties = {}) => ({ type, name, ...properties });

/**
 * Creates an Ingredient entity
 * @type {function(string, Object): Entity}
 */
const Ingredient = createEntity('ingredient');

/**
 * Creates a Container entity
 * @type {function(string, Object): Entity}
 */
const Container = createEntity('container');

/**
 * Creates a Tool entity
 * @type {function(string, Object): Entity}
 */
const Tool = createEntity('tool');

/**
 * Creates an Appliance entity
 * @type {function(string, Object): Entity}
 */
const Appliance = createEntity('appliance');

export { Ingredient, Container, Tool, Appliance };
