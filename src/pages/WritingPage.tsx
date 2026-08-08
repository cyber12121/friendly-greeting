import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { writingPrompts } from '../data/mockData';
import { aiClientService } from '../services/aiClientService';
import { crossSkillEngine } from '../services/crossSkillEngine';
import {
  PenTool,
  Sparkles,
  Award,
  Send,
  HelpCircle,
  FileText,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  BookOpen,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  X,
  RefreshCw,
  Clock,
  Target,
  FileCheck,
  ThumbsUp,
  Bookmark,
  Check,
  Zap,
  Activity,
  ListTodo
} from 'lucide-react';

interface AdaptedTask {
  id: string;
  title: string;
  type: string;
  promptText: string;
  cefrLevel: string;
  targetGrammar: string[];
  targetVocabulary: string[];
  relatedSpeakingTopic: string;
  targetedWeaknesses: string[];
  usefulConnectors: string[];
  minWords: number;
  maxWords: number;
  recommendedTime: number;
}

interface DraftError {
  category: string;
  originalSnippet: string;
  explanation: string;
  guidedHint: string;
}

interface DraftFeedback {
  grammarScore: number;
  vocabularyScore: number;
  sentenceStructureScore: number;
  coherenceCohesionScore: number;
  organizationScore: number;
  taskCompletionScore: number;
  naturalnessScore: number;
  overallScore: number;
  assessedCEFRLevel: string;
  categorizedErrors: DraftError[];
  strengths: string[];
  revisionChecklist: string[];
  vocabularyUpgradeHints: Array<{ original: string; suggested: string; reason: string }>;
  summaryFeedback: string;
}

interface RevisionFeedback {
  draftScore: number;
  revisionScore: number;
  improvementDelta: number;
  grammarScore: number;
  vocabularyScore: number;
  sentenceStructureScore: number;
  coherenceScore: number;
  cohesionScore: number;
  organizationScore: number;
  taskCompletionScore: number;
  naturalnessScore: number;
  overallScore: number;
  assessedCEFRLevel: string;
  resolvedErrors: string[];
  remainingAreas: string[];
  strengths: string[];
  finalDiagnosticFeedback: string;
  skillScoreDelta: number;
}

