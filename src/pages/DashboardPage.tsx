import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { aiClientService } from '../services/aiClientService';
import { AdaptivePlannerView } from '../components/AdaptivePlannerView';
import {
  Sparkles,
  Check,
  PlayCircle,
  ChevronRight,
  Loader2,
  ChevronDown
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    profile,
    skills,
    activities,
    toggleActivityCompletion,
    setActiveTab,
    openLessonModal
  } = useApp();

  const [isGeneratingDailyPlan, setIsGeneratingDailyPlan] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [showPlanner, setShowPlanner] = useState(false);
  const [aiDailyPlan, setAiDailyPlan] = useState<{
    dayNumber: number;
    primaryObjective: string;
    focusSkills: string[];
    recommendedTasks: { skill: string; title: string; durationMinutes: number; xp: number; description: string }[];
    motivationalTip: string;
  } | null>(null);

  const handleGenerateDailyPlan = async () => {
    setIsGeneratingDailyPlan(true);
    try {
      const res = await aiClientService.generateDailyPlan();
      setAiDailyPlan(res);
    } catch (err) {
      console.error('Failed to generate AI daily plan:', err);
    } finally {
      setIsGeneratingDailyPlan(false);
    }
  };

  // Activity completion lives in browser storage, so only show the tally
  // once mounted — otherwise SSR and client disagree.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const doneCount = activities.filter((a) => a.completed).length;
  const nextActivity = activities.find((a) => !a.completed);


  return (
    <div className="space-y-10">
      {/* One clear focus for today */}
      <section className="space-y-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Day {profile.programDay} · {profile.currentLevel} → {profile.targetLevel}
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold leading-snug max-w-xl">
          Today: speak with B2 precision.
        </h1>
        <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
          Focus on polite modals for workplace conversation, and swap one B1 word
          for a B2 alternative.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={openLessonModal}
            className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold px-5 py-3 transition-opacity hover:opacity-90 cursor-pointer"
          >
            <PlayCircle className="w-4 h-4" />
            Start today's lesson
          </button>
          <button
            disabled={isGeneratingDailyPlan}
            onClick={handleGenerateDailyPlan}
            className="flex items-center gap-2 rounded-xl border border-border bg-card text-sm font-medium px-4 py-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {isGeneratingDailyPlan ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isGeneratingDailyPlan ? 'Preparing…' : 'AI daily plan'}
          </button>
        </div>
      </section>

      {/* Next single step */}
      {nextActivity && (
        <section className="rounded-2xl border border-border bg-card p-5 space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Next up</p>
          <p className="text-base font-semibold">{nextActivity.title}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {nextActivity.description}
          </p>
          <button
            onClick={() => setActiveTab(nextActivity.route)}
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary pt-1 cursor-pointer"
          >
            Practice · {nextActivity.durationMinutes} min
            <ChevronRight className="w-4 h-4" />
          </button>
        </section>
      )}

      {aiDailyPlan && (
        <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <p className="text-sm font-semibold">Your AI plan for day {aiDailyPlan.dayNumber}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {aiDailyPlan.primaryObjective}
          </p>
          <ul className="space-y-3">
            {aiDailyPlan.recommendedTasks.map((t, idx) => (
              <li key={idx} className="border-t border-border pt-3 space-y-1">
                <p className="text-sm font-medium">{t.title}</p>
                <p className="text-xs text-muted-foreground">
                  {t.skill} · {t.durationMinutes} min
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Today's checklist — plain, low-noise rows */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold">Today's tasks</h2>
          <span className="text-xs text-muted-foreground tabular-nums">
            {doneCount}/{activities.length}
          </span>
        </div>

        <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
          {activities.map((activity) => (
            <li key={activity.id} className="flex items-center gap-3 px-4 py-3.5">
              <button
                onClick={() => toggleActivityCompletion(activity.id)}
                className={`w-5 h-5 shrink-0 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                  activity.completed
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-border text-transparent hover:border-primary'
                }`}
                aria-label={activity.completed ? 'Mark as not done' : 'Mark as done'}
              >
                <Check className="w-3 h-3" />
              </button>

              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm truncate ${
                    activity.completed ? 'text-muted-foreground line-through' : 'font-medium'
                  }`}
                >
                  {activity.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.skill} · {activity.durationMinutes} min
                </p>
              </div>

              <button
                onClick={() => setActiveTab(activity.route)}
                className="shrink-0 p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-label={`Open ${activity.skill} practice`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Extra detail stays folded away by default */}
      <section className="space-y-3">
        <button
          onClick={() => setShowSkills((v) => !v)}
          className="flex w-full items-center justify-between text-sm font-semibold cursor-pointer"
        >
          Skill levels
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform ${showSkills ? 'rotate-180' : ''}`}
          />
        </button>

        {showSkills && (
          <ul className="space-y-3 rounded-2xl border border-border bg-card p-5">
            {skills.map((s) => (
              <li
                key={s.skill}
                onClick={() => setActiveTab(s.skill.toLowerCase())}
                className="space-y-2 cursor-pointer"
              >
                <div className="flex items-baseline justify-between text-sm">
                  <span>{s.skill}</span>
                  <span className="text-muted-foreground tabular-nums">{s.currentScore}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${s.currentScore}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={() => setShowPlanner((v) => !v)}
          className="flex w-full items-center justify-between text-sm font-semibold cursor-pointer"
        >
          Adaptive planner
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform ${showPlanner ? 'rotate-180' : ''}`}
          />
        </button>
        {showPlanner && <AdaptivePlannerView />}
      </section>
    </div>
  );
};
