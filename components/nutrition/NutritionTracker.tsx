"use client";

import { useState, useMemo } from "react";
import { FoodLog, MacroTargets } from "@/lib/types";
import { useLocalStorage } from "@/lib/useLocalStorage";

const FOOD_PRESETS = [
  { name: "鸡胸肉 Chicken Breast",        protein: 31,   carbs: 0,    fat: 3.6  },
  { name: "三文鱼 Salmon",                protein: 25,   carbs: 0,    fat: 8.7  },
  { name: "鸡蛋 Egg",                     protein: 12.5, carbs: 0.6,  fat: 10.3 },
  { name: "牛肉末 Beef Mince 5%",         protein: 26,   carbs: 0,    fat: 7.5  },
  { name: "金枪鱼罐头 Tuna (water)",       protein: 26,   carbs: 0,    fat: 0.9  },
  { name: "豆腐 Firm Tofu",               protein: 8,    carbs: 2,    fat: 4    },
  { name: "希腊酸奶 Greek Yoghurt",       protein: 9,    carbs: 3.8,  fat: 5    },
  { name: "燕麦 Oats",                    protein: 11,   carbs: 60,   fat: 7    },
  { name: "糙米 Brown Rice (cooked)",     protein: 2.6,  carbs: 23,   fat: 0.9  },
  { name: "白米饭 White Rice (cooked)",   protein: 2.7,  carbs: 28,   fat: 0.3  },
  { name: "红薯 Sweet Potato",            protein: 2,    carbs: 20.7, fat: 0.1  },
  { name: "西兰花 Broccoli",              protein: 3,    carbs: 5,    fat: 0.4  },
  { name: "花生酱 Peanut Butter",         protein: 25,   carbs: 13,   fat: 51   },
  { name: "核桃 Walnuts",                 protein: 15,   carbs: 14,   fat: 65   },
  { name: "全脂牛奶 Whole Milk",           protein: 3.2,  carbs: 4.7,  fat: 3.7  },
];

const DEFAULT_TARGETS: MacroTargets = { protein: 160, carbs: 220, fat: 65 };

function todayStr() { return new Date().toISOString().split("T")[0]; }
function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
function calcMacros(e: FoodLog) {
  const r = e.grams / 100;
  const protein = Math.round(e.proteinPer100 * r * 10) / 10;
  const carbs   = Math.round(e.carbsPer100   * r * 10) / 10;
  const fat     = Math.round(e.fatPer100     * r * 10) / 10;
  return { protein, carbs, fat, calories: Math.round(protein * 4 + carbs * 4 + fat * 9) };
}

