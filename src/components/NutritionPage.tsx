'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Store } from '@/lib/useStore';
import { sumNutrition, today, genId } from '@/lib/useStore';
import type { FoodEntry, MealType, NutritionGoals, DayType, GoalsByType, FoodIngredient } from '@/lib/types';
import type { Tab } from '@/app/page';

interface NutritionPageProps {
  store: Store;
  onTabChange: (tab: Tab) => void;
}

interface FoodResult {
  name: string;
  kcalPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

const MEALS: { id: MealType; label: string; icon: string }[] = [
  { id: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { id: 'lunch',     label: 'Lunch',     icon: '☀️' },
  { id: 'dinner',    label: 'Dinner',    icon: '🌙' },
  { id: 'snacks',    label: 'Snacks',    icon: '🍎' },
];

const DAY_TYPE_CONFIG: Record<DayType, { label: string; icon: string; activeBg: string }> = {
  high:   { label: 'High Intensity', icon: '🔥', activeBg: 'bg-red-500 text-white' },
  medium: { label: 'Medium',         icon: '⚡',  activeBg: 'bg-amber-500 text-white' },
  low:    { label: 'Low',            icon: '🌿',  activeBg: 'bg-emerald-500 text-white' },
  rest:   { label: 'Rest Day',       icon: '😴',  activeBg: 'bg-slate-400 text-white' },
};

export default function NutritionPage({ store, onTabChange }: NutritionPageProps) {
  const todayStr = today();
  const todayLog = store.nutritionLog[todayStr];
  const totals = sumNutrition(todayLog);
  const waterMl = store.waterLog[todayStr] ?? 0;
  const activeType: DayType = store.dayTypes[todayStr] ?? 'medium';
  const activeGoals = store.goalsByType[activeType];

  const [addingMeal, setAddingMeal] = useState<MealType | null>(null);
  const [editingEntry, setEditingEntry] = useState<{ meal: MealType; food: FoodEntry } | null>(null);
  const [showGoals, setShowGoals] = useState(false);

  const handleRemove = useCallback(
    (meal: MealType, foodId: string) => store.removeFood(todayStr, meal, foodId),
    [store, todayStr]
  );

  const handleModalSubmit = useCallback(
    (food: FoodEntry) => {
      if (editingEntry) {
        store.updateFood(todayStr, editingEntry.meal, food);
        setEditingEntry(null);
      } else if (addingMeal) {
        store.addFood(todayStr, addingMeal, food);
        setAddingMeal(null);
      }
    },
    [editingEntry, addingMeal, store, todayStr]
  );

  const caloriePct = activeGoals.calories > 0
    ? Math.min((totals.calories / activeGoals.calories) * 100, 100)
    : 0;
  const remaining = activeGoals.calories - totals.calories;

  const modalMealLabel = editingEntry
    ? (MEALS.find(m => m.id === editingEntry.meal)?.label ?? '')
    : (MEALS.find(m => m.id === addingMeal)?.label ?? '');

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onTabChange('overview')}
            className="text-slate-400 hover:text-slate-600 transition-colors text-sm font-medium"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Today's Nutrition</h1>
            <p className="text-slate-500 text-sm mt-1">{todayStr}</p>
          </div>
        </div>
        <button
          onClick={() => setShowGoals(true)}
          className="text-sm border border-slate-200 text-slate-500 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          Set Goals
        </button>
      </div>

      {/* Day type selector */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(Object.keys(DAY_TYPE_CONFIG) as DayType[]).map(type => {
          const cfg = DAY_TYPE_CONFIG[type];
          const isActive = activeType === type;
          return (
            <button
              key={type}
              onClick={() => store.setDayType(todayStr, type)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isActive ? cfg.activeBg : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {cfg.icon} {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Nutrition summary */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 mb-4">
        <div className="grid grid-cols-4 gap-2 mb-5">
          <NutrientStat label="Calories" value={totals.calories} max={activeGoals.calories} unit="kcal" textColor="text-orange-500" />
          <NutrientStat label="Protein"  value={totals.protein}  max={activeGoals.protein}  unit="g"    textColor="text-blue-500" />
          <NutrientStat label="Carbs"    value={totals.carbs}    max={activeGoals.carbs}    unit="g"    textColor="text-yellow-500" />
          <NutrientStat label="Fat"      value={totals.fat}      max={activeGoals.fat}      unit="g"    textColor="text-red-400" />
        </div>
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>Calorie Progress</span>
            <span className={remaining < 0 ? 'text-red-400' : 'text-slate-400'}>
              {remaining >= 0 ? `${remaining} kcal remaining` : `${Math.abs(remaining)} kcal over`}
            </span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${caloriePct >= 100 ? 'bg-red-400' : 'bg-gradient-to-r from-emerald-400 to-emerald-500'}`}
              style={{ width: `${caloriePct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>0</span>
            <span>{activeGoals.calories} kcal</span>
          </div>
        </div>
      </div>

      {/* Water tracker */}
      <WaterTracker
        waterMl={waterMl}
        waterGoal={store.waterGoal}
        waterAmountCounts={store.waterAmountCounts}
        onAdd={ml => store.logWater(todayStr, ml)}
        onRecord={store.recordWaterAmount}
        onUpdateGoal={store.updateWaterGoal}
      />

      {/* Meal cards */}
      <div className="space-y-4 mt-4">
        {MEALS.map(meal => {
          const foods = todayLog?.meals[meal.id] ?? [];
          const mealCals = foods.reduce((s, f) => s + f.calories, 0);

          return (
            <div key={meal.id} className="bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{meal.icon}</span>
                  <span className="font-medium text-slate-700">{meal.label}</span>
                  {mealCals > 0 && (
                    <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                      {mealCals} kcal
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setAddingMeal(meal.id)}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  + Add
                </button>
              </div>

              {foods.length > 0 ? (
                <div className="border-t border-slate-50 px-5 py-3 space-y-3">
                  {foods.map(food => (
                    <div key={food.id} className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 truncate">{food.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {food.amount}g · P {food.protein.toFixed(1)}g · C {food.carbs.toFixed(1)}g · F {food.fat.toFixed(1)}g
                        </p>
                        {food.ingredients && food.ingredients.length > 0 && (
                          <p className="text-xs text-slate-300 mt-0.5">
                            {food.ingredients.map(i => `${i.name} ${i.amount}g`).join(' · ')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-3 shrink-0">
                        <span className="text-sm font-medium text-slate-600">{food.calories} kcal</span>
                        <button
                          onClick={() => setEditingEntry({ meal: meal.id, food })}
                          className="text-slate-300 hover:text-blue-400 text-sm transition-colors"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleRemove(meal.id, food.id)}
                          className="text-slate-300 hover:text-red-400 text-lg leading-none transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-t border-slate-50 px-5 py-3 text-center">
                  <p className="text-xs text-slate-300">Nothing logged yet</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add/Edit food modal */}
      {(addingMeal || editingEntry) && (
        <AddFoodModal
          mealLabel={modalMealLabel}
          onAdd={handleModalSubmit}
          onClose={() => { setAddingMeal(null); setEditingEntry(null); }}
          initialFood={editingEntry?.food}
          isEditing={!!editingEntry}
        />
      )}

      {/* Goals modal */}
      {showGoals && (
        <GoalsModal
          goalsByType={store.goalsByType}
          onSaveAll={goals => { store.updateAllGoals(goals); setShowGoals(false); }}
          onClose={() => setShowGoals(false)}
        />
      )}
    </div>
  );
}

// ─── Water Tracker ────────────────────────────────────────────────────────────

function getTopPresets(counts: Record<string, number>): [number, number, number] {
  const sorted = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([ml]) => parseInt(ml));
  const defaults = [150, 250, 500];
  const result: number[] = [];
  for (const ml of [...sorted, ...defaults]) {
    if (!result.includes(ml)) result.push(ml);
    if (result.length >= 3) break;
  }
  return result as [number, number, number];
}

function WaterTracker({
  waterMl, waterGoal, waterAmountCounts, onAdd, onRecord, onUpdateGoal,
}: {
  waterMl: number;
  waterGoal: number;
  waterAmountCounts: Record<string, number>;
  onAdd: (ml: number) => void;
  onRecord: (ml: number) => void;
  onUpdateGoal: (ml: number) => void;
}) {
  const pct = Math.min((waterMl / waterGoal) * 100, 100);
  const filledGlasses = Math.min(Math.floor((waterMl / waterGoal) * 8), 8);
  const presets = getTopPresets(waterAmountCounts);

  // Inline goal editing
  const [editGoal, setEditGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState('');
  const [customMl, setCustomMl] = useState('');

  const startEditGoal = () => {
    setGoalDraft(String(waterGoal));
    setEditGoal(true);
  };
  const commitGoal = () => {
    const v = parseInt(goalDraft) || waterGoal;
    if (v > 0) onUpdateGoal(v);
    setEditGoal(false);
  };

  const addCustom = () => {
    const ml = parseInt(customMl) || 0;
    if (ml > 0) {
      onAdd(ml);
      onRecord(ml); // track for auto-preset learning
      setCustomMl('');
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
      {/* Header: "800 / [2000] mL" — click goal to edit inline */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">💧</span>
          <h2 className="font-semibold text-slate-700">Water Intake</h2>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium text-blue-500">
          <span>{waterMl} /</span>
          {editGoal ? (
            <input
              type="number"
              value={goalDraft}
              onChange={e => setGoalDraft(e.target.value)}
              onBlur={commitGoal}
              onKeyDown={e => { if (e.key === 'Enter') commitGoal(); if (e.key === 'Escape') setEditGoal(false); }}
              autoFocus
              min={100}
              className="w-16 text-center border border-blue-300 rounded px-1 py-0.5 text-sm focus:outline-none focus:border-blue-400"
            />
          ) : (
            <button
              onClick={startEditGoal}
              className="underline underline-offset-2 hover:text-blue-700 transition-colors"
              title="Click to change goal"
            >
              {waterGoal}
            </button>
          )}
          <span>mL</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
        <div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>

      {/* Glass segments */}
      <div className="flex gap-1 mb-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-5 rounded transition-colors ${i < filledGlasses ? 'bg-blue-400' : 'bg-slate-100'}`}
          />
        ))}
      </div>

      {/* Auto-preset quick-add buttons + minus */}
      <div className="flex gap-2 mb-2">
        {presets.map(ml => (
          <button
            key={ml}
            onClick={() => onAdd(ml)}
            className="flex-1 text-xs py-1.5 border border-blue-200 text-blue-500 hover:bg-blue-50 rounded-lg font-medium transition-colors"
          >
            +{ml}mL
          </button>
        ))}
        <button
          onClick={() => onAdd(-presets[0])}
          disabled={waterMl === 0}
          className="px-3 py-1.5 text-xs border border-slate-200 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-40"
          title={`Remove ${presets[0]}mL`}
        >
          −
        </button>
      </div>

      {/* Always-visible custom input */}
      <div className="flex gap-2 items-center">
        <input
          type="number"
          value={customMl}
          onChange={e => setCustomMl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addCustom()}
          placeholder="Custom amount"
          min={1}
          className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
        />
        <span className="text-sm text-slate-400 shrink-0">mL</span>
        <button
          onClick={addCustom}
          disabled={!customMl || parseInt(customMl) <= 0}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0"
        >
          Add
        </button>
      </div>
    </div>
  );
}

// ─── Food Search Panel ────────────────────────────────────────────────────────

function FoodSearchPanel({
  onSelect,
  pinnedFoods,
}: {
  onSelect: (food: FoodResult) => void;
  pinnedFoods?: FoodResult[];
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodResult[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim()) { setResults([]); setLoading(false); return; }

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/food-search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  // Pinned (previously-used) foods — show all when query is empty, or filtered matches when typing
  const pinnedMatching: FoodResult[] = pinnedFoods
    ? query.trim()
      ? pinnedFoods.filter(f => f.name.toLowerCase().includes(query.toLowerCase()))
      : pinnedFoods
    : [];

  // Exclude pinned from API results to avoid duplicates
  const otherResults = results.filter(r => !pinnedMatching.some(p => p.name === r.name));

  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="搜索食物（如：牛奶、咖啡、鸡蛋）"
        autoFocus
        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100"
      />
      {loading && <p className="text-xs text-slate-400 text-center mt-3">Searching...</p>}

      {pinnedMatching.length > 0 && (
        <div className="mt-2 space-y-1">
          {!query.trim() && (
            <p className="text-[10px] font-medium text-slate-400 px-1 mb-1 uppercase tracking-wide">Previously added</p>
          )}
          {pinnedMatching.map((r, i) => (
            <button
              key={i}
              onClick={() => onSelect(r)}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-emerald-100 border border-emerald-100 bg-emerald-50/60 transition-colors"
            >
              <p className="text-sm text-slate-700 font-medium leading-tight truncate">{r.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {r.kcalPer100g} kcal · P {r.proteinPer100g}g · C {r.carbsPer100g}g · F {r.fatPer100g}g
                <span className="text-slate-300 ml-1">(per 100g)</span>
              </p>
            </button>
          ))}
          {otherResults.length > 0 && <div className="border-t border-slate-100 my-1" />}
        </div>
      )}

      {otherResults.length > 0 && (
        <div className={`${pinnedMatching.length === 0 ? 'mt-2' : ''} space-y-1 max-h-44 overflow-y-auto`}>
          {otherResults.map((r, i) => (
            <button
              key={i}
              onClick={() => onSelect(r)}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-emerald-50 border border-slate-100 transition-colors"
            >
              <p className="text-sm text-slate-700 font-medium leading-tight truncate">{r.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {r.kcalPer100g} kcal · P {r.proteinPer100g}g · C {r.carbsPer100g}g · F {r.fatPer100g}g
                <span className="text-slate-300 ml-1">(per 100g)</span>
              </p>
            </button>
          ))}
        </div>
      )}

      {!loading && query.trim() && pinnedMatching.length === 0 && results.length === 0 && (
        <p className="text-xs text-slate-400 text-center mt-3">
          No results — try Manual tab to enter nutrition directly.
        </p>
      )}
    </div>
  );
}

// ─── Add / Edit Food Modal ────────────────────────────────────────────────────

type ModalTab = 'search' | 'recipe' | 'manual';

function AddFoodModal({
  mealLabel, onAdd, onClose, initialFood, isEditing,
}: {
  mealLabel: string;
  onAdd: (food: FoodEntry) => void;
  onClose: () => void;
  initialFood?: FoodEntry;
  isEditing?: boolean;
}) {
  const [tab, setTab] = useState<ModalTab>(isEditing ? 'manual' : 'search');

  const TAB_LABELS: Record<ModalTab, string> = {
    search: 'Search',
    recipe: 'Recipe',
    manual: 'Manual',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <h3 className="font-semibold text-slate-800">
            {isEditing ? `Edit — ${mealLabel}` : `Add to ${mealLabel}`}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
        </div>

        <div className="flex border-b border-slate-100 px-6 shrink-0">
          {(Object.keys(TAB_LABELS) as ModalTab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-2.5 mr-5 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {tab === 'search' && <SearchTab  mealLabel={mealLabel} onAdd={onAdd} />}
          {tab === 'recipe' && <RecipeTab  mealLabel={mealLabel} onAdd={onAdd} />}
          {tab === 'manual' && (
            <ManualTab
              mealLabel={mealLabel}
              onAdd={onAdd}
              initialFood={initialFood}
              isEditing={isEditing}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Search Tab ───────────────────────────────────────────────────────────────

function SearchTab({ mealLabel, onAdd }: { mealLabel: string; onAdd: (f: FoodEntry) => void }) {
  const [selected, setSelected] = useState<FoodResult | null>(null);
  const [amount, setAmount] = useState('100');

  const amtNum = parseFloat(amount) || 0;
  const preview = selected && amtNum > 0
    ? {
        calories: Math.round(selected.kcalPer100g * amtNum / 100),
        protein:  +(selected.proteinPer100g * amtNum / 100).toFixed(1),
        carbs:    +(selected.carbsPer100g   * amtNum / 100).toFixed(1),
        fat:      +(selected.fatPer100g     * amtNum / 100).toFixed(1),
      }
    : null;

  const handleAdd = () => {
    if (!selected || !preview || amtNum <= 0) return;
    onAdd({ id: genId(), name: selected.name, amount: amtNum, ...preview });
  };

  if (!selected) return <FoodSearchPanel onSelect={setSelected} />;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 mt-0.5 shrink-0">←</button>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 leading-tight">{selected.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{selected.kcalPer100g} kcal per 100g</p>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-slate-500 mb-1 block">Amount (g)</label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          min={0}
          autoFocus
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100"
        />
      </div>
      {preview && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 grid grid-cols-4 gap-2 text-center">
          <div><p className="text-xs font-bold text-emerald-700">{preview.calories}</p><p className="text-xs text-emerald-500">kcal</p></div>
          <div><p className="text-xs font-bold text-blue-600">{preview.protein}g</p><p className="text-xs text-blue-400">protein</p></div>
          <div><p className="text-xs font-bold text-yellow-600">{preview.carbs}g</p><p className="text-xs text-yellow-400">carbs</p></div>
          <div><p className="text-xs font-bold text-red-500">{preview.fat}g</p><p className="text-xs text-red-300">fat</p></div>
        </div>
      )}
      <button
        onClick={handleAdd}
        disabled={amtNum <= 0}
        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
      >
        Add to {mealLabel}
      </button>
    </div>
  );
}

// ─── Recipe Tab ───────────────────────────────────────────────────────────────

interface Ingredient { food: FoodResult; amount: number; }
type RecipeStep = 'building' | 'searching' | 'amounting';

function RecipeTab({ mealLabel, onAdd }: { mealLabel: string; onAdd: (f: FoodEntry) => void }) {
  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [step, setStep] = useState<RecipeStep>('building');
  const [pendingFood, setPendingFood] = useState<FoodResult | null>(null);
  const [pendingAmount, setPendingAmount] = useState('100');

  const totals = ingredients.reduce(
    (acc, { food, amount }) => {
      const f = amount / 100;
      return {
        calories: acc.calories + food.kcalPer100g * f,
        protein:  acc.protein  + food.proteinPer100g * f,
        carbs:    acc.carbs    + food.carbsPer100g * f,
        fat:      acc.fat      + food.fatPer100g * f,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const confirmIngredient = () => {
    if (!pendingFood) return;
    setIngredients(prev => [...prev, { food: pendingFood, amount: parseFloat(pendingAmount) || 100 }]);
    setPendingFood(null);
    setPendingAmount('100');
    setStep('building');
  };

  if (step === 'searching') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <button onClick={() => { setStep('building'); setPendingFood(null); }} className="text-slate-400 hover:text-slate-600">←</button>
          <p className="text-sm font-medium text-slate-600">Search Ingredient</p>
        </div>
        <FoodSearchPanel onSelect={food => { setPendingFood(food); setStep('amounting'); }} />
      </div>
    );
  }

  if (step === 'amounting' && pendingFood) {
    const amtNum = parseFloat(pendingAmount) || 0;
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-2">
          <button onClick={() => setStep('searching')} className="text-slate-400 hover:text-slate-600 mt-0.5 shrink-0">←</button>
          <div>
            <p className="text-sm font-semibold text-slate-800 leading-tight">{pendingFood.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{pendingFood.kcalPer100g} kcal per 100g</p>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Amount (g)</label>
          <input
            type="number"
            value={pendingAmount}
            onChange={e => setPendingAmount(e.target.value)}
            min={0}
            autoFocus
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100"
          />
        </div>
        {amtNum > 0 && (
          <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
            = {Math.round(pendingFood.kcalPer100g * amtNum / 100)} kcal
            · P {(pendingFood.proteinPer100g * amtNum / 100).toFixed(1)}g
            · C {(pendingFood.carbsPer100g * amtNum / 100).toFixed(1)}g
            · F {(pendingFood.fatPer100g * amtNum / 100).toFixed(1)}g
          </p>
        )}
        <div className="flex gap-2">
          <button
            onClick={confirmIngredient}
            disabled={amtNum <= 0}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-100 disabled:text-slate-400 text-white font-medium py-2 rounded-lg text-sm"
          >
            Add
          </button>
          <button
            onClick={() => { setStep('building'); setPendingFood(null); setPendingAmount('100'); }}
            className="flex-1 border border-slate-200 text-slate-500 hover:bg-slate-50 py-2 rounded-lg text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-slate-500 mb-1 block">Recipe Name</label>
        <input
          value={recipeName}
          onChange={e => setRecipeName(e.target.value)}
          placeholder="如：拿铁咖啡、蛋白奶昔"
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100"
        />
      </div>

      {ingredients.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500">Ingredients</p>
          {ingredients.map((ing, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
              <p className="flex-1 text-sm text-slate-700 truncate">{ing.food.name}</p>
              <input
                type="number"
                value={ing.amount}
                onChange={e => {
                  const copy = [...ingredients];
                  copy[i] = { ...ing, amount: parseFloat(e.target.value) || 0 };
                  setIngredients(copy);
                }}
                min={0}
                className="w-16 text-center border border-slate-200 rounded px-1 py-1 text-xs focus:outline-none focus:border-emerald-400"
              />
              <span className="text-xs text-slate-400">g</span>
              <button
                onClick={() => setIngredients(prev => prev.filter((_, j) => j !== i))}
                className="text-slate-300 hover:text-red-400 text-base leading-none ml-1"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setStep('searching')}
        className="w-full border-2 border-dashed border-slate-200 hover:border-emerald-300 text-slate-400 hover:text-emerald-500 py-2.5 rounded-lg text-sm font-medium transition-colors"
      >
        + Add Ingredient
      </button>

      {ingredients.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 grid grid-cols-4 gap-2 text-center">
          <div><p className="text-xs font-bold text-emerald-700">{Math.round(totals.calories)}</p><p className="text-xs text-emerald-500">kcal</p></div>
          <div><p className="text-xs font-bold text-blue-600">{totals.protein.toFixed(1)}g</p><p className="text-xs text-blue-400">protein</p></div>
          <div><p className="text-xs font-bold text-yellow-600">{totals.carbs.toFixed(1)}g</p><p className="text-xs text-yellow-400">carbs</p></div>
          <div><p className="text-xs font-bold text-red-500">{totals.fat.toFixed(1)}g</p><p className="text-xs text-red-300">fat</p></div>
        </div>
      )}

      <button
        onClick={() => {
          if (!recipeName.trim() || ingredients.length === 0) return;
          onAdd({
            id: genId(),
            name: recipeName.trim(),
            amount: Math.round(ingredients.reduce((s, { amount }) => s + amount, 0)),
            calories: Math.round(totals.calories),
            protein: +totals.protein.toFixed(1),
            carbs: +totals.carbs.toFixed(1),
            fat: +totals.fat.toFixed(1),
          });
        }}
        disabled={!recipeName.trim() || ingredients.length === 0}
        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
      >
        Add to {mealLabel}
      </button>
    </div>
  );
}

// ─── Manual Tab (with optional ingredients) ───────────────────────────────────

type IngStep = 'idle' | 'searching' | 'amounting';

function ManualTab({
  mealLabel, onAdd, initialFood, isEditing,
}: {
  mealLabel: string;
  onAdd: (f: FoodEntry) => void;
  initialFood?: FoodEntry;
  isEditing?: boolean;
}) {
  const [name, setName] = useState(initialFood?.name ?? '');
  const [amount, setAmount] = useState(String(initialFood?.amount ?? 100));
  const [calories, setCalories] = useState(String(initialFood?.calories ?? ''));
  const [protein, setProtein] = useState(String(initialFood?.protein ?? ''));
  const [carbs, setCarbs] = useState(String(initialFood?.carbs ?? ''));
  const [fat, setFat] = useState(String(initialFood?.fat ?? ''));

  const [ingredients, setIngredients] = useState<FoodIngredient[]>(initialFood?.ingredients ?? []);
  const [ingStep, setIngStep] = useState<IngStep>('idle');
  const [pendingFood, setPendingFood] = useState<FoodResult | null>(null);
  const [pendingAmount, setPendingAmount] = useState('100');

  // Recalculate nutrition totals from ingredients list
  const recalcFromIngredients = (ings: FoodIngredient[]) => {
    if (ings.length === 0) return;
    const t = ings.reduce(
      (acc, ing) => {
        const f = ing.amount / 100;
        return {
          calories: acc.calories + ing.kcalPer100g * f,
          protein:  acc.protein  + ing.proteinPer100g * f,
          carbs:    acc.carbs    + ing.carbsPer100g * f,
          fat:      acc.fat      + ing.fatPer100g * f,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    setCalories(String(Math.round(t.calories)));
    setProtein(String(+t.protein.toFixed(1)));
    setCarbs(String(+t.carbs.toFixed(1)));
    setFat(String(+t.fat.toFixed(1)));
    setAmount(String(Math.round(ings.reduce((s, i) => s + i.amount, 0))));
  };

  const confirmIngredient = () => {
    if (!pendingFood) return;
    const newIng: FoodIngredient = {
      name: pendingFood.name,
      amount: parseFloat(pendingAmount) || 100,
      kcalPer100g: pendingFood.kcalPer100g,
      proteinPer100g: pendingFood.proteinPer100g,
      carbsPer100g: pendingFood.carbsPer100g,
      fatPer100g: pendingFood.fatPer100g,
    };
    const newIngs = [...ingredients, newIng];
    setIngredients(newIngs);
    recalcFromIngredients(newIngs);
    setPendingFood(null);
    setPendingAmount('100');
    setIngStep('idle');
  };

  const removeIngredient = (idx: number) => {
    const newIngs = ingredients.filter((_, j) => j !== idx);
    setIngredients(newIngs);
    if (newIngs.length > 0) recalcFromIngredients(newIngs);
  };

  const updateIngredientAmount = (idx: number, newAmt: number) => {
    const newIngs = ingredients.map((ing, j) => j === idx ? { ...ing, amount: newAmt } : ing);
    setIngredients(newIngs);
    recalcFromIngredients(newIngs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !calories) return;
    onAdd({
      id: initialFood?.id ?? genId(),
      name: name.trim(),
      amount: parseFloat(amount) || 100,
      calories: parseFloat(calories) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      ingredients: ingredients.length > 0 ? ingredients : undefined,
    });
  };

  // Ingredient search step: searching
  if (ingStep === 'searching') {
    const pinnedFoods: FoodResult[] = ingredients.map(ing => ({
      name: ing.name,
      kcalPer100g: ing.kcalPer100g,
      proteinPer100g: ing.proteinPer100g,
      carbsPer100g: ing.carbsPer100g,
      fatPer100g: ing.fatPer100g,
    }));
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <button onClick={() => { setIngStep('idle'); setPendingFood(null); }} className="text-slate-400 hover:text-slate-600">←</button>
          <p className="text-sm font-medium text-slate-600">Search Ingredient</p>
        </div>
        <FoodSearchPanel
          onSelect={food => { setPendingFood(food); setIngStep('amounting'); }}
          pinnedFoods={pinnedFoods.length > 0 ? pinnedFoods : undefined}
        />
      </div>
    );
  }

  // Ingredient amount step
  if (ingStep === 'amounting' && pendingFood) {
    const amtNum = parseFloat(pendingAmount) || 0;
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-2">
          <button onClick={() => setIngStep('searching')} className="text-slate-400 hover:text-slate-600 mt-0.5 shrink-0">←</button>
          <div>
            <p className="text-sm font-semibold text-slate-800 leading-tight">{pendingFood.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{pendingFood.kcalPer100g} kcal per 100g</p>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Amount (g)</label>
          <input
            type="number"
            value={pendingAmount}
            onChange={e => setPendingAmount(e.target.value)}
            min={0}
            autoFocus
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100"
          />
        </div>
        {amtNum > 0 && (
          <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
            = {Math.round(pendingFood.kcalPer100g * amtNum / 100)} kcal
            · P {(pendingFood.proteinPer100g * amtNum / 100).toFixed(1)}g
            · C {(pendingFood.carbsPer100g * amtNum / 100).toFixed(1)}g
            · F {(pendingFood.fatPer100g * amtNum / 100).toFixed(1)}g
          </p>
        )}
        <div className="flex gap-2">
          <button
            onClick={confirmIngredient}
            disabled={amtNum <= 0}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-100 disabled:text-slate-400 text-white font-medium py-2 rounded-lg text-sm"
          >
            Add
          </button>
          <button
            onClick={() => { setIngStep('idle'); setPendingFood(null); setPendingAmount('100'); }}
            className="flex-1 border border-slate-200 text-slate-500 hover:bg-slate-50 py-2 rounded-lg text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Food Name */}
      <div>
        <label className="text-xs font-medium text-slate-500 mb-1 block">Food Name *</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="如：鸡胸肉"
          required
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100"
        />
      </div>

      {/* Ingredients */}
      <div className="space-y-2">
        {ingredients.map((ing, i) => (
          <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
            <p className="flex-1 text-xs text-slate-700 truncate">{ing.name}</p>
            <input
              type="number"
              value={ing.amount}
              onChange={e => updateIngredientAmount(i, parseFloat(e.target.value) || 0)}
              min={0}
              step="0.01"
              className="w-14 text-center border border-slate-200 rounded px-1 py-1 text-xs focus:outline-none focus:border-emerald-400"
            />
            <span className="text-xs text-slate-400">g</span>
            <button
              type="button"
              onClick={() => removeIngredient(i)}
              className="text-slate-300 hover:text-red-400 text-base leading-none"
            >
              ×
            </button>
          </div>
        ))}
        {ingredients.length > 0 && (
          <p className="text-xs text-slate-400 pt-0.5">
            Nutrition auto-calculated from ingredients — you can still edit manually.
          </p>
        )}
        <button
          type="button"
          onClick={() => setIngStep('searching')}
          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors"
        >
          + Add Ingredient
        </button>
      </div>

      {/* Amount + Calories */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Amount (g)</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            min={0}
            step="0.01"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Calories (kcal) *</label>
          <input
            type="number"
            value={calories}
            onChange={e => setCalories(e.target.value)}
            placeholder="0"
            min={0}
            step="0.01"
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100"
          />
        </div>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Protein (g)</label>
          <input type="number" value={protein} onChange={e => setProtein(e.target.value)} placeholder="0" min={0} step="0.01" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Carbs (g)</label>
          <input type="number" value={carbs} onChange={e => setCarbs(e.target.value)} placeholder="0" min={0} step="0.01" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Fat (g)</label>
          <input type="number" value={fat} onChange={e => setFat(e.target.value)} placeholder="0" min={0} step="0.01" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400" />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
      >
        {isEditing ? 'Save Changes' : `Add to ${mealLabel}`}
      </button>
    </form>
  );
}

// ─── Nutrient Stat ────────────────────────────────────────────────────────────

function NutrientStat({
  label, value, max, unit, textColor,
}: {
  label: string; value: number; max: number; unit: string; textColor: string;
}) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 999) : 0;
  const display = unit === 'kcal' ? value.toFixed(0) : value.toFixed(1);
  return (
    <div className="text-center">
      <p className={`text-xl font-bold ${textColor}`}>{display}</p>
      <p className="text-xs text-slate-400">{unit}</p>
      <p className="text-xs text-slate-300 mt-0.5">{pct}%</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

// ─── Goals Modal ──────────────────────────────────────────────────────────────

const GOAL_FIELDS: { key: keyof NutritionGoals; label: string }[] = [
  { key: 'calories', label: 'Daily Calories (kcal)' },
  { key: 'protein',  label: 'Protein Goal (g)' },
  { key: 'carbs',    label: 'Carbs Goal (g)' },
  { key: 'fat',      label: 'Fat Goal (g)' },
];

function GoalsModal({
  goalsByType, onSaveAll, onClose,
}: {
  goalsByType: GoalsByType;
  onSaveAll: (g: GoalsByType) => void;
  onClose: () => void;
}) {
  const [activeType, setActiveType] = useState<DayType>('medium');
  const [draft, setDraft] = useState<GoalsByType>({ ...goalsByType });

  const updateField = (field: keyof NutritionGoals, value: string) => {
    setDraft(prev => ({
      ...prev,
      [activeType]: { ...prev[activeType], [field]: parseFloat(value) || 0 },
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <h3 className="font-semibold text-slate-800">Daily Nutrition Goals</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
        </div>

        <div className="flex border-b border-slate-100 px-4 shrink-0">
          {(Object.keys(DAY_TYPE_CONFIG) as DayType[]).map(type => {
            const cfg = DAY_TYPE_CONFIG[type];
            return (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`flex items-center gap-1 py-2.5 px-2 mr-1 text-xs font-medium border-b-2 transition-colors ${
                  activeType === type
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {cfg.icon} {cfg.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {GOAL_FIELDS.map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs font-medium text-slate-500 mb-1 block">{label}</label>
              <input
                type="number"
                value={draft[activeType][key]}
                onChange={e => updateField(key, e.target.value)}
                min={0}
                step="0.01"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100"
              />
            </div>
          ))}
        </div>

        <div className="px-6 pb-5 shrink-0">
          <button
            onClick={() => onSaveAll(draft)}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            Save All
          </button>
        </div>
      </div>
    </div>
  );
}
