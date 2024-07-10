import crypto from 'node:crypto';
import { gzipSync, gunzipSync } from 'node:zlib';

import qrcode from 'qrcode-terminal';

import { ActionType } from './enums.js';

const _hashStep = Symbol('hashStep');
const _hashAttribute = Symbol('hashAttribute');

// -------------------- Recipe Class --------------------

/**
 * Represents a complete recipe
 * @class
 */
class Recipe {
  /**
   * Creates a new Recipe
   * @param {string} name - The name of the recipe
   * @param {Object} options - The recipe options
   * @param {Entity[]} [options.ingredients=[]] - The ingredients for the recipe
   * @param {Entity[]} [options.tools=[]] - The tools required for the recipe
   * @param {Entity[]} [options.appliances=[]] - The appliances required for the recipe
   * @param {RecipeStep[]} [options.steps=[]] - The steps of the recipe
   * @param {number} [options.servings=1] - The number of servings the recipe produces
   * @param {string} [options.difficulty='medium'] - The difficulty level of the recipe
   * @param {Duration} [options.estimatedTime=null] - The estimated time to complete the recipe
   * @param {Object} [options.nutritionInfo=null] - Nutritional information for the recipe
   * @param {string[]} [options.miseEnPlace=[]] - Mise en place instructions
   * @param {string[]} [options.servingSuggestions=[]] - Serving suggestions for the recipe
   * @param {string[]} [options.tags=[]] - Tags associated with the recipe
   */
  constructor(
    name,
    {
      ingredients = [],
      tools = [],
      appliances = [],
      steps = [],
      servings = 1,
      difficulty = 'medium',
      estimatedTime = null,
      nutritionInfo = null,
      miseEnPlace = [],
      servingSuggestions = [],
      tags = [],
    } = {}
  ) {
    this.name = name;
    this.ingredients = ingredients;
    this.tools = tools;
    this.appliances = appliances;
    this.steps = steps;
    this.servings = servings;
    this.difficulty = difficulty;
    this.estimatedTime = estimatedTime;
    this.nutritionInfo = nutritionInfo;
    this.miseEnPlace = miseEnPlace;
    this.servingSuggestions = servingSuggestions;
    this.substitutions = [];
    this.tags = tags;
    this.hash = null;
  }

  /**
   * Creates a new Recipe instance
   * @param {string} name - The name of the recipe
   * @param {Object} options - The recipe options
   * @returns {Recipe} A new Recipe instance
   */
  static create(name, options) {
    return new Recipe(name, options);
  }

  /**
   * Creates and returns a new RecipeStep instance
   * @param {Entity|Entity[]} ingredients - The ingredient(s) to add
   * @returns {RecipeStep} A new RecipeStep instance
   */
  createStep(ingredients) {
    const step = new RecipeStep().add(ingredients);
    this.steps.push(step);
    return step;
  }

  /**
   * Sets the difficulty level of the recipe
   * @param {string} level - The difficulty level
   * @returns {Recipe} The Recipe instance
   */
  setDifficulty(level) {
    this.difficulty = level;
    return this;
  }

  /**
   * Sets the estimated time to complete the recipe
   * @param {Duration} time - The estimated time
   * @returns {Recipe} The Recipe instance
   */
  setEstimatedTime(time) {
    this.estimatedTime = time;
    return this;
  }

  /**
   * Adds nutritional information to the recipe
   * @param {Object} info - The nutritional information
   * @returns {Recipe} The Recipe instance
   */
  addNutritionInfo(info) {
    this.nutritionInfo = info;
    return this;
  }

  /**
   * Adds mise en place instructions to the recipe
   * @param {string[]} steps - The mise en place steps
   * @returns {Recipe} The Recipe instance
   */
  addMiseEnPlace(steps) {
    this.miseEnPlace = steps;
    return this;
  }

  /**
   * Scales the recipe by a given factor
   * @param {number} factor - The scaling factor
   * @returns {Recipe} The Recipe instance
   */
  scale(factor) {
    this.ingredients = this.ingredients.map((ingredient) => ({
      ...ingredient,
      amount: ingredient.amount * factor,
    }));
    this.servings *= factor;
    return this;
  }