function MacroBar({ label, value, target, barColor }: { label: string; value: number; target: number; barColor: string }) {
  const pct = Math.min(100, (value / target) * 100);
  const over = value > target;
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
        <span className={`text-sm tabular-nums ${over ? "text-red-500 font-bold" : "text-gray-500 dark:text-gray-400"}`}>{value.toFixed(1)} g / {target} g</span>
      </div>
      <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${over ? "bg-red-500" : barColor}`} style={{ width: `${pct.toFixed(1)}%` }} />
      </div>
      <div className="text-right text-xs text-gray-400 mt-0.5">{Math.round(pct)}%</div>
    </div>
  );
}

const SAMPLE_LOGS: FoodLog[] = [
  { id: "s1", date: todayStr(), name: "燕麦 Oats",               grams: 100, proteinPer100: 11,  carbsPer100: 60,  fatPer100: 7   },
  { id: "s2", date: todayStr(), name: "鸡胸肉 Chicken Breast",   grams: 200, proteinPer100: 31,  carbsPer100: 0,   fatPer100: 3.6 },
  { id: "s3", date: todayStr(), name: "糙米 Brown Rice (cooked)", grams: 150, proteinPer100: 2.6, carbsPer100: 23, fatPer100: 0.9 },
  { id: "s4", date: todayStr(), name: "希腊酸奶 Greek Yoghurt",  grams: 200, proteinPer100: 9,   carbsPer100: 3.8, fatPer100: 5   },
];

const EMPTY_FORM = { name: "", grams: "", protein: "", carbs: "", fat: "" };

export default function NutritionTracker() {
  const [logs,    setLogs,    hydrated]        = useLocalStorage<FoodLog[]>("fittrack-nutrition", SAMPLE_LOGS);
  const [targets, setTargets, targetsHydrated] = useLocalStorage<MacroTargets>("fittrack-targets", DEFAULT_TARGETS);
  const [viewDate, setViewDate] = useState(todayStr);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [preset, setPreset]     = useState("");
  const [error, setError]       = useState("");
  const [editTargets, setEditTargets]   = useState(false);
  const [draftTargets, setDraftTargets] = useState(DEFAULT_TARGETS);

  function applyPreset(name: string) {
    const p = FOOD_PRESETS.find((f) => f.name === name);
    if (!p) return;
    setPreset(name);
    setForm((f) => ({ ...f, name: p.name, protein: String(p.protein), carbs: String(p.carbs), fat: String(p.fat) }));
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const g = parseFloat(form.grams), p = parseFloat(form.protein), c = parseFloat(form.carbs), fa = parseFloat(form.fat);
    if (!form.name || isNaN(g) || g <= 0 || isNaN(p) || isNaN(c) || isNaN(fa)) {
      setError("请填写食物名称、克数及每 100 g 的蛋白质 / 碳水 / 脂肪"); return;
    }
    setError("");
    setLogs((prev) => [{ id: uid(), date: viewDate, name: form.name, grams: g, proteinPer100: p, carbsPer100: c, fatPer100: fa }, ...prev]);
    setForm(EMPTY_FORM); setPreset("");
  }

  function del(id: string) { setLogs((prev) => prev.filter((l) => l.id !== id)); }

  const todayLogs     = useMemo(() => logs.filter((l) => l.date === viewDate), [logs, viewDate]);
  const totals        = useMemo(() => todayLogs.reduce(
    (acc, e) => { const m = calcMacros(e); return { protein: Math.round((acc.protein + m.protein) * 10) / 10, carbs: Math.round((acc.carbs + m.carbs) * 10) / 10, fat: Math.round((acc.fat + m.fat) * 10) / 10, calories: acc.calories + m.calories }; },
    { protein: 0, carbs: 0, fat: 0, calories: 0 }
  ), [todayLogs]);
  const calorieTarget = Math.round(targets.protein * 4 + targets.carbs * 4 + targets.fat * 9);
  const uniqueDates   = useMemo(() => [...new Set(logs.map((l) => l.date))].sort((a, b) => b.localeCompare(a)), [logs]);

  if (!hydrated || !targetsHydrated) return (
    <div className="animate-pulse space-y-4">
      <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-xl" />
      <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-xl" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">宏量营养汇总</h2>
            <select value={viewDate} onChange={(e) => setViewDate(e.target.value)}
              className="mt-1 text-sm text-indigo-600 dark:text-indigo-400 bg-transparent border-none focus:outline-none cursor-pointer">
              {!uniqueDates.includes(todayStr()) && <option value={todayStr()}>{todayStr()} (今天)</option>}
              {uniqueDates.map((d) => <option key={d} value={d}>{d}{d === todayStr() ? " (今天)" : ""}</option>)}
            </select>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">{totals.calories}</p>
            <p className="text-xs text-gray-400">/ {calorieTarget} kcal 目标</p>
            <button onClick={() => { setDraftTargets(targets); setEditTargets(true); }}
              className="text-xs text-gray-400 hover:text-indigo-500 transition-colors mt-1 underline underline-offset-2">修改目标</button>
          </div>
        </div>
        <div className="space-y-4">
          <MacroBar label="蛋白质 Protein" value={totals.protein} target={targets.protein} barColor="bg-blue-500" />
          <MacroBar label="碳水化合物 Carbs" value={totals.carbs}   target={targets.carbs}   barColor="bg-amber-400" />
          <MacroBar label="脂肪 Fat"         value={totals.fat}     target={targets.fat}     barColor="bg-rose-400" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full font-medium">P {totals.protein.toFixed(1)} g</span>
          <span className="inline-flex items-center gap-1 text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300 px-3 py-1 rounded-full font-medium">C {totals.carbs.toFixed(1)} g</span>
          <span className="inline-flex items-center gap-1 text-xs bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-300 px-3 py-1 rounded-full font-medium">F {totals.fat.toFixed(1)} g</span>
          <span className="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full font-medium">{totals.calories} kcal</span>
        </div>
      </div>

      {/* Target modal */}
      {editTargets && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">修改每日宏量目标</h3>
            <div className="space-y-3">
              {(["protein", "carbs", "fat"] as const).map((key) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    {key === "protein" ? "蛋白质 Protein (g)" : key === "carbs" ? "碳水 Carbs (g)" : "脂肪 Fat (g)"}
                  </label>
                  <input type="number" min="0" value={draftTargets[key]}
                    onChange={(e) => setDraftTargets((d) => ({ ...d, [key]: parseInt(e.target.value) || 0 }))}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              ))}
              <p className="text-xs text-gray-400">热量目标：{Math.round(draftTargets.protein * 4 + draftTargets.carbs * 4 + draftTargets.fat * 9)} kcal</p>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setTargets(draftTargets); setEditTargets(false); }}
                className="flex-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm font-semibold transition-colors">保存</button>
              <button onClick={() => setEditTargets(false)}
                className="flex-1 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">取消</button>
            </div>
          </div>
        </div>
      )}

      {/* Add form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">添加食物</h2>
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 mb-2">常用食物（点击自动填入宏量数据）</p>
          <div className="flex flex-wrap gap-2">
            {FOOD_PRESETS.map((p) => (
              <button key={p.name} type="button" onClick={() => applyPreset(p.name)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  preset === p.name ? "bg-indigo-600 border-indigo-600 text-white" : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600"
                }`}>{p.name.split(" ")[0]}</button>
            ))}
          </div>
        </div>
        <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 items-end">
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">食物名称</label>
            <input type="text" value={form.name} placeholder="如：鸡胸肉" onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-blue-500 mb-1">蛋白质 / 100 g</label>
            <input type="number" min="0" step="0.1" value={form.protein} placeholder="31" onChange={(e) => setForm((f) => ({ ...f, protein: e.target.value }))}
              className="w-full rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-amber-500 mb-1">碳水 / 100 g</label>
            <input type="number" min="0" step="0.1" value={form.carbs} placeholder="0" onChange={(e) => setForm((f) => ({ ...f, carbs: e.target.value }))}
              className="w-full rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-rose-500 mb-1">脂肪 / 100 g</label>
            <input type="number" min="0" step="0.1" value={form.fat} placeholder="3.6" onChange={(e) => setForm((f) => ({ ...f, fat: e.target.value }))}
              className="w-full rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-900/10 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">实际克数 (g)</label>
            <input type="number" min="1" value={form.grams} placeholder="200" onChange={(e) => setForm((f) => ({ ...f, grams: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <button type="submit" className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-4 py-2 text-sm font-semibold transition-colors">+ 添加</button>
          </div>
        </form>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </div>

      {/* Log table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">饮食记录 — {viewDate}</h2>
        </div>
        {todayLogs.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-12">今日暂无记录，点击上方快速选择食物开始吧！</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/60">
                <tr>{["食物", "克数", "蛋白质", "碳水", "脂肪", "热量", ""].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {todayLogs.map((entry) => {
                  const m = calcMacros(entry);
                  return (
                    <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{entry.name}</td>
                      <td className="px-4 py-3 text-gray-500 tabular-nums">{entry.grams} g</td>
                      <td className="px-4 py-3 text-blue-600 dark:text-blue-400 font-semibold tabular-nums">{m.protein} g</td>
                      <td className="px-4 py-3 text-amber-600 dark:text-amber-400 font-semibold tabular-nums">{m.carbs} g</td>
                      <td className="px-4 py-3 text-rose-600 dark:text-rose-400 font-semibold tabular-nums">{m.fat} g</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-200 tabular-nums">{m.calories} kcal</td>
                      <td className="px-4 py-3"><button onClick={() => del(entry.id)} className="text-gray-300 hover:text-red-500 transition-colors text-xl leading-none" aria-label="删除">&times;</button></td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-gray-200 dark:border-gray-600">
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">合计</td>
                  <td className="px-4 py-3 text-gray-500 tabular-nums">{todayLogs.reduce((s, e) => s + e.grams, 0)} g</td>
                  <td className="px-4 py-3 text-blue-600 dark:text-blue-400 font-bold tabular-nums">{totals.protein.toFixed(1)} g</td>
                  <td className="px-4 py-3 text-amber-600 dark:text-amber-400 font-bold tabular-nums">{totals.carbs.toFixed(1)} g</td>
                  <td className="px-4 py-3 text-rose-600 dark:text-rose-400 font-bold tabular-nums">{totals.fat.toFixed(1)} g</td>
                  <td className="px-4 py-3 font-bold text-gray-900 dark:text-white tabular-nums">{totals.calories} kcal</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