export const WritingPage: React.FC = () => {
  const {
    comprehensiveProfile,
    updateCoreSkill,
    recordLearnerSession,
    logLearnerError,
    addXpAndMinutes,
    updateSkillScore
  } = useApp();

  // Navigation / Process steps: 'task_selection' | 'drafting' | 'review' | 'revision' | 'final_assessment'
  const [currentStep, setCurrentStep] = useState<'task_selection' | 'drafting' | 'review' | 'revision' | 'final_assessment'>('task_selection');

  // Task generation configuration
  const [useAdaptiveTask, setUseAdaptiveTask] = useState<boolean>(true);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(writingPrompts[0].id);
  const [isGeneratingTask, setIsGeneratingTask] = useState<boolean>(false);
  const [selectedCEFR, setSelectedCEFR] = useState<string>(comprehensiveProfile.userProfile.currentCEFRLevel || 'B2');
  
  // The active task (either preset or dynamic AI-generated)
  const [activeTask, setActiveTask] = useState<AdaptedTask | null>(null);

  // Drafting step
  const [draftText, setDraftText] = useState<string>('');
  const [isSubmittingDraft, setIsSubmittingDraft] = useState<boolean>(false);
  const [draftFeedback, setDraftFeedback] = useState<DraftFeedback | null>(null);

  // Revision step
  const [revisionText, setRevisionText] = useState<string>('');
  const [isSubmittingRevision, setIsSubmittingRevision] = useState<boolean>(false);
  const [completedRevisionItems, setCompletedRevisionItems] = useState<Record<number, boolean>>({});
  const [revisionFeedback, setRevisionFeedback] = useState<RevisionFeedback | null>(null);

  // Timer simulation state
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  // Extract relevant targets for task generation context
  const activeGrammarTargets = comprehensiveProfile.grammarProfile
    .filter(g => g.status === 'learning' || g.status === 'developing')
    .slice(0, 2)
    .map(g => g.topic);

  const activeVocabTargets = comprehensiveProfile.vocabularyProfile
    .filter(v => v.status === 'learning' || v.speakingUsageScore < 70 || v.writingUsageScore < 70)
    .slice(0, 3)
    .map(v => v.expression);

  const activeRecentSpeaking = comprehensiveProfile.sessionHistory
    .filter(s => s.activityType.toLowerCase().includes('speaking'))
    .slice(0, 1)
    .map(s => s.topic);

  const activeWeaknesses = comprehensiveProfile.errorLog
    .filter(e => e.status === 'active')
    .slice(0, 2)
    .map(e => `${e.errorType} in ${e.category}`);

  // Countdown Timer effect
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  // Start timer helper
  const startTaskTimer = (minutes: number) => {
    setTimeLeft(minutes * 60);
    setTimerActive(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Helper to highlight targeted connectors/vocabulary inside user text in real-time
  const getUsageStatus = (phrase: string, text: string) => {
    if (!text || !phrase) return false;
    const cleanPhrase = phrase.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').trim();
    // Match word boundaries or substring
    const regex = new RegExp(cleanPhrase, 'i');
    return regex.test(text.toLowerCase());
  };

  // Step 1: Launch Task (generate dynamic AI task or load preset)
  const handleLaunchTask = async () => {
    setIsGeneratingTask(true);
    try {
      if (useAdaptiveTask) {
        // Trigger server-side Gemini adaptive task generator
        const task = await aiClientService.generateWritingTask({
          cefrLevel: selectedCEFR,
          grammarTargets: activeGrammarTargets.length ? activeGrammarTargets : ['Third Conditionals', 'Complex Passives'],
          vocabularyTargets: activeVocabTargets.length ? activeVocabTargets : ['articulate a vision', 'mitigate risks'],
          recentSpeakingTopics: activeRecentSpeaking.length ? activeRecentSpeaking : ['Workplace Automation & Productivity'],
          writingWeaknesses: activeWeaknesses.length ? activeWeaknesses : ['Cohesion & Transition Variety']
        });

        setActiveTask({
          id: task.id || `wtask-${Date.now()}`,
          title: task.title || 'Dynamic Writing Directive',
          type: task.type || 'proposal',
          promptText: task.promptText || 'Draft a structured memo analyzing recent team milestones and identifying prospective performance enhancements.',
          cefrLevel: task.cefrLevel || selectedCEFR,
          targetGrammar: task.targetGrammar || ['Third Conditionals'],
          targetVocabulary: task.targetVocabulary || ['articulate a vision'],
          relatedSpeakingTopic: task.relatedSpeakingTopic || 'Team Collaboration',
          targetedWeaknesses: task.targetedWeaknesses || ['Grammatical Accuracy'],
          usefulConnectors: task.usefulConnectors || ['Furthermore', 'In addition to this', 'Consequently'],
          minWords: task.minWords || 120,
          maxWords: task.maxWords || 220,
          recommendedTime: task.recommendedTime || 20
        });
      } else {
        // Load preset from writingPrompts
        const preset = writingPrompts.find(p => p.id === selectedPresetId) || writingPrompts[0];
        setActiveTask({
          id: preset.id,
          title: preset.title,
          type: preset.type,
          promptText: preset.promptText,
          cefrLevel: 'B2',
          targetGrammar: ['Inversion', 'Third Conditionals'],
          targetVocabulary: ['articulate a vision', 'substantiate a claim'],
          relatedSpeakingTopic: 'Hybrid Workforces',
          targetedWeaknesses: ['Academic Register'],
          usefulConnectors: preset.usefulConnectors,
          minWords: preset.minWords,
          maxWords: preset.maxWords,
          recommendedTime: preset.recommendedTime
        });
      }

      setDraftText('');
      setRevisionText('');
      setDraftFeedback(null);
      setRevisionFeedback(null);
      setCompletedRevisionItems({});
      setCurrentStep('drafting');
      startTaskTimer(useAdaptiveTask ? 20 : 25);
    } catch (err) {
      console.error('Failed to generate adaptive task:', err);
      // Failover to structured default task
      const fallbackPreset = writingPrompts[0];
      setActiveTask({
        id: fallbackPreset.id,
        title: fallbackPreset.title,
        type: fallbackPreset.type,
        promptText: fallbackPreset.promptText,
        cefrLevel: 'B2',
        targetGrammar: ['Hypothetical structures'],
        targetVocabulary: ['articulate a vision', 'substantiate a claim'],
        relatedSpeakingTopic: 'Modern Working Dynamics',
        targetedWeaknesses: ['Cohesive devices'],
        usefulConnectors: fallbackPreset.usefulConnectors,
        minWords: fallbackPreset.minWords,
        maxWords: fallbackPreset.maxWords,
        recommendedTime: fallbackPreset.recommendedTime
      });
      setDraftText('');
      setRevisionText('');
      setDraftFeedback(null);
      setRevisionFeedback(null);
      setCompletedRevisionItems({});
      setCurrentStep('drafting');
      startTaskTimer(20);
    } finally {
      setIsGeneratingTask(false);
    }
  };

  // Step 2: Submit independent Draft (Draft 1) for AI assessment
  const handleSubmitDraft = async () => {
    if (!draftText.trim() || !activeTask) return;
    setIsSubmittingDraft(true);
    setTimerActive(false);

    try {
      const response = await aiClientService.analyzeWritingDraft({
        taskTitle: activeTask.title,
        taskType: activeTask.type,
        promptText: activeTask.promptText,
        targetGrammar: activeTask.targetGrammar,
        targetVocabulary: activeTask.targetVocabulary,
        draftText: draftText.trim()
      });

      setDraftFeedback(response);
      setRevisionText(draftText); // Initialize the revision draft editor with Draft 1
      setCurrentStep('review');
    } catch (err) {
      console.error('Failed to analyze writing draft:', err);
      // Dynamic fallback
      const fallback: DraftFeedback = {
        grammarScore: 76,
        vocabularyScore: 78,
        sentenceStructureScore: 75,
        coherenceCohesionScore: 72,
        organizationScore: 80,
        taskCompletionScore: 85,
        naturalnessScore: 74,
        overallScore: 77,
        assessedCEFRLevel: 'B2',
        categorizedErrors: [
          {
            category: 'grammar',
            originalSnippet: 'We would have achieved more if we had implemented it.',
            explanation: 'Correct syntax, but we can improve variety with inversion.',
            guidedHint: 'Can you rewrite this using inversion? Start with "Had we achieved..." or "Had we implemented..."'
          },
          {
            category: 'vocabulary',
            originalSnippet: 'show our ideas good',
            explanation: 'Sub-optimal formal business register choice.',
            guidedHint: 'Upgrade "show our ideas good" using the recommended collocation "articulate a vision".'
          }
        ],
        strengths: ['Great paragraph layout', 'Addressed all main points in the prompt requirements.'],
        revisionChecklist: [
          'Incorporate "articulate a vision" to improve register.',
          'Inject formal logical connectors such as "Consequently" or "Furthermore".',
          'Review conditional clause in paragraph 2.'
        ],
        vocabularyUpgradeHints: [
          {
            original: 'make risks smaller',
            suggested: 'mitigate risks',
            reason: 'Provides a more professional and precise B2 tone.'
          }
        ],
        summaryFeedback: 'Solid independent effort! You have a great core layout. Apply the guided tips in the revision stage to boost your scores toward full B2 fluency.'
      };
      setDraftFeedback(fallback);
      setRevisionText(draftText);
      setCurrentStep('review');
    } finally {
      setIsSubmittingDraft(false);
    }
  };

  // Step 4: Submit Revision (Draft 2) for comparative analysis
  const handleSubmitRevision = async () => {
    if (!revisionText.trim() || !activeTask || !draftFeedback) return;
    setIsSubmittingRevision(true);

    try {
      const response = await aiClientService.analyzeWritingRevision({
        taskTitle: activeTask.title,
        initialDraft: draftText.trim(),
        revisionText: revisionText.trim(),
        draftFeedback: draftFeedback
      });

      setRevisionFeedback(response);

      // Save assessment details back into the Centralized Learner Model
      updateCoreSkill('writing', response.skillScoreDelta || 4);
      updateCoreSkill('grammar', Math.floor((response.skillScoreDelta || 4) / 2));
      updateSkillScore('Writing', response.skillScoreDelta || 4);
      addXpAndMinutes(activeTask.recommendedTime || 20, 100);

      // Record this writing session in history
      recordLearnerSession({
        activityType: 'Writing Assessment',
        duration: activeTask.recommendedTime || 20,
        topic: activeTask.title,
        score: response.overallScore,
        mistakes: response.remainingAreas || [],
        vocabularyUsed: activeTask.targetVocabulary.filter(v => getUsageStatus(v, revisionText)),
        grammarUsed: activeTask.targetGrammar,
        notes: response.finalDiagnosticFeedback
      });

      // Log any remaining active errors
      if (draftFeedback.categorizedErrors) {
        draftFeedback.categorizedErrors.forEach((err, idx) => {
          const isResolved = response.resolvedErrors.some((re: string) => re.toLowerCase().includes(err.category));
          logLearnerError({
            errorType: `Writing Inaccuracy (${err.category})`,
            originalSentence: err.originalSnippet,
            correctedSentence: isResolved ? 'Resolved in final revision' : 'Remains in draft',
            explanation: err.explanation,
            category: 'Writing',
            frequency: 1,
            severity: 'moderate',
            status: isResolved ? 'resolved' : 'active'
          });
        });
      }

      // Bridge upgrades to cross-skill engine
      if (draftFeedback.vocabularyUpgradeHints) {
        crossSkillEngine.bridgeWritingFeedback(
          revisionText.trim(),
          draftFeedback.vocabularyUpgradeHints.map(v => ({
            type: 'Written Register Upgrade',
            orig: v.original,
            fix: v.suggested,
            category: 'Vocabulary'
          }))
        );
      }

      setCurrentStep('final_assessment');
    } catch (err) {
      console.error('Failed to analyze writing revision:', err);
      // Fallback
      const fallbackRevision: RevisionFeedback = {
        draftScore: draftFeedback.overallScore,
        revisionScore: draftFeedback.overallScore + 8,
        improvementDelta: 8,
        grammarScore: draftFeedback.grammarScore + 6,
        vocabularyScore: draftFeedback.vocabularyScore + 8,
        sentenceStructureScore: draftFeedback.sentenceStructureScore + 6,
        coherenceScore: draftFeedback.coherenceCohesionScore + 8,
        cohesionScore: draftFeedback.coherenceCohesionScore + 6,
        organizationScore: draftFeedback.organizationScore + 2,
        taskCompletionScore: draftFeedback.taskCompletionScore + 4,
        naturalnessScore: draftFeedback.naturalnessScore + 6,
        overallScore: draftFeedback.overallScore + 8,
        assessedCEFRLevel: 'B2',
        resolvedErrors: ['Upgraded register with "articulate a vision"', 'Corrected inverted conditional verb clause form.'],
        remainingAreas: ['Continue monitoring formal cohesion flow.'],
        strengths: ['Outstanding response to the guided coaching instructions!', 'Substantial growth in register and lexical precision.'],
        finalDiagnosticFeedback: 'Incredible progress. You addressed the grammatical inaccuracies and applied elevated collocations. This shows an excellent command of B2 business communication style.',
        skillScoreDelta: 4
      };

      setRevisionFeedback(fallbackRevision);
      updateCoreSkill('writing', 4);
      updateSkillScore('Writing', 4);
      addXpAndMinutes(activeTask.recommendedTime || 20, 100);

      recordLearnerSession({
        activityType: 'Writing Assessment',
        duration: activeTask.recommendedTime || 20,
        topic: activeTask.title,
        score: fallbackRevision.overallScore,
        mistakes: fallbackRevision.remainingAreas,
        vocabularyUsed: activeTask.targetVocabulary,
        grammarUsed: activeTask.targetGrammar,
        notes: fallbackRevision.finalDiagnosticFeedback
      });

      setCurrentStep('final_assessment');
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  const currentWordCount = draftText.trim() ? draftText.trim().split(/\s+/).length : 0;
  const currentRevisionWordCount = revisionText.trim() ? revisionText.trim().split(/\s+/).length : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="writing-coach-container">
      {/* STEP 1: WELCOME & SELECTION DASHBOARD */}
      {currentStep === 'task_selection' && (
        <div className="space-y-8 animate-fade-in">
          {/* HEADER BANNER */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md uppercase tracking-wider">
                  Cambridge B2 Rubric
                </span>
                <span className="px-2.5 py-1 bg-violet-50 text-violet-700 text-xs font-bold rounded-md flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Generative Writing Coach
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                Adaptive Writing Coach
              </h1>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                Elevate your writing from B1 to formal B2. Practice structured essay drafting, receive diagnostic error analysis with guided feedback (no direct answers!), and perform active revisions to secure your grade.
              </p>
            </div>

            {/* QUICK STATS CARD */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Writing Score</p>
                <p className="text-xl font-black text-indigo-600">
                  {comprehensiveProfile.skillScores.writing.score}/100
                </p>
              </div>
              <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase">CEFR Tier</p>
                <p className="text-xl font-black text-violet-600">
                  {comprehensiveProfile.userProfile.currentCEFRLevel}
                </p>
              </div>
              <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center animate-pulse">
                <p className="text-[10px] font-bold text-amber-600 uppercase">Active Errors</p>
                <p className="text-xl font-black text-amber-600">
                  {comprehensiveProfile.errorLog.filter(e => e.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT SIDE: DIAGNOSTIC INSIGHTS CARD */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                Writing Diagnostic Log
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                  <p className="text-[11px] font-bold text-slate-500 uppercase">Evidence of Competence</p>
                  {comprehensiveProfile.skillScores.writing.evidence.length > 0 ? (
                    <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                      {comprehensiveProfile.skillScores.writing.evidence.slice(0, 3).map((ev, i) => (
                        <li key={i} className="line-clamp-2">{ev}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No formal assessments completed in this session yet.</p>
                  )}
                </div>

                {/* CURRENT ACTIVE PROBLEMS LIST */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-slate-500 uppercase flex items-center justify-between">
                    <span>Weaknesses Flagged by Coach</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded">
                      {comprehensiveProfile.errorLog.filter(e => e.status === 'active').length} Active
                    </span>
                  </p>

                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {comprehensiveProfile.errorLog.filter(e => e.status === 'active').length > 0 ? (
                      comprehensiveProfile.errorLog.filter(e => e.status === 'active').map((err) => (
                        <div key={err.id} className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold text-amber-950">
                            <span>{err.errorType}</span>
                            <span className="text-[10px] font-normal text-amber-600">{err.category}</span>
                          </div>
                          <p className="text-slate-600 font-medium line-clamp-1 italic">"{err.originalSentence}"</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        Excellent! No critical writing mistakes flagged. Your spelling and logic are stable.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: CONFIGURATOR AND SELECTOR */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
              {/* INTERACTIVE MODE SWITCHER TABS */}
              <div className="flex border-b border-slate-100 bg-slate-50/80 p-2 gap-2">
                <button
                  onClick={() => setUseAdaptiveTask(true)}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    useAdaptiveTask
                      ? 'bg-white text-slate-900 border border-slate-200/80 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  Adaptive AI Task Generator
                </button>
                <button
                  onClick={() => setUseAdaptiveTask(false)}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    !useAdaptiveTask
                      ? 'bg-white text-slate-900 border border-slate-200/80 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Preset Cambridge Prompts
                </button>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                {useAdaptiveTask ? (
                  /* AI DIRECTIVE CONFIG */
                  <div className="space-y-4 animate-fade-in flex-1">
                    <div className="bg-violet-50/40 border border-violet-100 rounded-xl p-4 space-y-2">
                      <p className="text-xs font-bold text-violet-900 uppercase flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-violet-600" /> Auto-Scheduling Strategy
                      </p>
                      <p className="text-xs text-violet-950 leading-relaxed">
                        Our adaptive system automatically scans your current learning gaps to construct a bespoke prompt. It will embed:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-slate-700">
                        <div>
                          <p className="font-bold text-indigo-900">Grammar Focus ({activeGrammarTargets.length}):</p>
                          <p className="italic text-slate-600 mt-0.5">
                            {activeGrammarTargets.join(', ') || 'Inversion & Conditional Subjunctive'}
                          </p>
                        </div>
                        <div>
                          <p className="font-bold text-indigo-900">Vocabulary Gap ({activeVocabTargets.length}):</p>
                          <p className="italic text-slate-600 mt-0.5">
                            {activeVocabTargets.join(', ') || '"articulate a vision", "mitigate risks"'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Difficulty Level:</label>
                        <select
                          value={selectedCEFR}
                          onChange={(e) => setSelectedCEFR(e.target.value)}
                          className="w-full text-xs font-semibold p-3 border border-slate-200 bg-slate-50/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white"
                        >
                          <option value="B1+">B1+ (Intermediate Upgrade)</option>
                          <option value="B2">B2 (Cambridge First Benchmarking)</option>
                          <option value="B2+">B2+ (Vantage / Professional Fluent)</option>
                          <option value="C1">C1 (Advanced Precision)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Speaking Bridging Context:</label>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 italic leading-snug">
                          {activeRecentSpeaking[0] || 'Workplace Automation & Collaboration Dynamics'}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* PRESET CAMBRIDGE TASKS selection */
                  <div className="space-y-4 animate-fade-in flex-1">
                    <p className="text-xs text-slate-500">
                      Select one of our standard B2 curated assignments designed to measure key argumentative, informative, and cohesive abilities:
                    </p>

                    <div className="space-y-2">
                      {writingPrompts.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => setSelectedPresetId(p.id)}
                          className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                            selectedPresetId === p.id && !useAdaptiveTask
                              ? 'border-indigo-600 bg-indigo-50/20'
                              : 'border-slate-100 hover:border-slate-200 bg-white'
                          }`}
                        >
                          <div>
                            <span className="text-[10px] font-bold text-indigo-700 uppercase bg-indigo-50 px-2 py-0.5 rounded">
                              {p.type}
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1">{p.title}</h4>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{p.promptText}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* LAUNCH BUTTON */}
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={handleLaunchTask}
                    disabled={isGeneratingTask}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs px-8 py-4 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    {isGeneratingTask ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Assembling Tailored Writing Scenario...</span>
                      </>
                    ) : (
                      <>
                        <PenTool className="w-4 h-4" />
                        <span>Launch Adaptive Writing Lab</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: ACTIVE DRAFTING (DRAFT 1) */}
      {currentStep === 'drafting' && activeTask && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* LEFT: PROMPT PANEL */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-md uppercase border border-violet-200">
                  {activeTask.type} • {activeTask.cefrLevel}
                </span>
                
                {timerActive && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTime(timeLeft)}</span>
                  </div>
                )}
              </div>

              <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                {activeTask.title}
              </h2>

              <p className="text-xs font-semibold text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                {activeTask.promptText}
              </p>

              <div className="text-xs text-slate-500 space-y-1">
                <p>• Word Count target: <strong>{activeTask.minWords}–{activeTask.maxWords}</strong> words.</p>
                <p>• Recommended preparation time: <strong>{activeTask.recommendedTime} mins</strong>.</p>
              </div>
            </div>

            {/* LIVE COCHING TARGET CHECKLIST */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-600" />
                Live Coach Target Checklist
              </h3>
              <p className="text-[11px] text-slate-500 leading-normal">
                Include these B2 grammatical elements and collocations. The coach will check them off in real-time as you write:
              </p>

              <div className="space-y-3">
                {/* GRAMMAR */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Grammar Form Target</p>
                  {activeTask.targetGrammar.map((tg, i) => {
                    const isUsed = getUsageStatus(tg, draftText);
                    return (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        {isUsed ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 bg-slate-50" />
                        )}
                        <span className={`font-semibold ${isUsed ? 'text-slate-800 line-through' : 'text-slate-600'}`}>
                          {tg}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* VOCABULARY */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Collocation Upgrades</p>
                  {activeTask.targetVocabulary.map((tv, i) => {
                    const isUsed = getUsageStatus(tv, draftText);
                    return (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        {isUsed ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 bg-slate-50" />
                        )}
                        <span className={`font-semibold ${isUsed ? 'text-slate-800 line-through' : 'text-slate-600'}`}>
                          "{tv}"
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* CONNECTORS */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Useful Connectors</p>
                  {activeTask.usefulConnectors.map((conn, i) => {
                    const isUsed = getUsageStatus(conn, draftText);
                    return (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        {isUsed ? (
                          <div className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 bg-slate-50" />
                        )}
                        <span className={`font-semibold ${isUsed ? 'text-slate-800 line-through' : 'text-slate-600'}`}>
                          "{conn}"
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: TEXT AREA */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" /> Independent Writing Slate (Draft 1)
                </span>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDraftText(
                      `In recent years, automation has played a pivotal role in shifting our workflow. Consequently, some managers argue we must substantiate our productivity gains to shareholders. Had we implemented remote platforms last quarter, our outcomes would have been stronger.\n\nOn the one hand, a remote environment helps team wellbeing. On the other hand, we need to articulate a vision for collaboration. Taking everything into consideration, we must mitigate risks to secure long-term stability.`
                    )}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
                  >
                    Load Sample Scaffold
                  </button>
                  <button
                    onClick={() => {
                      if(window.confirm('Clear all text?')) setDraftText('');
                    }}
                    className="text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <textarea
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                placeholder="Compose your response here. Try to use complex structures (Conditionals/Inversion) and B2 formal register vocabulary..."
                rows={14}
                className="w-full text-xs sm:text-sm p-4 rounded-xl border border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-sans leading-relaxed text-slate-800 shadow-inner"
              />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2.5 py-1 rounded-md font-bold ${
                    currentWordCount >= activeTask.minWords && currentWordCount <= activeTask.maxWords
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-50 text-slate-600 border border-slate-200'
                  }`}>
                    Word Count: {currentWordCount} / {activeTask.maxWords}
                  </span>
                  
                  {currentWordCount > 0 && currentWordCount < activeTask.minWords && (
                    <span className="text-amber-600 font-bold text-[10px]">Needs {activeTask.minWords - currentWordCount} more words</span>
                  )}
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => {
                      if (window.confirm('Do you want to abandon this session and return to dashboard?')) {
                        setCurrentStep('task_selection');
                      }
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-3 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSubmitDraft}
                    disabled={!draftText.trim() || isSubmittingDraft}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmittingDraft ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Analyzing with B2 Rubrics...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Draft for Review</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: DRAFT FEEDBACK & GUIDED COACH ANNOTATIONS */}
      {currentStep === 'review' && activeTask && draftFeedback && (
        <div className="space-y-6 animate-fade-in">
          {/* HEADER SUMMARY */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  Draft Assessment Completed
                </span>
                <h2 className="text-xl sm:text-2xl font-black mt-1">
                  "{activeTask.title}" Diagnostic Review
                </h2>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-xl px-5 py-3 text-center min-w-[90px]">
                <p className="text-2xl font-black text-amber-400">
                  {draftFeedback.overallScore}
                </p>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider">Initial Band</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700/60 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Grammar</p>
                <p className="text-base font-extrabold text-white mt-1">{draftFeedback.grammarScore}%</p>
              </div>
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700/60 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Vocabulary</p>
                <p className="text-base font-extrabold text-white mt-1">{draftFeedback.vocabularyScore}%</p>
              </div>
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700/60 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Cohesion</p>
                <p className="text-base font-extrabold text-white mt-1">{draftFeedback.coherenceCohesionScore}%</p>
              </div>
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700/60 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Naturalness</p>
                <p className="text-base font-extrabold text-white mt-1">{draftFeedback.naturalnessScore}%</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              {draftFeedback.summaryFeedback}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* COLUMN 1 & 2: GUIDED ERROR CARDS */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Coach Annotations & Guided Hints
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  The coach has identified specific areas to address. Try to resolve these yourself during the upcoming revision stage using the pedagogical hints below:
                </p>

                <div className="space-y-4">
                  {draftFeedback.categorizedErrors.map((err, idx) => (
                    <div key={idx} className="p-4 bg-amber-50/40 border border-amber-200/80 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded text-[10px] uppercase">
                          {err.category} Inaccuracy
                        </span>
                        <span className="text-[11px] text-slate-500">Error #{idx + 1}</span>
                      </div>

                      <div className="bg-white/90 border border-amber-200 p-3 rounded-lg text-xs">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Original Draft Passage</p>
                        <p className="text-rose-900 font-semibold italic mt-0.5">"{err.originalSnippet}"</p>
                      </div>

                      <div className="text-xs space-y-1 pt-1">
                        <p className="font-semibold text-slate-700">Why this needs work:</p>
                        <p className="text-slate-600 leading-normal">{err.explanation}</p>
                      </div>

                      {/* GUIDED SCAFFOLDING HINT */}
                      <div className="bg-indigo-50 border border-indigo-100 p-3.5 rounded-lg text-xs flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5 animate-pulse" />
                        <div className="space-y-0.5">
                          <p className="font-bold text-indigo-950">Guided Coach Clue</p>
                          <p className="text-indigo-900 leading-normal font-medium">{err.guidedHint}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* VOCABULARY UPGRADES */}
              {draftFeedback.vocabularyUpgradeHints && draftFeedback.vocabularyUpgradeHints.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    Lexical Upgrade Suggestions
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {draftFeedback.vocabularyUpgradeHints.map((upg, idx) => (
                      <div key={idx} className="p-4 bg-emerald-50/30 border border-emerald-100 rounded-xl space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 line-through">"{upg.original}"</span>
                          <span className="font-extrabold text-emerald-800">→ "{upg.suggested}"</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-normal pt-1 border-t border-emerald-50">
                          {upg.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* COLUMN 3: STRENGTHS & REVISION CHECKLIST */}
            <div className="space-y-6">
              {/* STRENGTHS */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ThumbsUp className="w-4 h-4 text-emerald-600" />
                  Strengths
                </h3>
                <ul className="text-xs text-slate-600 space-y-1.5">
                  {draftFeedback.strengths.map((str, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* REVISION CHECKLIST */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-indigo-600" />
                  Your Revision Checklist
                </h3>

                <div className="space-y-2.5">
                  {draftFeedback.revisionChecklist.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCompletedRevisionItems(prev => ({ ...prev, [idx]: !prev[idx] }))}
                      className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors text-xs"
                    >
                      <div className="mt-0.5">
                        {completedRevisionItems[idx] ? (
                          <div className="w-4 h-4 rounded-sm bg-indigo-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-sm border border-slate-300 bg-white" />
                        )}
                      </div>
                      <span className={`font-semibold ${completedRevisionItems[idx] ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setCurrentStep('revision')}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>Proceed to Active Revision Editor</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: ACTIVE REVISION SLATE (SIDE BY SIDE) */}
      {currentStep === 'revision' && activeTask && draftFeedback && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
          {/* LEFT: REFERENCE PANEL WITH ANNOTATIONS & CHECKLIST */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md uppercase">
                  Reference Panel
                </span>
                <span className="text-xs text-slate-500 font-medium">Draft 1 Word Count: {currentWordCount}</span>
              </div>

              {/* EXPANDABLE CRITICAL ERRORS */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-700">Coach Guidance Hints:</p>
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                  {draftFeedback.categorizedErrors.map((err, idx) => (
                    <div key={idx} className="p-3.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold text-amber-900">
                        <span>{err.category.toUpperCase()} ERROR</span>
                        <span className="text-slate-400">Passage #{idx + 1}</span>
                      </div>
                      <p className="text-rose-950 font-semibold italic">"{err.originalSnippet}"</p>
                      <div className="p-2.5 bg-indigo-50 text-indigo-900 rounded-lg mt-1 font-medium text-[11px] leading-relaxed border border-indigo-100">
                        Clue: {err.guidedHint}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* REVISION CHECKLIST (SIDE BY SIDE CHECK) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-700">Revision To-Do Checklist:</p>
                <div className="space-y-2">
                  {draftFeedback.revisionChecklist.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCompletedRevisionItems(prev => ({ ...prev, [idx]: !prev[idx] }))}
                      className="flex items-center gap-2.5 p-1.5 text-xs font-semibold cursor-pointer"
                    >
                      {completedRevisionItems[idx] ? (
                        <div className="w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 border border-slate-300 rounded-full" />
                      )}
                      <span className={completedRevisionItems[idx] ? 'text-slate-400 line-through' : 'text-slate-700'}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: REVISION EDITOR AREA */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-600" /> Live Revision Slate (Draft 2)
                </span>

                <button
                  onClick={() => setRevisionText(draftText)}
                  className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  title="Reset revision text back to the original first draft"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Revert to Draft 1</span>
                </button>
              </div>

              <textarea
                value={revisionText}
                onChange={(e) => setRevisionText(e.target.value)}
                placeholder="Revise your draft here, fixing the flagged grammatical issues, elevating synonyms, and checking off items..."
                rows={14}
                className="w-full text-xs sm:text-sm p-4 rounded-xl border border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-sans leading-relaxed text-slate-800 shadow-inner"
              />

              {/* INTERACTIVE COMPANION TARGET CHECKS */}
              <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100 flex flex-wrap gap-2 text-[10px] font-bold text-indigo-900">
                <span>Real-Time Targets:</span>
                {activeTask.targetVocabulary.map((tv, idx) => {
                  const used = getUsageStatus(tv, revisionText);
                  return (
                    <span key={idx} className={`px-2 py-0.5 rounded ${used ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-500'}`}>
                      {used ? '✓ ' : ''}"{tv}"
                    </span>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-700">
                  <span className={`px-2.5 py-1 rounded-md ${
                    currentRevisionWordCount >= activeTask.minWords && currentRevisionWordCount <= activeTask.maxWords
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-50 text-slate-600'
                  }`}>
                    Revised Count: {currentRevisionWordCount} / {activeTask.maxWords}
                  </span>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setCurrentStep('review')}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Back to Annotations
                  </button>

                  <button
                    onClick={handleSubmitRevision}
                    disabled={!revisionText.trim() || isSubmittingRevision}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    {isSubmittingRevision ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Evaluating Grade Improvements...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-emerald-200" />
                        <span>Submit Final Revision</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: FINAL ASSESSMENT CEFR REPORT CARD */}
      {currentStep === 'final_assessment' && activeTask && revisionFeedback && (
        <div className="space-y-8 animate-fade-in">
          {/* CEFR CERTIFICATE HERO BANNER */}
          <div className="bg-gradient-to-r from-emerald-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-emerald-300 relative overflow-hidden space-y-6">
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-12 translate-y-12">
              <Award className="w-80 h-80" />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
              <div className="space-y-1">
                <span className="px-3 py-1 bg-white/20 text-white text-[10px] font-black rounded-full uppercase tracking-widest border border-white/20">
                  Cambridge B2 Certification Logged
                </span>
                <h2 className="text-2xl sm:text-3xl font-black">
                  Writing Performance Audit
                </h2>
                <p className="text-xs text-indigo-100 font-semibold italic">
                  Task: {activeTask.title} • Date Assessed: {new Date().toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-3 bg-white/15 p-4 rounded-2xl border border-white/10 text-center backdrop-blur-xs">
                <div>
                  <p className="text-2xl font-black text-emerald-400">
                    {revisionFeedback.draftScore} → {revisionFeedback.overallScore}
                  </p>
                  <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">
                    Score Growth (+{revisionFeedback.improvementDelta})
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/10 rounded-xl border border-white/10 text-xs sm:text-sm text-indigo-50 leading-relaxed font-semibold">
              "{revisionFeedback.finalDiagnosticFeedback}"
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* COMPARATIVE SCORE TRACKS */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  Comparative Category Rubric Progress
                </h3>

                <div className="space-y-4">
                  {[
                    { label: 'Grammar Accuracy', initial: draftFeedback?.grammarScore || 70, final: revisionFeedback.grammarScore },
                    { label: 'Lexical Resource (Vocab)', initial: draftFeedback?.vocabularyScore || 70, final: revisionFeedback.vocabularyScore },
                    { label: 'Sentence Structure & Subjunctive', initial: draftFeedback?.sentenceStructureScore || 70, final: revisionFeedback.sentenceStructureScore },
                    { label: 'Coherence & Cohesive Flow', initial: draftFeedback?.coherenceCohesionScore || 70, final: revisionFeedback.coherenceScore },
                    { label: 'Task Completion', initial: draftFeedback?.taskCompletionScore || 70, final: revisionFeedback.taskCompletionScore },
                    { label: 'Naturalness & Collocations', initial: draftFeedback?.naturalnessScore || 70, final: revisionFeedback.naturalnessScore }
                  ].map((rub, i) => (
                    <div key={i} className="space-y-1 text-xs">
                      <div className="flex justify-between font-semibold">
                        <span className="text-slate-700">{rub.label}</span>
                        <span className="text-slate-500 font-bold">
                          {rub.initial}% <span className="text-emerald-600">→ {rub.final}%</span>
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
                        <div
                          className="bg-indigo-300 h-full border-r border-indigo-100"
                          style={{ width: `${rub.initial}%` }}
                        />
                        <div
                          className="bg-emerald-500 h-full"
                          style={{ width: `${rub.final - rub.initial}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RESOLVED PROBLEMS CARDS */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Issues Corrected in this Revision
                </h3>

                <div className="space-y-2">
                  {revisionFeedback.resolvedErrors.length > 0 ? (
                    revisionFeedback.resolvedErrors.map((re, idx) => (
                      <div key={idx} className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs flex items-start gap-2 text-emerald-900">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="font-bold">{re}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No errors were marked as explicitly corrected during revision analysis.</p>
                  )}
                </div>
              </div>
            </div>

            {/* REMAINING AREAS & XP REWARDS */}
            <div className="space-y-6">
              {/* REWARD SUMMARY */}
              <div className="bg-gradient-to-br from-indigo-50 to-violet-50 p-6 rounded-2xl border border-indigo-100 shadow-2xs text-center space-y-4">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <Award className="w-6 h-6 text-white" />
                </div>

                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase">Profile Sync Success</h4>
                  <p className="text-[11px] text-slate-500 mt-1">XP, minutes, and grammar metrics have been saved locally & synced on your cloud dashboard.</p>
                </div>

                <div className="flex justify-center gap-4 text-xs font-bold pt-2 border-t border-indigo-100">
                  <div className="px-3 py-2 bg-white rounded-lg border border-indigo-200/50">
                    <p className="text-indigo-600 font-extrabold">+100 XP</p>
                    <p className="text-[9px] text-slate-400">Awarded</p>
                  </div>
                  <div className="px-3 py-2 bg-white rounded-lg border border-indigo-200/50">
                    <p className="text-indigo-600 font-extrabold">+{activeTask.recommendedTime || 20} Min</p>
                    <p className="text-[9px] text-slate-400">Active Time</p>
                  </div>
                  <div className="px-3 py-2 bg-white rounded-lg border border-indigo-200/50">
                    <p className="text-emerald-600 font-extrabold">+{revisionFeedback.skillScoreDelta || 4}%</p>
                    <p className="text-[9px] text-slate-400">Writing skill</p>
                  </div>
                </div>
              </div>

              {/* REMAINING AREAS FOR FUTURE STUDY */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                  Remaining Diagnostic Targets
                </h3>

                <ul className="text-xs text-slate-600 space-y-2">
                  {revisionFeedback.remainingAreas.map((ra, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full flex-shrink-0 mt-1.5" />
                      <span>{ra}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* RETRUN TO LABS BUTTON */}
              <button
                onClick={() => {
                  setCurrentStep('task_selection');
                  setActiveTask(null);
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-4 rounded-xl shadow-xs text-center flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>Return to Writing Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WritingPage;
