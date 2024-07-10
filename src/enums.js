import { Temperature } from './measurement.js';

// -------------------- Enums --------------------

/**
 * Enumeration of stove heat levels
 * @enum {Temperature}
 */
const StoveHeat = {
  LOW: Temperature(1, 'level'),
  MEDIUM_LOW: Temperature(2, 'level'),
  MEDIUM: Temperature(3, 'level'),
  MEDIUM_HIGH: Temperature(4, 'level'),
  HIGH: Temperature(5, 'level'),
};

/**
 * Enumeration of cues
 * @enum {string}
 */
const Cue = {
  COLOR: 'color',
  CONSISTENCY: 'consistency',
  SMELL: 'smell',
  TASTE: 'taste',
  TEXTURE: 'texture',
};

/**
 * Enumeration of sensory feedback types
 * @enum {string}
 */
const SensoryFeedback = Cue;

/**
 * Enumeration of action types in a recipe step
 * @enum {string}
 */
const ActionType = {
  ADD: 'add',
  MIX: 'mix',
  HEAT: 'heat',
  TRANSFER: 'transfer',
  PREPARE: 'prepare',
  REST: 'rest',
  EQUIPMENT_SETTING: 'equipmentSetting',
  PREHEAT: 'preheat',
};

/**
 * Enumeration of grill cooking methods
 * @enum {string}
 */
const GrillCookingMethod = {
  DIRECT: 'direct',
  INDIRECT: 'indirect',
};

/**
 * Enumeration of meat doneness levels with corresponding temperatures
 * @enum {Temperature}
 */
const MeatDoneness = {
  RARE: Temperature(125, 'F'),
  MEDIUM_RARE: Temperature(135, 'F'),
  MEDIUM: Temperature(145, 'F'),
  MEDIUM_WELL: Temperature(150, 'F'),
  WELL_DONE: Temperature(160, 'F'),
};

export {
  StoveHeat,
  Cue,
  SensoryFeedback,
  ActionType,
  GrillCookingMethod,
  MeatDoneness,
};
