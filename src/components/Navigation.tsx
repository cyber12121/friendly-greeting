import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Mic,
  BookOpen,
  Sparkles,
  PenTool,
  Headphones,
  TrendingUp,
  Settings,
  UserCheck,
  Award
} from 'lucide-react';

export const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'speaking', label: 'Speaking', icon: Mic },
  { id: 'grammar', label: 'Grammar', icon: BookOpen },
  { id: 'vocabulary', label: 'Vocabulary', icon: Sparkles },
  { id: 'writing', label: 'Writing', icon: PenTool },
  { id: 'listening', label: 'Listening', icon: Headphones },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'assessment', label: 'B2 Assessment', icon: Award },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'login', label: 'Account', icon: UserCheck }
];

export const DesktopSidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 min-h-[calc(100vh-61px)]">
      <div className="p-4">
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3 mb-6">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-indigo-400 mb-1">Target Milestone</p>
          <p className="text-sm font-bold text-white">CEFR B2 Independent</p>
          <p className="text-xs text-slate-400 mt-1">Spontaneous & coherent expression in professional & academic contexts.</p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-slate-800/80">
        <div className="bg-gradient-to-r from-indigo-950/60 to-slate-800/80 p-3 rounded-xl border border-indigo-800/40">
          <p className="text-xs font-semibold text-indigo-200">B2 Tip of the Day</p>
          <p className="text-[11px] text-slate-300 mt-1 leading-snug">
            Replace "I think" with "From my standpoint" or "It appears to me that" to express academic nuance.
          </p>
        </div>
      </div>
    </aside>
  );
};

export const MobileNavigation: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-40 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition-colors cursor-pointer ${
                isActive ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
