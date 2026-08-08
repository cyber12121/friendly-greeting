import React, { useState, useEffect } from 'react';
import { safeStorage } from '../lib/storage';
import { useApp } from '../context/AppContext';
import { aiClientService } from '../services/aiClientService';
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  FileText,
  CheckCircle,
  XCircle,
  Award,
  Sparkles,
  Loader2,
  ArrowRight,
  TrendingUp,
  Activity,
  AlertCircle,
  Compass,
  Check,
  ChevronRight,
  Bookmark,
  Calendar,
  Speech
} from 'lucide-react';

interface ListeningQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  questionType: 'main_idea' | 'specific_detail' | 'vocabulary' | 'speaker_intention' | 'paraphrasing' | 'implied_meaning';
}

interface HarvestableTerm {
  expression: string;
  meaning: string;
  example: string;
}

interface ListeningActivity {
  id: string;
  title: string;
  accent: string;
  duration: string;
  topic: string;
  difficulty: 'B1' | 'B1+' | 'B2-' | 'B2';
  audioSimulatedText: string;
  transcript: string;
  questions: ListeningQuestion[];
  harvestableVocabulary: HarvestableTerm[];
  speakingBridge: {
    scenario: string;
    promptText: string;
  };
}

interface ListeningCoachProfile {
  level: 'B1' | 'B1+' | 'B2-' | 'B2';
  accuracyHistory: number[];
  categoryStats: Record<string, { correct: number; total: number }>;
  vocabularyGaps: HarvestableTerm[];
  accentsConquered: string[];
}

const INITIAL_COACH_PROFILE: ListeningCoachProfile = {
  level: 'B1+',
  accuracyHistory: [75, 80],
  categoryStats: {
    main_idea: { correct: 4, total: 5 },
    specific_detail: { correct: 3, total: 5 },
    vocabulary: { correct: 3, total: 4 },
    speaker_intention: { correct: 2, total: 4 },
    paraphrasing: { correct: 2, total: 3 },
    implied_meaning: { correct: 1, total: 3 }
  },
  vocabularyGaps: [
    { expression: 'strike a balance', meaning: 'To find a satisfactory compromise between two opposing things.', example: 'We must strike a balance between speed and quality.' }
  ],
  accentsConquered: ['British RP', 'General American']
};

