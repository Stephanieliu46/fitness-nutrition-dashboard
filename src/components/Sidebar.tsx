'use client';

import type { Tab } from '@/app/page';

// 导航菜单配置
const NAV_ITEMS: { id: Tab; label: string; icon: string; desc: string }[] = [
  { id: 'overview', label: 'Overview', icon: '📊', desc: 'Today at a glance' },
  { id: 'workout', label: 'Workout', icon: '💪', desc: 'Log your exercises' },
  { id: 'nutrition', label: 'Nutrition', icon: '🥗', desc: 'Track your food intake' },
];

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="w-52 bg-slate-900 flex flex-col shrink-0">
      {/* App logo */}
      <div className="px-5 py-6 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🏋️</span>
          <div>
            <p className="text-white font-bold text-base leading-tight">FitTrack</p>
            <p className="text-slate-500 text-xs">Fitness & Nutrition</p>
          </div>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                isActive
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className={`text-xs ${isActive ? 'text-emerald-200' : 'text-slate-600'}`}>
                  {item.desc}
                </p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer tagline */}
      <div className="px-5 py-4 border-t border-slate-800">
        <p className="text-slate-600 text-xs leading-relaxed">Every rep counts. Keep going. 🔥</p>
      </div>
    </aside>
  );
}
