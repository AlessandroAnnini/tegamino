import { ActionType, StoveHeat, GrillCookingMethod } from './enums.js';

// -------------------- Recipe Step Class --------------------

/**
 * Represents a step in a recipe
 * @class
 */
class RecipeStep {
  /**
   * Creates a new RecipeStep
   */
  constructor() {
    this.actions = [];
    this.currentIngredients = [];
    this.currentContainer = null;
    this.threads = [];
    this.cues = [];
    this.adjustments = [];
    this.sensoryChecks = [];
  }

  /**
   * Adds ingredients to the current step
   * @param {Entity|Entity[]} ingredients - The ingredient(s) to add
   * @returns {RecipeStep}
   */
  add(ingredients) {
    this.currentIngredients = Array.isArray(ingredients)
      ? ingredients
      : [ingredients];
    return this;
  }

  /**
   * Specifies the container for the current ingredients
   * @param {Entity} container - The container to use
   * @returns {RecipeStep}
   */
  to(container) {
    this.currentIngredients.forEach((ingredient) => {
      this.actions.push({ type: ActionType.ADD, ingredient, container });
    });
    this.currentContainer = container;
    return this;
  }

  /**
   * Adds a mixing action to the step
   * @returns {RecipeStep}
   */
  mix() {
    this.actions.push({
      type: ActionType.MIX,
      container: this.currentContainer,
    });
    return this;
  }

  /**
   * Adds a heating action to the step
   * @param {Temperature|string} temperature - The temperature to heat to
   * @returns {RecipeStep}
   */
  heat(temperature) {
    if (typeof temperature === 'string') {
      temperature = StoveHeat[temperature.toUpperCase()] || temperature;
    }
    this.actions.push({
      type: ActionType.HEAT,
      container: this.currentContainer,
      temperature,
    });
    return this;
  }

  /**
   * Specifies the duration for the last action
   * @param {Duration} duration - The duration to set
   * @returns {RecipeStep}
   */
  for(duration) {
    const lastAction = this.actions[this.actions.length - 1];
    lastAction.duration = duration;
    return this;
  }

  /**
   * Adds a transfer action to the step
   * @param {Entity} toContainer - The container to transfer to
   * @returns {RecipeStep}
   */
  transfer(toContainer) {
    this.actions.push({
      type: ActionType.TRANSFER,
      from: this.currentContainer,
      to: toContainer,
    });
    this.currentContainer = toContainer;
    return this;
  }

  /**
   * Adds preparation techniques to the step
   * @param {...string} techniques - The preparation techniques to add
   * @returns {RecipeStep}
   */
  prepare(...techniques) {
    techniques.forEach((technique) => {
      this.actions.push({
        type: ActionType.PREPARE,
        technique,
        ingredient: this.currentIngredients[0],
      });
    });
    return this;
  }

  /**
   * Sets equipment settings for the step
   * @param {Entity} equipment - The equipment to set
   * @param {*} setting - The setting to apply
   * @returns {RecipeStep}
   */
  setEquipment(equipment, setting) {
    this.actions.push({
      type: ActionType.EQUIPMENT_SETTING,
      equipment,
      setting,
    });
    return this;
  }

  /**
   * Adds a rest period to the step
   * @param {Duration} duration - The duration of the rest period
   * @returns {RecipeStep}
   */
  rest(duration) {
    this.actions.push({ type: ActionType.REST, duration });
    return this;
  }

  /**
   * Adds a preheating action to the step
   * @param {Entity} appliance - The appliance to preheat
   * @param {Temperature} temperature - The temperature to preheat to
   * @returns {RecipeStep}
   */
  preheat(appliance, temperature) {
    this.actions.push({
      type: ActionType.PREHEAT,
      appliance,
      temperature,
    });
    return this;
  }

  /**
   * Sets up the grill for cooking
   * @param {Temperature} temperature - The grill temperature
   * @param {GrillCookingMethod} method - The grilling method
   * @returns {RecipeStep}
   */
  grillSetup(temperature, method) {
    this.actions.push({
      type: ActionType.EQUIPMENT_SETTING,
      equipment: 'grill',
      temperature,
      method,
    });
    return this;
  }

  /**
   * Specifies cooking to a target internal temperature
   * @param {Temperature} targetTemperature - The target internal temperature
   * @returns {RecipeStep}
   */
  cookToTemperature(targetTemperature) {
    this.actions.push({
      type: ActionType.HEAT,
      targetTemperature,
    });
    return this;
  }

  /**
   * Adds a parallel step to the recipe
   * @param {function(RecipeStep): void} callback - Function to define the parallel step
   * @returns {RecipeStep}
   */
  parallel(callback) {
    const parallelStep = new RecipeStep();
    callback(parallelStep);
    this.threads.push(parallelStep);
    return this;
  }

  /**
   * Specifies a condition for the last action
   * @param {string} condition - The condition to set
   * @returns {RecipeStep}
   */
  untilCondition(condition) {
    this.actions[this.actions.length - 1].condition = condition;
    return this;
  }

  /**
   * Adds a cue to the step
   * @param {Cue} cueType - The type of cue
   * @param {string} description - Description of the cue
   * @returns {RecipeStep}
   */
  untilCue(cueType, description) {
    this.cues.push({ type: cueType, description });
    return this;
  }

  /**
   * Adds an adjustment to the step
   * @param {string} condition - The condition for adjustment
   * @param {string} action - The adjustment action
   * @returns {RecipeStep}
   */
  adjust(condition, action) {
    this.adjustments.push({ condition, action });
    return this;
  }

  /**
   * Adds a sensory check to the step
   * @param {SensoryFeedback} feedbackType - The type of sensory feedback
   * @param {string} description - Description of the sensory check
   * @param {string} adjustment - The adjustment to make based on the check
   * @returns {RecipeStep}
   */
  checkSensory(feedbackType, description, adjustment) {
    this.sensoryChecks.push({ type: feedbackType, description, adjustment });
    return this;
  }

  /**
   * Gets all actions in the step
   * @returns {Object} An object containing all actions and related information
   */
  getActions() {
    return {
      mainThread: this.actions,
      parallelThreads: this.threads.map(
        (thread) => thread.getActions().mainThread
      ),
      adjustments: this.adjustments,
      sensoryChecks: this.sensoryChecks,
      cues: this.cues,
    };
  }

  /**
   * Converts the RecipeStep to a JSON-friendly object
   * @returns {Object} A JSON-friendly representation of the RecipeStep
   */
  toJSON() {
    return {
      actions: this.actions,
      threads: this.threads.map((thread) => thread.toJSON()),
      cues: this.cues,
      adjustments: this.adjustments,
      sensoryChecks: this.sensoryChecks,
    };
  }

  /**
   * Creates a RecipeStep from a JSON object
   * @param {Object} json - The JSON representation of a RecipeStep
   * @returns {RecipeStep} A new RecipeStep instance
   */
  static fromJSON(json) {
    const step = new RecipeStep();
    step.actions = json.actions;
    step.threads = json.threads.map(RecipeStep.fromJSON);
    step.cues = json.cues;
    step.adjustments = json.adjustments;
    step.sensoryChecks = json.sensoryChecks;
    return step;
  }
}

export default RecipeStep;
