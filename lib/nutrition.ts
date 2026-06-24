import { FoodItem } from "./types";
import nutritionData from "../data/uk-nutrition.json";

export async function getFoodDatabase(): Promise<FoodItem[]> {
  return nutritionData as FoodItem[];
}
export function searchFoods(query: string, foods: FoodItem[]): FoodItem[] {
  const q = query.toLowerCase();
  return foods.filter((f) => f.name.toLowerCase().includes(q) || (f.category && f.category.toLowerCase().includes(q)));
}
export function calcMacros(food: FoodItem, grams: number) {
  const ratio = grams / 100;
  return {
    calories: Math.round(food.calories * ratio),
    protein:  Math.round(food.protein  * ratio * 10) / 10,
    carbs:    Math.round(food.carbs    * ratio * 10) / 10,
    fat:      Math.round(food.fat      * ratio * 10) / 10,
  };
}
