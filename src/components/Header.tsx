import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Flame, Target, Calendar, PlayCircle, LogIn, LogOut, User as UserIcon } from 'lucide-react';

export const Header: React.FC = () => {
  const { profile, openLessonModal, setActiveTab } = useApp();
  const { user, logout } = useAuth();

  const progressPercent = Math.min(100, Math.round((profile.minutesCompletedToday / profile.dailyGoalMinutes) * 100));

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Left branding & learner level badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-sm font-bold text-lg tracking-tight">
            B2
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">B2 English Coach</h1>
              <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Target className="w-3 h-3 text-indigo-600" />
                {profile.currentLevel} → {profile.targetLevel}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Welcome back, <span className="text-slate-800 font-semibold">{user?.displayName || profile.name}</span>
            </p>
          </div>
        </div>

        {/* Center / Stats status indicators */}
        <div className="flex items-center gap-4 sm:gap-6 text-xs text-slate-600 font-medium">
          {/* Day tracker */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Program: <strong className="text-slate-900">Day {profile.programDay}</strong>/{profile.totalProgramDays}</span>
          </div>

          {/* Streak tracker */}
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 px-3 py-1.5 rounded-lg border border-amber-200">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Streak: <strong className="text-amber-900">{profile.streakDays} Days</strong></span>
          </div>

          {/* Daily Goal bar */}
          <div className="hidden md:flex flex-col gap-1 min-w-[130px]">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">Today's Goal</span>
              <span className="font-semibold text-slate-800">{profile.minutesCompletedToday}/{profile.dailyGoalMinutes} min</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Button & User Auth menu */}
        <div className="flex items-center gap-3">
          <button
            onClick={openLessonModal}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all hover:shadow-md active:scale-98 cursor-pointer"
          >
            <PlayCircle className="w-4 h-4 text-indigo-200" />
            <span>Start Lesson</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300 ml-0.5" />
          </button>

          {user ? (
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-7 h-7 rounded-lg object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('login')}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Google Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

