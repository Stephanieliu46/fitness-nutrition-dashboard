import WorkoutSummary from "@/components/workout/WorkoutSummary";
import NutritionSummary from "@/components/nutrition/NutritionSummary";
import StatsCard from "@/components/layout/StatsCard";

export default function Home() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">Track your strength training and nutrition in one place.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard label="Workouts this week" value="3" unit="sessions" />
        <StatsCard label="Today's calories" value="1,840" unit="kcal" />
        <StatsCard label="Protein today" value="142" unit="g" />
        <StatsCard label="Streak" value="5" unit="days" />
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section aria-labelledby="workout-heading">
          <h2 id="workout-heading" className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Workout Log</h2>
          <WorkoutSummary />
        </section>
        <section aria-labelledby="nutrition-heading">
          <h2 id="nutrition-heading" className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Nutrition Tracking</h2>
          <NutritionSummary />
        </section>
      </div>
    </div>
  );
}
