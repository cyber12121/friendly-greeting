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
  { id: 'dashboard', label: 'Today', icon: LayoutDashboard },
  { id: 'speaking', label: 'Speaking', icon: Mic },
  { id: 'grammar', label: 'Grammar', icon: BookOpen },
  { id: 'vocabulary', label: 'Vocabulary', icon: Sparkles },
  { id: 'writing', label: 'Writing', icon: PenTool },
  { id: 'listening', label: 'Listening', icon: Headphones },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'assessment', label: 'Assessment', icon: Award },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'login', label: 'Account', icon: UserCheck }
];

// The mobile bar shows only the essentials so nothing competes for attention.
const mobileItems = navItems.filter((i) =>
  ['dashboard', 'speaking', 'grammar', 'vocabulary', 'progress'].includes(i.id)
);

export const DesktopSidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-border bg-sidebar min-h-[calc(100vh-61px)]">
      <nav className="p-3 space-y-0.5 sticky top-[61px]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer ${
                isActive
                  ? 'bg-secondary text-foreground font-semibold'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export const MobileNavigation: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border px-2 py-2">
      <div className="flex items-center justify-around">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
