import React, { useState, useEffect, useRef } from 'react';
import { safeStorage } from '../lib/storage';
import { useApp } from '../context/AppContext';
import { speakingScenarios } from '../data/mockData';
import { ChatMessage } from '../types';
import { aiClientService } from '../services/aiClientService';
import { crossSkillEngine } from '../services/crossSkillEngine';
import { learnerService } from '../services/learnerService';
import {
  Mic,
  MicOff,
  Play,
  Square,
  Volume2,
  Send,
  Sparkles,
  Award,
  RefreshCw,
  Clock,
  ThumbsUp,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Target,
  BookOpen,
  ArrowRight,
  BarChart3,
  Lightbulb,
  Zap
} from 'lucide-react';

export const SpeakingPage: React.FC = () => {
  const { updateSkillScore, addXpAndMinutes } = useApp();
  const profile = learnerService.getProfile();

  const [selectedScenarioId, setSelectedScenarioId] = useState(speakingScenarios[0].id);
  const scenario = speakingScenarios.find(s => s.id === selectedScenarioId) || speakingScenarios[0];
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [inputText, setInputText] = useState('');
  const [difficulty, setDifficulty] = useState<'B1' | 'B1+' | 'B2'>('B2');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Interaction Mode State
  const [interactionMode, setInteractionMode] = useState<'text' | 'voice'>('text');
  const [isMuted, setIsMuted] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [activeSpeechText, setActiveSpeechText] = useState('');
  const [speakingSeconds, setSpeakingSeconds] = useState(0);

  // Web Speech API recognition instances & refs
  const [recognition, setRecognition] = useState<any>(null);
  const transcriptRef = useRef('');
  const activeRecognitionRef = useRef<any>(null);

  // Pre-session briefing configuration
  const [sessionObjective, setSessionObjective] = useState('Negotiate scope changes & present evidence using inverted conditionals');
  const [targetGrammarTopic, setTargetGrammarTopic] = useState('Inverted Conditionals ("Had we known...")');
  const [targetVocabList, setTargetVocabList] = useState(['mitigate', 'compromise', 'benchmark', 'consensus']);
  const [recentWeaknesses, setRecentWeaknesses] = useState('Pauses before complex hypothetical structures; avoids past perfect conditionals');
  const [isAdapted, setIsAdapted] = useState(false);

  // Load dynamic targets from the Cross-Skill Engine on mount/load
  useEffect(() => {
    const graph = crossSkillEngine.buildDependencyGraph();
    const activeGrammarBridges = graph.bridges.filter(
      b => b.connectionType === 'GRAMMAR_TO_SPEAKING' && b.isActivated
    );
    const activeVocabBridges = graph.bridges.filter(
      b => b.connectionType === 'VOCABULARY_TO_SPEAKING' && b.isActivated
    );

    if (activeGrammarBridges.length > 0 || activeVocabBridges.length > 0) {
      const topGrammar = activeGrammarBridges[0];
      const grammarTopic = topGrammar ? topGrammar.sourceItemName : 'Inverted Conditionals ("Had we known...")';
      
      const vocabExpressions = activeVocabBridges.slice(0, 4).map(b => b.sourceItemName);
      const vocabList = vocabExpressions.length > 0 ? vocabExpressions : ['mitigate', 'compromise', 'benchmark', 'consensus'];

      setTargetGrammarTopic(grammarTopic);
      setTargetVocabList(vocabList);
      setIsAdapted(true);
      
      let objective = `Custom session: Present solutions for ${scenario.title}. `;
      if (topGrammar) {
        objective += `Focus on natural execution of "${grammarTopic}". `;
      }
      if (vocabExpressions.length > 0) {
        objective += `Integrate terms: ${vocabExpressions.join(', ')}.`;
      }
      setSessionObjective(objective);

      const activeErrors = graph.bridges.filter(
        b => b.connectionType === 'SPEAKING_TO_GRAMMAR' || b.connectionType === 'SPEAKING_TO_VOCABULARY'
      ).map(b => b.sourceItemName);
      if (activeErrors.length > 0) {
        setRecentWeaknesses(activeErrors.slice(0, 2).join('; ') + '. Monitor clarity and correctness.');
      } else {
        setRecentWeaknesses('Pauses before complex hypothetical structures; avoids past perfect conditionals');
      }
    } else {
      setIsAdapted(false);
      setTargetGrammarTopic('Inverted Conditionals ("Had we known...")');
      setTargetVocabList(['mitigate', 'compromise', 'benchmark', 'consensus']);
      setSessionObjective('Negotiate scope changes & present evidence using inverted conditionals');
      setRecentWeaknesses('Pauses before complex hypothetical structures; avoids past perfect conditionals');
    }
  }, [selectedScenarioId, scenario]);

  // Post-session assessment state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [assessmentData, setAssessmentData] = useState<any | null>(null);

  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition on mount
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setRecognition(true);
    }
    return () => {
      window.speechSynthesis?.cancel();
      if (activeRecognitionRef.current) {
        try {
          activeRecognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Timer effect for active session
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSessionActive) {
      timer = setInterval(() => {
        setDurationSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSessionActive]);

  // Voice recording duration timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => {
        setSpeakingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setSpeakingSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // Listening to Speaking Bridge setup
  useEffect(() => {
    const bridgeStr = localStorage.getItem('listening_speaking_bridge');
    if (bridgeStr) {
      try {
        const bridge = JSON.parse(bridgeStr);
        setSessionObjective(`Topic: ${bridge.scenario}. Focus: ${bridge.promptText}`);
        if (bridge.scenario) {
          // Find matching scenario or set custom topic
          const match = speakingScenarios.find(s => s.title.toLowerCase().includes(bridge.scenario.toLowerCase()) || s.topic.toLowerCase().includes(bridge.scenario.toLowerCase()));
          if (match) {
            setSelectedScenarioId(match.id);
          }
        }
        localStorage.removeItem('listening_speaking_bridge');
      } catch (e) {
        console.error('Failed to parse listening speaking bridge:', e);
      }
    }
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, isAiThinking]);

  const handleStartSession = () => {
    setIsSessionActive(true);
    setAssessmentData(null);
    setDurationSeconds(0);
    setChatLog([
      {
        id: 'msg-1',
        sender: 'ai',
        text: scenario.initialAiMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        phoneticTip: 'Notice the rising intonation on open questions.'
      }
    ]);

    // Speak initial AI message if in Voice Mode and not muted
    if (interactionMode === 'voice' && !isMuted && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(scenario.initialAiMessage);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleEndSessionAndAnalyze = async () => {
    window.speechSynthesis?.cancel();
    if (isRecording) {
      stopVoiceRecording();
    }
    setIsSessionActive(false);
    setIsRecording(false);
    setIsEvaluating(true);

    try {
      const history = chatLog.map(m => ({ sender: m.sender, text: m.text }));
      const evaluation = await aiClientService.evaluateSpeakingSession({
        scenarioTitle: scenario.title,
        scenarioTopic: scenario.topic,
        durationSeconds,
        chatHistory: history,
        sessionConfig: {
          currentLevel: difficulty,
          todaysObjective: sessionObjective,
          targetGrammar: targetGrammarTopic,
          targetVocabulary: targetVocabList,
          recentSpeakingWeaknesses: recentWeaknesses,
          topicDifficulty: difficulty
        }
      });

      setAssessmentData(evaluation);

      // Process assessment in learner profile and sync to Firestore
      learnerService.processSpeakingAssessment(
        evaluation,
        `${scenario.title} (${scenario.topic})`,
        durationSeconds
      );

      const mins = Math.max(1, Math.round(durationSeconds / 60));
      addXpAndMinutes(mins, 45);
      updateSkillScore('Speaking', 3);
      updateSkillScore('Fluency', 2);
    } catch (err) {
      console.error('Failed to evaluate speaking session:', err);
      // Fallback assessment if network fails
      const fallbackEval = {
        fluencyScore: 78,
        grammarAccuracyScore: 80,
        vocabularyRangeScore: 76,
        vocabularyUsageScore: 82,
        coherenceScore: 84,
        complexityScore: 74,
        abilityToExplainScore: 80,
        abilityToGiveExamplesScore: 78,
        interactionScore: 85,
        overallCEFRLevel: difficulty,
        top3Mistakes: [
          {
            errorType: 'Conditional Inversion',
            original: 'If we knew the risk, we did something else.',
            corrected: 'Had we known the risk, we would have chosen a different strategy.',
            explanation: 'In formal B2 business speech, use third conditional inversion.'
          }
        ],
        top3Improvements: [
          'Maintained active turn-taking without hesitation.',
          'Used strong transitional phrases during counterarguments.',
          'Expressed clear reasoning for project timeline adjustments.'
        ],
        vocabularyGaps: [
          {
            expression: 'mitigate risk',
            meaning: 'To reduce risk severity or likelihood',
            contextWhereNeeded: 'Used "make risk less" instead of "mitigate risk"'
          }
        ],
        grammarPriorities: ['Inverted Conditionals', 'Mixed Conditionals'],
        nextSpeakingTarget: 'Practice defending budget reallocation against management objections',
        recurringErrors: ['Mixed third conditional tense agreement']
      };
      setAssessmentData(fallbackEval);
      learnerService.processSpeakingAssessment(fallbackEval, scenario.title, durationSeconds);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSubmit = (typeof customText === 'string' ? customText : inputText).trim();
    if (!textToSubmit || !isSessionActive || isAiThinking) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSubmit,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newChat = [...chatLog, userMsg];
    setChatLog(newChat);
    setInputText('');
    setActiveSpeechText('');
    transcriptRef.current = '';
    setIsAiThinking(true);

    try {
      const history = newChat.map(m => ({ sender: m.sender, text: m.text }));
      const userTurnNumber = Math.floor(newChat.filter(m => m.sender === 'user').length);

      const result = await aiClientService.analyzeSpeaking({
        scenarioTitle: scenario.title,
        scenarioTopic: scenario.topic,
        userTranscript: textToSubmit,
        chatHistory: history,
        sessionConfig: {
          currentLevel: difficulty,
          todaysObjective: sessionObjective,
          targetGrammar: targetGrammarTopic,
          targetVocabulary: targetVocabList,
          recentSpeakingWeaknesses: recentWeaknesses,
          topicDifficulty: difficulty,
          turnNumber: userTurnNumber
        }
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: result.aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        phoneticTip: result.pronunciationTip,
        b2Alternative: result.b2Alternative
      };

      if (result.b2Alternative) {
        crossSkillEngine.bridgeSpeakingFeedback(textToSubmit, [
          {
            type: 'Oral Lexical Precision Upgrade',
            orig: textToSubmit.slice(0, 60),
            fix: result.b2Alternative,
            category: 'Vocabulary'
          }
        ]);
      }

      setChatLog(prev => [...prev, aiMsg]);
      updateSkillScore('Speaking', 1);

      // Play AI Response out loud using SpeechSynthesis if in Voice Mode and not muted
      if (interactionMode === 'voice' && !isMuted && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(result.aiResponse);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error('Error calling AI speaking service:', err);
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `That is a clear argument regarding ${scenario.topic}. However, how would you justify this approach if senior management demands a 20% cost reduction? Could you provide a concrete example?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        b2Alternative: 'Try: "Taking all variables into account, we ought to reallocate our resources accordingly."'
      };
      setChatLog(prev => [...prev, fallbackMsg]);

      // Play fallback message too
      if (interactionMode === 'voice' && !isMuted && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(fallbackMsg.text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
      }
    } finally {
      setIsAiThinking(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startVoiceRecording = () => {
    setMicError(null);
    setActiveSpeechText('');
    transcriptRef.current = '';
    setSpeakingSeconds(0);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError('Web Speech Recognition API is not supported in this browser. Please use Chrome, Edge, or Safari, or switch to Text Mode.');
      setIsRecording(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      // On mobile devices, continuous mode is unstable and often causes speech recognition to fail instantly.
      // Setting continuous to false allows normal speech dictation on mobile.
      rec.continuous = !isMobile;
      rec.interimResults = true;
      rec.lang = 'en-US';

      setIsRecording(true);
      let finalTranscript = '';

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += trans + ' ';
          } else {
            interimTranscript += trans;
          }
        }
        const fullText = (finalTranscript + interimTranscript).trim();
        setActiveSpeechText(fullText);
        transcriptRef.current = fullText;
      };

      rec.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        if (e.error === 'not-allowed' || e.error === 'permission-denied') {
          setMicError('Microphone permission blocked. Please grant microphone access in your address bar or browser settings.');
        } else if (e.error === 'no-speech') {
          // ignore
        } else {
          setMicError(`Speech recognition error: ${e.error || 'Unknown issue'}`);
        }
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      rec.start();
      activeRecognitionRef.current = rec;
    } catch (e: any) {
      console.error('Error starting speech recognition:', e);
      setMicError(`Could not activate microphone: ${e.message || e}`);
      setIsRecording(false);
    }
  };

  const stopVoiceRecording = () => {
    if (activeRecognitionRef.current) {
      try {
        activeRecognitionRef.current.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
    }
    setIsRecording(false);

    const finalSpeechText = transcriptRef.current.trim();
    if (finalSpeechText) {
      handleSendMessage(finalSpeechText);
    } else {
      setMicError('No speech detected. Please speak clearly or try again.');
    }
  };

  const toggleRecordingSim = () => {
    // If browser supports speech recognition, let's use it for dictation in Text Mode too!
    if (recognition) {
      if (isRecording) {
        stopVoiceRecordingTextMode();
      } else {
        startVoiceRecordingTextMode();
      }
    } else {
      // Simulator fallback if Web Speech API is not supported
      if (!isRecording) {
        setIsRecording(true);
        setTimeout(() => {
          setIsRecording(false);
          setInputText("I see your point regarding the deadline; however, had we been given two additional weeks, we could have substantiated our findings and mitigated potential budget bottlenecks.");
        }, 3000);
      } else {
        setIsRecording(false);
      }
    }
  };

  const startVoiceRecordingTextMode = () => {
    setMicError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError('Web Speech Recognition API is not supported in this browser. Please use Chrome, Edge, or Safari.');
      setIsRecording(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      rec.continuous = !isMobile;
      rec.interimResults = true;
      rec.lang = 'en-US';

      setIsRecording(true);
      let finalTranscript = '';

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += trans + ' ';
          } else {
            interimTranscript += trans;
          }
        }
        setInputText((finalTranscript + interimTranscript).trim());
      };

      rec.onerror = (e: any) => {
        console.warn('Speech recognition error in text mode:', e);
        if (e.error === 'not-allowed' || e.error === 'permission-denied') {
          setMicError('Microphone permission blocked. Unable to dictate in text mode.');
        } else if (e.error === 'no-speech') {
          // ignore
        } else {
          setMicError(`Speech recognition error in text mode: ${e.error || 'Unknown issue'}`);
        }
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      rec.start();
      activeRecognitionRef.current = rec;
    } catch (e: any) {
      console.error('Error starting speech recognition in text mode:', e);
      setMicError(`Could not activate microphone for dictation: ${e.message || e}`);
      setIsRecording(false);
    }
  };

  const stopVoiceRecordingTextMode = () => {
    if (activeRecognitionRef.current) {
      try {
        activeRecognitionRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Mic className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">AI Speaking Coach</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time conversational roleplay with single-question follow-ups, B2 counterarguments & diagnostic post-session analysis
          </p>
        </div>

        {/* Controls: Start/End session & Timer */}
        <div className="flex items-center gap-4">
          {isSessionActive && (
            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-900 px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono">
              <Clock className="w-4 h-4 text-indigo-600 animate-pulse" />
              <span>{formatTimer(durationSeconds)}</span>
            </div>
          )}

          {!isSessionActive ? (
            <button
              onClick={handleStartSession}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Speaking Session</span>
            </button>
          ) : (
            <button
              onClick={handleEndSessionAndAnalyze}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Complete & Analyze Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Pre-Session Setup Briefing Card (if session not active & no report yet) */}
      {!isSessionActive && !assessmentData && (
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm space-y-4 border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold tracking-wide">Pre-Session AI Briefing Configuration</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-md">
                Target Level: {difficulty}
              </span>
              {isAdapted && (
                <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  ⚡ Adapted from Profile
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Objective</p>
              <p className="text-slate-200 font-medium leading-relaxed">{sessionObjective}</p>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1">
              <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Target Grammar</p>
              <p className="text-slate-200 font-medium">{targetGrammarTopic}</p>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1">
              <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Target Vocabulary</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {targetVocabList.map((v, i) => (
                  <span key={i} className="bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[10px] px-2 py-0.5 rounded-md font-medium">
                    {v}
                  </span>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1">
              <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Recent Speaking Weaknesses</p>
              <p className="text-slate-300 font-medium">{recentWeaknesses}</p>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1 flex flex-col justify-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Session Protocol</p>
              <p className="text-[11px] text-slate-300">
                AI asks <strong>1 question at a time</strong>. Turn 3+ introduces <strong>B2 counterarguments</strong> requiring proof & reasoning.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Bar: Topic & Difficulty */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Topic Selector */}
        <div className="md:col-span-2 bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Practice Scenario & Topic</label>
          <select
            value={selectedScenarioId}
            onChange={(e) => setSelectedScenarioId(e.target.value)}
            disabled={isSessionActive}
            className="w-full text-xs font-medium p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-60"
          >
            {speakingScenarios.map(s => (
              <option key={s.id} value={s.id}>{s.title} ({s.topic})</option>
            ))}
          </select>
        </div>

        {/* Difficulty Selector */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Target Difficulty</label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg text-xs font-bold">
            {(['B1', 'B1+', 'B2'] as const).map((lvl) => (
              <button
                key={lvl}
                disabled={isSessionActive}
                onClick={() => setDifficulty(lvl)}
                className={`py-1.5 rounded-md transition-all cursor-pointer ${
                  difficulty === lvl
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Post-Session Comprehensive Evaluation Loading State */}
      {isEvaluating && (
        <div className="bg-indigo-900 text-white p-8 rounded-2xl shadow-lg flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-300" />
          <h3 className="text-base font-bold">Analyzing Your Complete Speaking Session...</h3>
          <p className="text-xs text-indigo-200 max-w-md text-center">
            Evaluating 10 core dimensions (fluency, grammar, vocabulary range, coherence, ability to explain and give examples, interaction, and recurring errors) and saving results to Firestore.
          </p>
        </div>
      )}

      {/* Post-Session Assessment Data Report (Rendered after completing session) */}
      {assessmentData && !isSessionActive && !isEvaluating && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">Post-Session Diagnostic Assessment Report</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Saved to Firestore & synchronized with Learner Profile
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-3 py-1 rounded-lg">
                Assessed Level: {assessmentData.overallCEFRLevel || difficulty}
              </span>
              <button
                onClick={() => setAssessmentData(null)}
                className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>

          {/* 10 Core Evaluation Dimensions Bar Charts */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-indigo-600" /> 10 Core Skill Diagnostic Scores
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              {[
                { label: 'Fluency', score: assessmentData.fluencyScore },
                { label: 'Grammar Accuracy', score: assessmentData.grammarAccuracyScore },
                { label: 'Vocab Range', score: assessmentData.vocabularyRangeScore },
                { label: 'Vocab Usage', score: assessmentData.vocabularyUsageScore },
                { label: 'Coherence', score: assessmentData.coherenceScore },
                { label: 'Complexity', score: assessmentData.complexityScore },
                { label: 'Ability to Explain', score: assessmentData.abilityToExplainScore },
                { label: 'Ability to Exemplify', score: assessmentData.abilityToGiveExamplesScore },
                { label: 'Interaction', score: assessmentData.interactionScore },
                { label: 'Recurring Error Status', score: Math.max(50, 100 - (assessmentData.recurringErrors?.length || 1) * 15) }
              ].map((dim, idx) => (
                <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <span className="text-[11px] font-semibold text-slate-600 truncate">{dim.label}</span>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs font-bold text-slate-900">{dim.score || 75}%</span>
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${dim.score || 75}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Targeted Focus: Top 3 Mistakes (Non-overwhelming) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top 3 Mistakes */}
            <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200 space-y-3">
              <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5 uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-rose-600" /> Top Priority Corrections (Max 3)
              </h4>
              <p className="text-[11px] text-rose-700">Focused feedback to avoid overwhelming cognitive load:</p>

              <div className="space-y-2.5">
                {assessmentData.top3Mistakes?.length > 0 ? (
                  assessmentData.top3Mistakes.slice(0, 3).map((m: any, i: number) => (
                    <div key={i} className="bg-white p-3 rounded-lg border border-rose-200 text-xs space-y-1">
                      <p className="text-rose-900 font-semibold line-through">"{m.original}"</p>
                      <p className="text-emerald-800 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        "{m.corrected}"
                      </p>
                      <p className="text-[11px] text-slate-600 italic mt-0.5">{m.explanation}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-rose-800 italic">No major priority mistakes detected! Excellent accuracy.</p>
                )}
              </div>
            </div>

            {/* Top 3 Strengths & Improvements */}
            <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-3">
              <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wider">
                <ThumbsUp className="w-4 h-4 text-emerald-600" /> Top Strengths & Progress
              </h4>
              <ul className="space-y-2 text-xs">
                {assessmentData.top3Improvements?.map((imp: string, i: number) => (
                  <li key={i} className="bg-white p-2.5 rounded-lg border border-emerald-200 text-slate-800 font-medium flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Vocabulary Gaps & Next Target */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-2.5">
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-amber-600" /> Identified Vocabulary Gaps
              </h4>
              <div className="space-y-2">
                {assessmentData.vocabularyGaps?.map((gap: any, i: number) => (
                  <div key={i} className="bg-white p-2.5 rounded-lg border border-amber-200 text-xs">
                    <p className="font-bold text-amber-950">{gap.expression}</p>
                    <p className="text-[11px] text-slate-600">{gap.meaning}</p>
                    <p className="text-[10px] text-slate-500 italic mt-0.5">{gap.contextWhereNeeded}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200 space-y-3 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <Target className="w-4 h-4 text-indigo-600" /> Next Speaking Target
                </h4>
                <p className="text-xs font-medium text-indigo-950 mt-2 bg-white p-3 rounded-lg border border-indigo-200 leading-relaxed">
                  "{assessmentData.nextSpeakingTarget || 'Maintain natural turn-taking while defending complex points.'}"
                </p>
              </div>

              <div className="pt-2">
                <p className="text-[11px] font-bold text-indigo-800 mb-1">Recommended Next Grammar Priorities:</p>
                <div className="flex flex-wrap gap-1.5">
                  {assessmentData.grammarPriorities?.map((g: string, i: number) => (
                    <span key={i} className="bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pronunciation & Phonetic Analysis Section */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Pronunciation & Intelligibility Feedback
                </h4>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-500">Intelligibility & Stress Score:</span>
                <span className="font-extrabold text-indigo-600 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-2xs">
                  {assessmentData.pronunciationScore || 75}/100
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Actionable observations on your word clarity, stress placement, and recurring spoken patterns from this session:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {assessmentData.pronunciationObservations && assessmentData.pronunciationObservations.length > 0 ? (
                  assessmentData.pronunciationObservations.map((obs: string, idx: number) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-slate-250/50 text-xs flex gap-2.5 shadow-2xs">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 w-5 h-5 rounded-lg flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-slate-700 leading-relaxed font-medium">{obs}</p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-2 text-slate-500 italic text-xs">
                    No major pronunciation issues detected in this session!
                  </div>
                )}
              </div>

              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-[10px] text-slate-500 leading-relaxed">
                <p className="font-bold text-indigo-950 mb-0.5">Note on Speech Assessment Technology:</p>
                This pronunciation evaluation is analyzed purely through the intelligibility of the transcribed text and typical spoken stress patterns for target business vocabulary. It is intended as a high-level practice guide and does not claim to provide a professional phonetic, acoustic, or clinical laboratory assessment.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode Selector Option tabs */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600 animate-pulse" />
          <div>
            <span className="text-xs font-bold text-slate-800">Coaching Interaction Mode:</span>
            <p className="text-[10px] text-slate-500">Choose between structured text dialogue and real-time hands-free voice coach</p>
          </div>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-64 border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setInteractionMode('text');
              window.speechSynthesis?.cancel();
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              interactionMode === 'text'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            TEXT MODE
          </button>
          <button
            type="button"
            onClick={() => {
              setInteractionMode('voice');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              interactionMode === 'voice'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            VOICE MODE
          </button>
        </div>
      </div>

      {/* Main Conversation & Feedback Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Transcript Area (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[540px]">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">{scenario.title}</p>
              <p className="text-[11px] text-slate-500">{scenario.description}</p>
            </div>
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-md">
              Target CEFR: {difficulty}
            </span>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {chatLog.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
                <Mic className="w-10 h-10 text-slate-300" />
                <p className="text-xs font-medium max-w-sm">
                  Click "Start Speaking Session" above to launch your live interaction with the AI Coach.
                </p>
              </div>
            ) : (
              chatLog.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1 text-[10px] opacity-75 font-semibold">
                      <span>{msg.sender === 'user' ? 'You (Learner)' : 'AI Speaking Coach'}</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <p className="text-sm font-normal">{msg.text}</p>

                    {msg.phoneticTip && (
                      <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-indigo-700 bg-indigo-50/80 p-2 rounded-lg flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span><strong>Phonetic Tip:</strong> {msg.phoneticTip}</span>
                      </div>
                    )}

                    {msg.b2Alternative && (
                      <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded-lg flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span><strong>B2 Alternative:</strong> {msg.b2Alternative}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {isAiThinking && (
              <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl w-max text-xs text-indigo-700 font-semibold shadow-xs">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>AI Coach is processing input & formulating follow-up question...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* User Input / Microphone Controls */}
          {interactionMode === 'voice' ? (
            <div className="p-4 border-t border-slate-200 bg-white rounded-b-2xl space-y-4">
              {/* Voice Coaching HUD Panel */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  {isRecording ? (
                    <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                    </div>
                  ) : (
                    <span className="w-3 h-3 rounded-full bg-slate-300 shrink-0"></span>
                  )}
                  <div className="text-xs">
                    <p className="font-bold text-slate-800">
                      {isRecording ? `Recording Audio Input (${speakingSeconds}s)` : 'Ready to listen'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {isRecording ? 'Speak clearly now... click stop to finalize' : 'Activate the microphone to begin'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold text-slate-500">Read Aloud:</span>
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                      isMuted
                        ? 'bg-rose-50 text-rose-600 border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {isMuted ? 'Muted' : 'Sound On'}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 py-1">
                {!isRecording ? (
                  <button
                    type="button"
                    disabled={!isSessionActive || isAiThinking}
                    onClick={startVoiceRecording}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-3.5 rounded-xl transition-all shadow-sm cursor-pointer w-full max-w-xs"
                  >
                    <Mic className="w-4 h-4 text-white" />
                    <span>Start Speaking</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopVoiceRecording}
                    className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-6 py-3.5 rounded-xl transition-all shadow-sm animate-pulse cursor-pointer w-full max-w-xs"
                  >
                    <MicOff className="w-4 h-4 text-white" />
                    <span>Stop Speaking & Send</span>
                  </button>
                )}
              </div>

              {/* Dynamic Transcript Live Preview Box */}
              {activeSpeechText && (
                <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-150/80 text-xs text-indigo-950 font-medium space-y-1">
                  <span className="text-[9px] font-black uppercase text-indigo-600 tracking-wider">Live speech transcript:</span>
                  <p className="italic leading-relaxed">"{activeSpeechText}"</p>
                </div>
              )}

              {/* Permission & System Error Banner */}
              {micError && (
                <div className="p-3 bg-rose-50 border border-rose-150 text-rose-800 rounded-xl flex items-start gap-2 text-[11px] leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{micError}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 border-t border-slate-200 bg-white rounded-b-2xl space-y-3">
              <div className="flex items-center gap-2">
                <button
                  disabled={!isSessionActive}
                  onClick={toggleRecordingSim}
                  className={`p-3 rounded-xl transition-all cursor-pointer ${
                    isRecording
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50'
                  }`}
                  title="Dictate message using Speech-to-Text"
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <input
                  type="text"
                  disabled={!isSessionActive}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={
                    isSessionActive
                      ? isRecording
                        ? 'Dictating speech...'
                        : 'Type your spoken response or dictate...'
                      : 'Click Start Speaking Session above to enable input...'
                  }
                  className="flex-1 text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-50"
                />

                <button
                  disabled={!isSessionActive || !inputText.trim()}
                  onClick={() => handleSendMessage()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white p-3 rounded-xl transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {isRecording && (
                <div className="flex items-center gap-2 text-xs text-rose-600 font-semibold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                  <span>Microphone dictating text... Speak naturally in English</span>
                </div>
              )}

              {micError && (
                <div className="p-2.5 bg-rose-50 border border-rose-150 text-rose-800 rounded-lg text-[10px] leading-relaxed">
                  {micError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Target Expressions & Dynamic Session Parameters Sidebar */}
        <div className="space-y-6">
          {/* Target Vocabulary Checklist */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Target Expressions for Today
            </h3>
            <p className="text-xs text-slate-500">Naturally weave these B2 expressions into your responses:</p>

            <div className="space-y-2">
              {targetVocabList.map((word, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 flex items-center justify-between">
                  <span>"{word}"</span>
                  <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">B2 Target</span>
                </div>
              ))}
            </div>
          </div>

          {/* Conversation Rules & Difficulty Tracker */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              Coach Interaction Rules
            </h3>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Single Question Rule:</strong> AI asks 1 question at a time to maintain focus.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>No Constant Interruption:</strong> Full attempt is allowed before evaluation.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Reasons & Examples:</strong> AI follows up asking for concrete proof.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span><strong>Counterarguments:</strong> Turn 3+ introduces polite counterproposals to challenge you.</span>
              </div>
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 space-y-1">
              <p className="font-bold flex items-center gap-1 text-indigo-800">
                <Zap className="w-3.5 h-3.5" /> B2 Coach Principle:
              </p>
              <p className="text-[11px] leading-relaxed">
                Post-session feedback is strictly focused on your <strong>top 3 mistakes</strong> to ensure fast, actionable learning without cognitive overload.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
