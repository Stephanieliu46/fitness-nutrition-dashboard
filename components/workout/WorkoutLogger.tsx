"use client";

import { useState, useMemo } from "react";
import { WorkoutLog } from "@/lib/types";
import { useLocalStorage } from "@/lib/useLocalStorage";

const EXERCISES = [
  "臀推 Hip Thrust", "罗马尼亚硬拉 Romanian Deadlift", "传统硬拉 Deadlift",
  "深蹲 Back Squat", "前蹲 Front Squat", "卧推 Bench Press",
  "上斜卧推 Incline Press", "过头推举 Overhead Press", "引体向上 Pull-up",
  "杠铃划船 Barbell Row", "保加利亚分腿蹲 Bulgarian Split Squat",
  "腿举 Leg Press", "二头弯举 Bicep Curl", "三头下压 Tricep Pushdown",
];

function todayStr() { return new Date().toISOString().split("T")[0]; }
function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

const SAMPLE_LOGS: WorkoutLog[] = [
  { id: "s1", date: "2026-06-20", exercise: "臀推 Hip Thrust",              weightKg: 130, sets: 4, reps: 8,  notes: "" },
  { id: "s2", date: "2026-06-20", exercise: "传统硬拉 Deadlift",            weightKg: 115, sets: 3, reps: 5,  notes: "" },
  { id: "s3", date: "2026-06-22", exercise: "深蹲 Back Squat",             weightKg: 100, sets: 5, reps: 5,  notes: "感觉稳" },
  { id: "s4", date: "2026-06-22", exercise: "臀推 Hip Thrust",              weightKg: 135, sets: 4, reps: 8,  notes: "" },
  { id: "s5", date: "2026-06-24", exercise: "传统硬拉 Deadlift",            weightKg: 120, sets: 3, reps: 5,  notes: "新PR！" },
  { id: "s6", date: "2026-06-24", exercise: "卧推 Bench Press",             weightKg: 80,  sets: 4, reps: 6,  notes: "" },
  { id: "s7", date: "2026-06-24", exercise: "罗马尼亚硬拉 Romanian Deadlift", weightKg: 100, sets: 3, reps: 10, notes: "" },
];

const EMPTY_FORM = { date: todayStr(), exercise: EXERCISES[0], weightKg: "", sets: "", reps: "", notes: "" };