// Rich, high-fidelity default exercises for offline preview and instant training
const DEFAULT_COACH_EXERCISES: ListeningActivity[] = [
  {
    id: 'def-1',
    title: 'Executive Panel: Balancing Subsidies & Grid Capacity',
    accent: 'Standard British (RP)',
    duration: '2:15 min',
    topic: 'Sustainable Energy Grid Architecture',
    difficulty: 'B2',
    audioSimulatedText: "Welcome delegates. As we review the Q3 energy forecast, we must strike a balance between aggressive solar subsidies and physical grid capacity. Implementing solar integrated cladding is a pivotal step; however, our regional coordinators caution that local tax revenue is insufficient for long-term transformer upkeep. Thus, we must phase out obsolete fossil fuel supports to substantiate our commitment to zero-emissions.",
    transcript: "Speaker A: Welcome delegates. As we review the Q3 energy forecast, we must strike a balance between aggressive solar subsidies and physical grid capacity.\nSpeaker B: Absolutely. Implementing solar integrated cladding is a pivotal step; however, our regional coordinators caution that local tax revenue is insufficient for long-term transformer upkeep.\nSpeaker A: Thus, we must phase out obsolete fossil fuel supports to substantiate our commitment to zero-emissions.",
    questions: [
      {
        id: 'def-1-q1',
        question: 'What is the primary argument regarding renewable integration discussed in the conversation?',
        options: [
          'Immediate shutdown of all local electrical grids',
          'Finding a realistic compromise between solar subsidies and actual grid capability',
          'Focusing exclusively on electric aircraft transport systems',
          'Eliminating all local green funding immediately'
        ],
        correctIndex: 1,
        explanation: 'The conversation centers on "striking a balance between aggressive solar subsidies and physical grid capacity."',
        questionType: 'main_idea'
      },
      {
        id: 'def-1-q2',
        question: 'Which specific structural asset was highlighted by Speaker B?',
        options: [
          'Deep underground geothermal wells',
          'Solar integrated cladding systems',
          'High-altitude vertical wind turbines',
          'Offshore tidal energy converters'
        ],
        correctIndex: 1,
        explanation: 'Speaker B mentions that "Implementing solar integrated cladding is a pivotal step."',
        questionType: 'specific_detail'
      },
      {
        id: 'def-1-q3',
        question: 'What does the speaker mean by the phrase "strike a balance"?',
        options: [
          'To hit a moving physical target',
          'To find a satisfactory compromise between two opposing requirements',
          'To construct perfectly symmetrical architecture',
          'To fail under sudden structural pressure'
        ],
        correctIndex: 1,
        explanation: 'To strike a balance is a common idiom meaning to find a compromise.',
        questionType: 'vocabulary'
      },
      {
        id: 'def-1-q4',
        question: 'What is Speaker B\'s attitude towards the funding of immediate high-cost grid enhancements?',
        options: [
          'Aggressive and dismissive skepticism',
          'Cautious advocacy, citing constraints in local tax revenue',
          'Total indifference to energy transition targets',
          'Unconditional support regardless of financial constraints'
        ],
        correctIndex: 1,
        explanation: 'Speaker B supports solar cladding but highlights that regional coordinators are worried about local tax revenue limits.',
        questionType: 'speaker_intention'
      },
      {
        id: 'def-1-q5',
        question: 'Which option best restates Speaker A\'s concluding point on fossil fuel supports?',
        options: [
          'We should double down on gas investments to secure transition stability.',
          'We need to gradually discontinue older fossil fuel subsidies to back up our clean goals.',
          'Fossil fuel subsidies are already completely gone in all sectors.',
          'Subsidies are irrelevant to overall zero-emissions achievements.'
        ],
        correctIndex: 1,
        explanation: '"Phase out obsolete fossil fuel supports to substantiate our commitment" is paraphrased as gradually discontinuing to back up goals.',
        questionType: 'paraphrasing'
      },
      {
        id: 'def-1-q6',
        question: 'What is implied about the regional coordinators mentioned by Speaker B?',
        options: [
          'They do not believe in environmental sustainability.',
          'They are worried about infrastructure failures due to insufficient budget.',
          'They reside outside European zones.',
          'They are actively drafting a counter-proposal.'
        ],
        correctIndex: 1,
        explanation: 'Their caution that "local tax revenue is insufficient for long-term transformer upkeep" implies worry about eventual budget-driven infrastructure failures.',
        questionType: 'implied_meaning'
      }
    ],
    harvestableVocabulary: [
      { expression: 'strike a balance', meaning: 'To find a satisfactory compromise between two opposing things.', example: 'We must strike a balance between speed and quality.' },
      { expression: 'phase out', meaning: 'To gradually discontinue a product, service, or policy over time.', example: 'The company plans to phase out single-use plastics by next year.' },
      { expression: 'substantiate', meaning: 'To provide evidence to support or prove the truth of a claim.', example: 'You must substantiate your thesis with primary data.' }
    ],
    speakingBridge: {
      scenario: 'Urban Transit Strategy Meeting',
      promptText: 'Negotiate the deployment of solar cladding versus traditional wind turbine systems with a skeptical supervisor.'
    }
  },
  {
    id: 'def-2',
    title: 'Podcast: Working Across Time Zones Asynchronously',
    accent: 'General American',
    duration: '2:00 min',
    topic: 'Modern Corporate Dynamics',
    difficulty: 'B1+',
    audioSimulatedText: "Hey there! In this episode of Team Sync, we tackle timezone fatigue. Asynchronous work is highly praised, but without clear boundaries, employees experience severe burnout. To combat this, I recommend setting a mandatory daily core window of two hours where overlapping teams are available for quick, high-touch alignment. Managers must respect this and not expect instant replies outside these boundaries.",
    transcript: "Speaker A: Hey there! In this episode of Team Sync, we tackle timezone fatigue.\nSpeaker B: Asynchronous work is highly praised, but without clear boundaries, employees experience severe burnout.\nSpeaker A: To combat this, I recommend setting a mandatory daily core window of two hours where overlapping teams are available for quick, high-touch alignment. Managers must respect this and not expect instant replies outside these boundaries.",
    questions: [
      {
        id: 'def-2-q1',
        question: 'What is the primary message of this podcast segment?',
        options: [
          'A call to return to traditional 9-to-5 physical office structures',
          'Implementing core boundaries and short sync windows to mitigate remote work fatigue',
          'Encouraging global teams to work 24/7 without interruption',
          'How to utilize automated email templates'
        ],
        correctIndex: 1,
        explanation: 'The podcast recommends establishing core overlap hours to balance asynchronous work and protect against remote burnout.',
        questionType: 'main_idea'
      },
      {
        id: 'def-2-q2',
        question: 'What specific length of time does the speaker recommend for overlapping availability?',
        options: [
          'Exactly four hours daily',
          'A mandatory two-hour daily core window',
          'One hour per week on Fridays',
          'Continuous real-time presence throughout the afternoon'
        ],
        correctIndex: 1,
        explanation: 'The speaker explicitly recommends "setting a mandatory daily core window of two hours."',
        questionType: 'specific_detail'
      },
      {
        id: 'def-2-q3',
        question: 'In this context, what does "burnout" refer to?',
        options: [
          'A computer processor overheating',
          'Physical and mental exhaustion caused by overwork and stress',
          'Setting a campfire in an outdoor workspace',
          'Disliking remote software tools'
        ],
        correctIndex: 1,
        explanation: '"Burnout" describes the severe physical and emotional exhaustion resulting from chronic occupational stress.',
        questionType: 'vocabulary'
      },
      {
        id: 'def-2-q4',
        question: 'What is the speaker\'s intention in mentioning the expectations of managers?',
        options: [
          'To support working overtime regularly',
          'To prompt managers to allow team members to ignore messages outside core hours',
          'To suggest firing non-responsive employees',
          'To advise managers to use instant messaging applications'
        ],
        correctIndex: 1,
        explanation: 'The speaker warns that managers "must respect this and not expect instant replies outside these boundaries."',
        questionType: 'speaker_intention'
      },
      {
        id: 'def-2-q5',
        question: 'Which of the following best restates the recommendation on timezone fatigue?',
        options: [
          'Teams should ignore messages completely.',
          'To solve timezone fatigue, establish a compulsory daily two-hour alignment period.',
          'Employees must move to the same city.',
          'Timezone fatigue cannot be resolved.'
        ],
        correctIndex: 1,
        explanation: 'Establishing a compulsory daily two-hour alignment period is a direct paraphrase of setting a mandatory daily core window of two hours.',
        questionType: 'paraphrasing'
      }
    ],
    harvestableVocabulary: [
      { expression: 'asynchronous work', meaning: 'Work style where team members collaborate without needing to be online at the same time.', example: 'Our global team relies heavily on asynchronous work via detailed wiki documentation.' },
      { expression: 'burnout', meaning: 'State of emotional, physical, and mental exhaustion caused by excessive and prolonged stress.', example: 'Working late hours across three continents eventually led to full burnout.' }
    ],
    speakingBridge: {
      scenario: 'Timezone Collaboration Proposal',
      promptText: 'Pitch a customized asynchronous agreement to a global cross-functional team in your next verbal sync.'
    }
  }
];

