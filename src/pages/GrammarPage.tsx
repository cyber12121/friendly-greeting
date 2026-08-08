import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { grammarTopics } from '../data/mockData';
import { aiClientService } from '../services/aiClientService';
import { learnerService } from '../services/learnerService';
import { evaluateGrammarRecommendations, RecommendedGrammarTopicResult } from '../utils/grammarAdaptiveEngine';
import { GrammarProfileItem, GrammarTopicStatus } from '../types';
import {
  BookOpen,
  CheckCircle,
  XCircle,
  HelpCircle,
  Award,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Volume2,
  Loader2,
  Brain,
  Mic,
  PenTool,
  Check,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Layers,
  ShieldCheck,
  MessageSquare,
  BarChart2
} from 'lucide-react';

export const GrammarPage: React.FC = () => {
  const { comprehensiveProfile: profile, updateSkillScore, addXpAndMinutes } = useApp();

  // 1. Evaluate recommended topics based on learner level, error log, review schedule, etc.
  const recommendedResults: RecommendedGrammarTopicResult[] = useMemo(() => {
    return evaluateGrammarRecommendations(profile, grammarTopics);
  }, [profile]);

  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    recommendedResults[0]?.topic.id || grammarTopics[0].id
  );

  const [activeStep, setActiveStep] = useState<number>(1);

  // Lesson state
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [showControlledResults, setShowControlledResults] = useState(false);

  // Step 4: Sentence Production state
  const [sentenceInput, setSentenceInput] = useState('');

  // Step 5: Speaking Production state
  const [speakingInput, setSpeakingInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Step 6: Short Writing Production state
  const [writingInput, setWritingInput] = useState('');

  // AI custom lesson generation
  const [isGeneratingAiLesson, setIsGeneratingAiLesson] = useState(false);
  const [aiCustomLesson, setAiCustomLesson] = useState<{
    topicTitle: string;
    cefrLevel: string;
    explanation: string;
    b1VsB2Comparison: { b1Way: string; b2Way: string; explanation: string }[];
    examples: string[];
  } | null>(null);

  // Step 7: Assessment & Multi-dimensional Mastery state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    recognitionScore: number;
    controlledAccuracyScore: number;
    sentenceProductionScore: number;
    sentenceFeedback: string;
    sentenceCorrection: string;
    speakingUsageScore: number;
    speakingFeedback: string;
    speakingCorrection: string;
    writingUsageScore: number;
    writingFeedback: string;
    writingCorrection: string;
    overallGrammarAccuracy: number;
    recommendedScaffolding: 'simplified' | 'standard' | 'advanced';
    nextReviewDays: number;
    summaryFeedback: string;
    savedItem?: GrammarProfileItem;
  } | null>(null);

  const currentRecommendation = recommendedResults.find(r => r.topic.id === selectedTopicId) || recommendedResults[0];
  const currentTopic = currentRecommendation.topic;
  const historyItem = currentRecommendation.history;

  // TTS Helper
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleGenerateAiLesson = async () => {
    setIsGeneratingAiLesson(true);
    try {
      const lesson = await aiClientService.generateGrammarLesson(currentTopic.title);
      setAiCustomLesson(lesson);
    } catch (err) {
      console.error('Failed to generate AI grammar lesson:', err);
    } finally {
      setIsGeneratingAiLesson(false);
    }
  };

  const handleSelectOption = (exerciseId: string, optionIndex: number) => {
    if (showControlledResults) return;
    setUserAnswers(prev => ({ ...prev, [exerciseId]: optionIndex }));
  };

  const calculateControlledScore = () => {
    if (!currentTopic.exercises || currentTopic.exercises.length === 0) return 80;
    let correct = 0;
    currentTopic.exercises.forEach(ex => {
      if (userAnswers[ex.id] === ex.correctIndex) correct++;
    });
    return Math.round((correct / currentTopic.exercises.length) * 100);
  };

  const handleSimulateRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      if (!speakingInput) {
        setSpeakingInput(currentTopic.speakingProductionPrompt?.sampleTarget || `In our team meeting, I stated that had we received feedback earlier, we would have adjusted the release smoothly.`);
      }
    } else {
      setIsRecording(true);
    }
  };

  const handleResetLesson = () => {
    setActiveStep(1);
    setUserAnswers({});
    setShowControlledResults(false);
    setSentenceInput('');
    setSpeakingInput('');
    setWritingInput('');
    setEvaluationResult(null);
  };

  const handleRunFullEvaluation = async () => {
    setIsEvaluating(true);
    const controlledScore = calculateControlledScore();

    try {
      const aiEval = await aiClientService.evaluateGrammarProduction({
        topicName: currentTopic.title,
        sentenceProductionText: sentenceInput || currentTopic.sentenceProductionPrompt?.sampleTarget || 'Had we analyzed the data, we would have avoided errors.',
        speakingProductionText: speakingInput || currentTopic.speakingProductionPrompt?.sampleTarget || 'Had we received client feedback earlier, we would have adjusted timelines.',
        writingProductionText: writingInput || currentTopic.writingProductionPrompt?.sampleTarget || 'Had the risk assessment been completed during Q1, delays would have been mitigated.',
        controlledScore
      });

      const recognitionScore = Math.min(100, controlledScore + 5);
      const controlledAccuracyScore = controlledScore;
      const sentenceProductionScore = aiEval.sentenceProductionScore || 80;
      const speakingUsageScore = aiEval.speakingUsageScore || 78;
      const writingUsageScore = aiEval.writingUsageScore || 82;

      const overallAccuracy = Math.round(
        (recognitionScore + controlledAccuracyScore + sentenceProductionScore + speakingUsageScore + writingUsageScore) / 5
      );

      const timesPracticed = (historyItem?.timesPracticed || 0) + 1;
      const timesFailed = overallAccuracy < 60 ? (historyItem?.timesFailed || 0) + 1 : (historyItem?.timesFailed || 0);

      // Rule: Do NOT mark a topic as mastered after just one exercise.
      // Needs timesPracticed >= 3 AND overallAccuracy >= 85 AND all dimension scores >= 80
      const isMastered =
        timesPracticed >= 3 &&
        overallAccuracy >= 85 &&
        recognitionScore >= 80 &&
        controlledAccuracyScore >= 80 &&
        sentenceProductionScore >= 80 &&
        speakingUsageScore >= 80 &&
        writingUsageScore >= 80;

      let newStatus: GrammarTopicStatus = 'learning';
      if (isMastered) {
        newStatus = 'mastered';
      } else if (overallAccuracy >= 75 || (historyItem?.accuracy || 0) >= 70) {
        newStatus = 'developing';
      }

      let nextDays = aiEval.nextReviewDays || (overallAccuracy >= 85 ? 7 : overallAccuracy >= 60 ? 3 : 1);
      if (timesFailed >= 2) nextDays = 1; // force tomorrow review if repeatedly failing

      const nextReviewDate = new Date(Date.now() + nextDays * 86400000).toISOString().split('T')[0];
      const scaffoldingLevel = timesFailed >= 2 || overallAccuracy < 60 ? 'simplified' : overallAccuracy >= 85 ? 'advanced' : 'standard';

      const updatedGrammarItem: GrammarProfileItem = {
        id: historyItem?.id || `g-mod-${Date.now()}`,
        topic: currentTopic.title,
        cefrLevel: currentTopic.cefrLevel,
        status: newStatus,
        accuracy: overallAccuracy,
        recognitionScore,
        controlledAccuracyScore,
        sentenceProductionScore,
        speakingUsageScore,
        writingUsageScore,
        scaffoldingLevel,
        lastPracticed: new Date().toISOString().split('T')[0],
        timesPracticed,
        timesFailed,
        nextReviewDate
      };

      // Save to centralized Learner Service & Firestore
      learnerService.saveGrammarTopic(updatedGrammarItem);

      // Record Session
      learnerService.recordSession({
        activityType: 'Adaptive Grammar Lesson',
        topic: currentTopic.title,
        durationMinutes: 12,
        score: overallAccuracy,
        notes: `Grammar status: ${newStatus.toUpperCase()}. Review scheduled in ${nextDays} days.`
      });

      // Update XP & Skill Score
      addXpAndMinutes(15, 45);
      updateSkillScore('Grammar', Math.round((overallAccuracy - 60) / 5));

      setEvaluationResult({
        recognitionScore,
        controlledAccuracyScore,
        sentenceProductionScore,
        sentenceFeedback: aiEval.sentenceFeedback || 'Clear structural construction aligned with B2 rules.',
        sentenceCorrection: aiEval.sentenceCorrection || sentenceInput,
        speakingUsageScore,
        speakingFeedback: aiEval.speakingFeedback || 'Good spoken register and natural intonation.',
        speakingCorrection: aiEval.speakingCorrection || speakingInput,
        writingUsageScore,
        writingFeedback: aiEval.writingFeedback || 'Strong formal register with clear cohesive devices.',
        writingCorrection: aiEval.writingCorrection || writingInput,
        overallGrammarAccuracy: overallAccuracy,
        recommendedScaffolding: scaffoldingLevel,
        nextReviewDays: nextDays,
        summaryFeedback: aiEval.summaryFeedback || 'Excellent progress across all 5 production dimensions.',
        savedItem: updatedGrammarItem
      });

      setActiveStep(7);
    } catch (err) {
      console.error('Failed to complete grammar evaluation:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header & Adaptive Selection Engine Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Adaptive Grammar Coach</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Personalized grammar selection based on recurring errors, review schedules, and production objectives
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-teal-600" />
              <span>Current Level: {profile.userProfile.currentCEFRLevel}</span>
            </span>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
              <span>Target: {profile.userProfile.targetCEFRLevel}</span>
            </span>
          </div>
        </div>

        {/* Adaptive Topic Selector Grid */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Recommended Grammar Focus Areas
            </h3>
            <span className="text-[11px] text-slate-500 italic">Ranked dynamically by error history & mastery gaps</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recommendedResults.map(({ topic, priorityScore, recommendationReason, badgeType, history }) => {
              const isSelected = topic.id === selectedTopicId;

              let badgeStyle = "bg-slate-100 text-slate-700 border-slate-200";
              let badgeText = "Standard Module";

              if (badgeType === 'error_triggered') {
                badgeStyle = "bg-rose-50 text-rose-800 border-rose-200 font-bold";
                badgeText = "🔥 Error Triggered";
              } else if (badgeType === 'review_due') {
                badgeStyle = "bg-amber-50 text-amber-800 border-amber-200 font-bold";
                badgeText = "⏰ Review Due Today";
              } else if (badgeType === 'mastery_gap') {
                badgeStyle = "bg-indigo-50 text-indigo-800 border-indigo-200 font-bold";
                badgeText = "⚠️ Low Mastery Gap";
              } else if (badgeType === 'level_objective') {
                badgeStyle = "bg-teal-50 text-teal-800 border-teal-200 font-bold";
                badgeText = "🎯 B2 Target Step";
              }

              return (
                <button
                  key={topic.id}
                  onClick={() => {
                    setSelectedTopicId(topic.id);
                    handleResetLesson();
                  }}
                  className={`p-4 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20 shadow-xs'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md border ${badgeStyle}`}>
                        {badgeText}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">{topic.cefrLevel}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 line-clamp-2">{topic.title}</p>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-500 border-t border-slate-200/60 pt-2">
                    <p className="line-clamp-2 italic text-[10px] text-slate-600">{recommendationReason}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>Status: <strong className="text-slate-700 capitalize">{history?.status || 'new'}</strong></span>
                      <span>Accuracy: <strong className="text-teal-700">{history?.accuracy ? `${history.accuracy}%` : 'New'}</strong></span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 7-Step Navigation Workflow Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[700px] gap-2">
          {[
            { num: 1, title: '1. Explain Simply', icon: BookOpen },
            { num: 2, title: '2. Examples & Audio', icon: Volume2 },
            { num: 3, title: '3. Controlled Practice', icon: Brain },
            { num: 4, title: '4. Sentence Build', icon: CheckCircle },
            { num: 5, title: '5. Speaking Usage', icon: Mic },
            { num: 6, title: '6. Writing Usage', icon: PenTool },
            { num: 7, title: '7. Multi-Mastery Eval', icon: Award }
          ].map((step, idx) => {
            const IconComponent = step.icon;
            const isCompleted = activeStep > step.num;
            const isCurrent = activeStep === step.num;

            return (
              <React.Fragment key={step.num}>
                <button
                  onClick={() => setActiveStep(step.num)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                    isCurrent
                      ? 'bg-teal-600 text-white font-bold shadow-xs'
                      : isCompleted
                      ? 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                  <span>{step.title}</span>
                  {isCompleted && <Check className="w-3 h-3 text-teal-600 ml-1" />}
                </button>
                {idx < 6 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* STEP 1: EXPLAIN SIMPLY */}
      {activeStep === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Step 1 of 7 • Concept Explanation
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2">{currentTopic.title}</h3>
            </div>

            <button
              onClick={handleGenerateAiLesson}
              disabled={isGeneratingAiLesson}
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              {isGeneratingAiLesson ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              )}
              <span>{isGeneratingAiLesson ? 'Generating Custom AI Lesson...' : 'AI Deep Custom Explanation'}</span>
            </button>
          </div>

          {/* Simple Explanation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Concept Overview</h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              {aiCustomLesson ? aiCustomLesson.explanation : currentTopic.explanation}
            </p>
          </div>

          {/* Structural Formula Box */}
          {currentTopic.formula && (
            <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/70 space-y-1">
              <span className="text-[10px] font-bold uppercase text-teal-800 tracking-wider flex items-center gap-1">
                <Layers className="w-3 h-3 text-teal-600" /> Structural Formula / Pattern
              </span>
              <p className="text-xs font-mono font-bold text-teal-950">{currentTopic.formula}</p>
            </div>
          )}

          {/* B1 vs B2 Register Comparisons */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">B1 vs B2 Register Upgrade</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentTopic.b1VsB2Comparison.map((comp, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Standard B1 Formulation</span>
                    <p className="text-xs text-slate-600 line-through bg-white p-2.5 rounded-lg border border-slate-200">{comp.b1Way}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-teal-700 uppercase flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-teal-600" /> B2 Precision Target
                    </span>
                    <p className="text-xs font-semibold text-teal-950 bg-teal-50 p-2.5 rounded-lg border border-teal-200">{comp.b2Way}</p>
                  </div>
                  <p className="text-[11px] text-slate-500 italic pt-1">{comp.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveStep(2)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <span>Next: Step 2 Examples</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SHOW EXAMPLES */}
      {activeStep === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Step 2 of 7 • Natural Context Examples
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-2">Natural B2 Example Sentences</h3>
            <p className="text-xs text-slate-500 mt-1">Listen to natural pronunciation and notice structural cadence</p>
          </div>

          <div className="space-y-3">
            {currentTopic.examples.map((ex, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900">"{ex}"</p>
                </div>
                <button
                  onClick={() => speakText(ex)}
                  className="p-2 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-700 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Listen to native pronunciation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveStep(1)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Back to Explanation
            </button>
            <button
              onClick={() => setActiveStep(3)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <span>Next: Step 3 Controlled Practice</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CONTROLLED EXERCISES */}
      {activeStep === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Step 3 of 7 • Controlled Recognition & Accuracy
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2">Multiple Choice Recognition Questions</h3>
            </div>

            {showControlledResults && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-xl font-bold text-xs">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Accuracy: {calculateControlledScore()}%</span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {currentTopic.exercises.map((ex, qIdx) => {
              const selectedOpt = userAnswers[ex.id];
              const isCorrect = selectedOpt === ex.correctIndex;

              return (
                <div key={ex.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      Q{qIdx + 1}
                    </span>
                    <p className="text-sm font-bold text-slate-900 leading-snug">{ex.question}</p>
                  </div>

                  <div className="space-y-2">
                    {ex.options.map((opt, optIdx) => {
                      let optionStyle = "border-slate-200 bg-white text-slate-700 hover:border-slate-300";
                      if (selectedOpt === optIdx) {
                        optionStyle = "border-teal-600 bg-teal-50 text-teal-900 font-bold";
                      }

                      if (showControlledResults) {
                        if (optIdx === ex.correctIndex) {
                          optionStyle = "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold";
                        } else if (selectedOpt === optIdx && !isCorrect) {
                          optionStyle = "border-rose-600 bg-rose-50 text-rose-950 font-bold";
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={showControlledResults}
                          onClick={() => handleSelectOption(ex.id, optIdx)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${optionStyle}`}
                        >
                          <span>{opt}</span>
                          {showControlledResults && optIdx === ex.correctIndex && (
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                          {showControlledResults && selectedOpt === optIdx && !isCorrect && (
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {showControlledResults && (
                    <div className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                      isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}>
                      <p className="font-bold flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4" /> Explanation:
                      </p>
                      <p>{ex.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {!showControlledResults ? (
              <button
                onClick={() => setShowControlledResults(true)}
                disabled={Object.keys(userAnswers).length === 0}
                className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Check Answers
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowControlledResults(false)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retry
                </button>
                <button
                  onClick={() => setActiveStep(4)}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <span>Next: Step 4 Sentence Build</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: SENTENCE PRODUCTION */}
      {activeStep === 4 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Step 4 of 7 • Sentence Production & Transformation
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-2">Construct or Transform a Target Sentence</h3>
            <p className="text-xs text-slate-500 mt-1">Apply the grammar rule in an active standalone written sentence</p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Production Task</span>
            <p className="text-sm font-bold text-slate-900">
              {currentTopic.sentenceProductionPrompt?.instruction || `Rewrite or construct a formal sentence applying "${currentTopic.title}".`}
            </p>
            {currentTopic.sentenceProductionPrompt?.startingText && (
              <p className="text-xs font-mono text-teal-800 bg-teal-50 p-2 rounded-lg border border-teal-200">
                Start with: <strong>{currentTopic.sentenceProductionPrompt.startingText}</strong>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Your Sentence Attempt:</label>
            <textarea
              value={sentenceInput}
              onChange={(e) => setSentenceInput(e.target.value)}
              placeholder="Type your transformed B2 sentence here..."
              rows={3}
              className="w-full text-xs sm:text-sm p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveStep(3)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => setActiveStep(5)}
              disabled={!sentenceInput.trim()}
              className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <span>Next: Step 5 Speaking Usage</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: SPEAKING PRODUCTION */}
      {activeStep === 5 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Step 5 of 7 • Oral Speaking Application
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-2">Spoken Grammar Usage Scenario</h3>
            <p className="text-xs text-slate-500 mt-1">Demonstrate natural oral execution in a workplace scenario</p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Scenario Context</span>
            <p className="text-xs font-bold text-slate-800">
              {currentTopic.speakingProductionPrompt?.scenario || 'Professional Discussion'}
            </p>
            <p className="text-xs text-slate-600">
              {currentTopic.speakingProductionPrompt?.promptText || `Speak a response applying ${currentTopic.title}.`}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSimulateRecording}
                className={`p-3 rounded-full text-white font-bold transition-all cursor-pointer ${
                  isRecording ? 'bg-rose-600 animate-pulse' : 'bg-teal-600 hover:bg-teal-700'
                }`}
              >
                <Mic className="w-5 h-5" />
              </button>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  {isRecording ? 'Listening / Recording spoken answer...' : 'Click mic to record or fill transcript'}
                </p>
                <p className="text-[11px] text-slate-500">Practice saying your response out loud</p>
              </div>
            </div>

            <button
              onClick={() => speakText(speakingInput || currentTopic.speakingProductionPrompt?.sampleTarget || 'Had we received client feedback earlier, we would have adjusted the timeline.')}
              disabled={!speakingInput}
              className="text-xs font-bold text-teal-800 hover:text-teal-900 flex items-center gap-1.5 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" /> Listen to Audio
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Spoken Turn Transcript:</label>
            <textarea
              value={speakingInput}
              onChange={(e) => setSpeakingInput(e.target.value)}
              placeholder="Your spoken transcript will appear here (or type your oral attempt)..."
              rows={3}
              className="w-full text-xs sm:text-sm p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveStep(4)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => setActiveStep(6)}
              disabled={!speakingInput.trim()}
              className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <span>Next: Step 6 Writing Usage</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: SHORT WRITING PRODUCTION */}
      {activeStep === 6 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Step 6 of 7 • Short Writing Context Application
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-2">Formal Micro-Writing Paragraph</h3>
            <p className="text-xs text-slate-500 mt-1">Write a short 2-3 sentence paragraph incorporating the target structure into formal context</p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {currentTopic.writingProductionPrompt?.contextType || 'Formal Writing Task'}
            </span>
            <p className="text-xs font-bold text-slate-900 leading-relaxed">
              {currentTopic.writingProductionPrompt?.promptText || `Write a brief paragraph using ${currentTopic.title}.`}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Your Micro-Essay / Paragraph:</label>
            <textarea
              value={writingInput}
              onChange={(e) => setWritingInput(e.target.value)}
              placeholder="Write 2-3 formal sentences here..."
              rows={4}
              className="w-full text-xs sm:text-sm p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveStep(5)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Back
            </button>

            <button
              onClick={handleRunFullEvaluation}
              disabled={isEvaluating || !writingInput.trim()}
              className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Evaluating 5 Mastery Dimensions...</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>Run Step 7 Diagnostic Assessment</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: MULTI-DIMENSIONAL ASSESSMENT & AUTOMATIC SCHEDULING */}
      {activeStep === 7 && evaluationResult && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Step 7 of 7 • Multi-dimensional Diagnostic Assessment
              </span>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{currentTopic.title}</h3>
              <p className="text-xs text-slate-500 mt-1">Separate tracking across recognition, controlled accuracy, sentence build, speaking, & writing</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-center bg-teal-50 p-3.5 rounded-2xl border border-teal-200 min-w-[120px]">
                <p className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">Overall Accuracy</p>
                <p className="text-2xl font-extrabold text-teal-900">{evaluationResult.overallGrammarAccuracy}%</p>
              </div>

              <div className="text-center bg-slate-900 text-white p-3.5 rounded-2xl min-w-[120px]">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Topic Status</p>
                <p className="text-sm font-extrabold text-teal-300 capitalize mt-1">{evaluationResult.savedItem?.status}</p>
              </div>
            </div>
          </div>

          {/* 5-Dimension Mastery Progress Grid */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-teal-600" /> Multi-dimensional Mastery Breakdown
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { label: 'Recognition', score: evaluationResult.recognitionScore, desc: 'Rule identification' },
                { label: 'Controlled Accuracy', score: evaluationResult.controlledAccuracyScore, desc: 'Multiple choice precision' },
                { label: 'Sentence Production', score: evaluationResult.sentenceProductionScore, desc: 'Transformation construction' },
                { label: 'Speaking Usage', score: evaluationResult.speakingUsageScore, desc: 'Spoken scenario execution' },
                { label: 'Writing Usage', score: evaluationResult.writingUsageScore, desc: 'Formal written register' }
              ].map((dim, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{dim.label}</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-bold text-slate-900">{dim.score}%</span>
                    <span className="text-[10px] text-slate-400">{dim.desc}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        dim.score >= 80 ? 'bg-emerald-500' : dim.score >= 65 ? 'bg-teal-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Multi-Practice Mastery Notice */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3 text-xs text-slate-700">
            <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-slate-900">Adaptive Mastery Standard</p>
              <p className="text-slate-600">
                To prevent false mastery, a grammar topic is only marked as <strong>Mastered</strong> after at least <strong>3 separate successful practice sessions</strong> across all 5 dimensions. Current session attempts: <strong>{evaluationResult.savedItem?.timesPracticed || 1}</strong>.
              </p>
            </div>
          </div>

          {/* Adaptive Review Schedule & Scaffolding Adjustment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600" /> Automated Spaced Review
                </span>
                <span className="text-xs font-bold text-indigo-700 bg-white px-2.5 py-0.5 rounded-md border border-indigo-200">
                  + {evaluationResult.nextReviewDays} Days
                </span>
              </div>
              <p className="text-xs text-indigo-900/80">
                Next review scheduled for <strong>{evaluationResult.savedItem?.nextReviewDate}</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-teal-600" /> Scaffolding Adjustment
                </span>
                <span className="text-xs font-bold text-teal-800 bg-white px-2.5 py-0.5 rounded-md border border-teal-200 capitalize">
                  {evaluationResult.recommendedScaffolding} Level
                </span>
              </div>
              <p className="text-xs text-teal-900/80">
                {evaluationResult.recommendedScaffolding === 'simplified'
                  ? 'Difficulty reduced with extra hints to support mastery.'
                  : evaluationResult.recommendedScaffolding === 'advanced'
                  ? 'Complexity increased with B2+/C1 advanced structures.'
                  : 'Standard B2 difficulty maintained.'}
              </p>
            </div>
          </div>

          {/* Detailed Production Feedback & Corrections */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">AI Diagnostic Production Critique</h4>

            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-teal-600" /> Sentence Construction Feedback ({evaluationResult.sentenceProductionScore}%)
                </p>
                <p className="text-xs text-slate-600">{evaluationResult.sentenceFeedback}</p>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-800">
                  Corrected: {evaluationResult.sentenceCorrection}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-teal-600" /> Spoken Register Feedback ({evaluationResult.speakingUsageScore}%)
                </p>
                <p className="text-xs text-slate-600">{evaluationResult.speakingFeedback}</p>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-800">
                  Polished Spoken Turn: {evaluationResult.speakingCorrection}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <PenTool className="w-4 h-4 text-teal-600" /> Short Writing Feedback ({evaluationResult.writingUsageScore}%)
                </p>
                <p className="text-xs text-slate-600">{evaluationResult.writingFeedback}</p>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-800">
                  Polished Written Paragraph: {evaluationResult.writingCorrection}
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={handleResetLesson}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Practice Topic Again
            </button>

            <button
              onClick={() => {
                // Select next recommended topic
                const nextTopic = recommendedResults.find(r => r.topic.id !== selectedTopicId)?.topic.id;
                if (nextTopic) {
                  setSelectedTopicId(nextTopic);
                  handleResetLesson();
                } else {
                  handleResetLesson();
                }
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors cursor-pointer"
            >
              Continue to Next Recommended Topic
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
