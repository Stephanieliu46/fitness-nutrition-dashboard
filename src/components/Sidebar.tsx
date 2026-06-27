'use client';

import type { Tab } from '@/app/page';

const NAV_ITEMS: { id: Tab; label: string; icon: string; desc: string }[] = [
  { id: 'overview',  label: 'Overview',  icon: '📊', desc: 'Today at a glance' },
  { id: 'workout',   label: 'Workout',   icon: '💪', desc: 'Log your exercises' },
  { id: 'nutrition', label: 'Nutrition', icon: '🥗', desc: 'Track your food intake' },
];

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <>
      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <aside className="hidden sm:flex w-52 bg-slate-900 flex-col shrink-0">
        <div className="px-5 py-6 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🏋️</span>
            <div>
              <p className="text-white font-bold text-base leading-tight">FitTrack</p>
              <p className="text-slate-500 text-xs">Fitness & Nutrition</p>
            </div>
          </div>
        </div>

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

        <div className="px-5 py-4 border-t border-slate-800">
          <p className="text-slate-600 text-xs leading-relaxed">Every rep counts. Keep going. 🔥</p>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar (hidden on desktop) ── */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 flex"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {NAV_ITEMS.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${
                isActive ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              <span className="text-2xl leading-none">{item.icon}</span>
              <span className={`text-[11px] font-semibold ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
