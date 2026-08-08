import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { LogIn, LogOut, PlayCircle } from 'lucide-react';

export const Header: React.FC = () => {
  const { profile, openLessonModal, setActiveTab } = useApp();
  const { user, logout } = useAuth();

  const progressPercent = Math.min(
    100,
    Math.round((profile.minutesCompletedToday / profile.dailyGoalMinutes) * 100)
  );

  return (
    <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-sm border-b border-border">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-3.5 flex items-center justify-between gap-6">
        {/* Quiet branding */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-secondary text-foreground flex items-center justify-center font-semibold text-sm">
            B2
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">B2 English Coach</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.displayName || profile.name} · Day {profile.programDay}
            </p>
          </div>
        </div>

        {/* One single progress signal instead of four stat chips */}
        <div className="hidden sm:flex items-center gap-3 min-w-[150px]">
          <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {profile.minutesCompletedToday}/{profile.dailyGoalMinutes}m
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openLessonModal}
            className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold px-3.5 py-2 transition-opacity hover:opacity-90 cursor-pointer"
          >
            <PlayCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Start lesson</span>
          </button>

          {user ? (
            <button
              onClick={logout}
              title="Sign out"
              className="p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('login')}
              className="p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Sign in"
            >
              <LogIn className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
