'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  WorkoutSession, DailyNutrition, NutritionGoals,
  FoodEntry, MealType, DayType, GoalsByType,
} from './types';

const DEFAULT_GOALS_BY_TYPE: GoalsByType = {
  high:   { calories: 2600, protein: 185, carbs: 320, fat: 75 },
  medium: { calories: 2200, protein: 160, carbs: 265, fat: 70 },
  low:    { calories: 1800, protein: 140, carbs: 210, fat: 58 },
  rest:   { calories: 1500, protein: 125, carbs: 175, fat: 52 },
};

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function today(): string {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

export function sumNutrition(dayLog: DailyNutrition | undefined) {
  if (!dayLog) return { calories: 0, protein: 0, fat: 0, carbs: 0 };
  const allFoods = Object.values(dayLog.meals).flat();
  return allFoods.reduce(
    (acc, food) => ({
      calories: acc.calories + food.calories,
      protein: acc.protein + food.protein,
      fat: acc.fat + food.fat,
      carbs: acc.carbs + food.carbs,
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );
}

export function totalSets(session: WorkoutSession): number {
  return session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
}

export function useStore() {
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [nutritionLog, setNutritionLog] = useState<Record<string, DailyNutrition>>({});
  const [goalsByType, setGoalsByType] = useState<GoalsByType>(DEFAULT_GOALS_BY_TYPE);
  const [dayTypes, setDayTypes] = useState<Record<string, DayType>>({});
  const [waterLog, setWaterLog] = useState<Record<string, number>>({});
  const [waterGoal, setWaterGoal] = useState(2000);
  const [waterAmountCounts, setWaterAmountCounts] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setWorkoutSessions(load('workoutSessions', []));
    setNutritionLog(load('nutritionLog', {}));
    setGoalsByType(load('goalsByType', DEFAULT_GOALS_BY_TYPE));
    setDayTypes(load('dayTypes', {}));
    setWaterLog(load('waterLog', {}));
    setWaterGoal(load('waterGoal', 2000));
    setWaterAmountCounts(load('waterAmountCounts', {}));
    setReady(true);
  }, []);

  const saveWorkout = useCallback((session: WorkoutSession) => {
    setWorkoutSessions(prev => {
      const exists = prev.some(s => s.id === session.id);
      const next = exists
        ? prev.map(s => (s.id === session.id ? session : s))
        : [session, ...prev];
      save('workoutSessions', next);
      return next;
    });
  }, []);

  const deleteWorkout = useCallback((id: string) => {
    setWorkoutSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      save('workoutSessions', next);
      return next;
    });
  }, []);

  const addFood = useCallback((date: string, meal: MealType, food: FoodEntry) => {
    setNutritionLog(prev => {
      const dayLog = prev[date] ?? {
        date,
        meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
      };
      const next = {
        ...prev,
        [date]: {
          ...dayLog,
          meals: { ...dayLog.meals, [meal]: [...dayLog.meals[meal], food] },
        },
      };
      save('nutritionLog', next);
      return next;
    });
  }, []);

  const removeFood = useCallback((date: string, meal: MealType, foodId: string) => {
    setNutritionLog(prev => {
      const dayLog = prev[date];
      if (!dayLog) return prev;
      const next = {
        ...prev,
        [date]: {
          ...dayLog,
          meals: { ...dayLog.meals, [meal]: dayLog.meals[meal].filter(f => f.id !== foodId) },
        },
      };
      save('nutritionLog', next);
      return next;
    });
  }, []);

  const updateFood = useCallback((date: string, meal: MealType, food: FoodEntry) => {
    setNutritionLog(prev => {
      const dayLog = prev[date];
      if (!dayLog) return prev;
      const next = {
        ...prev,
        [date]: {
          ...dayLog,
          meals: {
            ...dayLog.meals,
            [meal]: dayLog.meals[meal].map(f => f.id === food.id ? food : f),
          },
        },
      };
      save('nutritionLog', next);
      return next;
    });
  }, []);

  const updateAllGoals = useCallback((goals: GoalsByType) => {
    setGoalsByType(goals);
    save('goalsByType', goals);
  }, []);

  const setDayType = useCallback((date: string, type: DayType) => {
    setDayTypes(prev => {
      const next = { ...prev, [date]: type };
      save('dayTypes', next);
      return next;
    });
  }, []);

  const logWater = useCallback((date: string, ml: number) => {
    setWaterLog(prev => {
      const next = { ...prev, [date]: Math.max(0, (prev[date] ?? 0) + ml) };
      save('waterLog', next);
      return next;
    });
  }, []);

  const updateWaterGoal = useCallback((ml: number) => {
    setWaterGoal(ml);
    save('waterGoal', ml);
  }, []);

  // Records a custom-entered water amount for frequency tracking (auto-presets)
  const recordWaterAmount = useCallback((ml: number) => {
    if (ml <= 0) return;
    setWaterAmountCounts(prev => {
      const key = String(ml);
      const next = { ...prev, [key]: (prev[key] ?? 0) + 1 };
      save('waterAmountCounts', next);
      return next;
    });
  }, []);

  return {
    ready,
    workoutSessions,
    nutritionLog,
    goalsByType,
    dayTypes,
    waterLog,
    waterGoal,
    waterAmountCounts,
    saveWorkout,
    deleteWorkout,
    addFood,
    removeFood,
    updateFood,
    updateAllGoals,
    setDayType,
    logWater,
    updateWaterGoal,
    recordWaterAmount,
  };
}

export type Store = ReturnType<typeof useStore>;
