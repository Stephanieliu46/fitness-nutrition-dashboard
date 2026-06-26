'use client';

import { useState, useCallback } from 'react';
import type { Store } from '@/lib/useStore';
import { genId, today, totalSets } from '@/lib/useStore';
import type { WorkoutSession, WorkoutSet } from '@/lib/types';
import { EXERCISES, CATEGORY_LABELS } from '@/lib/exercises';
import type { Tab } from '@/app/page';

interface WorkoutPageProps {
  store: Store;
  onTabChange: (tab: Tab) => void;
}

function shiftDateStr(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

export default function WorkoutPage({ store, onTabChange }: WorkoutPageProps) {
  const todayActual = today();
  const [selectedDate, setSelectedDate] = useState(todayActual);
  const isToday = selectedDate === todayActual;
  const selectedSession = store.workoutSessions.find(s => s.date === selectedDate);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const shiftDate = (days: number) => {
    const next = shiftDateStr(selectedDate, days);
    if (next <= todayActual) setSelectedDate(next);
  };

  const startWorkout = useCallback(() => {
    store.saveWorkout({ id: genId(), date: selectedDate, exercises: [], notes: '' });
  }, [store, selectedDate]);

  // Clicking an exercise adds it; if already present, appends another set
  const addOrExpandExercise = useCallback(
    (exerciseId: string) => {
      if (!selectedSession) return;
      const ex = EXERCISES.find(e => e.id === exerciseId);
      if (!ex) return;
      const existingIdx = selectedSession.exercises.findIndex(e => e.exerciseId === exerciseId);
      if (existingIdx >= 0) {
        const exercises = selectedSession.exercises.map((e, i) => {
          if (i !== existingIdx) return e;
          const last = e.sets[e.sets.length - 1] ?? { weight: 0, reps: 0 };
          return { ...e, sets: [...e.sets, { ...last }] };
        });
        store.saveWorkout({ ...selectedSession, exercises });
      } else {
        store.saveWorkout({
          ...selectedSession,
          exercises: [
            ...selectedSession.exercises,
            { exerciseId: ex.id, exerciseName: ex.name, sets: [{ weight: 0, reps: 0 }] },
          ],
        });
      }
    },
    [selectedSession, store]
  );

  const updateSet = useCallback(
    (exIdx: number, setIdx: number, field: keyof WorkoutSet, val: number) => {
      if (!selectedSession) return;
      const exercises = selectedSession.exercises.map((e, i) =>
        i === exIdx
          ? { ...e, sets: e.sets.map((s, j) => (j === setIdx ? { ...s, [field]: val } : s)) }
          : e
      );
      store.saveWorkout({ ...selectedSession, exercises });
    },
    [selectedSession, store]
  );

  const addSet = useCallback(
    (exIdx: number) => {
      if (!selectedSession) return;
      const exercises = selectedSession.exercises.map((e, i) => {
        if (i !== exIdx) return e;
        const last = e.sets[e.sets.length - 1] ?? { weight: 0, reps: 0 };
        return { ...e, sets: [...e.sets, { ...last }] };
      });
      store.saveWorkout({ ...selectedSession, exercises });
    },
    [selectedSession, store]
  );

  const removeSet = useCallback(
    (exIdx: number, setIdx: number) => {
      if (!selectedSession) return;
      const exercises = selectedSession.exercises
        .map((e, i) =>
          i === exIdx ? { ...e, sets: e.sets.filter((_, j) => j !== setIdx) } : e
        )
        .filter(e => e.sets.length > 0);
      store.saveWorkout({ ...selectedSession, exercises });
    },
    [selectedSession, store]
  );

  const filteredExercises =
    categoryFilter === 'all' ? EXERCISES : EXERCISES.filter(e => e.category === categoryFilter);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => onTabChange('overview')}
                className="text-slate-400 hover:text-slate-600 transition-colors text-sm font-medium"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-slate-800">
                {isToday ? "Today's Workout" : 'Workout Log'}
              </h1>
            </div>

            {/* Date navigation */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => shiftDate(-1)}
                className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors text-base"
              >
                ‹
              </button>
              <input
                type="date"
                value={selectedDate}
                max={todayActual}
                onChange={e => e.target.value && setSelectedDate(e.target.value)}
                className="text-sm text-slate-600 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-emerald-400 cursor-pointer"
              />
              <button
                onClick={() => shiftDate(1)}
                disabled={isToday}
                className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 hover:border-slate-300 disabled:opacity-30 transition-colors text-base"
              >
                ›
              </button>
              {!isToday && (
                <button
                  onClick={() => setSelectedDate(todayActual)}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium px-2 py-1 border border-emerald-200 rounded-lg transition-colors"
                >
                  Today
                </button>
              )}
            </div>
          </div>

          {selectedSession && (
            <button
              onClick={() => {
                if (window.confirm(`Clear workout on ${selectedDate}?`)) {
                  store.deleteWorkout(selectedSession.id);
                }
              }}
              className="text-sm text-red-400 hover:text-red-600 transition-colors mt-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* No session: empty state */}
      {!selectedSession ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-100 text-center mb-8">
          <p className="text-5xl mb-4">🏋️</p>
          <h2 className="text-lg font-semibold text-slate-700 mb-2">
            No workout recorded {isToday ? 'today' : `on ${selectedDate}`}
          </h2>
          <p className="text-slate-400 text-sm mb-6">Log your exercises, sets, and weights</p>
          <button
            onClick={startWorkout}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-2.5 rounded-lg transition-colors"
          >
            Start Workout
          </button>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {/* Summary */}
          {selectedSession.exercises.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-8">
              <div>
                <p className="text-xs text-emerald-600">Exercises</p>
                <p className="text-2xl font-bold text-emerald-700">{selectedSession.exercises.length}</p>
              </div>
              <div>
                <p className="text-xs text-emerald-600">Total Sets</p>
                <p className="text-2xl font-bold text-emerald-700">{totalSets(selectedSession)}</p>
              </div>
            </div>
          )}

          {/* Exercise library — click to add directly; sits ABOVE the logged sets */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <h2 className="font-medium text-slate-700 mb-3 text-sm">Add Exercise</h2>

            {/* Category filter */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {([...Object.keys(CATEGORY_LABELS), 'all'] as string[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                    categoryFilter === cat
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>

            {/* Exercise buttons — tap to add / tap again to add a set */}
            <div className="flex flex-wrap gap-2">
              {filteredExercises.map(ex => {
                const isAdded = selectedSession.exercises.some(e => e.exerciseId === ex.id);
                return (
                  <button
                    key={ex.id}
                    onClick={() => addOrExpandExercise(ex.id)}
                    title={isAdded ? 'Tap to add another set' : 'Tap to add exercise'}
                    className={`text-xs px-3 py-2 rounded-lg border font-medium transition-all ${
                      isAdded
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600'
                    }`}
                  >
                    {ex.name}
                    {isAdded && <span className="ml-1.5 text-[10px] text-emerald-400">✓ +set</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Logged exercise cards with inline set editing */}
          {selectedSession.exercises.map((exercise, exIdx) => {
            const meta = EXERCISES.find(e => e.id === exercise.exerciseId);
            const catLabel = meta ? CATEGORY_LABELS[meta.category] : '';

            return (
              <div key={exIdx} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800">{exercise.exerciseName}</h3>
                  {catLabel && (
                    <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full">
                      {catLabel}
                    </span>
                  )}
                </div>

                <div className="flex gap-2 text-xs text-slate-400 px-1 mb-2">
                  <span className="w-8 text-center">Set</span>
                  <span className="flex-1 text-center">Weight (kg)</span>
                  <span className="flex-1 text-center">Reps</span>
                  <span className="w-6" />
                </div>

                {exercise.sets.map((set, setIdx) => (
                  <div key={setIdx} className="flex items-center gap-2 mb-2">
                    <span className="w-8 text-center text-xs text-slate-400 font-medium">
                      {setIdx + 1}
                    </span>
                    <input
                      type="number"
                      value={set.weight || ''}
                      onChange={e => updateSet(exIdx, setIdx, 'weight', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      min={0}
                      className="flex-1 text-center border border-slate-200 rounded-lg py-1.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100"
                    />
                    <input
                      type="number"
                      value={set.reps || ''}
                      onChange={e => updateSet(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min={0}
                      className="flex-1 text-center border border-slate-200 rounded-lg py-1.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100"
                    />
                    <button
                      onClick={() => removeSet(exIdx, setIdx)}
                      className="w-6 text-slate-300 hover:text-red-400 text-xl leading-none transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => addSet(exIdx)}
                  className="mt-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  + Add Set
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* History */}
      <div>
        <h2 className="font-semibold text-slate-700 mb-3">History</h2>
        {store.workoutSessions.filter(s => s.date !== selectedDate).length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">No workout history yet</p>
        ) : (
          <div className="space-y-2">
            {store.workoutSessions
              .filter(s => s.date !== selectedDate)
              .slice(0, 15)
              .map(session => (
                <HistoryCard
                  key={session.id}
                  session={session}
                  onSelect={() => setSelectedDate(session.date)}
                  onDelete={() => {
                    if (window.confirm(`Delete workout on ${session.date}?`)) {
                      store.deleteWorkout(session.id);
                    }
                  }}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryCard({
  session, onSelect, onDelete,
}: {
  session: WorkoutSession;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
      >
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-slate-700">{session.date}</p>
            <button
              onClick={e => { e.stopPropagation(); onSelect(); }}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Edit →
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {session.exercises.length} exercises · {totalSets(session)} sets
          </p>
        </div>
        <span className="text-slate-400 text-xs">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-50 pt-3">
          <div className="space-y-1.5">
            {session.exercises.map((ex, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-slate-600">{ex.exerciseName}</span>
                <span className="text-slate-400">{ex.sets.length} sets</span>
              </div>
            ))}
          </div>
          <button
            onClick={onDelete}
            className="mt-3 text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
