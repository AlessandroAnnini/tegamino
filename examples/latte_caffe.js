import { Recipe, RecipeStep, Entities, Measurement } from './../src/index.js';

const tazza = Entities.Container('Tazza', { material: 'ceramic', volume: 1 });

const latte = Entities.Ingredient('Latte', { amount: 1, unit: 'cup' });
const espresso = Entities.Ingredient('Espresso', { amount: 1, unit: 'shot' });
const sugar = Entities.Ingredient('Sugar', { amount: 1, unit: 'tablespoon' });

const spoon = Entities.Tool('Spoon');

const step1 = new RecipeStep().add(latte, espresso, sugar).to(tazza).mix();
const step2 = new RecipeStep()
  .heat(Measurement.Temperature.MEDIUM)
  .for(Measurement.minutes(1));

const latteBiscotti = new Recipe('Latte Caffe', {
  ingredients: [latte, espresso, sugar],
  tools: [spoon],
  steps: [step1, step2],
  servings: 1,
  difficulty: 'very easy',
  estimatedTime: Measurement.minutes(3),
  tags: ['beverage', 'Italian', 'breakfast'],
});

const output = latteBiscotti;

console.log(output.toQrCode());
