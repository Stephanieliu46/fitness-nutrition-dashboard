import NutritionTracker from "@/components/nutrition/NutritionTracker";

export default function NutritionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">精准营养复盘</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">输入食材克数，自动累计蛋白质 / 碳水 / 脂肪，直观对比每日目标。</p>
      </div>
      <NutritionTracker />
    </div>
  );
}
