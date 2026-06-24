const todaysMeals = [
  { name: "Breakfast", items: ["Porridge with banana", "2 scrambled eggs"], calories: 520, protein: 28, carbs: 72, fat: 14 },
  { name: "Lunch",     items: ["Chicken breast", "Brown rice", "Broccoli"],   calories: 680, protein: 58, carbs: 74, fat: 12 },
  { name: "Dinner",   items: ["Salmon fillet", "Sweet potato", "Asparagus"],  calories: 640, protein: 56, carbs: 58, fat: 18 },
];
const totals = todaysMeals.reduce((acc, m) => ({ calories: acc.calories + m.calories, protein: acc.protein + m.protein, carbs: acc.carbs + m.carbs, fat: acc.fat + m.fat }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
const DAILY_TARGETS = { calories: 2400, protein: 180, carbs: 250, fat: 70 };

function MacroBar({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const pct = Math.min(100, Math.round((value / target) * 100));
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1"><span>{label}</span><span>{value}g / {target}g</span></div>
      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"><div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

export default function NutritionSummary() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">Today&apos;s Macros</span>
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{totals.calories} kcal</span>
        </div>
        <div className="space-y-2">
          <MacroBar label="Protein" value={totals.protein} target={DAILY_TARGETS.protein} color="bg-blue-500" />
          <MacroBar label="Carbs"   value={totals.carbs}   target={DAILY_TARGETS.carbs}   color="bg-amber-400" />
          <MacroBar label="Fat"     value={totals.fat}     target={DAILY_TARGETS.fat}     color="bg-rose-400" />
        </div>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {todaysMeals.map((meal) => (
          <div key={meal.name} className="px-4 py-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{meal.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{meal.items.join(" · ")}</p>
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{meal.calories} kcal</span>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4"><a href="/nutrition" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">View nutrition details &rarr;</a></div>
    </div>
  );
}
