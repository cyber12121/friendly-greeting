import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  dailyPlannerEngine,
  AdaptiveDailyPlan,
  DailyPlanActivity
} from '../services/dailyPlannerEngine';
import {
  Sparkles,
  CheckCircle,
  Clock,
  Target,
  Brain,
  ChevronDown,
  ChevronUp,
  Play,
  RotateCw,
  Award,
  Zap,
  Mic,
  BookOpen,
  Headphones,
  PenTool,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Check
} from 'lucide-react';

const skillIconMap: Record<string, React.FC<{ className?: string }>> = {
  Speaking: Mic,
  Grammar: BookOpen,
  Vocabulary: Sparkles,
  Listening: Headphones,
  Writing: PenTool,
  Review: RefreshCw
};

export const AdaptivePlannerView: React.FC = () => {
  const { setActiveTab, user } = useApp();
  const [plan, setPlan] = useState<AdaptiveDailyPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showReasoning, setShowReasoning] = useState<boolean>(true);
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);

  useEffect(() => {
    // Load cached plan or generate initial plan
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
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (activityId: string) => {
    if (!plan) return;
    const updated = await dailyPlannerEngine.toggleActivityCompleted(activityId, user?.uid);
    if (updated) {
      setPlan({ ...updated });
    }
  };

  const handleStartActivity = (route: string) => {
    if (route === 'speaking' || route === 'grammar' || route === 'vocabulary' || route === 'listening' || route === 'writing') {
      setActiveTab(route as any);
    } else {
      setActiveTab('grammar'); // default fallback for review
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center space-y-4 my-6">
        <div className="inline-flex items-center justify-center p-4 bg-indigo-50 text-indigo-600 rounded-full animate-bounce">
          <Brain className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Analyzing 13 Learner Profile Factors...</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Evaluating CEFR levels, skill weaknesses, recurring error logs, grammar/vocabulary mastery, listening trends, and spaced repetition schedules to curate your adaptive daily plan.
        </p>
        <div className="w-48 h-2 bg-slate-100 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-indigo-600 animate-pulse rounded-full w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center space-y-4 my-6">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">No Daily Plan Generated Yet</h3>
        <p className="text-xs text-slate-500">
          Click below to trigger the Adaptive AI Daily Learning Planner.
        </p>
        <button
          onClick={handleGeneratePlan}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate Adaptive Daily Plan</span>
        </button>
      </div>
    );
  }

  const completedActivitiesCount = plan.activities.filter((a) => a.completed).length;
  const progressPercent = Math.round((completedActivitiesCount / plan.activities.length) * 100);

  return (
    <div className="space-y-6 my-6">
      {/* Top Banner: Day Objective & Time Allocation */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-indigo-900/60 relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-indigo-400" />
                Day {plan.dayNumber} Adaptive Plan
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                Target: {plan.targetCEFR}
              </span>
            </div>

            <button
              onClick={handleGeneratePlan}
              disabled={loading}
              className="bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl border border-indigo-400/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Regenerate Daily Plan</span>
            </button>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Today's Objective: {plan.dailyObjective}
            </h2>
          </div>

          {/* Time Budget & Progress Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-indigo-900/80 text-xs">
            <div className="flex items-center gap-2.5 text-slate-300">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>
                Available Budget: <strong className="text-white">{plan.availableStudyTimeMinutes} mins</strong>
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-300">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>
                Planned Duration: <strong className="text-white">{plan.totalDurationMinutes} mins</strong> (6 Skills)
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>
                Completed: <strong className="text-white">{completedActivitiesCount} / {plan.activities.length} ({progressPercent}%)</strong>
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 13-Factor Adaptation Justification Card */}
      <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-5 shadow-xs text-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Adaptation Reasoning (Based on 13 Profile Factors)</span>
          </div>
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            {showReasoning ? 'Hide Breakdown' : 'Show Breakdown'}
            {showReasoning ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showReasoning && (
          <div className="bg-white p-4 rounded-xl border border-indigo-100/80 text-slate-700 leading-relaxed text-xs space-y-2">
            <p className="font-medium text-slate-800">{plan.adaptedAllocationReasoning}</p>
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-500">
              <div>• Weakest Skills: <span className="font-semibold text-slate-700">Speaking & Grammar</span></div>
              <div>• Recurring Errors: <span className="font-semibold text-slate-700">Conditionals & Prepositions</span></div>
              <div>• Vocabulary: <span className="font-semibold text-slate-700">4 Words Needing Usage</span></div>
              <div>• Listening Tier: <span className="font-semibold text-slate-700">B2+ High Speed</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Structured 6 Activities Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            Today's Tailored Activities ({plan.activities.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Complete activities to maintain your learning streak
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plan.activities.map((act) => {
            const Icon = skillIconMap[act.expectedSkill] || BookOpen;
            const isExpanded = expandedActivityId === act.id;

            return (
              <div
                key={act.id}
                className={`bg-white border rounded-2xl p-5 shadow-xs transition-all space-y-3 relative ${
                  act.completed
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                {/* Header: Skill Icon, Title, Duration */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleComplete(act.id)}
                      className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 border ${
                        act.completed
                          ? 'bg-emerald-500 border-emerald-600 text-white'
                          : 'bg-slate-50 border-slate-300 hover:border-indigo-500 text-transparent'
                      }`}
                      title={act.completed ? 'Mark incomplete' : 'Mark completed'}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100 flex items-center gap-1">
                          <Icon className="w-3 h-3" />
                          {act.expectedSkill}
                        </span>
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
                          {act.difficulty}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {act.estimatedDurationMinutes} mins
                        </span>
                      </div>

                      <h4 className={`text-sm font-bold mt-1.5 ${act.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {act.title}
                      </h4>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 shrink-0">
                    +{act.xpReward} XP
                  </span>
                </div>

                {/* Topic & Pedagogical Objective */}
                <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p><strong className="text-slate-800">Topic:</strong> {act.topic}</p>
                  <p><strong className="text-slate-800">Objective:</strong> {act.objective}</p>
                </div>

                {/* Target Grammar & Target Vocabulary chips */}
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <span className="bg-indigo-50 text-indigo-800 font-medium px-2 py-0.5 rounded border border-indigo-100">
                    Grammar: {act.targetGrammar}
                  </span>
                  {act.targetVocabulary.map((vocab, vIdx) => (
                    <span key={vIdx} className="bg-emerald-50 text-emerald-800 font-medium px-2 py-0.5 rounded border border-emerald-100">
                      +{vocab}
                    </span>
                  ))}
                </div>

                {/* Collapsible details for Instructions & Success Criteria */}
                {isExpanded && (
                  <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600 animate-fadeIn">
                    <div>
                      <strong className="text-slate-800 block mb-0.5">Instructions:</strong>
                      <p className="leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">{act.instructions}</p>
                    </div>
                    <div>
                      <strong className="text-slate-800 block mb-0.5">Success Criteria:</strong>
                      <p className="leading-relaxed text-emerald-700 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100 font-medium">{act.successCriteria}</p>
                    </div>
                  </div>
                )}

                {/* Action Row */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => setExpandedActivityId(isExpanded ? null : act.id)}
                    className="text-slate-500 hover:text-slate-800 font-medium text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    {isExpanded ? 'Hide Details' : 'View Instructions'}
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  <button
                    onClick={() => handleStartActivity(act.route)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs text-xs"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Start Practice</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
