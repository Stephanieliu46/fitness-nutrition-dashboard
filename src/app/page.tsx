'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Overview from '@/components/Overview';
import WorkoutPage from '@/components/WorkoutPage';
import NutritionPage from '@/components/NutritionPage';
import { useStore } from '@/lib/useStore';

// 三个主要页面的标识
export type Tab = 'overview' | 'workout' | 'nutrition';

export default function Home() {
  const [tab, setTab] = useState<Tab>('overview');
  const store = useStore();

  // 等待 localStorage 数据加载完毕
  if (!store.ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-400 text-sm">加载中...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activeTab={tab} onTabChange={setTab} />
      <main className="flex-1 overflow-y-auto bg-slate-50">
        {tab === 'overview' && <Overview store={store} onTabChange={setTab} />}
        {tab === 'workout' && <WorkoutPage store={store} onTabChange={setTab} />}
        {tab === 'nutrition' && <NutritionPage store={store} onTabChange={setTab} />}
      </main>
    </div>
  );
}