export const ListeningPage: React.FC = () => {
  const { updateSkillScore, addXpAndMinutes, saveVocabularyItem } = useApp();

  // Load listening history / profile from safeStorage
  const [coachProfile, setCoachProfile] = useState<ListeningCoachProfile>(() => {
    try {
      const saved = safeStorage.getItem('listening_coach_profile_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_COACH_PROFILE;
  });

  const [selectedExId, setSelectedExId] = useState<string>(DEFAULT_COACH_EXERCISES[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [harvestedItems, setHarvestedItems] = useState<Record<string, boolean>>({});

  // Dynamic state for AI Custom exercises
  const [isGenerating, setIsGenerating] = useState(false);
  const [customExercises, setCustomExercises] = useState<ListeningActivity[]>([]);
  const [customTopic, setCustomTopic] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'B1' | 'B1+' | 'B2-' | 'B2'>('B2');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Combine standard and dynamically generated ones
  const allExercises = [...DEFAULT_COACH_EXERCISES, ...customExercises];
  const activeExercise = allExercises.find(e => e.id === selectedExId) || allExercises[0];

  // Sync coach profile to safeStorage whenever it changes
  useEffect(() => {
    safeStorage.setItem('listening_coach_profile_v2', JSON.stringify(coachProfile));
  }, [coachProfile]);

  // Audio simulator timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= 135) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const formatAudioTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (qId: string, optIdx: number) => {
    if (showResults) return;
    setUserAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const handleReset = () => {
    setUserAnswers({});
    setShowResults(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setFeedbackMsg(null);
  };

  // Submit and run our dynamic adaptation & stats tracking engine!
  const handleSubmitAnswers = () => {
    setShowResults(true);
    let correctCount = 0;
    const totalQuestions = activeExercise.questions.length;

    const updatedStats = { ...coachProfile.categoryStats };
    const newlyDetectedGaps: HarvestableTerm[] = [...coachProfile.vocabularyGaps];

    activeExercise.questions.forEach(q => {
      const isCorrect = userAnswers[q.id] === q.correctIndex;
      if (isCorrect) correctCount++;

      const type = q.questionType || 'specific_detail';
      if (!updatedStats[type]) {
        updatedStats[type] = { correct: 0, total: 0 };
      }
      updatedStats[type].total += 1;
      if (isCorrect) {
        updatedStats[type].correct += 1;
      } else if (type === 'vocabulary') {
        // Find corresponding vocabulary from harvestableVocabulary and add to gaps
        const gapTerm = activeExercise.harvestableVocabulary?.find(v =>
          q.question.toLowerCase().includes(v.expression.toLowerCase()) ||
          q.explanation.toLowerCase().includes(v.expression.toLowerCase()) ||
          v.expression.toLowerCase().split(' ').some(word => word.length > 4 && q.question.toLowerCase().includes(word))
        );

        if (gapTerm) {
          if (!newlyDetectedGaps.some(g => g.expression.toLowerCase() === gapTerm.expression.toLowerCase())) {
            newlyDetectedGaps.push(gapTerm);

            // AUTO-SCHEDULE for active learning in the central Vocabulary system!
            saveVocabularyItem({
              id: `voc_listen_gap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              expression: gapTerm.expression,
              meaning: gapTerm.meaning,
              example: gapTerm.example,
              cefrLevel: (activeExercise.difficulty.startsWith('B2') ? 'B2' : 'B1') as any,
              category: 'collocations',
              status: 'learning', // triggers active review in vocab tab
              recognitionScore: 40,
              recallScore: 20,
              speakingUsageScore: 10,
              writingUsageScore: 10,
              timesReviewed: 1,
              timesSuccessfullyUsed: 0,
              timesFailedToUse: 1,
              nextReviewDate: new Date().toISOString().split('T')[0]
            });
          }
        }
      }
    });

    const score = Math.round((correctCount / totalQuestions) * 100);
    const newHistory = [...coachProfile.accuracyHistory, score];

    // Dynamic Adaptation: Auto-advance or adjust recommended Listening level
    const levels: ('B1' | 'B1+' | 'B2-' | 'B2')[] = ['B1', 'B1+', 'B2-', 'B2'];
    let nextLevel = coachProfile.level;

    const recentScores = newHistory.slice(-2);
    let levelChangeNote = '';
    if (recentScores.length >= 2) {
      if (recentScores.every(s => s >= 80)) {
        const idx = levels.indexOf(coachProfile.level);
        if (idx < levels.length - 1) {
          nextLevel = levels[idx + 1];
          levelChangeNote = `Level Up! Your outstanding performance advanced your Coach Level to ${nextLevel}.`;
        }
      } else if (recentScores.every(s => s <= 40)) {
        const idx = levels.indexOf(coachProfile.level);
        if (idx > 0) {
          nextLevel = levels[idx - 1];
          levelChangeNote = `Adapting Difficulty: We've tuned down your recommended Coach Level to ${nextLevel} to build foundational confidence.`;
        }
      }
    }

    // Add current accent to conquered accents list
    const newAccents = [...coachProfile.accentsConquered];
    if (activeExercise.accent && !newAccents.includes(activeExercise.accent)) {
      newAccents.push(activeExercise.accent);
    }

    setCoachProfile({
      level: nextLevel,
      accuracyHistory: newHistory,
      categoryStats: updatedStats,
      vocabularyGaps: newlyDetectedGaps.slice(-5), // Keep latest 5 gaps
      accentsConquered: newAccents
    });

    setFeedbackMsg(
      levelChangeNote || `Completed with ${score}% accuracy. XP and minutes recorded.`
    );

    // Sync to main application progress and trigger XP rewards
    updateSkillScore('Listening', Math.round(correctCount * 3.5));
    addXpAndMinutes(10, correctCount * 25);
  };

  // Harvest vocabulary terms manually
  const handleHarvestItem = (item: HarvestableTerm) => {
    saveVocabularyItem({
      id: `voc_harvest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      expression: item.expression,
      meaning: item.meaning,
      example: item.example,
      cefrLevel: (activeExercise.difficulty.startsWith('B2') ? 'B2' : 'B1') as any,
      category: 'collocations',
      status: 'active',
      recognitionScore: 80,
      recallScore: 60,
      speakingUsageScore: 40,
      writingUsageScore: 40,
      timesReviewed: 1,
      timesSuccessfullyUsed: 0,
      timesFailedToUse: 0,
      nextReviewDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0] // 3 days spaced repetition
    });

    setHarvestedItems(prev => ({ ...prev, [item.expression]: true }));
  };

  const handleHarvestAll = () => {
    activeExercise.harvestableVocabulary.forEach(item => {
      if (!harvestedItems[item.expression]) {
        handleHarvestItem(item);
      }
    });
  };

  // Connect topic to Speaking Tab (carry over via safeStorage and trigger navigation)
  const handleLaunchSpeakingBridge = () => {
    safeStorage.setItem(
      'listening_speaking_bridge',
      JSON.stringify({
        scenario: activeExercise.speakingBridge.scenario,
        promptText: activeExercise.speakingBridge.promptText
      })
    );
    // Force App navigation via context
    const tabSelector = document.getElementById('sidebar-nav-speaking') || document.getElementById('mobile-nav-speaking');
    if (tabSelector) {
      tabSelector.click();
    } else {
      window.location.hash = '#speaking'; // fallback trigger
    }
  };

  // Dynamically generate an exercise using Gemini
  const handleGenerateAiExercise = async () => {
    if (!customTopic.trim()) {
      alert('Please enter a topic first.');
      return;
    }
    setIsGenerating(true);
    try {
      const result = await aiClientService.generateListeningQuestions(customTopic, selectedLevel);
      if (result) {
        const mappedResult: ListeningActivity = {
          ...result,
          id: `custom-${Date.now()}`,
          difficulty: selectedLevel,
          questions: result.questions.map((q: any) => ({
            ...q,
            questionType: q.questionType || 'specific_detail'
          }))
        };
        setCustomExercises(prev => [mappedResult, ...prev]);
        setSelectedExId(mappedResult.id);
        handleReset();
        setShowTranscript(false);
      }
    } catch (err) {
      console.error('Failed to generate customized listening exercise:', err);
      alert('Failed to generate custom listening exercise. Using default resources.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate stats values
  const totalCompleted = coachProfile.accuracyHistory.length;
  const avgAccuracy = totalCompleted > 0
    ? Math.round(coachProfile.accuracyHistory.reduce((a, b) => a + b, 0) / totalCompleted)
    : 0;

  // Get question type readability names
  const getQuestionTypeName = (type: string) => {
    const names: Record<string, string> = {
      main_idea: 'Main Idea Synthesis',
      specific_detail: 'Specific Fact Recall',
      vocabulary: 'Contextual Vocabulary',
      speaker_intention: 'Speaker Attitude / Intention',
      paraphrasing: 'Lexical Paraphrasing',
      implied_meaning: 'Implied / Inferred Stance'
    };
    return names[type] || type;
  };

  return (
    <div className="space-y-8 pb-16" id="listening-coach-root">
      {/* Upper Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Main Player and Controls */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header & Exercise Pickers */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">Adaptive Listening Coach</h2>
                  <p className="text-xs text-slate-500">Trained for fast accents, implicit meaning, and colloquial speech</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedExId}
                onChange={(e) => {
                  setSelectedExId(e.target.value);
                  handleReset();
                }}
                className="text-xs font-semibold p-2.5 w-full sm:w-auto rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <optgroup label="Core Syllabus">
                  {DEFAULT_COACH_EXERCISES.map(e => (
                    <option key={e.id} value={e.id}>{e.title}</option>
                  ))}
                </optgroup>
                {customExercises.length > 0 && (
                  <optgroup label="AI Generated Custom">
                    {customExercises.map(e => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          </div>

          {/* AI Generator Panel */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-800">Generate Custom Adaptive Scenario</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Enter topic (e.g. Fintech disruption, Medical ethics...)"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="col-span-1 sm:col-span-2 text-xs p-3 rounded-xl border border-indigo-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              
              <div className="flex gap-2">
                <select
                  value={selectedLevel}
                  onChange={(e: any) => setSelectedLevel(e.target.value)}
                  className="text-xs font-bold p-3 rounded-xl border border-indigo-200 bg-white focus:outline-none"
                >
                  <option value="B1">Level B1</option>
                  <option value="B1+">Level B1+</option>
                  <option value="B2-">Level B2-</option>
                  <option value="B2">Level B2</option>
                </select>
                
                <button
                  onClick={handleGenerateAiExercise}
                  disabled={isGenerating}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold text-xs p-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isGenerating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Compass className="w-3.5 h-3.5" />
                  )}
                  <span>{isGenerating ? 'Drafting...' : 'Build Drill'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Simulated Audio Player */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-md border border-slate-800 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-teal-400 bg-teal-950/80 border border-teal-800/80 px-2 py-0.5 rounded">
                    {activeExercise.accent}
                  </span>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-950/80 border border-indigo-800/80 px-2 py-0.5 rounded">
                    Target: {activeExercise.difficulty}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1.5 leading-snug">{activeExercise.title}</h3>
              </div>

              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 px-3 py-1.5 rounded-lg border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-teal-400" />
                <span>{showTranscript ? 'Hide script' : 'View script'}</span>
              </button>
            </div>

            {/* Interactive wave visualizer */}
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-4">
              <div className="flex items-end gap-[3px] h-10 px-2 overflow-hidden justify-between">
                {Array.from({ length: 42 }).map((_, idx) => {
                  const isActive = (idx / 42) <= (currentTime / 135);
                  // Generate complex wave pattern
                  const waveHeight = isPlaying 
                    ? Math.abs(Math.sin((idx + currentTime) * 0.4)) * 30 + 8
                    : Math.abs(Math.sin(idx * 0.2)) * 14 + 6;
                  return (
                    <div
                      key={idx}
                      className={`w-1 rounded-full transition-all duration-300 ${
                        isActive ? 'bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.4)]' : 'bg-slate-800'
                      }`}
                      style={{ height: `${waveHeight}px` }}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
                <span>{formatAudioTime(currentTime)}</span>
                <div className="flex items-center gap-4">
                  
                  {/* Play Trigger */}
                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 fill-slate-950 stroke-none" />
                    ) : (
                      <Play className="w-4 h-4 fill-slate-950 stroke-none ml-0.5" />
                    )}
                  </button>

                  {/* Playback speed controller */}
                  <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                    {[0.8, 1.0, 1.2].map(speed => (
                      <button
                        key={speed}
                        onClick={() => setPlaybackSpeed(speed)}
                        className={`px-2 py-1 rounded font-bold cursor-pointer transition-colors ${
                          playbackSpeed === speed 
                            ? 'bg-teal-500 text-slate-950' 
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>

                </div>
                <span>{activeExercise.duration}</span>
              </div>
            </div>

            {/* Collapsible Transcript */}
            {showTranscript && (
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 text-xs leading-relaxed text-slate-300 whitespace-pre-line font-sans border-l-4 border-l-teal-500 animate-fadeIn">
                <div className="font-bold text-teal-400 mb-2 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Script & Dialogue:</span>
                </div>
                {activeExercise.transcript}
              </div>
            )}
          </div>

          {/* COMPREHENSION DRILLS */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Drill Questions</h3>
                <p className="text-xs text-slate-500">Every task evaluates a specific Cambridge listening competence</p>
              </div>

              {showResults && (
                <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-100 text-teal-800 px-3 py-1.5 rounded-xl font-bold text-xs">
                  <Award className="w-4 h-4 text-teal-600" />
                  <span>Score: {Math.round((activeExercise.questions.filter(q => userAnswers[q.id] === q.correctIndex).length / activeExercise.questions.length) * 100)}%</span>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {activeExercise.questions.map((q, qIdx) => {
                const selectedOpt = userAnswers[q.id];
                const isCorrect = selectedOpt === q.correctIndex;

                return (
                  <div key={q.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-4">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {qIdx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-600 tracking-wider">
                            {getQuestionTypeName(q.questionType)}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 leading-snug">{q.question}</p>
                      </div>
                    </div>

                    {/* Answer Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8">
                      {q.options.map((opt, optIdx) => {
                        let btnStyle = "border-slate-200 bg-white text-slate-700 hover:border-slate-300";
                        if (selectedOpt === optIdx) {
                          btnStyle = "border-teal-600 bg-teal-50 text-teal-950 font-bold";
                        }
                        if (showResults) {
                          if (optIdx === q.correctIndex) {
                            btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold";
                          } else if (selectedOpt === optIdx && !isCorrect) {
                            btnStyle = "border-rose-500 bg-rose-50 text-rose-950 font-bold";
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={showResults}
                            onClick={() => handleSelectOption(q.id, optIdx)}
                            className={`w-full text-left p-3 rounded-lg border text-xs transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {showResults && optIdx === q.correctIndex && (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                            {showResults && selectedOpt === optIdx && !isCorrect && (
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {showResults && (
                      <div className="pl-8">
                        <div className="p-3 bg-teal-50/50 border border-teal-100 rounded-xl text-[11px] text-teal-950">
                          <span className="font-bold block mb-0.5">Explanation:</span>
                          <p>{q.explanation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Form Controls */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Exercise</span>
              </button>

              {!showResults ? (
                <button
                  onClick={handleSubmitAnswers}
                  disabled={Object.keys(userAnswers).length < activeExercise.questions.length}
                  className="bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Verify Answers
                </button>
              ) : (
                <button
                  onClick={handleReset}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Practice Again
                </button>
              )}
            </div>

            {feedbackMsg && (
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-100 flex items-center gap-2 text-xs text-teal-950 font-medium">
                <Check className="w-4 h-4 text-teal-600 shrink-0" />
                <span>{feedbackMsg}</span>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Analytics, Vocabulary Harvesting, Speaking Connectors */}
        <div className="space-y-6">

          {/* LISTENING COACH ANALYTICS PANEL */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">Coach Analytics</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-100">
                Level: {coachProfile.level}
              </span>
            </div>

            {/* Accuracy tracker */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-[10px] text-slate-500 block leading-none font-bold">AVG ACCURACY</span>
                <span className="text-xl font-black text-slate-900 mt-1 block">{avgAccuracy}%</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-[10px] text-slate-500 block leading-none font-bold">DRILLS TAKEN</span>
                <span className="text-xl font-black text-slate-900 mt-1 block">{totalCompleted}</span>
              </div>
            </div>

            {/* Skill distribution progress */}
            <div className="space-y-2.5 pt-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Comprehension Type Accuracy</h4>
              {Object.entries(coachProfile.categoryStats).map(([key, rawValue]) => {
                const value = rawValue as { correct: number; total: number };
                const percent = value.total > 0 ? Math.round((value.correct / value.total) * 100) : 0;
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-700">{getQuestionTypeName(key)}</span>
                      <span className="font-mono text-slate-500 font-bold">{value.correct}/{value.total} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          percent >= 80 ? 'bg-emerald-500' : percent >= 60 ? 'bg-teal-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${percent || 10}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Accents conquered */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Accents Conquered</h4>
              <div className="flex flex-wrap gap-1">
                {coachProfile.accentsConquered.length > 0 ? (
                  coachProfile.accentsConquered.map(acc => (
                    <span key={acc} className="text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md">
                      {acc}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No accents recorded yet. Complete a drill!</span>
                )}
              </div>
            </div>

            {/* Dynamic Advice */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[9px] font-bold text-indigo-700 uppercase tracking-widest block">Coach Advice:</span>
              <p className="text-[11px] leading-relaxed text-slate-600">
                {avgAccuracy >= 80 
                  ? "Outstanding receptivity. You possess strong lexical flexibility. Try generating highly specialized technical topics to stress-test your comprehension."
                  : "Excellent effort. Keep an ear out for discourse markers like 'however' or 'on the other hand' which indicate shifts in speaker attitude. Focus on implied meaning tasks."}
              </p>
            </div>
          </div>

          {/* VOCABULARY HARVESTER PANEL */}
          {activeExercise.harvestableVocabulary && activeExercise.harvestableVocabulary.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">Vocabulary Harvester</h3>
                </div>
                <button
                  onClick={handleHarvestAll}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded"
                >
                  Harvest All
                </button>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {activeExercise.harvestableVocabulary.map((item, idx) => {
                  const isHarvested = harvestedItems[item.expression];
                  return (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-800">“{item.expression}”</span>
                        <button
                          onClick={() => handleHarvestItem(item)}
                          disabled={isHarvested}
                          className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${
                            isHarvested 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                          }`}
                        >
                          {isHarvested ? 'Harvested' : 'Harvest'}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{item.meaning}</p>
                      <p className="text-[11px] text-slate-400 italic font-mono leading-none">Ex: {item.example}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SPEAKING BRIDGE PANEL */}
          {activeExercise.speakingBridge && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-1.5">
                <Speech className="w-4.5 h-4.5 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">Productive Speaking Bridge</h3>
              </div>
              
              <div className="bg-white/80 p-3.5 rounded-xl border border-emerald-500/10 space-y-2">
                <h4 className="text-xs font-extrabold text-slate-900">{activeExercise.speakingBridge.scenario}</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">{activeExercise.speakingBridge.promptText}</p>
              </div>

              <button
                onClick={handleLaunchSpeakingBridge}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Launch Connected Speaking Roleplay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* VOCABULARY GAPS LOG */}
          {coachProfile.vocabularyGaps.length > 0 && (
            <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800">Review Gaps (Active Remediation)</h3>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">These terms are scheduled for priority spaced repetition exercises</p>
              
              <div className="space-y-2">
                {coachProfile.vocabularyGaps.map((g, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-xl border border-rose-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-extrabold text-slate-800 block">“{g.expression}”</span>
                      <span className="text-[10px] text-slate-500 block leading-tight">{g.meaning.substring(0, 50)}...</span>
                    </div>
                    <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                      Needs review
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