  /**
   * Suggests a substitution for an ingredient
   * @param {Entity} ingredient - The original ingredient
   * @param {Entity} alternative - The alternative ingredient
   * @returns {Recipe} The Recipe instance
   */
  suggestSubstitution(ingredient, alternative) {
    this.substitutions.push({ original: ingredient, alternative });
    return this;
  }

  /**
   * Adds a serving suggestion to the recipe
   * @param {string} suggestion - The serving suggestion
   * @returns {Recipe} The Recipe instance
   */
  addServingSuggestion(suggestion) {
    this.servingSuggestions.push(suggestion);
    return this;
  }

  /**
   * Adds tags to the recipe
   * @param {...string} newTags - Tags to add to the recipe
   * @returns {Recipe} The Recipe instance
   */
  addTags(...newTags) {
    this.tags.push(...newTags);
    return this;
  }

  /**
   * Converts the Recipe to a JSON string
   * @returns {string} A JSON string representation of the Recipe
   */
  toJSON() {
    return JSON.stringify({
      name: this.name,
      ingredients: this.ingredients,
      tools: this.tools,
      appliances: this.appliances,
      steps: this.steps.map((step) => step.toJSON()),
      servings: this.servings,
      difficulty: this.difficulty,
      estimatedTime: this.estimatedTime,
      nutritionInfo: this.nutritionInfo,
      miseEnPlace: this.miseEnPlace,
      servingSuggestions: this.servingSuggestions,
      substitutions: this.substitutions,
      tags: this.tags,
    });
  }

  /**
   * Creates a Recipe from a JSON string
   * @param {string} json - The JSON string representation of a Recipe
   * @returns {Recipe} A new Recipe instance
   */
  static fromJSON(json) {
    const data = JSON.parse(json);
    const recipe = new Recipe(data.name, {
      ingredients: data.ingredients,
      tools: data.tools,
      appliances: data.appliances,
      steps: data.steps.map(RecipeStep.fromJSON),
      servings: data.servings,
      difficulty: data.difficulty,
      estimatedTime: data.estimatedTime,
      nutritionInfo: data.nutritionInfo,
      miseEnPlace: data.miseEnPlace,
      servingSuggestions: data.servingSuggestions,
      tags: data.tags,
    });
    recipe.substitutions = data.substitutions;
    return recipe;
  }

  /**
   * Validates the recipe
   * @throws {Error} If the recipe is invalid
   */
  validate() {
    if (!this.name) throw new Error('Recipe must have a name');
    if (this.ingredients.length === 0)
      throw new Error('Recipe must have at least one ingredient');
    if (this.steps.length === 0)
      throw new Error('Recipe must have at least one step');
    // Add more validation as needed
  }

  /**
   * Calculates and returns the hash of the recipe
   * @param {number} [numBuckets=256] - The number of buckets for hashing
   * @returns {string} The hash of the recipe
   */
  cook(numBuckets = 256) {
    if (this.hash) {
      return this.hash; // Return cached hash if already calculated
    }

    const buckets = new Array(numBuckets).fill(0);

    // Hash ingredients
    this.ingredients.forEach((ingredient) => {
      const hash = crypto
        .createHash('md5')
        .update(ingredient.name.toLowerCase())
        .digest('hex');
      const bucketIndex = parseInt(hash.substr(0, 8), 16) % numBuckets;
      buckets[bucketIndex]++;
    });

    // Hash steps
    this.steps.forEach((step) => {
      this[_hashStep](step, buckets, numBuckets);
    });

    // Convert buckets to a hex string
    const hexString = buckets
      .map((count) => count.toString(16).padStart(2, '0'))
      .join('');

    // Compress the hex string and convert to base64
    this.hash = gzipSync(Buffer.from(hexString, 'hex')).toString('base64');

    return this.hash;
  }

