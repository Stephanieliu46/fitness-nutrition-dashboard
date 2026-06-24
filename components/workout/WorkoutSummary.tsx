const recentWorkouts = [
  { date: "2026-06-24", name: "Upper Body – Push", exercises: ["Bench Press 4×5", "OHP 3×8", "Tricep Dips 3×10"], duration: "55 min" },
  { date: "2026-06-22", name: "Lower Body – Squat", exercises: ["Back Squat 5×5", "Romanian DL 3×8", "Leg Press 3×12"], duration: "60 min" },
  { date: "2026-06-20", name: "Upper Body – Pull", exercises: ["Deadlift 3×5", "Barbell Row 4×6", "Pull-ups 3×8"], duration: "50 min" },
];

export default function WorkoutSummary() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm divide-y divide-gray-100 dark:divide-gray-700">
      {recentWorkouts.map((w) => (
        <div key={w.date} className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{w.name}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {new Date(w.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
            <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">{w.duration}</span>
          </div>
          <ul className="mt-2 flex flex-wrap gap-1">
            {w.exercises.map((ex) => (
              <li key={ex} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">{ex}</li>
            ))}
          </ul>
        </div>
      ))}
      <div className="p-4">
        <a href="/workout" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">View all workouts &rarr;</a>
      </div>
    </div>
  );
}
