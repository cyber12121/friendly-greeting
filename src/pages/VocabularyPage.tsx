import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Volume2,
  Mic,
  Send,
  Brain,
  Award,
  ArrowRight,
  Clock,
  Target,
  Filter,
  Search,
  AlertCircle,
  Calendar,
  ChevronRight,
  GraduationCap,
  Check,
  Loader2,
  Layers,
  MessageSquare,
  FileText
} from 'lucide-react';
import { VocabularyProfileItem, VocabularyCategory, VocabularyStatus } from '../types';
import {
  evaluateVocabRecommendations,
  calculateVocabMasteryAndInterval,
  getWeakVocabularyForProduction,
  EvaluatedVocabRecommendation
} from '../utils/vocabAdaptiveEngine';
import { aiClientService } from '../services/aiClientService';

export const VocabularyPage: React.FC = () => {
  const { comprehensiveProfile, saveVocabularyItem, addXpAndMinutes } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<VocabularyCategory | 'all'>('all');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'due' | 'weak' | 'mastered'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Practice state
  const [activeSessionItem, setActiveSessionItem] = useState<VocabularyProfileItem | null>(null);
  const [practiceStep, setPracticeStep] = useState<number>(1); // 1: Meaning, 2: Recall, 3: Speaking, 4: Writing, 5: Assessment

  // Step 2 Recall
  const [recallUserAnswer, setRecallUserAnswer] = useState('');
  const [recallScore, setRecallScore] = useState<number | null>(null);

  // Step 3 Speaking
  const [speakingText, setSpeakingText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Step 4 Writing
  const [writingText, setWritingText] = useState('');

  // Step 5 Evaluation
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);

  // Default vocabulary fallback list
  const evaluatedRecommendations = evaluateVocabRecommendations(comprehensiveProfile);
  const weakVocabForProduction = getWeakVocabularyForProduction(comprehensiveProfile, 3);

  // Filtered vocabulary list for dashboard
  const filteredRecommendations = evaluatedRecommendations.filter(rec => {
    const matchesCategory = selectedCategory === 'all' || rec.item.category === selectedCategory;
    const matchesQuery =
      rec.item.expression.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.item.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.item.collocations || []).some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesFilter = true;
    if (selectedFilter === 'due') matchesFilter = rec.isDueForReview;
    else if (selectedFilter === 'weak') matchesFilter = rec.hasProductionGap;
    else if (selectedFilter === 'mastered') matchesFilter = rec.item.status === 'mastered';

    return matchesCategory && matchesQuery && matchesFilter;
  });

  // Start Practice Workflow
  const startSession = (item: VocabularyProfileItem) => {
    setActiveSessionItem(item);
    setPracticeStep(1);
    setRecallUserAnswer('');
    setRecallScore(null);
    setSpeakingText('');
    setWritingText('');
    setEvaluationResult(null);
  };

  // Text-to-speech helper
  const handleSpeakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Step 2 Recall Evaluation
  const handleCheckRecall = () => {
    if (!activeSessionItem) return;
    const target = activeSessionItem.expression.toLowerCase().trim();
    const user = recallUserAnswer.toLowerCase().trim();

    let score = 0;
    if (user === target) {
      score = 100;
    } else if (user.includes(target) || target.includes(user)) {
      score = 75;
    } else {
      score = 30;
    }
    setRecallScore(score);
  };

  // Step 5 Submit for 4D Evaluation
  const handleEvaluateSession = async () => {
    if (!activeSessionItem) return;
    setIsEvaluating(true);

    try {
      const recognition = activeSessionItem.recognitionScore || 85;
      const recall = recallScore !== null ? recallScore : 75;

      const aiResult = await aiClientService.evaluateVocabProduction({
        expression: activeSessionItem.expression,
        recognitionScore: recognition,
        recallScore: recall,
        speakingProductionText: speakingText || activeSessionItem.speakingPrompt?.sampleTarget || activeSessionItem.example,
        writingProductionText: writingText || activeSessionItem.writingPrompt?.sampleTarget || activeSessionItem.example
      });

      const isSuccess = aiResult.overallVocabScore >= 70;
      const calculation = calculateVocabMasteryAndInterval(activeSessionItem, {
        recognitionScore: recognition,
        recallScore: recall,
        speakingUsageScore: aiResult.speakingUsageScore,
        writingUsageScore: aiResult.writingUsageScore,
        isSuccess
      });

      // Save updated vocabulary profile item to context & Firestore
      saveVocabularyItem(calculation.updatedItem);
      addXpAndMinutes(10, 40);

      setEvaluationResult({
        ai: aiResult,
        updated: calculation.updatedItem,
        isNowMastered: calculation.isNowMastered,
        nextReviewDays: calculation.nextReviewDays
      });
      setPracticeStep(5);
    } catch (err) {
      console.error('Failed to evaluate vocabulary production:', err);
      // Fallback evaluation
      const calculation = calculateVocabMasteryAndInterval(activeSessionItem, {
        recognitionScore: activeSessionItem.recognitionScore || 85,
        recallScore: recallScore || 70,
        speakingUsageScore: 78,
        writingUsageScore: 80,
        isSuccess: true
      });
      saveVocabularyItem(calculation.updatedItem);
      addXpAndMinutes(10, 30);

      setEvaluationResult({
        ai: {
          speakingUsageScore: 78,
          speakingFeedback: `Good contextual application of "${activeSessionItem.expression}".`,
          writingUsageScore: 80,
          writingFeedback: 'Solid formal register and clear collocation structure.',
          overallVocabScore: 79,
          summaryFeedback: 'Great effort! Your expression usage is progressing toward B2 fluency.'
        },
        updated: calculation.updatedItem,
        isNowMastered: calculation.isNowMastered,
        nextReviewDays: calculation.nextReviewDays
      });
      setPracticeStep(5);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">
              B2 Expression Engine
            </span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Spaced Repetition Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Adaptive Vocabulary Coach
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Master usable B2 collocations, phrasal verbs, and professional expressions. True mastery requires active production across speaking and writing contexts.
          </p>
        </div>

        {/* TOP STATS BADGES */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <p className="text-[11px] font-bold text-slate-500 uppercase">Mastered</p>
            <p className="text-xl font-black text-emerald-600">
              {comprehensiveProfile.vocabularyProfile.filter(v => v.status === 'mastered').length}
            </p>
          </div>
          <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <p className="text-[11px] font-bold text-slate-500 uppercase">Due Today</p>
            <p className="text-xl font-black text-amber-600">
              {evaluatedRecommendations.filter(r => r.isDueForReview).length}
            </p>
          </div>
          <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <p className="text-[11px] font-bold text-slate-500 uppercase">Total Phrases</p>
            <p className="text-xl font-black text-indigo-600">
              {comprehensiveProfile.vocabularyProfile.length}
            </p>
          </div>
        </div>
      </div>

      {/* WEAK VOCABULARY AUTO-SCHEDULING BANNER */}
      {weakVocabForProduction.length > 0 && !activeSessionItem && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                  <span>Weak Expression Scheduling Active</span>
                  <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-extrabold rounded-md">
                    {weakVocabForProduction.length} Items Flagged
                  </span>
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  The adaptive engine identified production gaps in these expressions and automatically scheduled them into your Speaking & Writing modules:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {weakVocabForProduction.map(wv => (
                    <span
                      key={wv.id}
                      onClick={() => startSession(wv)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-amber-300 text-amber-900 rounded-lg text-xs font-semibold cursor-pointer hover:border-amber-500 transition-colors"
                    >
                      <span>"{wv.expression}"</span>
                      <span className="text-[10px] text-amber-600 font-normal">(Speak {wv.speakingUsageScore}% / Write {wv.writingUsageScore}%)</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE PRACTICE SESSION WORKFLOW (IF ITEM SELECTED) */}
      {activeSessionItem ? (
        <div className="bg-white rounded-2xl border-2 border-indigo-200 p-6 sm:p-8 shadow-lg space-y-6">
          {/* STEP NAVIGATION BAR */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSessionItem(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer"
              >
                ← Back to Dashboard
              </button>
              <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
                {activeSessionItem.category.replace('_', ' ').toUpperCase()} • {activeSessionItem.cefrLevel}
              </span>
            </div>

            {/* STEP PROGRESS INDICATORS */}
            <div className="hidden sm:flex items-center gap-1">
              {[
                { step: 1, label: '1. Meaning' },
                { step: 2, label: '2. Recall' },
                { step: 3, label: '3. Speaking' },
                { step: 4, label: '4. Writing' },
                { step: 5, label: '5. Assessment' }
              ].map(s => (
                <div
                  key={s.step}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    practiceStep === s.step
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : practiceStep > s.step
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {s.label}
                </div>
              ))}
            </div>
          </div>

          {/* STEP 1: MEANING, COLLOCATIONS & REGISTER */}
          {practiceStep === 1 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                      "{activeSessionItem.expression}"
                    </h2>
                    <button
                      onClick={() => handleSpeakText(activeSessionItem.expression)}
                      className="p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl cursor-pointer transition-colors"
                      title="Listen to Pronunciation"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">{activeSessionItem.meaning}</p>
                </div>

                <div className="text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-6 space-y-1">
                  <p className="text-xs text-slate-500 font-bold">B1 Synonym Equivalent</p>
                  <p className="text-sm font-semibold text-rose-600 line-through">
                    {activeSessionItem.b1Equivalent || 'basic expression'}
                  </p>
                  <p className="text-xs text-indigo-700 font-bold">B2 Upgrade Context</p>
                </div>
              </div>

              {/* COLLOCATIONS & EXAMPLE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-2">
                  <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-600" /> High-Impact Collocations
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(activeSessionItem.collocations || [activeSessionItem.expression]).map((col, idx) => (
                      <span key={idx} className="bg-white text-indigo-950 font-bold text-xs px-3 py-1.5 rounded-lg border border-indigo-200 shadow-2xs">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-2">
                  <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-600" /> B2 Context Example
                  </p>
                  <p className="text-xs font-semibold text-emerald-950 leading-relaxed pt-1">
                    "{activeSessionItem.example}"
                  </p>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setPracticeStep(2)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Step 2: Context Recall Drill</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: RECALL & CLOZE DRILL */}
          {practiceStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-600" />
                  Step 2: Cloze Context Recall
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Recall and type the exact B2 expression or collocation to complete the target sentence.
                </p>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <p className="text-xs font-bold text-slate-500 uppercase">Fill in the blank:</p>
                <p className="text-base font-bold text-slate-900 leading-relaxed">
                  "{activeSessionItem.example.replace(new RegExp(activeSessionItem.expression, 'gi'), ' [ ___________ ] ')}"
                </p>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-700">Type the target expression:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={recallUserAnswer}
                      onChange={e => setRecallUserAnswer(e.target.value)}
                      placeholder={`Target phrase: ${activeSessionItem.meaning.slice(0, 30)}...`}
                      className="flex-1 text-xs font-bold p-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button
                      onClick={handleCheckRecall}
                      disabled={!recallUserAnswer.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs px-5 py-3.5 rounded-xl cursor-pointer"
                    >
                      Check Answer
                    </button>
                  </div>
                </div>

                {recallScore !== null && (
                  <div className={`p-4 rounded-xl border text-xs space-y-1 ${
                    recallScore >= 80
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}>
                    <p className="font-bold">
                      {recallScore >= 80 ? '✓ Excellent Recall!' : '⚠️ Needs Practice'}
                    </p>
                    <p>Correct Target Phrase: <strong>"{activeSessionItem.expression}"</strong></p>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setPracticeStep(1)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setPracticeStep(3)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Step 3: Spoken Production</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SPOKEN CONTEXT PRODUCTION */}
          {practiceStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Mic className="w-5 h-5 text-indigo-600" />
                  Step 3: Spoken Context Production
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Produce a natural spoken response in a simulated real-world scenario incorporating "{activeSessionItem.expression}".
                </p>
              </div>

              <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
                <div className="p-4 bg-white rounded-xl border border-indigo-200 space-y-1">
                  <p className="text-xs font-bold text-indigo-900 uppercase">
                    Scenario: {activeSessionItem.speakingPrompt?.scenario || 'Professional Discussion'}
                  </p>
                  <p className="text-xs font-bold text-slate-800">
                    {activeSessionItem.speakingPrompt?.promptText || `State your opinion using "${activeSessionItem.expression}".`}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Your Spoken Response Transcript:</label>
                  <textarea
                    value={speakingText}
                    onChange={e => setSpeakingText(e.target.value)}
                    rows={3}
                    placeholder={`Speak or type your response incorporating "${activeSessionItem.expression}"...`}
                    className="w-full text-xs p-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <button
                    onClick={() => {
                      setIsRecording(!isRecording);
                      if (!isRecording && !speakingText) {
                        setSpeakingText(activeSessionItem.speakingPrompt?.sampleTarget || activeSessionItem.example);
                      }
                    }}
                    className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 cursor-pointer ${
                      isRecording ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-900 text-white'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    <span>{isRecording ? 'Stop Recording' : 'Simulate Speech Recording'}</span>
                  </button>

                  <button
                    onClick={() => setSpeakingText(activeSessionItem.speakingPrompt?.sampleTarget || activeSessionItem.example)}
                    className="text-xs font-semibold text-indigo-700 hover:underline cursor-pointer"
                  >
                    Insert Recommended Model Answer
                  </button>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setPracticeStep(2)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setPracticeStep(4)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Step 4: Written Production</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: FORMAL WRITTEN PRODUCTION */}
          {practiceStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Step 4: Short Formal Writing Production
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Draft a formal written paragraph using "{activeSessionItem.expression}" with appropriate collocations and register.
                </p>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase">
                    Writing Context: {activeSessionItem.writingPrompt?.contextType || 'Formal Memorandum'}
                  </p>
                  <p className="text-xs font-bold text-slate-800">
                    {activeSessionItem.writingPrompt?.promptText || `Compose a short formal paragraph using "${activeSessionItem.expression}".`}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Your Formal Paragraph Submission:</label>
                  <textarea
                    value={writingText}
                    onChange={e => setWritingText(e.target.value)}
                    rows={4}
                    placeholder={`Draft your paragraph incorporating "${activeSessionItem.expression}"...`}
                    className="w-full text-xs p-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setWritingText(activeSessionItem.writingPrompt?.sampleTarget || activeSessionItem.example)}
                    className="text-xs font-semibold text-indigo-700 hover:underline cursor-pointer"
                  >
                    Insert Recommended B2 Model Paragraph
                  </button>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setPracticeStep(3)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  ← Back
                </button>

                <button
                  onClick={handleEvaluateSession}
                  disabled={isEvaluating}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  {isEvaluating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Evaluating 4D Production Scores...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Submit for 4D AI Assessment & Mastery Check</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: 4D AI ASSESSMENT & MASTERY UPDATE */}
          {practiceStep === 5 && evaluationResult && (
            <div className="space-y-6">
              <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Assessment Result
                    </span>
                    <h3 className="text-xl font-black mt-0.5">
                      "{activeSessionItem.expression}" Performance Evaluation
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-emerald-400">
                      {evaluationResult.ai.overallVocabScore}/100
                    </p>
                    <p className="text-[10px] text-slate-400">Overall Score</p>
                  </div>
                </div>

                {/* 4-DIMENSIONAL SCORES GRID */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-center">
                    <p className="text-[10px] font-bold text-slate-400">Recognition</p>
                    <p className="text-base font-extrabold text-white mt-1">
                      {evaluationResult.updated.recognitionScore}%
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-center">
                    <p className="text-[10px] font-bold text-slate-400">Recall Drill</p>
                    <p className="text-base font-extrabold text-white mt-1">
                      {evaluationResult.updated.recallScore}%
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-center">
                    <p className="text-[10px] font-bold text-slate-400">Spoken Context</p>
                    <p className="text-base font-extrabold text-indigo-400 mt-1">
                      {evaluationResult.updated.speakingUsageScore}%
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-center">
                    <p className="text-[10px] font-bold text-slate-400">Written Context</p>
                    <p className="text-base font-extrabold text-emerald-400 mt-1">
                      {evaluationResult.updated.writingUsageScore}%
                    </p>
                  </div>
                </div>

                {/* MASTERY BADGE STATUS */}
                <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6 text-amber-400" />
                    <div>
                      <p className="text-xs font-bold text-white">
                        Mastery Status: <span className="uppercase text-amber-400">{evaluationResult.updated.status}</span>
                      </p>
                      <p className="text-[11px] text-slate-300">
                        {evaluationResult.isNowMastered
                          ? '🎉 Mastery unlocked! Meets all 4-dimensional production requirements.'
                          : 'Mastery requires >=80% in both speaking & writing production across multiple sessions.'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    Next Review: +{evaluationResult.nextReviewDays} days
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                  {evaluationResult.ai.summaryFeedback}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveSessionItem(null)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs cursor-pointer"
                >
                  Done & Return to Expressions List
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* DASHBOARD VIEW: FILTERABLE EXPRESSIONS CATALOG */
        <div className="space-y-6">
          {/* CATEGORY SELECTOR & FILTERS */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
            {/* CATEGORIES */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {[
                { id: 'all', label: 'All Expressions' },
                { id: 'collocations', label: 'Collocations' },
                { id: 'useful_phrases', label: 'Useful Phrases' },
                { id: 'phrasal_verbs', label: 'Phrasal Verbs' },
                { id: 'topic_vocab', label: 'Topic Vocab' },
                { id: 'conversational', label: 'Conversational' },
                { id: 'b2_academic', label: 'B2 Academic' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`text-xs font-bold px-3 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* SEARCH & STATUS FILTER */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search phrases, collocations..."
                  className="w-full text-xs font-medium pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={selectedFilter}
                onChange={e => setSelectedFilter(e.target.value as any)}
                className="text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="due">⏰ Due Today</option>
                <option value="weak">🎯 Production Gap</option>
                <option value="mastered">✅ Mastered</option>
              </select>
            </div>
          </div>

          {/* EXPRESSION CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecommendations.map(({ item, recommendationReason, isDueForReview, hasProductionGap }) => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between p-6 ${
                  item.status === 'mastered'
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : hasProductionGap
                    ? 'border-amber-300 bg-amber-50/20'
                    : isDueForReview
                    ? 'border-indigo-300'
                    : 'border-slate-200'
                }`}
              >
                <div className="space-y-4">
                  {/* CARD HEADER */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {item.category.replace('_', ' ')}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 mt-1">
                        "{item.expression}"
                      </h3>
                    </div>

                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                      item.status === 'mastered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'active'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{item.meaning}</p>

                  {/* RECOMMENDATION REASON BADGE */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-semibold text-slate-700">
                    {recommendationReason}
                  </div>

                  {/* COLLOCATIONS */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Key Collocations:</p>
                    <div className="flex flex-wrap gap-1">
                      {(item.collocations || [item.expression]).slice(0, 3).map((col, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-md">
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 4D PROGRESS METRICS */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-semibold">Spoken Production:</span>
                      <span className="font-extrabold text-indigo-700">{item.speakingUsageScore}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${item.speakingUsageScore}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-500 font-semibold">Written Production:</span>
                      <span className="font-extrabold text-emerald-700">{item.writingUsageScore}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${item.writingUsageScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* START SESSION BUTTON */}
                <div className="pt-6">
                  <button
                    onClick={() => startSession(item)}
                    className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs py-3 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Practice Expression Session</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VocabularyPage;
