import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  dailyPlannerEngine,
  AdaptiveDailyPlan
} from '../services/dailyPlannerEngine';
import {
  Sparkles,
  Clock,
  Brain,
  ChevronDown,
  Play,
  RotateCw,
  Mic,
  BookOpen,
  Headphones,
  PenTool,
  RefreshCw,
  Check
} from 'lucide-react';
import { Collapse } from './Collapse';
import { notifyAiFallback } from '../lib/notify';

const skillIconMap: Record<string, React.FC<{ className?: string }>> = {
  Speaking: Mic,
  Grammar: BookOpen,
  Vocabulary: Sparkles,
  Listening: Headphones,
  Writing: PenTool,
  Review: RefreshCw
};

/** Quiet circular progress used instead of a loud gradient bar. */
const ProgressRing: React.FC<{ percent: number }> = ({ percent }) => {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg viewBox="0 0 56 56" className="w-14 h-14 -rotate-90">
        <circle cx="28" cy="28" r={radius} className="stroke-border" strokeWidth="3" fill="none" />
        <circle
          cx="28"
          cy="28"
          r={radius}
          className="stroke-primary transition-[stroke-dashoffset] duration-500 ease-out"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference.toFixed(2)}
          strokeDashoffset={offset.toFixed(2)}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold tabular-nums">
        {percent}%
      </span>
    </div>
  );
};

export const AdaptivePlannerView: React.FC = () => {
  const { setActiveTab } = useApp();
  const { user } = useAuth();
  const [plan, setPlan] = useState<AdaptiveDailyPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);

  useEffect(() => {
    const cached = dailyPlannerEngine.getStoredPlan();
    if (cached) {
      setPlan(cached);
    } else {
      handleGeneratePlan();
    }
  }, []);

  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      const generated = await dailyPlannerEngine.generateTodayPlan(user?.uid);
      setPlan(generated);
    } catch (err) {
      console.error('Failed to generate adaptive daily plan:', err);
      notifyAiFallback('your daily plan');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (activityId: string) => {
    if (!plan) return;
    const updated = await dailyPlannerEngine.toggleActivityCompleted(activityId, user?.uid);
    if (updated) setPlan({ ...updated });
  };

  const handleStartActivity = (route: string) => {
    if (['speaking', 'grammar', 'vocabulary', 'listening', 'writing'].includes(route)) {
      setActiveTab(route as any);
    } else {
      setActiveTab('grammar');
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-3">
        <Brain className="w-6 h-6 mx-auto text-muted-foreground animate-pulse" />
        <p className="text-sm font-medium">Building today's plan…</p>
        <p className="text-xs text-muted-foreground">Matching activities to your current level and weak spots.</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-4">
        <p className="text-sm font-medium">No plan yet for today</p>
        <button
          onClick={handleGeneratePlan}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          Build my plan
        </button>
      </div>
    );
  }

  const completedCount = plan.activities.filter((a) => a.completed).length;
  const progressPercent = Math.round((completedCount / plan.activities.length) * 100);

  return (
    <div className="space-y-4">
      {/* Header: objective + one progress indicator */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start gap-4">
          <ProgressRing percent={progressPercent} />

          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Day {plan.dayNumber} · target {plan.targetCEFR}
            </p>
            <h2 className="text-base font-semibold leading-snug">{plan.dailyObjective}</h2>
            <p className="text-xs text-muted-foreground tabular-nums">
              {completedCount} of {plan.activities.length} done · {plan.totalDurationMinutes} min planned
            </p>
          </div>

          <button
            onClick={handleGeneratePlan}
            disabled={loading}
            aria-label="Rebuild today's plan"
            title="Rebuild today's plan"
            className="shrink-0 p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Activities: one calm list, each row opens inline */}
      <ul className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
        {plan.activities.map((act) => {
          const Icon = skillIconMap[act.expectedSkill] || BookOpen;
          const isExpanded = expandedActivityId === act.id;

          return (
            <li key={act.id} className={act.completed ? 'bg-muted/40' : undefined}>
              <div className="flex items-center gap-3 px-4 py-3.5">
                <button
                  onClick={() => handleToggleComplete(act.id)}
                  aria-label={act.completed ? 'Mark as not done' : 'Mark as done'}
                  className={`w-5 h-5 shrink-0 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                    act.completed
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-border text-transparent hover:border-primary'
                  }`}
                >
                  <Check className="w-3 h-3" />
                </button>

                <button
                  onClick={() => setExpandedActivityId(isExpanded ? null : act.id)}
                  aria-expanded={isExpanded}
                  className="min-w-0 flex-1 text-left cursor-pointer"
                >
                  <p className={`text-sm truncate ${act.completed ? 'text-muted-foreground line-through' : 'font-medium'}`}>
                    {act.title}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Icon className="w-3 h-3" />
                    {act.expectedSkill}
                    <span aria-hidden>·</span>
                    <Clock className="w-3 h-3" />
                    {act.estimatedDurationMinutes} min
                  </p>
                </button>

                <ChevronDown
                  onClick={() => setExpandedActivityId(isExpanded ? null : act.id)}
                  className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform cursor-pointer ${isExpanded ? 'rotate-180' : ''}`}
                />
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 pl-12 space-y-3 text-xs text-muted-foreground">
                  <p className="leading-relaxed text-foreground">{act.objective}</p>
                  <p className="leading-relaxed">{act.instructions}</p>
                  <p className="leading-relaxed">
                    <span className="text-foreground font-medium">Done when:</span> {act.successCriteria}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="rounded-md bg-muted px-2 py-0.5">{act.targetGrammar}</span>
                    {act.targetVocabulary.map((vocab, vIdx) => (
                      <span key={vIdx} className="rounded-md bg-muted px-2 py-0.5">
                        {vocab}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleStartActivity(act.route)}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    Start · {act.estimatedDurationMinutes} min
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Why this plan — folded away by default */}
      <Collapse title="Why this plan" hint="How today's activities were chosen">
        <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
          <p className="text-foreground">{plan.adaptedAllocationReasoning}</p>
          <ul className="space-y-1">
            <li>Weakest skills · Speaking & Grammar</li>
            <li>Recurring errors · Conditionals & prepositions</li>
            <li>Vocabulary · 4 words needing usage</li>
            <li>Listening tier · B2+ high speed</li>
          </ul>
        </div>
      </Collapse>
    </div>
  );
};
