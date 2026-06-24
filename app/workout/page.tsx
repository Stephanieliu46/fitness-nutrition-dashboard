import WorkoutLogger from "@/components/workout/WorkoutLogger";

export default function WorkoutPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">力量训练记录</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">记录你的大重量训练，追踪每个动作的历史进度与个人最佳。</p>
      </div>
      <WorkoutLogger />
    </div>
  );
}