  /**
   * Calculates the similarity between this recipe and another recipe or hash
   * @param {Recipe|string} other - The other recipe or its hash to compare to
   * @returns {number} A value between 0 and 1, where 1 means identical and 0 means completely different
   */
  compareTo(other) {
    const decompressHash = (hash) => {
      try {
        return gunzipSync(Buffer.from(hash, 'base64')).toString('hex');
      } catch (error) {
        throw new Error('Invalid hash format: unable to decompress');
      }
    };

    const thisHash = decompressHash(this.cook());
    const otherHash =
      other instanceof Recipe
        ? decompressHash(other.cook())
        : decompressHash(other);

    if (thisHash.length !== otherHash.length) {
      throw new Error('Hashes must be of equal length');
    }

    let distance = 0;
    const totalBuckets = thisHash.length / 2;

    for (let i = 0; i < thisHash.length; i += 2) {
      const count1 = parseInt(thisHash.substr(i, 2), 16);
      const count2 = parseInt(otherHash.substr(i, 2), 16);
      distance += Math.abs(count1 - count2);
    }

    // Convert distance to similarity (1 - normalized distance)
    return 1 - distance / (16 * totalBuckets); // 16 is the max difference possible in each bucket (FF - 00 in hex)
  }

  [_hashStep](step, buckets, numBuckets) {
    step.actions.forEach((action) => {
      this[_hashAttribute](action.type, buckets, numBuckets);
      if (action.ingredient)
        this[_hashAttribute](action.ingredient.name, buckets, numBuckets);
      if (action.container)
        this[_hashAttribute](action.container.name, buckets, numBuckets);
      if (action.temperature)
        this[_hashAttribute](action.temperature.value, buckets, numBuckets);
      if (action.duration)
        this[_hashAttribute](action.duration.value, buckets, numBuckets);
    });

    step.cues.forEach((cue) => {
      this[_hashAttribute](cue.type, buckets, numBuckets);
      this[_hashAttribute](cue.description, buckets, numBuckets);
    });

    step.sensoryChecks.forEach((check) => {
      this[_hashAttribute](check.type, buckets, numBuckets);
      this[_hashAttribute](check.description, buckets, numBuckets);
    });

    // Recursively hash parallel threads
    step.threads.forEach((thread) =>
      this[_hashStep](thread, buckets, numBuckets)
    );
  }

  [_hashAttribute](value, buckets, numBuckets) {
    if (value !== undefined && value !== null) {
      const hash = crypto
        .createHash('md5')
        .update(value.toString().toLowerCase())
        .digest('hex');
      const bucketIndex = parseInt(hash.substr(0, 8), 16) % numBuckets;
      buckets[bucketIndex]++;
    }
  }

  /**
   * Generates a QR code representation of the recipe and returns the compressed data.
   *
   * This method performs the following steps:
   * 1. Converts the recipe to a JSON string.
   * 2. Compresses the JSON string using gzip.
   * 3. Encodes the compressed data to base64.
   * 4. Generates a QR code from the compressed, base64-encoded data and displays it in the console.
   *
   * @returns {string} The compressed, base64-encoded representation of the recipe.
   *
   * @throws {Error} If there's an issue with JSON stringification, compression, or QR code generation.
   */
  toQrCode() {
    const jsonStr = this.toJSON();

    // Compress the JSON string and convert to base64
    const compressed = gzipSync(Buffer.from(jsonStr, 'utf-8')).toString(
      'base64'
    );

    // generate QR code
    qrcode.generate(compressed, { small: true });

    // const decompressData = (hash) => {
    //   try {
    //     const decompressed = gunzipSync(Buffer.from(hash, 'base64'));
    //     return decompressed.toString('utf-8');
    //   } catch (error) {
    //     console.error('Decompression error:', error);
    //     throw new Error('Invalid hash format: unable to decompress');
    //   }
    // };

    return compressed;
  }

