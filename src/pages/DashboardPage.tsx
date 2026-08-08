import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { aiClientService } from '../services/aiClientService';
import { AdaptivePlannerView } from '../components/AdaptivePlannerView';
import {
  Sparkles,
  CheckCircle,
  PlayCircle,
  Clock,
  Award,
  ArrowRight,
  TrendingUp,
  Target,
  Mic,
  Headphones,
  BookOpen,
  PenTool,
  Volume2,
  Loader2
} from 'lucide-react';

const skillIcons: Record<string, React.FC<{ className?: string }>> = {
  Speaking: Mic,
  Listening: Headphones,
  Grammar: BookOpen,
  Vocabulary: Sparkles,
  Writing: PenTool,
  Pronunciation: Volume2
};

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

  const overallAvgScore = Math.round(
    skills.reduce((acc, curr) => acc + curr.currentScore, 0) / skills.length
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner: Program Overview & Level Status */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-indigo-900/50">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-indigo-600/90 text-indigo-100 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-500/30 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-300" />
              CEFR Progression Path: {profile.currentLevel} → {profile.targetLevel}
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30">
              Program Day {profile.programDay} of {profile.totalProgramDays}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Ready to elevate your English to B2 precision today?
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
            Today's Focus: Master <strong>non-confrontational B2 modals</strong> for workplace negotiation and eliminate repetitive B1 vocabulary.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={openLessonModal}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg transition-all hover:shadow-indigo-500/20 flex items-center gap-2 cursor-pointer"
            >
              <PlayCircle className="w-4 h-4 text-indigo-200" />
              <span>Start Today's Lesson</span>
              <Sparkles className="w-4 h-4 text-amber-300 ml-1" />
            </button>

            <button
              disabled={isGeneratingDailyPlan}
              onClick={handleGenerateDailyPlan}
              className="bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-indigo-200 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              {isGeneratingDailyPlan ? (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              ) : (
                <Sparkles className="w-4 h-4 text-indigo-400" />
              )}
              <span>{isGeneratingDailyPlan ? 'Curating Plan...' : 'AI Custom Daily Plan'}</span>
            </button>

            <button
              onClick={() => setActiveTab('speaking')}
              className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Mic className="w-4 h-4 text-indigo-400" />
              <span>AI Speaking Practice</span>
            </button>
          </div>
        </div>

        {/* Decorative Overall Badge */}
        <div className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col items-center bg-slate-800/70 backdrop-blur-md border border-slate-700/80 p-5 rounded-2xl text-center min-w-[160px]">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Proficiency</span>
          <span className="text-4xl font-extrabold text-white my-1">{overallAvgScore}%</span>
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +4.2% this week
          </span>
        </div>
      </div>

      {/* Adaptive Daily Learning Planner */}
      <AdaptivePlannerView />
      {aiDailyPlan && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-indigo-950">
                AI Generated Daily Plan (Day {aiDailyPlan.dayNumber})
              </h3>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-white px-3 py-1 rounded-full border border-indigo-200">
              Focus: {aiDailyPlan.focusSkills.join(', ')}
            </span>
          </div>

          <p className="text-xs text-indigo-900 font-medium bg-white p-3.5 rounded-xl border border-indigo-100">
            <strong>Primary Objective:</strong> {aiDailyPlan.primaryObjective}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {aiDailyPlan.recommendedTasks.map((t, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-indigo-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-600">{t.skill}</span>
                  <span className="text-[10px] text-slate-500">{t.durationMinutes}m • +{t.xp} XP</span>
                </div>
                <p className="font-bold text-slate-900">{t.title}</p>
                <p className="text-slate-600">{t.description}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-indigo-800 italic font-medium pt-1">
            💡 Coach Tip: {aiDailyPlan.motivationalTip}
          </p>
        </div>
      )}

      {/* Main Grid: Today's Recommended Activities & Today's Objective */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recommended Activities (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Today's Recommended Activities</h3>
              <p className="text-xs text-slate-500">Curated micro-tasks targeting your B2 skill gap</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {activities.filter(a => a.completed).length}/{activities.length} Completed
            </span>
          </div>

          <div className="space-y-3">
            {activities.map((activity) => {
              const Icon = skillIcons[activity.skill] || Sparkles;
              return (
                <div
                  key={activity.id}
                  className={`p-4 rounded-xl border transition-all flex items-start sm:items-center justify-between gap-4 ${
                    activity.completed
                      ? 'bg-slate-50 border-slate-200/80 opacity-75'
                      : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <button
                      onClick={() => toggleActivityCompletion(activity.id)}
                      className={`mt-0.5 sm:mt-0 p-1 rounded-lg transition-colors cursor-pointer ${
                        activity.completed ? 'text-emerald-600 bg-emerald-50' : 'text-slate-300 hover:text-slate-500'
                      }`}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{activity.title}</span>
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                          {activity.skill}
                        </span>
                        <span className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                          {activity.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{activity.description}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {activity.durationMinutes} min
                        </span>
                        <span className="flex items-center gap-1 text-amber-600 font-semibold">
                          <Award className="w-3 h-3" /> +{activity.xpReward} XP
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab(activity.route)}
                    className="shrink-0 flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <span>Practice</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Objective Sidebar Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-indigo-600">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">Today's Objective</h3>
            </div>

            <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
              <p className="text-xs font-bold text-indigo-900 uppercase tracking-wide">Primary Target</p>
              <p className="text-sm font-semibold text-slate-800 leading-snug">
                Enhance Fluency & Spontaneity in Professional Discussions
              </p>
              <p className="text-xs text-slate-600">
                Transition from pausing for simple words to naturally utilizing connective adverbs like <em>"furthermore"</em>, <em>"nevertheless"</em>, and <em>"consequently"</em>.
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">Key Outcomes for B2:</p>
              <ul className="space-y-1.5 list-disc list-inside text-slate-600">
                <li>Express agreement & polite disagreement naturally.</li>
                <li>Avoid repeating B1 adjectives (good, bad, happy).</li>
                <li>Construct 150-word structured paragraph responses.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Skill Progress Cards Grid (6 skills) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Skill Proficiency Matrix</h3>
            <p className="text-xs text-slate-500">Track your trajectory across the 6 core B2 English domains</p>
          </div>
          <button
            onClick={() => setActiveTab('progress')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Detailed Radar Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((s) => {
            const Icon = skillIcons[s.skill] || Sparkles;
            return (
              <div
                key={s.skill}
                onClick={() => setActiveTab(s.skill.toLowerCase())}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-900 text-sm">{s.skill}</span>
                    </div>

                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      s.status === 'Mastered' ? 'bg-emerald-100 text-emerald-800' :
                      s.status === 'Near Target' ? 'bg-teal-100 text-teal-800' :
                      s.status === 'Improving' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {s.status}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-2xl font-extrabold text-slate-900">{s.currentScore}%</span>
                    <span className="text-xs font-medium text-slate-400">Goal: {s.b2TargetScore}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                      style={{ width: `${s.currentScore}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {s.keyFocus}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Open {s.skill} Practice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
