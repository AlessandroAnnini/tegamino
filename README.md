# 🍳 Tegamino 🥘

A powerful and flexible JavaScript framework for creating, manipulating, and managing recipes.

- [🍳 Tegamino 🥘](#-tegamino-)
  - [📥 Installation](#-installation)
  - [🧰 Components and Examples](#-components-and-examples)
    - [🥕 Ingredients](#-ingredients)
    - [🍽️ Containers](#️-containers)
    - [🔪 Tools](#-tools)
    - [🍳 Appliances](#-appliances)
    - [⏱️ Duration](#️-duration)
    - [🌡️ Temperature](#️-temperature)
    - [🔄 Parallel Steps](#-parallel-steps)
    - [🍽️ Complete Recipe](#️-complete-recipe)
    - [🔄 Converting Units](#-converting-units)
    - [💾 Serialization](#-serialization)
    - [🍳 Cooking a Recipe (Hashing)](#-cooking-a-recipe-hashing)
    - [🔍 Comparing Recipes](#-comparing-recipes)
    - [📱 Generating QR Code for a Recipe](#-generating-qr-code-for-a-recipe)
    - [📝 Exporting Recipe to Text and Markdown](#-exporting-recipe-to-text-and-markdown)
      - [Text Export](#text-export)
      - [Markdown Export](#markdown-export)
  - [🤝 Contributing](#-contributing)
  - [📄 License](#-license)

## 📥 Installation

To install the Recipe Framework, use npm:

````bash
npm install recipe-framework

## 🚀 Usage

First, import the framework in your JavaScript file:

```javascript
const RecipeFramework = require('recipe-framework');
````

## 🧰 Components and Examples

### 🥕 Ingredients

Create ingredients using the `Ingredient` function:

```javascript
const carrot = RecipeFramework.Ingredient('Carrot', {
  amount: 2,
  unit: 'pieces',
});
const salt = RecipeFramework.Ingredient('Salt', { amount: 1, unit: 'tsp' });
```

### 🍽️ Containers

Define containers with the `Container` function:

```javascript
const bowl = RecipeFramework.Container('Mixing Bowl');
const pan = RecipeFramework.Container('Frying Pan');
```

### 🔪 Tools

Specify tools using the `Tool` function:

```javascript
const knife = RecipeFramework.Tool("Chef's Knife");
const whisk = RecipeFramework.Tool('Whisk');
```

### 🍳 Appliances

Define appliances with the `Appliance` function:

```javascript
const oven = RecipeFramework.Appliance('Oven');
const stove = RecipeFramework.Appliance('Stove');
```

### ⏱️ Duration

Create duration objects:

```javascript
const tenMinutes = RecipeFramework.minutes(10);
const oneHour = RecipeFramework.hours(1);
const thirtySecs = RecipeFramework.seconds(30);
```

### 🌡️ Temperature

Specify temperatures:

```javascript
const bakingTemp = RecipeFramework.fahrenheit(350);
const boilingPoint = RecipeFramework.celsius(100);
const lowHeat = RecipeFramework.StoveHeat.LOW;
```

### 🔄 Parallel Steps

Use the `parallel` method to define steps that occur simultaneously with the main step:

````javascript
const mainStep = new RecipeFramework.RecipeStep()
  .add(RecipeFramework.Ingredient('Pasta'))
  .to(RecipeFramework.Container('Pot'))
  .heat(RecipeFramework.StoveHeat.HIGH)
  .for(RecipeFramework.minutes(10))
  .untilCondition('pasta is al dente');

mainStep.parallel((parallelStep) => {
  parallelStep
    .add(RecipeFramework.Ingredient('Tomato Sauce'))
    .to(RecipeFramework.Container('Saucepan'))
    .heat(RecipeFramework.StoveHeat.MEDIUM)
    .for(RecipeFramework.minutes(5))
    .untilCondition('sauce is heated through');
});

This creates a step where pasta is cooked while simultaneously heating the tomato sauce

### 📝 Recipe Steps

Create and chain recipe steps:

```javascript
const step1 = new RecipeFramework.RecipeStep()
  .add(carrot)
  .to(bowl)
  .prepare('chop')
  .untilVisualCue(RecipeFramework.VisualCue.CONSISTENCY, 'finely chopped');

const step2 = new RecipeFramework.RecipeStep()
  .add(salt)
  .to(bowl)
  .mix()
  .for(RecipeFramework.seconds(30));

const step3 = new RecipeFramework.RecipeStep()
  .transfer(pan)
  .heat(RecipeFramework.StoveHeat.MEDIUM)
  .for(RecipeFramework.minutes(5))
  .untilCondition('carrots are tender');

const step4 = new RecipeFramework.RecipeStep().preheat(
  oven,
  RecipeFramework.fahrenheit(350)
);

const step5 = new RecipeFramework.RecipeStep().grillSetup(
  RecipeFramework.fahrenheit(400),
  RecipeFramework.GrillCookingMethod.DIRECT
);

const step6 = new RecipeFramework.RecipeStep().cookToTemperature(
  RecipeFramework.MeatDoneness.MEDIUM_RARE
);

step3.parallel((parallelStep) => {
  parallelStep
    .add(RecipeFramework.Ingredient('Garlic'))
    .prepare('mince')
    .to(pan);
});

step3.adjust('if too dry', 'add 2 tbsp of water');
step3.checkSensory(
  RecipeFramework.SensoryFeedback.TASTE,
  'Taste for seasoning',
  'add more salt if needed'
);
````

### 🍽️ Complete Recipe

Create a complete recipe:

```javascript
const carrotRecipe = new RecipeFramework.Recipe('Sautéed Carrots', {
  ingredients: [carrot, salt],
  tools: [knife, whisk],
  appliances: [stove, oven],
  steps: [step1, step2, step3, step4, step5, step6],
  servings: 4,
  difficulty: 'easy',
  estimatedTime: RecipeFramework.minutes(20),
  tags: ['vegetarian', 'side dish'],
});

carrotRecipe.setDifficulty('medium');
carrotRecipe.setEstimatedTime(RecipeFramework.minutes(25));
carrotRecipe.addNutritionInfo({ calories: 50, protein: 1, carbs: 10, fat: 0 });
carrotRecipe.addMiseEnPlace(['Wash and peel carrots', 'Measure salt']);
carrotRecipe.scale(2);
carrotRecipe.suggestSubstitution(carrot, RecipeFramework.Ingredient('Parsnip'));
carrotRecipe.addServingSuggestion('Garnish with fresh parsley');
carrotRecipe.addTags('low-calorie', 'quick');
```

### 🔄 Converting Units

Use the UnitConverter to convert between units:

```javascript
const cupsToMl = RecipeFramework.UnitConverter.convert(1, 'cups', 'ml');
const fahrenheitToCelsius = RecipeFramework.UnitConverter.convert(
  350,
  'F',
  'C'
);
```

### 💾 Serialization

Convert recipes to and from JSON:

```javascript
const recipeJson = carrotRecipe.toJSON();
const reconstructedRecipe = RecipeFramework.Recipe.fromJSON(recipeJson);
```

### 🍳 Cooking a Recipe (Hashing)

Use the `cook` method to generate a unique, compressed hash for a recipe. This hash can be used for comparison or identification purposes:

```javascript
const recipeHash = carrotRecipe.cook();
console.log('Recipe Hash:', recipeHash);
```

The `cook` method calculates a hash based on the recipe's ingredients, steps, and other attributes. It uses a bucket hashing technique and then compresses the result using gzip and encodes it in base64. This compressed hash can be used to quickly compare recipes or identify similar ones while minimizing storage and transmission requirements.

### 🔍 Comparing Recipes

Use the `compareTo` method to calculate the similarity between two recipes:

```javascript
const similarity = carrotRecipe.compareTo(anotherRecipe);
console.log('Recipe Similarity:', similarity);
```

You can also compare a recipe with a pre-calculated compressed hash:

```javascript
const hashOfAnotherRecipe = 'H4sIAAAAAAAAA...'; // This should be a gzipped, base64 encoded hash
const similarityWithHash = carrotRecipe.compareTo(hashOfAnotherRecipe);
console.log('Similarity with hash:', similarityWithHash);
```

The `compareTo` method returns a value between 0 and 1, where 1 indicates identical recipes and 0 indicates completely different recipes. It works by decompressing the hashes before comparison.

These methods are useful for:

- Identifying duplicate or very similar recipes
- Suggesting similar recipes to users
- Organizing and categorizing large recipe collections

### 📱 Generating QR Code for a Recipe

Use the `toQrCode` method to generate a QR code representation of the recipe:

```javascript
const qrCodeData = carrotRecipe.toQrCode();
```

This method compresses the entire recipe data (not just the hash) using gzip, encodes it in base64, and generates a QR code. The QR code is displayed in the console, and the compressed data is returned as a string.

This feature is useful for:

- Easily sharing recipes between devices
- Storing recipe information in a compact, scannable format
- Quick recipe lookup in a physical cookbook or menu

Note: The size of the QR code will depend on the complexity of the recipe. Very large or complex recipes might result in dense QR codes that are difficult to scan. In such cases, consider simplifying the recipe or splitting it into multiple QR codes.

### 📝 Exporting Recipe to Text and Markdown

#### Text Export

Use the `toText` method to generate a human-readable, emoji-enhanced text version of the recipe:

```javascript
const recipeText = carrotRecipe.toText();
console.log(recipeText);
```

This will produce output similar to:

```text
🍽️ Sautéed Carrots

👥 Servings: 4
⏱️ Estimated Time: 25 minutes
📊 Difficulty: medium

🧾 Ingredients:
  • 2 pieces Carrot
  • 1 tsp Salt

🔧 Tools:
  • Chef's Knife
  • Whisk

🔌 Appliances:
  • Stove
  • Oven

👨‍🍳 Instructions:
  1. Add Carrot to Mixing Bowl. Chop until finely chopped.
  2. Add Salt to Mixing Bowl. Mix ingredients in Mixing Bowl. Do this for 30 seconds.
  3. Transfer ingredients to Frying Pan. Heat Frying Pan to level 3. Do this for 5 minutes.
     Meanwhile:
     a. Add Garlic to Frying Pan. Mince Garlic.
  4. Preheat Oven to 350F.
  5. Set up grill to 400F for direct cooking.
  6. Cook to internal temperature of 135F.

🔪 Mise en Place:
  • Wash and peel carrots
  • Measure salt

🥗 Nutrition Information:
  • calories: 50
  • protein: 1
  • carbs: 10
  • fat: 0

🍴 Serving Suggestions:
  • Garnish with fresh parsley

🔄 Possible Substitutions:
  • Instead of Carrot, you can use Parsnip

🏷️ Tags: vegetarian, side dish, low-calorie, quick
```

The toText method provides a clear, easy-to-read format for your recipes, using emojis to visually separate different sections. This method includes:

- Basic recipe information (name, servings, time, difficulty)
- Ingredients, tools, and appliances
- Detailed instructions with all types of actions
- Parallel steps
- Visual cues, adjustments, and sensory checks
- Mise en place
- Nutrition information
- Serving suggestions
- Possible substitutions
- Tags

This can be useful for:

- Displaying recipes in a more user-friendly format
- Exporting recipes to a simple text format
- Sharing recipes via text-based mediums (e.g., email, messaging apps)
- Creating printable recipe cards

#### Markdown Export

Use the toMarkdown method to generate a beautifully formatted markdown version of the recipe:

```javascript
const recipeMarkdown = carrotRecipe.toMarkdown();
console.log(recipeMarkdown);
```

This will produce output similar to:

```markdown
# 🍽️ Sautéed Carrots

- 👥 **Servings:** 4
- ⏱️ **Estimated Time:** 25 minutes
- 📊 **Difficulty:** medium

## 🧾 Ingredients

- 2 pieces Carrot
- 1 tsp Salt

## 🔧 Tools

- Chef's Knife
- Whisk

## 🔌 Appliances

- Stove
- Oven

## 👨‍🍳 Instructions

1. Add Carrot to Mixing Bowl. Chop until finely chopped.

2. Add Salt to Mixing Bowl. Mix ingredients in Mixing Bowl. Do this for 30 seconds.

3. Transfer ingredients to Frying Pan. Heat Frying Pan to level 3. Do this for 5 minutes.

   _Meanwhile:_

   a. Add Garlic to Frying Pan. Mince Garlic.

4. Preheat Oven to 350F.

5. Set up grill to 400F for direct cooking.

6. Cook to internal temperature of 135F.

## 🔪 Mise en Place

- Wash and peel carrots
- Measure salt

## 🥗 Nutrition Information

- **calories:** 50
- **protein:** 1
- **carbs:** 10
- **fat:** 0

## 🍴 Serving Suggestions

- Garnish with fresh parsley

## 🔄 Possible Substitutions

- Instead of Carrot, you can use Parsnip

## 🏷️ Tags

`vegetarian`, `side dish`, `low-calorie`, `quick`
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