  /**
   * Converts the recipe to a human-readable text format with emojis.
   * @returns {string} A formatted string representation of the recipe.
   */
  toText() {
    let text = `🍽️ ${this.name}\n\n`;

    text += `👥 Servings: ${this.servings}\n`;
    text += `⏱️ Estimated Time: ${this.estimatedTime.value} ${this.estimatedTime.unit}\n`;
    text += `📊 Difficulty: ${this.difficulty}\n\n`;

    text += `🧾 Ingredients:\n`;
    this.ingredients.forEach((ing) => {
      text += `  • ${ing.amount} ${ing.unit} ${ing.name}\n`;
    });

    text += `\n🔧 Tools:\n`;
    this.tools.forEach((tool) => {
      text += `  • ${tool.name}\n`;
    });

    text += `\n🔌 Appliances:\n`;
    this.appliances.forEach((appliance) => {
      text += `  • ${appliance.name}\n`;
    });

    text += `\n👨‍🍳 Instructions:\n`;
    this.steps.forEach((step, index) => {
      text += `  ${index + 1}. `;
      step.actions.forEach((action) => {
        switch (action.type) {
          case ActionType.ADD:
            text += `Add ${action.ingredient.name} to ${action.container.name}. `;
            break;
          case ActionType.MIX:
            text += `Mix ingredients in ${action.container.name}. `;
            break;
          case ActionType.HEAT:
            text += `Heat ${action.container.name} to ${action.temperature.value}${action.temperature.unit}. `;
            break;
          case ActionType.TRANSFER:
            text += `Transfer ingredients from ${action.from.name} to ${action.to.name}. `;
            break;
          case ActionType.PREPARE:
            text += `${action.technique} ${action.ingredient.name}. `;
            break;
          case ActionType.REST:
            text += `Let it rest. `;
            break;
          case ActionType.EQUIPMENT_SETTING:
            text += `Set ${action.equipment.name} to ${action.setting}. `;
            break;
          case ActionType.PREHEAT:
            text += `Preheat ${action.appliance.name} to ${action.temperature.value}${action.temperature.unit}. `;
            break;
        }
      });
      if (step.duration) {
        text += `Do this for ${step.duration.value} ${step.duration.unit}. `;
      }
      if (step.condition) {
        text += `Continue until ${step.condition}. `;
      }
      step.cues.forEach((cue) => {
        text += `Look for ${cue.description} (${cue.type}). `;
      });
      step.adjustments.forEach((adj) => {
        text += `If ${adj.condition}, then ${adj.action}. `;
      });
      step.sensoryChecks.forEach((check) => {
        text += `${check.description} (${check.type}). If needed, ${check.adjustment}. `;
      });
      text += '\n';

      // Handle parallel steps
      if (step.threads.length > 0) {
        text += `    Meanwhile:\n`;
        step.threads.forEach((parallelStep, parallelIndex) => {
          text += `    ${String.fromCharCode(97 + parallelIndex)}. `; // a, b, c, ...
          parallelStep.actions.forEach((action) => {
            // Similar switch case as above for parallel actions
          });
          text += '\n';
        });
      }
    });

    if (this.miseEnPlace.length > 0) {
      text += `\n🔪 Mise en Place:\n`;
      this.miseEnPlace.forEach((step) => {
        text += `  • ${step}\n`;
      });
    }

    if (this.nutritionInfo) {
      text += `\n🥗 Nutrition Information:\n`;
      Object.entries(this.nutritionInfo).forEach(([key, value]) => {
        text += `  • ${key}: ${value}\n`;
      });
    }

    if (this.servingSuggestions.length > 0) {
      text += `\n🍴 Serving Suggestions:\n`;
      this.servingSuggestions.forEach((suggestion) => {
        text += `  • ${suggestion}\n`;
      });
    }

    if (this.substitutions.length > 0) {
      text += `\n🔄 Possible Substitutions:\n`;
      this.substitutions.forEach((sub) => {
        text += `  • Instead of ${sub.original.name}, you can use ${sub.alternative.name}\n`;
      });
    }

    if (this.tags.length > 0) {
      text += `\n🏷️ Tags: ${this.tags.join(', ')}\n`;
    }

    return text;
  }