export default function WorkoutLogger() {
  const [logs, setLogs, hydrated] = useLocalStorage<WorkoutLog[]>("fittrack-workouts", SAMPLE_LOGS);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [filterDate, setFilterDate] = useState("all");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const wkg = parseFloat(form.weightKg), s = parseInt(form.sets), r = parseInt(form.reps);
    if (!form.exercise || isNaN(wkg) || wkg <= 0 || isNaN(s) || s <= 0 || isNaN(r) || r <= 0) {
      setError("请填写完整的动作、重量、组数和次数"); return;
    }
    setError("");
    setLogs((prev) => [{ id: uid(), date: form.date, exercise: form.exercise, weightKg: wkg, sets: s, reps: r, notes: form.notes }, ...prev]);
    setForm((f) => ({ ...f, weightKg: "", sets: "", reps: "", notes: "" }));
  }

  function del(id: string) { setLogs((prev) => prev.filter((l) => l.id !== id)); }

  const prs = useMemo(() => {
    const m: Record<string, { weight: number; date: string }> = {};
    for (const l of logs) {
      if (!m[l.exercise] || l.weightKg > m[l.exercise].weight) m[l.exercise] = { weight: l.weightKg, date: l.date };
    }
    return m;
  }, [logs]);

  const progressByExercise = useMemo(() => {
    const map: Record<string, WorkoutLog[]> = {};
    for (const l of [...logs].sort((a, b) => b.date.localeCompare(a.date))) {
      if (!map[l.exercise]) map[l.exercise] = [];
      if (map[l.exercise].length < 2 && !map[l.exercise].find((x) => x.date === l.date)) map[l.exercise].push(l);
    }
    return map;
  }, [logs]);

  const uniqueDates = useMemo(() => [...new Set(logs.map((l) => l.date))].sort((a, b) => b.localeCompare(a)), [logs]);
  const visibleLogs  = useMemo(() => {
    const src = filterDate === "all" ? logs : logs.filter((l) => l.date === filterDate);
    return [...src].sort((a, b) => b.date.localeCompare(a.date) || a.exercise.localeCompare(b.exercise));
  }, [logs, filterDate]);
  const todayLogs = useMemo(() => logs.filter((l) => l.date === form.date), [logs, form.date]);

  if (!hydrated) return (
    <div className="animate-pulse space-y-4">
      <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-xl" />
      <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-xl" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">记录训练</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 items-end">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">日期</label>
            <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="col-span-2 sm:col-span-2 lg:col-span-2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">动作</label>
            <select value={form.exercise} onChange={(e) => setForm((f) => ({ ...f, exercise: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {EXERCISES.map((ex) => <option key={ex} value={ex}>{ex}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">重量 (kg)</label>
            <input type="number" min="0" step="2.5" value={form.weightKg} placeholder="100"
              onChange={(e) => setForm((f) => ({ ...f, weightKg: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">组数</label>
            <input type="number" min="1" value={form.sets} placeholder="4"
              onChange={(e) => setForm((f) => ({ ...f, sets: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">次数</label>
            <input type="number" min="1" value={form.reps} placeholder="8"
              onChange={(e) => setForm((f) => ({ ...f, reps: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="col-span-2 lg:col-span-5">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">备注（可选）</label>
            <input type="text" value={form.notes} placeholder="如：感觉很稳，下次加重 2.5 kg"
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <button type="submit" className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-4 py-2 text-sm font-semibold transition-colors">+ 添加</button>
          </div>
        </form>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </div>

      {/* Today */}
      {todayLogs.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">今日训练 <span className="ml-2 text-xs font-normal text-gray-400">({form.date})</span></h2>
          <div className="space-y-2">
            {todayLogs.map((log) => {
              const isPR = prs[log.exercise]?.weight === log.weightKg;
              return (
                <div key={log.id} className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                  isPR ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700" : "bg-gray-50 dark:bg-gray-700/50"
                }`}>
                  <div className="flex items-center gap-3 min-w-0">
                    {isPR && <span className="shrink-0 text-amber-500">🏆</span>}
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{log.exercise}</span>
                      <span className="ml-3 text-sm text-gray-600 dark:text-gray-300">{log.weightKg} kg &times; {log.sets} 组 &times; {log.reps} 次</span>
                      {log.notes && <span className="ml-2 text-xs text-gray-400 italic truncate">&quot;{log.notes}&quot;</span>}
                    </div>
                  </div>
                  <button onClick={() => del(log.id)} className="ml-3 shrink-0 text-gray-300 hover:text-red-500 text-xl leading-none transition-colors" aria-label="删除">&times;</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PR Board */}
      {Object.keys(prs).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">个人最佳 (PR)</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Object.entries(prs).sort((a, b) => a[0].localeCompare(b[0])).map(([exercise, pr]) => (
              <div key={exercise} className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 border border-indigo-100 dark:border-indigo-800">
                <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium truncate">{exercise}</p>
                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mt-1">{pr.weight} kg</p>
                <p className="text-xs text-indigo-400 dark:text-indigo-500 mt-0.5">{pr.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress */}
      {Object.keys(progressByExercise).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">历史进度对比</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  {["动作", "最近一次", "上一次", "变化"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase pb-2 pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {Object.entries(progressByExercise).map(([exercise, entries]) => {
                  const [latest, prev] = entries;
                  const diff = prev ? latest.weightKg - prev.weightKg : null;
                  return (
                    <tr key={exercise} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="py-2.5 pr-6 font-medium text-gray-900 dark:text-white">{exercise}</td>
                      <td className="py-2.5 pr-6 text-gray-700 dark:text-gray-200">{latest.weightKg} kg &times; {latest.sets}&times;{latest.reps} <span className="text-xs text-gray-400">({latest.date})</span></td>
                      <td className="py-2.5 pr-6 text-gray-500 dark:text-gray-400">
                        {prev ? <>{prev.weightKg} kg &times; {prev.sets}&times;{prev.reps} <span className="text-xs text-gray-400">({prev.date})</span></> : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="py-2.5">
                        {diff === null ? <span className="text-gray-300 text-xs">首次</span>
                          : diff > 0 ? <span className="text-green-600 font-semibold text-xs">+{diff} kg</span>
                          : diff < 0 ? <span className="text-red-500 font-semibold text-xs">{diff} kg</span>
                          : <span className="text-gray-400 text-xs">持平</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">全部历史</h2>
          <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
            className="rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="all">全部日期</option>
            {uniqueDates.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        {visibleLogs.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">暂无记录</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  {["日期", "动作", "重量", "组×次", "备注", ""].map((h, i) => (
                    <th key={i} className="text-left text-xs font-semibold text-gray-500 uppercase pb-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {visibleLogs.map((log) => {
                  const isPR = prs[log.exercise]?.weight === log.weightKg;
                  return (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="py-2.5 pr-4 text-gray-500 whitespace-nowrap">{log.date}</td>
                      <td className="py-2.5 pr-4 font-medium text-gray-900 dark:text-white">{log.exercise}{isPR && <span className="ml-1.5 text-amber-500 text-xs">🏆PR</span>}</td>
                      <td className="py-2.5 pr-4 text-gray-700 dark:text-gray-200 whitespace-nowrap">{log.weightKg} kg</td>
                      <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-300">{log.sets}&times;{log.reps}</td>
                      <td className="py-2.5 pr-4 text-xs text-gray-400 italic max-w-[160px] truncate">{log.notes || "—"}</td>
                      <td className="py-2.5"><button onClick={() => del(log.id)} className="text-gray-300 hover:text-red-500 transition-colors text-xl leading-none" aria-label="删除">&times;</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
