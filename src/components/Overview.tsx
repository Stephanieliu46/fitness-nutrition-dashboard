'use client';

import type { Store } from '@/lib/useStore';
import { sumNutrition, today } from '@/lib/useStore';
import type { Tab } from '@/app/page';
import { EXERCISES } from '@/lib/exercises';
import type { ExerciseCategory } from '@/lib/types';

interface OverviewProps {
  store: Store;
  onTabChange: (tab: Tab) => void;
}

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('-');
  });
}

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Color + short label per exercise category
const CAT_STYLE: Record<string, { bg: string; label: string }> = {
  chest:     { bg: 'bg-purple-100 text-purple-700', label: 'Back' },
  legs:      { bg: 'bg-blue-100 text-blue-700',     label: 'Legs' },
  shoulders: { bg: 'bg-orange-100 text-orange-700', label: 'Shoulders' },
  core:      { bg: 'bg-yellow-100 text-yellow-700', label: 'Core' },
  cardio:    { bg: 'bg-red-100 text-red-700',       label: 'Cardio' },
};

export default function Overview({ store, onTabChange }: OverviewProps) {
  const todayStr = today();
  const todayNutrition = sumNutrition(store.nutritionLog[todayStr]);
  const activeGoals = store.goalsByType[store.dayTypes[todayStr] ?? 'medium'];
  const last7Days = getLast7Days();

  const waterMl = store.waterLog[todayStr] ?? 0;
  const waterGoal = store.waterGoal;

  const caloriePct = Math.min(
    Math.round((todayNutrition.calories / activeGoals.calories) * 100),
    100
  );

  const hour = new Date().getHours();
  const greeting =
    hour < 6 ? 'Good night' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const dateLabel = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{greeting} 👋</h1>
        <p className="text-slate-500 text-sm mt-1">{dateLabel}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="🔥" label="Today's Calories" value={todayNutrition.calories.toFixed(0)} sub={`/ ${activeGoals.calories} kcal`} color="bg-orange-500" />
        <StatCard icon="🥩" label="Today's Protein"  value={todayNutrition.protein.toFixed(1)}  sub={`/ ${activeGoals.protein} g`}    color="bg-blue-500" />
        <StatCard icon="💧" label="Today's Water"    value={waterMl.toString()}                  sub={`/ ${waterGoal} mL`}             color="bg-sky-400" />
        <StatCard icon="✅" label="Calorie Goal"     value={`${caloriePct}`}                    sub="%"                               color="bg-violet-500" />
      </div>

      {/* Weekly training grid + nutrition summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly muscle-group grid */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-700 mb-4">Weekly Training</h2>

          <div className="grid grid-cols-7 gap-2">
            {last7Days.map(dateStr => {
              const d = new Date(dateStr + 'T12:00:00');
              const isToday = dateStr === todayStr;
              const session = store.workoutSessions.find(s => s.date === dateStr);

              // Unique exercise categories trained that day
              const categories = session
                ? [
                    ...new Set(
                      session.exercises
                        .map(ex => EXERCISES.find(e => e.id === ex.exerciseId)?.category)
                        .filter((c): c is ExerciseCategory => !!c)
                    ),
                  ]
                : [];

              return (
                <div key={dateStr} className="flex flex-col items-center gap-1">
                  <p className={`text-[11px] font-semibold mb-1 ${isToday ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {WEEKDAY[d.getDay()]}
                  </p>
                  {categories.length > 0 ? (
                    categories.map(cat => {
                      const s = CAT_STYLE[cat];
                      return s ? (
                        <span
                          key={cat}
                          className={`text-[10px] px-1 py-0.5 rounded font-medium leading-tight text-center w-full ${s.bg}`}
                        >
                          {s.label}
                        </span>
                      ) : null;
                    })
                  ) : (
                    <div className="w-full h-5 rounded bg-slate-50 border border-dashed border-slate-100" />
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={() => onTabChange('workout')}
            className="mt-5 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Log Workout →
          </button>
        </div>

        {/* Today's nutrition progress */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col">
          <h2 className="font-semibold text-slate-700 mb-4">Today's Nutrition</h2>
          <div className="flex-1 space-y-3">
            <MacroBar label="Calories" value={todayNutrition.calories} max={activeGoals.calories} unit="kcal" barColor="bg-orange-400" />
            <MacroBar label="Protein"  value={todayNutrition.protein}  max={activeGoals.protein}  unit="g"    barColor="bg-blue-400" />
            <MacroBar label="Carbs"    value={todayNutrition.carbs}    max={activeGoals.carbs}    unit="g"    barColor="bg-yellow-400" />
            <MacroBar label="Fat"      value={todayNutrition.fat}      max={activeGoals.fat}      unit="g"    barColor="bg-red-400" />
          </div>
          <button
            onClick={() => onTabChange('nutrition')}
            className="mt-4 text-xs text-emerald-600 hover:text-emerald-700 font-medium text-left"
          >
            Log Nutrition →
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon, label, value, sub, color,
}: {
  icon: string; label: string; value: string; sub: string; color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
      <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center text-sm mb-3`}>
        {icon}
      </div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-slate-800">{value}</span>
        <span className="text-xs text-slate-400">{sub}</span>
      </div>
    </div>
  );
}

function MacroBar({
  label, value, max, unit, barColor,
}: {
  label: string; value: number; max: number; unit: string; barColor: string;
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{label}</span>
        <span>{value.toFixed(0)} / {max} {unit}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