  /**
   * Converts the recipe to a markdown format with emojis.
   * @returns {string} A formatted markdown representation of the recipe.
   */
  toMarkdown() {
    let md = `# 🍽️ ${this.name}\n\n`;

    md += `- 👥 **Servings:** ${this.servings}\n`;
    md += `- ⏱️ **Estimated Time:** ${this.estimatedTime.value} ${this.estimatedTime.unit}\n`;
    md += `- 📊 **Difficulty:** ${this.difficulty}\n\n`;

    md += `## 🧾 Ingredients\n\n`;
    this.ingredients.forEach((ing) => {
      md += `- ${ing.amount} ${ing.unit} ${ing.name}\n`;
    });

    md += `\n## 🔧 Tools\n\n`;
    this.tools.forEach((tool) => {
      md += `- ${tool.name}\n`;
    });

    md += `\n## 🔌 Appliances\n\n`;
    this.appliances.forEach((appliance) => {
      md += `- ${appliance.name}\n`;
    });

    md += `\n## 👨‍🍳 Instructions\n\n`;
    this.steps.forEach((step, index) => {
      md += `${index + 1}. `;
      step.actions.forEach((action) => {
        switch (action.type) {
          case ActionType.ADD:
            md += `Add ${action.ingredient.name} to ${action.container.name}. `;
            break;
          case ActionType.MIX:
            md += `Mix ingredients in ${action.container.name}. `;
            break;
          case ActionType.HEAT:
            md += `Heat ${action.container.name} to ${action.temperature.value}${action.temperature.unit}. `;
            break;
          case ActionType.TRANSFER:
            md += `Transfer ingredients from ${action.from.name} to ${action.to.name}. `;
            break;
          case ActionType.PREPARE:
            md += `${action.technique} ${action.ingredient.name}. `;
            break;
          case ActionType.REST:
            md += `Let it rest. `;
            break;
          case ActionType.EQUIPMENT_SETTING:
            md += `Set ${action.equipment.name} to ${action.setting}. `;
            break;
          case ActionType.PREHEAT:
            md += `Preheat ${action.appliance.name} to ${action.temperature.value}${action.temperature.unit}. `;
            break;
        }
      });
      if (step.duration) {
        md += `Do this for ${step.duration.value} ${step.duration.unit}. `;
      }
      if (step.condition) {
        md += `Continue until ${step.condition}. `;
      }
      step.cues.forEach((cue) => {
        md += `Look for ${cue.description} (${cue.type}). `;
      });
      step.adjustments.forEach((adj) => {
        md += `If ${adj.condition}, then ${adj.action}. `;
      });
      step.sensoryChecks.forEach((check) => {
        md += `${check.description} (${check.type}). If needed, ${check.adjustment}. `;
      });
      md += '\n\n';

      // Handle parallel steps
      if (step.threads.length > 0) {
        md += `    *Meanwhile:*\n\n`;
        step.threads.forEach((parallelStep, parallelIndex) => {
          md += `    ${String.fromCharCode(97 + parallelIndex)}. `; // a, b, c, ...
          parallelStep.actions.forEach((action) => {
            // Similar switch case as above for parallel actions
          });
          md += '\n\n';
        });
      }
    });

    if (this.miseEnPlace.length > 0) {
      md += `## 🔪 Mise en Place\n\n`;
      this.miseEnPlace.forEach((step) => {
        md += `- ${step}\n`;
      });
      md += '\n';
    }

    if (this.nutritionInfo) {
      md += `## 🥗 Nutrition Information\n\n`;
      Object.entries(this.nutritionInfo).forEach(([key, value]) => {
        md += `- **${key}:** ${value}\n`;
      });
      md += '\n';
    }

    if (this.servingSuggestions.length > 0) {
      md += `## 🍴 Serving Suggestions\n\n`;
      this.servingSuggestions.forEach((suggestion) => {
        md += `- ${suggestion}\n`;
      });
      md += '\n';
    }

    if (this.substitutions.length > 0) {
      md += `## 🔄 Possible Substitutions\n\n`;
      this.substitutions.forEach((sub) => {
        md += `- Instead of ${sub.original.name}, you can use ${sub.alternative.name}\n`;
      });
      md += '\n';
    }

    if (this.tags.length > 0) {
      md += `## 🏷️ Tags\n\n`;
      md += this.tags.map((tag) => `\`${tag}\``).join(', ') + '\n';
    }

    return md;
  }
}

export default Recipe;
