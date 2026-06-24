export interface FoodItem {
  name: string; calories: number; protein: number; carbs: number; fat: number;
  source?: string; category?: string;
}
export interface Exercise { name: string; sets: number; reps: number; weightKg?: number; }
export interface WorkoutSession { id: string; date: string; name: string; exercises: Exercise[]; durationMin: number; notes?: string; }
export interface MealEntry { id: string; date: string; mealType: "breakfast" | "lunch" | "dinner" | "snack"; foods: Array<{ food: FoodItem; grams: number }>; }

export interface WorkoutLog {
  id: string; date: string; exercise: string;
  weightKg: number; sets: number; reps: number; notes: string;
}
export interface FoodLog {
  id: string; date: string; name: string; grams: number;
  proteinPer100: number; carbsPer100: number; fatPer100: number;
}
export interface MacroTargets { protein: number; carbs: number; fat: number; }
