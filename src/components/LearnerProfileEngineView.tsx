import React from 'react';
import { useApp } from '../context/AppContext';
import { EvaluatedSkill } from '../services/learnerProfileEngine';
import {
  Award,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Brain,
  Zap,
  BookOpen,
  FileText,
  Clock,
  Layers,
  Activity,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const LearnerProfileEngineView: React.FC = () => {
  const { evaluatedProfile } = useApp();

  const { currentLevel, strengths, weaknesses, learningBehavior, masterySummary } = evaluatedProfile;

  return (
    <div className="space-y-8">
      {/* HEADER BANNER: LIVE AI LEARNER PROFILE ENGINE DIAGNOSTIC */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-indigo-400" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                AI Learner Profile Model
              </h2>
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Live Dynamic Model
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              Continuously updating cognitive model tracking CEFR estimates, error frequencies, mastery stages, and behavioral consistency across all active practice sessions.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
            <div className="text-center px-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Current Level</span>
              <span className="text-2xl font-extrabold text-indigo-400">{currentLevel.overallCEFR}</span>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div className="text-center px-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">B2 Readiness</span>
              <span className="text-2xl font-extrabold text-emerald-400">{currentLevel.readinessScore}%</span>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div className="text-center px-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Confidence</span>
              <span className={`text-xs font-bold uppercase px-2 py-1 rounded-md block mt-1 ${
                currentLevel.confidenceLevel === 'high'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {currentLevel.confidenceLevel}
              </span>
            </div>
          </div>
        </div>

        {/* LEARNING BEHAVIOR SUMMARY STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 text-xs">
          <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Activity className="w-3.5 h-3.5 text-indigo-400" /> Study Frequency
            </span>
            <p className="text-sm font-bold text-white">
              {learningBehavior.studyFrequencySessionsPerWeek} sessions/wk ({learningBehavior.consistencyRating})
            </p>
          </div>

          <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-400" /> Avg Session Duration
            </span>
            <p className="text-sm font-bold text-white">
              {learningBehavior.averageSessionDurationMinutes} mins / session
            </p>
          </div>

          <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Current Streak
            </span>
            <p className="text-sm font-bold text-white">
              {learningBehavior.currentStreakDays} Days Streak
            </p>
          </div>

          <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-purple-400" /> Total Completed
            </span>
            <p className="text-sm font-bold text-white">
              {learningBehavior.totalSessionsCount} Practice Sessions
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: SKILL-SPECIFIC CEFR ESTIMATES WITH CONFIDENCE & EVIDENCE */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              Skill-Specific CEFR Estimates & Verified Evidence
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Every assessment is backed by concrete behavioral evidence logs and assigned a confidence rating.
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            8 Skills Tracked
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.values(currentLevel.skillEstimates) as EvaluatedSkill[]).map((sk) => (
            <div key={sk.skillKey} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-900">{sk.displayName}</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                    {sk.estimatedCEFR}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-xl font-extrabold text-slate-900">{sk.score}<span className="text-xs text-slate-400 font-normal">/100</span></span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    sk.confidenceLevel === 'high' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {sk.confidenceLevel} Confidence
                  </span>
                </div>

                <div className="mt-3 space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assessment Evidence:</p>
                  <ul className="space-y-1">
                    {sk.evidence.map((ev, i) => (
                      <li key={i} className="text-[11px] text-slate-600 leading-snug flex items-start gap-1">
                        <span className="text-indigo-500 font-bold">•</span>
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 text-[10px] text-slate-500 flex justify-between">
                <span>Trend: <strong className="capitalize text-slate-800">{sk.trend}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: ACQUISITION & MASTERY STAGES ENGINE */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              Four-Stage Acquisition & Mastery Model
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              The AI strictly distinguishes recognition from spontaneous production. An item is NOT marked as mastered after 1 attempt or multiple-choice alone.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Spontaneous Weight: {masterySummary.spontaneousProductionWeightFactor}x
          </span>
        </div>

        {/* 4 STAGES EXPLANATION HEADER */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
            <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px] block">Stage 1</span>
            <p className="font-bold text-slate-900">1. Knowledge</p>
            <p className="text-[11px] text-slate-500">Understands grammar rule or dictionary definition in theory.</p>
          </div>

          <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 space-y-1">
            <span className="font-extrabold text-blue-700 uppercase tracking-wider text-[10px] block">Stage 2</span>
            <p className="font-bold text-blue-900">2. Recognition</p>
            <p className="text-[11px] text-blue-700">Selects correct option in multiple-choice quizzes or drills.</p>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1">
            <span className="font-extrabold text-amber-700 uppercase tracking-wider text-[10px] block">Stage 3</span>
            <p className="font-bold text-amber-900">3. Controlled Practice</p>
            <p className="text-[11px] text-amber-700">Applies correctly in guided sentence transformations & fill-in drills.</p>
          </div>

          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1">
            <span className="font-extrabold text-emerald-700 uppercase tracking-wider text-[10px] block">Stage 4 (Mastery)</span>
            <p className="font-bold text-emerald-900">4. Spontaneous Production</p>
            <p className="text-[11px] text-emerald-700">Produces accurately across multiple unprompted speaking or writing sessions.</p>
          </div>
        </div>

        {/* MASTERY LISTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Grammar Mastery Stages */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Grammar Topic Acquisition Stages
            </h4>

            <div className="space-y-2.5">
              {strengths.masteredGrammar.map((evalItem, idx) => (
                <div key={idx} className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-emerald-950">{evalItem.item.topic}</p>
                      <p className="text-[10px] text-emerald-800 mt-0.5">{evalItem.reason}</p>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-emerald-200 text-emerald-900 shrink-0">
                      Mastered (Spontaneous)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-semibold text-emerald-800 border-t border-emerald-200/80 pt-2">
                    <span>Practiced: {evalItem.sessionsObservedCount}x across sessions</span>
                    <span>Confidence: <strong className="uppercase">{evalItem.confidence}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vocabulary Mastery Stages */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-600" />
              Active Vocabulary Acquisition Stages
            </h4>

            <div className="space-y-2.5">
              {strengths.activeVocabulary.map((evalItem, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-extrabold text-slate-900">{evalItem.item.expression}</span>
                      <span className="text-[10px] text-slate-500 block">{evalItem.item.meaning}</span>
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md ${
                      evalItem.isMastered
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {evalItem.stage.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-600 italic bg-white p-2 rounded border border-slate-200/80">
                    "{evalItem.item.example}"
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>Speaking Usage: <strong>{evalItem.item.speakingUsageScore}%</strong></span>
                    <span>Writing Usage: <strong>{evalItem.item.writingUsageScore}%</strong></span>
                    <span>Confidence: <strong className="uppercase">{evalItem.confidence}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: RECURRING ERROR FREQUENCY & WEIGHTED IMPORTANCE */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              Weighted Recurring Error Diagnostics
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Repeated mistakes receive higher weighted importance score (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded">Frequency × Severity Factor</code>) to prioritize remediation.
            </p>
          </div>
          <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
            {weaknesses.recurringGrammarErrors.length} Priority Issues
          </span>
        </div>

        <div className="space-y-3">
          {weaknesses.recurringGrammarErrors.map((err) => (
            <div key={err.id} className="p-4 bg-rose-50/40 rounded-2xl border border-rose-100 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-rose-950">{err.errorType}</span>
                  <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Category: {err.category}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-bold">
                  <span className="px-2.5 py-1 rounded bg-rose-100 text-rose-800 uppercase">
                    Severity: {err.severity}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-rose-900 text-white uppercase">
                    Weighted Score: {err.weightedImportanceScore}
                  </span>
                </div>
              </div>

              <div className="text-xs font-mono bg-white p-3 rounded-xl border border-rose-100 space-y-1">
                <p className="line-through text-rose-600">"{err.originalSentence}"</p>
                <p className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  "{err.correctedSentence}"
                </p>
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-600 pt-1">
                <span>{err.explanation}</span>
                <span className="font-bold text-rose-900 shrink-0">Frequency: {err.frequency}x</span>
              </div>
            </div>
          ))}
        </div>

        {/* DIAGNOSTIC BREAKDOWN CARDS FOR OTHER SKILL AREAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <span className="font-bold text-slate-900 block border-b border-slate-200 pb-1">Fluency Diagnostics</span>
            {weaknesses.fluencyProblems.map((f, i) => (
              <div key={i} className="space-y-1">
                <p className="font-semibold text-amber-900">{f.issue}</p>
                <p className="text-[11px] text-slate-600">{f.recommendation}</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <span className="font-bold text-slate-900 block border-b border-slate-200 pb-1">Vocabulary Gaps</span>
            {weaknesses.vocabularyGaps.map((v, i) => (
              <div key={i} className="space-y-1">
                <p className="font-semibold text-slate-900">{v.category}</p>
                <p className="text-[11px] text-slate-600">{v.missingRegister}</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <span className="font-bold text-slate-900 block border-b border-slate-200 pb-1">Pronunciation & Stress</span>
            {weaknesses.pronunciationProblems.map((p, i) => (
              <div key={i} className="space-y-1">
                <p className="font-semibold text-slate-900">{p.pattern}</p>
                <p className="text-[11px] text-slate-600">{p.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
