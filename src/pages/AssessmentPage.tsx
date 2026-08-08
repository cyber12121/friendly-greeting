import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { aiClientService } from '../services/aiClientService';
import { learnerService } from '../services/learnerService';
import {
  Award,
  BookOpen,
  Mic,
  MicOff,
  PenTool,
  Headphones,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Play,
  Volume2,
  Loader2,
  FileText,
  Clock,
  RefreshCw,
  TrendingUp,
  ChevronRight,
  Activity,
  Zap,
  Check,
  X
} from 'lucide-react';

interface GrammarQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  selectedOption: number | null;
  topic: string;
}

interface VocabQuestion {
  id: string;
  type: 'recognition' | 'recall' | 'production';
  question: string;
  options?: string[];
  correctIndex?: number;
  correctAnswer?: string;
  selectedValue?: string;
  topic: string;
}

export const AssessmentPage: React.FC = () => {
  const {
    comprehensiveProfile,
    updateLearnerUserProfile,
    updateCoreSkill,
    addXpAndMinutes
  } = useApp();

  const [activeStep, setActiveStep] = useState<'briefing' | 'grammar_vocab' | 'listening' | 'writing' | 'speaking' | 'submitting' | 'report'>('briefing');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ----------------------------------------------------
  // SECTION 1: GRAMMAR & VOCABULARY STATE
  // ----------------------------------------------------
  const [grammarQuestions, setGrammarQuestions] = useState<GrammarQuestion[]>([
    {
      id: 'g-1',
      question: "Identify the correct formal transformation of: 'If we had known about the compliance delays, we would have revised the agreement.'",
      options: [
        "Had we known about the compliance delays, we would have revised the agreement.",
        "Should we have known about the compliance delays, we revised the agreement.",
        "Did we know about the compliance delays, we had revised the agreement.",
        "If we would have known about compliance delays, we would have revised."
      ],
      correctIndex: 0,
      selectedOption: null,
      topic: "Conditional Inversions"
    },
    {
      id: 'g-2',
      question: "It is essential that she _______ her presentation slide decks before the management review on Thursday.",
      options: [
        "rehearses",
        "rehearse",
        "will rehearse",
        "rehearsed"
      ],
      correctIndex: 1,
      selectedOption: null,
      topic: "Subjunctive Mood"
    },
    {
      id: 'g-3',
      question: "While we _______ the statistical anomalies in the Q3 report, the server suddenly crashed, losing our draft.",
      options: [
        "analyzed",
        "were analyzing",
        "had analyzed",
        "have analyzed"
      ],
      correctIndex: 1,
      selectedOption: null,
      topic: "Narrative Tenses / Past Continuous"
    }
  ]);

  const [vocabQuestions, setVocabQuestions] = useState<VocabQuestion[]>([
    {
      id: 'v-1',
      type: 'recognition',
      question: "Choose the word closest in meaning to the B2 academic term 'mitigate':",
      options: ["alleviate/reduce", "increase/intensify", "verify/audit", "prolong/extend"],
      correctIndex: 0,
      selectedValue: undefined,
      topic: "B2 Verb Synonyms"
    },
    {
      id: 'v-2',
      type: 'recall',
      question: "Complete the sentence with the correct noun: 'After hours of intense negotiation, the corporate board finally reached a general ___________ on the budget.'",
      selectedValue: '',
      correctAnswer: 'consensus',
      topic: "Collocation Recall"
    },
    {
      id: 'v-3',
      type: 'production',
      question: "Write an original, formal sentence using the business keyword 'benchmark' to demonstrate its correct contextual application:",
      selectedValue: '',
      topic: "Vocabulary Contextual Production"
    }
  ]);

  // ----------------------------------------------------
  // SECTION 2: LISTENING STATE
  // ----------------------------------------------------
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSubtitle, setShowSubtitle] = useState(false);

  const listeningTranscript = "Welcome everyone. Today we are assessing our corporate transition strategies. Many regional branches are finding the initial deployment costs of our solar cladding systems to be quite high. Some managers are advocating for rooftop wind farms as a cheaper alternative. However, we must benchmark our efforts against long-term targets. Notwithstanding the immediate budget strain, we must proceed with solar integration to mitigate future regulatory risks. Striking a balance between local consensus and global mandates is essential, but we cannot concede our sustainability pledge for temporary convenience.";

  const [listeningQuestions, setListeningQuestions] = useState<any[]>([
    {
      id: 'l-1',
      question: "What is the primary objective of the speaker in this monologue?",
      options: [
        "To recommend rooftop wind turbines as a cost-efficient measure.",
        "To defend the high-cost solar cladding initiative against cheaper proposals.",
        "To criticize regional branch managers for failing to reach a local consensus.",
        "To outline a plan to cancel the corporate sustainability pledge completely."
      ],
      correctIndex: 1,
      selectedOption: null,
      type: "main_idea"
    },
    {
      id: 'l-2',
      question: "According to the speaker, what is the principal benefit of sticking with the solar integration plans despite budget strain?",
      options: [
        "Satisfying immediate consumer complaints.",
        "Avoiding future compliance and regulatory risks.",
        "Fostering quick consensus among regional delegates.",
        "Achieving immediate profitability benchmarks."
      ],
      correctIndex: 1,
      selectedOption: null,
      type: "specific_detail"
    },
    {
      id: 'l-3',
      question: "What does the speaker imply when using the phrase 'notwithstanding the immediate budget strain'?",
      options: [
        "The project should be paused until the budget is fully secured.",
        "The budget strain is insignificant and should be completely ignored.",
        "The long-term value outweighs the present financial challenge, so we must proceed.",
        "The budget strain will lead to the failure of the sustainability project."
      ],
      correctIndex: 2,
      type: "implied_meaning",
      selectedOption: null
    }
  ]);

  // Handle simulated audio play using speech synthesis or standard UI timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioProgress(prev => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            return 100;
          }
          return prev + 1.5 * playbackSpeed;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio, playbackSpeed]);

  const handlePlayAudioText = () => {
    if (isPlayingAudio) {
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
      setAudioProgress(0);
    } else {
      setIsPlayingAudio(true);
      setAudioProgress(0);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(listeningTranscript);
        utterance.rate = playbackSpeed;
        utterance.onend = () => {
          setIsPlayingAudio(false);
          setAudioProgress(100);
        };
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  // ----------------------------------------------------
  // SECTION 3: WRITING STATE
  // ----------------------------------------------------
  const writingPrompt = "In the contemporary digital landscape, while remote and asynchronous work arrangements offer unparalleled individual flexibility, some argue it fundamentally hinders deep team collaboration, organizational cohesion, and long-term career growth. To what extent do you agree or disagree with this standpoint? Provide logical arguments and evidence from your own experiences. Aim for approximately 250 words.";
  const [writingText, setWritingText] = useState('');
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const trimmed = writingText.trim();
    if (trimmed === '') {
      setWordCount(0);
    } else {
      setWordCount(trimmed.split(/\s+/).length);
    }
  }, [writingText]);

  // ----------------------------------------------------
  // SECTION 4: SPEAKING STATE
  // ----------------------------------------------------
  const speakingPrompts = [
    {
      id: 'spontaneous',
      label: "Spontaneous Conversation",
      description: "Introduce yourself formally, briefly summarize your professional or educational background, and outline why mastering professional English is critical to your career milestones.",
      timeLimit: 60,
      transcript: ""
    },
    {
      id: 'abstract',
      label: "Abstract Discussion",
      description: "Many developed nations are debating whether to ban private internal combustion vehicles in downtown zones to combat climate change. What are your views on this development, and what wider societal impacts might arise?",
      timeLimit: 90,
      transcript: ""
    },
    {
      id: 'storytelling',
      label: "Storytelling",
      description: "Narrate an experience where you had to adapt quickly to a major, unexpected disruption. Describe the context, your strategic response, and what this taught you about modern agile practices.",
      timeLimit: 90,
      transcript: ""
    },
    {
      id: 'debate',
      label: "Opinion/Debate Defense",
      description: "Take a clear stance and argue for or against this assertion: 'Advanced AI systems will render traditional human language educators and coaches completely obsolete in the coming decade.' Argue your perspective persuasively.",
      timeLimit: 90,
      transcript: ""
    }
  ];

  const [currentSpeakingPromptIndex, setCurrentSpeakingPromptIndex] = useState(0);
  const [speakingTranscripts, setSpeakingTranscripts] = useState<Record<string, string>>({
    spontaneous: '',
    abstract: '',
    storytelling: '',
    debate: ''
  });
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recognitionObj, setRecognitionObj] = useState<any>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const startVoiceRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      const promptKey = speakingPrompts[currentSpeakingPromptIndex].id;
      let finalTranscriptText = speakingTranscripts[promptKey] || '';

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscriptText += ' ' + event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setSpeakingTranscripts(prev => ({
          ...prev,
          [promptKey]: (finalTranscriptText + ' ' + interimTranscript).trim()
        }));
      };

      rec.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      rec.start();
      setRecognitionObj(rec);
    } else {
      // Simulate speech-to-text if API not supported
      const promptKey = speakingPrompts[currentSpeakingPromptIndex].id;
      let simText = "";
      if (promptKey === 'spontaneous') {
        simText = "Hello examiner. I am a project analyst in sustainable energy. I have been practicing my English for the past year because my goal is to lead international teams. To achieve this, mastering B2-level business English and presentation registers is essential to communicate clearly without hesitation gaps during strategic alignments.";
      } else if (promptKey === 'abstract') {
        simText = "In my opinion, banning cars in downtown regions is a highly beneficial step. From my perspective, we cannot solve atmospheric pollution without a serious paradigm shift in urban design. Consequently, we would reduce carbon emissions while encouraging people to utilize green public transit networks.";
      } else if (promptKey === 'storytelling') {
        simText = "A major challenge occurred when our primary vendor suddenly shut down operations. Had we not implemented a robust backup supply scheme, our project would have stalled entirely. We quickly pivoted by onboarding local contractors, which taught me the value of operational flexibility.";
      } else {
        simText = "I disagree with the assertion that AI will fully replace human language coaches. Although AI provides excellent instant grammatical feedback, it lacks the interpersonal empathy, cultural understanding, and psychological scaffolding that a live human coach provides during spontaneous debate contexts.";
      }

      setSpeakingTranscripts(prev => ({
        ...prev,
        [promptKey]: simText
      }));

      setTimeout(() => {
        setIsRecording(false);
      }, 3000);
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionObj) {
      recognitionObj.stop();
    }
    setIsRecording(false);
  };

  const simulateSpeechText = (key: string) => {
    let text = "";
    if (key === 'spontaneous') {
      text = "My name is Vinay, and I work in software consulting. I want to achieve the CEFR B2 level because my company works with corporate stakeholders in New York and London. I notice that sometimes I pause to search for words during spontaneous conversation, so this English program has been helping me build better fluency and confidence.";
    } else if (key === 'abstract') {
      text = "Regarding the car ban, I believe the environmental benefits are substantial. However, we must consider the socio-economic impact on retail businesses. If we implement a car-free zone, we must concurrently subsidize electric shuttle lines so that accessibility does not suffer.";
    } else if (key === 'storytelling') {
      text = "During our software deployment, the main database connection failed unexpectedly. It was a critical system bottleneck. I had to coordinate with three separate support engineers under intense pressure, but we established a stable workaround within two hours by using a temporary secondary cache.";
    } else if (key === 'debate') {
      text = "I believe AI acts as a fantastic amplifier for human coaches rather than a complete replacement. An AI can monitor vocabulary frequency and syntax errors with infinite patience, but human coaches excel at motivating students and guiding them through complex emotional blocks during speaking anxiety.";
    }
    setSpeakingTranscripts(prev => ({
      ...prev,
      [key]: text
    }));
  };

  // ----------------------------------------------------
  // SECTION 5: FINAL EVALUATION & REPORT STATE
  // ----------------------------------------------------
  const [assessmentReport, setAssessmentReport] = useState<any | null>(null);

  const handleSubmitAssessment = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setActiveStep('submitting');

    const payload = {
      grammarAnswers: grammarQuestions.map(q => ({
        id: q.id,
        topic: q.topic,
        question: q.question,
        selectedOptionText: q.selectedOption !== null ? q.options[q.selectedOption] : 'None',
        isCorrect: q.selectedOption === q.correctIndex
      })),
      vocabAnswers: vocabQuestions.map(q => {
        if (q.type === 'recognition') {
          return {
            id: q.id,
            topic: q.topic,
            type: q.type,
            question: q.question,
            selectedValue: q.selectedValue,
            isCorrect: q.selectedValue === q.options?.[q.correctIndex || 0]
          };
        } else if (q.type === 'recall') {
          return {
            id: q.id,
            topic: q.topic,
            type: q.type,
            question: q.question,
            selectedValue: q.selectedValue,
            isCorrect: q.selectedValue?.trim().toLowerCase() === q.correctAnswer?.toLowerCase()
          };
        } else {
          return {
            id: q.id,
            topic: q.topic,
            type: q.type,
            question: q.question,
            selectedValue: q.selectedValue,
            isCorrect: (q.selectedValue || '').trim().length > 15
          };
        }
      }),
      listeningAnswers: listeningQuestions.map(q => ({
        id: q.id,
        question: q.question,
        selectedOptionText: q.selectedOption !== null ? q.options[q.selectedOption] : 'None',
        isCorrect: q.selectedOption === q.correctIndex,
        type: q.type
      })),
      writingText: writingText,
      speakingTranscripts: speakingTranscripts
    };

    try {
      const evaluation = await aiClientService.evaluateB2Assessment(payload);
      setAssessmentReport(evaluation);
      setActiveStep('report');

      // Update learner profile locally and back up to server-side Firestore
      const targetScores: Record<string, number> = {
        speaking: evaluation.skillBreakdown.speaking.score,
        listening: evaluation.skillBreakdown.listening.score,
        writing: evaluation.skillBreakdown.writing.score,
        grammar: evaluation.skillBreakdown.grammar.score,
        vocabulary: evaluation.skillBreakdown.vocabulary.score,
        fluency: Math.round((evaluation.skillBreakdown.speaking.score + evaluation.skillBreakdown.listening.score) / 2),
        communication: Math.round((evaluation.skillBreakdown.speaking.score + evaluation.skillBreakdown.writing.score) / 2)
      };

      // Sync skill updates
      Object.entries(targetScores).forEach(([key, score]) => {
        updateCoreSkill(key as any, score, true, `Diagnostic assessment score for ${key}`);
      });

      // Update core CEFR level and add bonus XP
      updateLearnerUserProfile({
        currentCEFRLevel: evaluation.overallCEFR,
        currentProgramDay: 90 // Set to final day as they took the assessment!
      });

      addXpAndMinutes(30, 150); // Massive assessment completion bonus!

    } catch (err: any) {
      console.error("Failed to submit and evaluate final assessment:", err);
      setErrorMsg(err?.message || "There was an error communicating with the AI examiner. Please check your connections.");
      setActiveStep('briefing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* HEADER HERO AREA */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 rounded-full border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            Adaptive B2 Milestone Target
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Comprehensive CEFR B2 Independent Assessment
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">
            A high-fidelity examiner simulation assessing your spontaneous production, narrative cohesion, abstract arguments, grammar structures, and lexical range against the official CEFR B2 threshold.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shrink-0 text-center w-full md:w-auto min-w-[150px] relative z-10 backdrop-blur-xs">
          <p className="text-[10px] text-indigo-300 uppercase font-black tracking-wider">Overall Milestone</p>
          <p className="text-3xl font-black text-white mt-1">90-Day Path</p>
          <span className="inline-block mt-1 text-[11px] font-bold text-slate-400">
            Current: {comprehensiveProfile.userProfile?.currentCEFRLevel || 'B1+'}
          </span>
        </div>
      </div>

      {/* TIMELINE PROGRESS INDICATOR */}
      {activeStep !== 'report' && activeStep !== 'submitting' && (
        <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200/80 shadow-xs flex justify-between items-center text-xs overflow-x-auto gap-4 scrollbar-none">
          <button 
            onClick={() => setActiveStep('briefing')}
            className={`flex items-center gap-1.5 font-bold transition-all px-3 py-1.5 rounded-lg cursor-pointer ${
              activeStep === 'briefing' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            1. Briefing
          </button>
          <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
          
          <button 
            disabled={activeStep === 'briefing'}
            onClick={() => setActiveStep('grammar_vocab')}
            className={`flex items-center gap-1.5 font-bold transition-all px-3 py-1.5 rounded-lg cursor-pointer ${
              activeStep === 'grammar_vocab' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-800 disabled:opacity-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            2. Grammar & Vocab
          </button>
          <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />

          <button 
            disabled={activeStep === 'briefing' || activeStep === 'grammar_vocab'}
            onClick={() => setActiveStep('listening')}
            className={`flex items-center gap-1.5 font-bold transition-all px-3 py-1.5 rounded-lg cursor-pointer ${
              activeStep === 'listening' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-800 disabled:opacity-50'
            }`}
          >
            <Headphones className="w-4 h-4" />
            3. Listening
          </button>
          <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />

          <button 
            disabled={activeStep === 'briefing' || activeStep === 'grammar_vocab' || activeStep === 'listening'}
            onClick={() => setActiveStep('writing')}
            className={`flex items-center gap-1.5 font-bold transition-all px-3 py-1.5 rounded-lg cursor-pointer ${
              activeStep === 'writing' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-800 disabled:opacity-50'
            }`}
          >
            <PenTool className="w-4 h-4" />
            4. Writing
          </button>
          <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />

          <button 
            disabled={activeStep === 'briefing' || activeStep === 'grammar_vocab' || activeStep === 'listening' || activeStep === 'writing'}
            onClick={() => setActiveStep('speaking')}
            className={`flex items-center gap-1.5 font-bold transition-all px-3 py-1.5 rounded-lg cursor-pointer ${
              activeStep === 'speaking' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-800 disabled:opacity-50'
            }`}
          >
            <Mic className="w-4 h-4" />
            5. Speaking
          </button>
        </div>
      )}

      {/* ERROR MSG BANNER */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-start gap-3 text-xs leading-relaxed">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">System Connection Issue: </strong>
            {errorMsg}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          ACTIVE STEP CONTENT COMPONENT RENDERER
          ---------------------------------------------------- */}

      {/* STEP 1: BRIEFING OVERVIEW */}
      {activeStep === 'briefing' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              Before You Start: Assessment Guidelines & Rubrics
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Please allocate 15-20 minutes of quiet, uninterrupted time to complete this evaluation. It will test your actual language capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/50 space-y-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Activity className="w-4 h-4 text-indigo-600" />
                CEFR B2 Independent Benchmark Criteria
              </h3>
              <p className="text-slate-600 leading-relaxed">
                The CEFR B2 level represents the threshold where you can interact with a degree of fluency and spontaneity with native speakers. You are expected to:
              </p>
              <ul className="space-y-2 mt-1 pl-4 list-disc text-slate-500 leading-relaxed">
                <li>Understand the main ideas of complex text on both concrete and abstract topics.</li>
                <li>Produce clear, detailed text on a wide range of subjects.</li>
                <li>Explain a viewpoint on a topical issue giving the advantages and disadvantages of various options.</li>
                <li>Express viewpoints clearly with structured discourse markers.</li>
              </ul>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/50 space-y-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <FileText className="w-4 h-4 text-indigo-600" />
                Assessment Modules Overview
              </h3>
              <p className="text-slate-600 leading-relaxed">
                This comprehensive diagnostic engine evaluates you across five pillars:
              </p>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 bg-white border border-slate-150 rounded-lg">
                  <span className="font-bold text-slate-800 block">Grammar Accuracy</span>
                  <span className="text-[10px] text-slate-400">Inversions, subjunctive, tenses.</span>
                </div>
                <div className="p-2.5 bg-white border border-slate-150 rounded-lg">
                  <span className="font-bold text-slate-800 block">Vocabulary Range</span>
                  <span className="text-[10px] text-slate-400">Synonym recognition & usage.</span>
                </div>
                <div className="p-2.5 bg-white border border-slate-150 rounded-lg">
                  <span className="font-bold text-slate-800 block">Listening Comprehension</span>
                  <span className="text-[10px] text-slate-400">Abstract speech inference.</span>
                </div>
                <div className="p-2.5 bg-white border border-slate-150 rounded-lg">
                  <span className="font-bold text-slate-800 block">Writing Cohesion</span>
                  <span className="text-[10px] text-slate-400">Formal argument writing.</span>
                </div>
              </div>
              <p className="text-[11px] text-indigo-600 font-bold bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
                🎙️ Speaking Component: Includes spontaneous conversation, abstract discussion, storytelling, and persuasion tasks.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveStep('grammar_vocab')}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              Start Section 1: Grammar & Vocabulary
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: GRAMMAR & VOCABULARY SUBTEST */}
      {activeStep === 'grammar_vocab' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-8">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Section 1: Grammar & Vocabulary Test
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select the option that represents standard formal grammatical structures, and write contextual vocabulary sentences.
            </p>
          </div>

          {/* Grammar Questions Section */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase text-indigo-600 tracking-wider">Pillar A: B2 Grammatical Form Accuracy</h3>
            {grammarQuestions.map((q, qIdx) => (
              <div key={q.id} className="bg-slate-50/40 p-5 rounded-xl border border-slate-200/50 space-y-3">
                <p className="text-xs font-bold text-slate-800 flex items-start gap-1.5">
                  <span className="bg-slate-200 text-slate-700 w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    Q{qIdx + 1}
                  </span>
                  <span>{q.question}</span>
                </p>
                <div className="grid grid-cols-1 gap-2 pl-6">
                  {q.options.map((opt, optIdx) => (
                    <button
                      key={optIdx}
                      onClick={() => {
                        const updated = [...grammarQuestions];
                        updated[qIdx].selectedOption = optIdx;
                        setGrammarQuestions(updated);
                      }}
                      className={`text-left p-3 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                        q.selectedOption === optIdx
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Vocabulary Questions Section */}
          <div className="space-y-6 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-black uppercase text-indigo-600 tracking-wider">Pillar B: Vocabulary Range (Recognition, Recall & Production)</h3>
            
            {/* 1. Recognition */}
            <div className="bg-slate-50/40 p-5 rounded-xl border border-slate-200/50 space-y-3">
              <p className="text-xs font-bold text-slate-800 flex items-start gap-1.5">
                <span className="bg-slate-200 text-slate-700 w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">Q4</span>
                <span>{vocabQuestions[0].question}</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                {vocabQuestions[0].options?.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => {
                      const updated = [...vocabQuestions];
                      updated[0].selectedValue = opt;
                      setVocabQuestions(updated);
                    }}
                    className={`text-left p-3 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                      vocabQuestions[0].selectedValue === opt
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Recall */}
            <div className="bg-slate-50/40 p-5 rounded-xl border border-slate-200/50 space-y-3">
              <p className="text-xs font-bold text-slate-800 flex items-start gap-1.5">
                <span className="bg-slate-200 text-slate-700 w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">Q5</span>
                <span>{vocabQuestions[1].question}</span>
              </p>
              <div className="pl-6">
                <input
                  type="text"
                  value={vocabQuestions[1].selectedValue || ''}
                  onChange={(e) => {
                    const updated = [...vocabQuestions];
                    updated[1].selectedValue = e.target.value;
                    setVocabQuestions(updated);
                  }}
                  placeholder="Type the word here..."
                  className="w-full sm:w-80 bg-white border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* 3. Production */}
            <div className="bg-slate-50/40 p-5 rounded-xl border border-slate-200/50 space-y-3">
              <p className="text-xs font-bold text-slate-800 flex items-start gap-1.5">
                <span className="bg-slate-200 text-slate-700 w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">Q6</span>
                <span>{vocabQuestions[2].question}</span>
              </p>
              <div className="pl-6 space-y-1">
                <textarea
                  value={vocabQuestions[2].selectedValue || ''}
                  onChange={(e) => {
                    const updated = [...vocabQuestions];
                    updated[2].selectedValue = e.target.value;
                    setVocabQuestions(updated);
                  }}
                  rows={2}
                  placeholder="Write your original sentence here using the word 'benchmark' in a suitable business or academic context..."
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-400 block">Must show spontaneous vocabulary competence. Avoid basic phrases.</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveStep('briefing')}
              className="flex items-center gap-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Guidelines Briefing
            </button>

            <button
              onClick={() => setActiveStep('listening')}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              Continue to Section 2: Listening
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: LISTENING SUBTEST */}
      {activeStep === 'listening' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-8">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Headphones className="w-5 h-5 text-indigo-600" />
              Section 2: B2 Listening Comprehension Test
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Play the corporate strategy briefing audio once or twice, then select the options representing correct inferences and main ideas.
            </p>
          </div>

          {/* Audio Console Panel */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
            
            <button
              onClick={handlePlayAudioText}
              className={`w-14 h-14 rounded-full flex items-center justify-center font-bold shrink-0 transition-all shadow-md cursor-pointer ${
                isPlayingAudio ? 'bg-rose-500 text-white animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
              title="Click to play spoken text"
            >
              {isPlayingAudio ? (
                <div className="flex gap-1 justify-center items-center">
                  <span className="w-1 bg-white h-4 rounded animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-1 bg-white h-5 rounded animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1 bg-white h-4 rounded animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </button>

            <div className="flex-1 w-full space-y-3 relative z-10">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Volume2 className="w-4 h-4 text-indigo-500" />
                  Authentic Corporate Strategy Briefing (B2 Speed)
                </span>
                <span className="text-slate-400 font-medium">Progress: {Math.round(audioProgress)}%</span>
              </div>

              {/* Progress Slider Bar */}
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${audioProgress}%` }}
                />
              </div>

              {/* Audio Controls Grid */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Voice Speed:</span>
                  <button
                    onClick={() => setPlaybackSpeed(0.85)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer ${
                      playbackSpeed === 0.85 ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white text-slate-500 border-slate-200'
                    }`}
                  >
                    0.85x (Slow)
                  </button>
                  <button
                    onClick={() => setPlaybackSpeed(1)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer ${
                      playbackSpeed === 1 ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white text-slate-500 border-slate-200'
                    }`}
                  >
                    1.0x (Normal)
                  </button>
                  <button
                    onClick={() => setPlaybackSpeed(1.15)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer ${
                      playbackSpeed === 1.15 ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white text-slate-500 border-slate-200'
                    }`}
                  >
                    1.15x (Fast)
                  </button>
                </div>

                <button
                  onClick={() => setShowSubtitle(!showSubtitle)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    showSubtitle ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {showSubtitle ? "Hide Transcript" : "Show Transcript"}
                </button>
              </div>
            </div>
          </div>

          {/* Transcript Display box if toggled */}
          {showSubtitle && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed italic animate-fade-in relative">
              <strong className="block text-[10px] font-black uppercase text-indigo-500 not-italic mb-1">Spoken Monologue Transcript:</strong>
              "{listeningTranscript}"
            </div>
          )}

          {/* Listening Questions Block */}
          <div className="space-y-6 pt-4 border-t border-slate-100">
            {listeningQuestions.map((q, qIdx) => (
              <div key={q.id} className="bg-slate-50/40 p-5 rounded-xl border border-slate-200/50 space-y-3">
                <p className="text-xs font-bold text-slate-800 flex items-start gap-1.5">
                  <span className="bg-slate-200 text-slate-700 w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    Q{qIdx + 1}
                  </span>
                  <span>{q.question}</span>
                </p>
                <div className="grid grid-cols-1 gap-2 pl-6">
                  {q.options.map((opt, optIdx) => (
                    <button
                      key={optIdx}
                      onClick={() => {
                        const updated = [...listeningQuestions];
                        updated[qIdx].selectedOption = optIdx;
                        setListeningQuestions(updated);
                      }}
                      className={`text-left p-3 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                        q.selectedOption === optIdx
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveStep('grammar_vocab')}
              className="flex items-center gap-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Section 1: Grammar & Vocab
            </button>

            <button
              onClick={() => setActiveStep('writing')}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              Continue to Section 3: Writing
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: WRITING TASK SUBTEST */}
      {activeStep === 'writing' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-8">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <PenTool className="w-5 h-5 text-indigo-600" />
              Section 3: Opinion & Argument Writing Essay
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Construct a detailed formal argument addressing the prompt below. Aim for logical paragraphs, precise B2 synonyms, and formal linking words.
            </p>
          </div>

          {/* Prompt Presentation Card */}
          <div className="p-5 bg-indigo-50/25 border border-indigo-100 rounded-xl space-y-2">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">Essay Writing Prompt:</span>
            <p className="text-xs font-semibold text-slate-800 leading-relaxed italic">
              "{writingPrompt}"
            </p>
          </div>

          {/* Essay Input and Word Counter */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-800 block">Your Written Submission:</label>
              <span className={`font-extrabold px-3 py-1 rounded-full text-[11px] border ${
                wordCount >= 220 && wordCount <= 280
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : wordCount > 0 && wordCount < 220
                  ? 'bg-amber-50 text-amber-700 border-amber-100'
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}>
                Word Count: {wordCount} words (Target: ~250 words)
              </span>
            </div>

            <textarea
              value={writingText}
              onChange={(e) => setWritingText(e.target.value)}
              rows={12}
              placeholder="Begin typing your formal argument essay here. Structure your response into an introduction, two supportive body paragraphs defending your thesis, and a formal logical conclusion..."
              className="w-full bg-white border border-slate-200 rounded-xl p-4 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden leading-relaxed shadow-inner"
            />
          </div>

          {/* B2 Writing Tip Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 block uppercase tracking-wider text-[10px]">B2 Cohesive Linkage Recommendation:</span>
            <p className="leading-relaxed text-[11px]">
              Elevate your essay score by incorporating advanced logical linking adverbials such as: 
              <strong className="text-indigo-600"> 'Consequently'</strong>, 
              <strong className="text-indigo-500"> 'Notwithstanding'</strong>, 
              <strong className="text-indigo-500"> 'On the other hand'</strong>, or 
              <strong className="text-indigo-500"> 'With respect to'</strong>.
            </p>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveStep('listening')}
              className="flex items-center gap-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Section 2: Listening Test
            </button>

            <button
              onClick={() => setActiveStep('speaking')}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              Continue to Section 4: Speaking
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: SPEAKING TASK SUBTEST */}
      {activeStep === 'speaking' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-8">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Mic className="w-5 h-5 text-indigo-600" />
              Section 4: Oral Production Test (4 Speaking Tasks)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Demonstrate oral proficiency in spontaneous conversation, abstract discussion, storytelling, and persuasion debate. Click Record to use your mic, or simulate.
            </p>
          </div>

          {/* Prompt Navigation tabs */}
          <div className="flex border-b border-slate-200 overflow-x-auto gap-1 scrollbar-none text-xs">
            {speakingPrompts.map((spk, idx) => (
              <button
                key={spk.id}
                disabled={isRecording}
                onClick={() => setCurrentSpeakingPromptIndex(idx)}
                className={`py-2.5 px-4 font-bold border-b-2 whitespace-nowrap cursor-pointer transition-all ${
                  currentSpeakingPromptIndex === idx
                    ? 'border-indigo-600 text-indigo-600 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                } disabled:opacity-50`}
              >
                {idx + 1}. {spk.label}
              </button>
            ))}
          </div>

          {/* Active Speaking Prompt presentation card */}
          <div className="p-5 bg-indigo-50/25 border border-indigo-100 rounded-2xl space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-lg pointer-events-none" />
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-100/60 border border-indigo-200/50 px-2 py-0.5 rounded uppercase tracking-wider inline-block">
              Task Prompt {currentSpeakingPromptIndex + 1}: {speakingPrompts[currentSpeakingPromptIndex].label}
            </span>
            <p className="text-xs font-semibold text-slate-800 leading-relaxed">
              {speakingPrompts[currentSpeakingPromptIndex].description}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <Clock className="w-3.5 h-3.5" />
              Recommended speech length: {speakingPrompts[currentSpeakingPromptIndex].timeLimit} seconds
            </div>
          </div>

          {/* Recording interface panel */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${
                    isRecording 
                      ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                  title={isRecording ? "Stop voice recording" : "Start microphone recording"}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    {isRecording ? "Active Voice Analysis..." : "Microphone Audio Capture"}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {isRecording ? `Recording speech: ${recordingSeconds}s elapsed` : "Click red button to capture spontaneous voice transcript."}
                  </p>
                </div>
              </div>

              {/* Simulation fallback link */}
              <button
                onClick={() => simulateSpeechText(speakingPrompts[currentSpeakingPromptIndex].id)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-xl transition-all hover:bg-slate-50 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-indigo-500" />
                Simulate Structured Speech
              </button>
            </div>

            {/* Transcript Text Box */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 block">Captured Speech Transcript Text:</label>
              <div className="w-full bg-white border border-slate-200 rounded-xl p-4 min-h-[100px] text-xs leading-relaxed text-slate-700 relative">
                {speakingTranscripts[speakingPrompts[currentSpeakingPromptIndex].id] || (
                  <span className="text-slate-400 italic">No speech captured yet. Click Record and speak, or use the "Simulate" assistant to input.</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveStep('writing')}
              className="flex items-center gap-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Section 3: Writing
            </button>

            {currentSpeakingPromptIndex < speakingPrompts.length - 1 ? (
              <button
                onClick={() => setCurrentSpeakingPromptIndex(prev => prev + 1)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Next Speaking Task
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitAssessment}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer"
              >
                <Award className="w-4 h-4 text-emerald-200" />
                Submit Final B2 Assessment
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 6: AI ANALYZING SCREEN */}
      {activeStep === 'submitting' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-12 text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin" />
            <Award className="w-10 h-10 text-indigo-600 relative z-10" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-lg font-black text-slate-900">Evaluating Assessment Data</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              The AI Senior CEFR Diagnostic Examiner is running full-text analysis across your oral transcripts, cohesive essay, grammar, and vocabulary sub-tests. This will build a precise diagnostic profile.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 max-w-sm mx-auto flex items-center gap-3 text-left">
            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
            <span className="text-xs font-semibold text-slate-600">Analyzing grammatical form and coherence structure...</span>
          </div>
        </div>
      )}

      {/* STEP 7: FINAL COMPREHENSIVE EXAMINER REPORT */}
      {activeStep === 'report' && assessmentReport && (
        <div className="space-y-8 animate-fade-in">
          {/* Main Assessment Summary Banner */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

            <div className="space-y-2 md:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 inline-block">
                Formal Examiner Diagnostic Report
              </span>
              <h2 className="text-xl font-black text-slate-900">CEFR Assessment Verdict</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Thank you for completing the Final Assessment. Below is your detailed competence map. Your performance logs have been permanently recorded and your learner state has been updated.
              </p>
            </div>

            {/* Overall Score Badge */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-5 text-center flex flex-col justify-center items-center">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Overall Assessed Level</span>
              <span className="text-4xl font-black text-indigo-600 my-1">{assessmentReport.overallCEFR}</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-slate-700">Score: {assessmentReport.overallScore}/100</span>
                <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-black">
                  {assessmentReport.b2ReadinessPercentage}% B2 Ready
                </span>
              </div>
            </div>
          </div>

          {/* AREAS PREVENTING B2 / SUCCESS MESSAGE SECTION */}
          {assessmentReport.areasPreventingB2 && assessmentReport.areasPreventingB2.length > 0 ? (
            <div className="bg-amber-50/40 border border-amber-200/60 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-black uppercase text-amber-800 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Identified Gaps Preventing Stable B2 Status
              </h3>
              <p className="text-xs text-amber-700 leading-relaxed">
                While you demonstrated solid capabilities, the examiner identified specific sub-domains requiring tighter reinforcement before a full B2 credential can be granted:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {assessmentReport.areasPreventingB2.map((area: string, idx: number) => (
                  <span key={idx} className="bg-white border border-amber-200 text-amber-800 text-[11px] font-bold px-3 py-1 rounded-lg">
                    &bull; {area}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50/40 border border-emerald-200/60 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-black uppercase text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-bounce" />
                Stable CEFR B2 Competence Achieved!
              </h3>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Outstanding! You have successfully demonstrated B2 proficiency across all core assessment modalities, including syntactic complexity in essay writing and persuasion structures in spontaneous speech.
              </p>
            </div>
          )}

          {/* Core Skill Breakdown Bento Grid */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Comprehensive Skill breakdown Map</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
              
              {/* Speaking Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[220px]">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-slate-800 flex items-center gap-1">
                      <Mic className="w-4 h-4 text-indigo-600" />
                      Speaking
                    </span>
                    <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[10px] font-extrabold">
                      {assessmentReport.skillBreakdown.speaking.level} ({assessmentReport.skillBreakdown.speaking.score}%)
                    </span>
                  </div>
                  <div className="text-[11px] leading-relaxed text-slate-500">
                    <strong className="text-slate-700 block text-[10px] uppercase font-bold mt-1">Examiner Evidence:</strong>
                    "{assessmentReport.skillBreakdown.speaking.evidence}"
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 text-[10px] space-y-1">
                  <span className="text-emerald-700 block"><strong>Strengths:</strong> {assessmentReport.skillBreakdown.speaking.strengths}</span>
                  <span className="text-rose-700 block"><strong>Gaps:</strong> {assessmentReport.skillBreakdown.speaking.weaknesses}</span>
                </div>
              </div>

              {/* Listening Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[220px]">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-slate-800 flex items-center gap-1">
                      <Headphones className="w-4 h-4 text-indigo-600" />
                      Listening
                    </span>
                    <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[10px] font-extrabold">
                      {assessmentReport.skillBreakdown.listening.level} ({assessmentReport.skillBreakdown.listening.score}%)
                    </span>
                  </div>
                  <div className="text-[11px] leading-relaxed text-slate-500">
                    <strong className="text-slate-700 block text-[10px] uppercase font-bold mt-1">Examiner Evidence:</strong>
                    {assessmentReport.skillBreakdown.listening.evidence}
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 text-[10px] space-y-1">
                  <span className="text-emerald-700 block"><strong>Strengths:</strong> {assessmentReport.skillBreakdown.listening.strengths}</span>
                  <span className="text-rose-700 block"><strong>Gaps:</strong> {assessmentReport.skillBreakdown.listening.weaknesses}</span>
                </div>
              </div>

              {/* Writing Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[220px]">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-slate-800 flex items-center gap-1">
                      <PenTool className="w-4 h-4 text-indigo-600" />
                      Writing
                    </span>
                    <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[10px] font-extrabold">
                      {assessmentReport.skillBreakdown.writing.level} ({assessmentReport.skillBreakdown.writing.score}%)
                    </span>
                  </div>
                  <div className="text-[11px] leading-relaxed text-slate-500">
                    <strong className="text-slate-700 block text-[10px] uppercase font-bold mt-1">Examiner Evidence:</strong>
                    "{assessmentReport.skillBreakdown.writing.evidence}"
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 text-[10px] space-y-1">
                  <span className="text-emerald-700 block"><strong>Strengths:</strong> {assessmentReport.skillBreakdown.writing.strengths}</span>
                  <span className="text-rose-700 block"><strong>Gaps:</strong> {assessmentReport.skillBreakdown.writing.weaknesses}</span>
                </div>
              </div>

              {/* Grammar Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[220px]">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-slate-800 flex items-center gap-1">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      Grammar
                    </span>
                    <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[10px] font-extrabold">
                      {assessmentReport.skillBreakdown.grammar.level} ({assessmentReport.skillBreakdown.grammar.score}%)
                    </span>
                  </div>
                  <div className="text-[11px] leading-relaxed text-slate-500">
                    <strong className="text-slate-700 block text-[10px] uppercase font-bold mt-1">Examiner Evidence:</strong>
                    {assessmentReport.skillBreakdown.grammar.evidence}
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 text-[10px] space-y-1">
                  <span className="text-emerald-700 block"><strong>Strengths:</strong> {assessmentReport.skillBreakdown.grammar.strengths}</span>
                  <span className="text-rose-700 block"><strong>Gaps:</strong> {assessmentReport.skillBreakdown.grammar.weaknesses}</span>
                </div>
              </div>

              {/* Vocabulary Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[220px]">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-slate-800 flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      Vocabulary
                    </span>
                    <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[10px] font-extrabold">
                      {assessmentReport.skillBreakdown.vocabulary.level} ({assessmentReport.skillBreakdown.vocabulary.score}%)
                    </span>
                  </div>
                  <div className="text-[11px] leading-relaxed text-slate-500">
                    <strong className="text-slate-700 block text-[10px] uppercase font-bold mt-1">Examiner Evidence:</strong>
                    {assessmentReport.skillBreakdown.vocabulary.evidence}
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 text-[10px] space-y-1">
                  <span className="text-emerald-700 block"><strong>Strengths:</strong> {assessmentReport.skillBreakdown.vocabulary.strengths}</span>
                  <span className="text-rose-700 block"><strong>Gaps:</strong> {assessmentReport.skillBreakdown.vocabulary.weaknesses}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Recommended Next Step & Personalized Study Path Timeline */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                Action Plan
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Examiner Recommended Study & Practice Pathway
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                A structured chronological set of lessons and drills specifically synthesized to target your active linguistic gaps.
              </p>
            </div>

            {/* Immediate Next Action Highlight */}
            <div className="bg-indigo-50/30 border border-indigo-100 rounded-xl p-4 flex gap-3 items-start text-xs leading-relaxed text-indigo-950">
              <span className="bg-indigo-600 text-white font-extrabold px-2.5 py-1 rounded-lg text-[10px] shrink-0 uppercase tracking-wide">
                Priority 1
              </span>
              <div>
                <strong className="font-bold text-slate-900 block">Immediate Next Step:</strong>
                {assessmentReport.recommendedNextStep}
              </div>
            </div>

            {/* Step-by-step Timeline roadmap */}
            <div className="space-y-4 pt-2">
              {assessmentReport.personalizedContinuationPlan.map((step: string, idx: number) => (
                <div key={idx} className="flex gap-4 items-start text-xs">
                  <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-500 shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="bg-slate-50/50 hover:bg-slate-50 p-4.5 rounded-2xl border border-slate-200/60 leading-relaxed text-slate-600 flex-1 transition-all">
                    {step}
                  </div>
                </div>
              ))}
            </div>

            {/* Restart Button */}
            <div className="flex justify-end pt-4 border-t border-slate-150">
              <button
                onClick={() => {
                  setActiveStep('briefing');
                  setGrammarQuestions(grammarQuestions.map(q => ({ ...q, selectedOption: null })));
                  setVocabQuestions(vocabQuestions.map(q => ({ ...q, selectedValue: q.type === 'recognition' ? undefined : '' })));
                  setListeningQuestions(listeningQuestions.map(q => ({ ...q, selectedOption: null })));
                  setWritingText('');
                  setSpeakingTranscripts({ spontaneous: '', abstract: '', storytelling: '', debate: '' });
                }}
                className="flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retake Comprehensive B2 Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
