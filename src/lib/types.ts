// 训练相关类型
export type ExerciseCategory = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
}

export interface WorkoutSet {
  weight: number; // 公斤
  reps: number;   // 次数
}

export interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  date: string; // YYYY-MM-DD
  exercises: WorkoutExercise[];
  notes: string;
}

export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface TrainingPlanDay {
  exerciseIds: string[];
}

export interface TrainingPlan {
  id: string;
  name: string;
  days: Record<WeekDay, TrainingPlanDay>;
}

// 营养相关类型
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface FoodIngredient {
  name: string;
  amount: number;
  kcalPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

export interface FoodEntry {
  id: string;
  name: string;
  amount: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  photoUrl?: string;
  ingredients?: FoodIngredient[];
}

export interface DailyNutrition {
  date: string;
  meals: Record<MealType, FoodEntry[]>;
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export type DayType = 'high' | 'medium' | 'low' | 'rest';
export type GoalsByType = Record<DayType, NutritionGoals>;
