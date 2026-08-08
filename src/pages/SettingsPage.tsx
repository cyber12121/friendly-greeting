import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CEFRLevel, SkillType } from '../types';
import {
  Settings,
  User,
  Target,
  Clock,
  Sparkles,
  Save,
  RotateCcw,
  Check,
  ShieldAlert
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { profile, updateProfile, resetAllProgress } = useApp();

  const [name, setName] = useState(profile.name);
  const [currentLevel, setCurrentLevel] = useState<CEFRLevel>(profile.currentLevel);
  const [targetLevel, setTargetLevel] = useState<CEFRLevel>(profile.targetLevel);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(profile.dailyGoalMinutes);
  const [totalProgramDays, setTotalProgramDays] = useState(profile.totalProgramDays);
  const [strictness, setStrictness] = useState(profile.correctionStrictness);
  const [nativeAssistance, setNativeAssistance] = useState(profile.nativeLanguageAssistance);
  const [preferredFocusArea, setPreferredFocusArea] = useState<SkillType>(profile.preferredFocusArea);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      currentLevel,
      targetLevel,
      dailyGoalMinutes,
      totalProgramDays,
      correctionStrictness: strictness,
      nativeLanguageAssistance: nativeAssistance,
      preferredFocusArea
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
              <Settings className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Learner Settings & Preferences</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">Customize your learning pace, CEFR target goals, and AI feedback strictness</p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-xs font-bold animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Settings Saved!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" /> Personal Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Learner Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Email Address</label>
              <input
                type="email"
                disabled
                value={profile.email}
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* CEFR Level & Program Duration */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" /> CEFR Target & Timeline
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Current CEFR Level</label>
              <select
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value as CEFRLevel)}
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="B1">B1 (Threshold)</option>
                <option value="B1+">B1+ (Strong Intermediate)</option>
                <option value="B2">B2 (Vantage / Independent)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Target Level Goal</label>
              <select
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value as CEFRLevel)}
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="B2">B2 (Independent Mastery Goal)</option>
                <option value="B2+">B2+ (High Competency)</option>
                <option value="C1">C1 (Effective Operational Proficiency)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Daily Study Target (Minutes)</label>
              <select
                value={dailyGoalMinutes}
                onChange={(e) => setDailyGoalMinutes(Number(e.target.value))}
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value={15}>15 minutes / day (Light)</option>
                <option value={30}>30 minutes / day (Recommended)</option>
                <option value={45}>45 minutes / day (Intensive)</option>
                <option value={60}>60 minutes / day (Accelerated)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Program Duration</label>
              <select
                value={totalProgramDays}
                onChange={(e) => setTotalProgramDays(Number(e.target.value))}
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value={30}>30 Days Blitz</option>
                <option value={60}>60 Days Guided</option>
                <option value={90}>90 Days Mastery (Standard)</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI Coaching Preferences */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" /> AI Feedback Preferences
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Correction Strictness</label>
              <select
                value={strictness}
                onChange={(e) => setStrictness(e.target.value as any)}
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Gentle">Gentle (Focus on encouragement)</option>
                <option value="Balanced">Balanced (Correct key errors & offer B2 tips)</option>
                <option value="Strict B2 Academic">Strict B2 Academic (Flag all register & word choice flaws)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Primary Focus Skill</label>
              <select
                value={preferredFocusArea}
                onChange={(e) => setPreferredFocusArea(e.target.value as SkillType)}
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Speaking">Speaking (Spontaneous Fluency)</option>
                <option value="Writing">Writing (Essay & Email Coherence)</option>
                <option value="Grammar">Grammar (Inversion & Conditionals)</option>
                <option value="Vocabulary">Vocabulary (B2 Collocations)</option>
                <option value="Listening">Listening (Fast Speeches & Accents)</option>
                <option value="Pronunciation">Pronunciation (Word Stress)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={nativeAssistance}
                onChange={(e) => setNativeAssistance(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-xs font-medium text-slate-700">
                Show native language translations for complex B2 vocabulary tooltips
              </span>
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={() => setShowResetConfirm(!showResetConfirm)}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset All Progress Data</span>
          </button>

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>

        {/* Reset Confirmation Drawer */}
        {showResetConfirm && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
              <ShieldAlert className="w-4 h-4" />
              <span>Are you sure you want to reset all program progress?</span>
            </div>
            <p className="text-xs text-rose-700">
              This will clear completed activities, vocabulary mastery statuses, and reset scores to initial B1+ defaults.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  resetAllProgress();
                  setShowResetConfirm(false);
                }}
                className="bg-rose-600 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer"
              >
                Yes, Reset Everything
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="bg-slate-200 text-slate-800 font-bold text-xs px-4 py-2 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
