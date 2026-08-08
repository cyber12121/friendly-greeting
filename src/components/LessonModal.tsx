import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle, Volume2, Sparkles, ArrowRight, Award, Mic, Play } from 'lucide-react';

export const LessonModal: React.FC = () => {
  const { isLessonModalOpen, closeLessonModal, addXpAndMinutes, updateSkillScore } = useApp();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [recordedSentence, setRecordedSentence] = useState('');
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isLessonModalOpen) return null;

  const handleSimulateAudio = () => {
    setIsPlayingAudio(true);
    setTimeout(() => setIsPlayingAudio(false), 2000);
  };

  const handleCompleteLesson = () => {
    addXpAndMinutes(15, 60);
    updateSkillScore('Speaking', 2);
    updateSkillScore('Vocabulary', 2);
    updateSkillScore('Grammar', 2);
    setIsCompleted(true);
  };

  const resetModal = () => {
    setCurrentStep(1);
    setRecordedSentence('');
    setSelectedQuizOption(null);
    setIsCompleted(false);
    closeLessonModal();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs">
              B2
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Day 1 Guided Micro-Lesson</h3>
              <p className="text-xs text-slate-400">Targeting B2 Precision & Natural Expression</p>
            </div>
          </div>
          <button
            onClick={resetModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content body */}
        <div className="p-6 overflow-y-auto flex-1">
          {!isCompleted ? (
            <>
              {/* Step indicator */}
              <div className="flex items-center justify-between mb-6">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      step === currentStep
                        ? 'bg-indigo-600 text-white shadow-sm ring-4 ring-indigo-100'
                        : step < currentStep
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
                    </div>
                    {step < 4 && (
                      <div className={`h-1 flex-1 mx-2 rounded ${
                        step < currentStep ? 'bg-emerald-500' : 'bg-slate-100'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Vocabulary */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="inline-block px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                    Step 1: B2 Vocabulary Upgrade
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">Word: <span className="text-indigo-600">articulate</span></h4>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-slate-500">/ɑːrˈtɪk.jə.lət/</span>
                    <button
                      onClick={handleSimulateAudio}
                      className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce text-indigo-600' : ''}`} />
                      <span>{isPlayingAudio ? 'Playing Pronunciation...' : 'Listen Audio'}</span>
                    </button>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-sm text-slate-700">
                    <p><strong className="text-slate-900">Definition:</strong> Expressing ideas fluently and coherently in speech or writing.</p>
                    <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                      <p className="text-xs text-amber-700 font-semibold mb-1">B1 phrasing vs B2 phrasing:</p>
                      <p className="text-xs text-slate-500 line-through">B1: "He speaks very clearly in meetings."</p>
                      <p className="text-xs text-indigo-900 font-semibold mt-0.5">B2: "He delivered an articulate presentation in meetings."</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Grammar Concept */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="inline-block px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold">
                    Step 2: Grammar Structure
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">Formal Conditional Inversion</h4>
                  <p className="text-sm text-slate-600">
                    To make your English sound more polished and authoritative at B2 level, replace standard "If I had..." with inverted "Had I...".
                  </p>

                  <div className="space-y-3">
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <p className="text-xs text-slate-500">Standard Conditional (B1):</p>
                      <p className="text-sm font-medium text-slate-800">"If I had known about the delay, I would have notified you."</p>
                    </div>
                    <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl">
                      <p className="text-xs text-indigo-600 font-bold">B2 Inverted Structure:</p>
                      <p className="text-sm font-semibold text-indigo-950">"Had I known about the delay, I would have notified you immediately."</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Speaking Practice */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="inline-block px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold">
                    Step 3: Active Production
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">Speak or Type Your B2 Answer</h4>
                  <p className="text-sm text-slate-600">
                    Prompt: Express polite disagreement regarding a project deadline using <strong>"Had I..."</strong> or <strong>"articulate"</strong>.
                  </p>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSimulateAudio}
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 text-xs font-semibold cursor-pointer"
                      >
                        <Mic className="w-4 h-4" />
                        <span>{isPlayingAudio ? 'Listening...' : 'Simulate Recording'}</span>
                      </button>
                      <span className="text-xs text-slate-500">Or type below:</span>
                    </div>

                    <textarea
                      value={recordedSentence}
                      onChange={(e) => setRecordedSentence(e.target.value)}
                      placeholder="e.g., Had I been informed sooner, I would have articulated a clearer plan..."
                      rows={3}
                      className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Quick Quiz */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="inline-block px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                    Step 4: Mastery Check
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Which sentence demonstrates B2 conditional inversion?</h4>

                  <div className="space-y-2">
                    {[
                      'If I study hard, I pass my test.',
                      'Had I known about the changes, I would have adjusted the timeline.',
                      'I had known the changes so I adjusted the timeline.',
                      'Should I know the changes, I adjust it.'
                    ].map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedQuizOption(idx)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          selectedQuizOption === idx
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {selectedQuizOption === 1 && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Correct! "Had I known..." is the classic B2 inverted past conditional.</span>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Completed State */
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Lesson Complete!</h3>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">
                Great job! You completed today's core micro-lesson and earned <strong>+15 study minutes</strong> and <strong>+60 XP</strong>.
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-w-sm mx-auto space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Speaking Score:</span>
                  <span className="font-bold text-indigo-600">+2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vocabulary Score:</span>
                  <span className="font-bold text-indigo-600">+2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Grammar Score:</span>
                  <span className="font-bold text-indigo-600">+2%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          {!isCompleted ? (
            <>
              <button
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
                className="px-4 py-2 text-xs font-semibold text-slate-600 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleCompleteLesson}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold text-xs shadow-sm transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Finish Lesson</span>
                </button>
              )}
            </>
          ) : (
            <button
              onClick={resetModal}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-3 rounded-xl transition-colors cursor-pointer"
            >
              Return to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
