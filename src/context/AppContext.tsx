import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import '../lib/ssr-storage';
import { pathToTab, tabToPath } from '../lib/tabs';
import {
  LearnerProfile,
  SkillProgress,
  RecommendedActivity,
  VocabWord,
  ComprehensiveLearnerProfile,
  UserProfile,
  CoreSkillKey,
  GrammarProfileItem,
  VocabularyProfileItem,
  ErrorLogItem,
  SessionHistoryItem
} from '../types';
import {
  initialProfile,
  initialSkillProgress,
  recommendedActivities as defaultActivities,
  vocabWords as defaultVocab
} from '../data/mockData';
import { learnerService } from '../services/learnerService';
import { learnerProfileEngine, EvaluatedLearnerProfileModel } from '../services/learnerProfileEngine';

interface AppContextType {
  // Centralized Core Learner Model
  comprehensiveProfile: ComprehensiveLearnerProfile;
  evaluatedProfile: EvaluatedLearnerProfileModel;
  updateLearnerUserProfile: (updates: Partial<UserProfile>) => void;
  updateCoreSkill: (
    skillKey: CoreSkillKey,
    scoreDeltaOrValue: number,
    isAbsoluteScore?: boolean,
    evidence?: string
  ) => void;
  saveGrammarTopic: (topic: GrammarProfileItem) => void;
  saveVocabularyItem: (vocab: VocabularyProfileItem) => void;
  logLearnerError: (error: Omit<ErrorLogItem, 'id' | 'firstDetected' | 'lastDetected'>) => void;
  recordLearnerSession: (session: Omit<SessionHistoryItem, 'id' | 'date'>) => void;
  getAiContextPrompt: () => string;

  // Legacy & UI helper state
  profile: LearnerProfile;
  updateProfile: (updated: Partial<LearnerProfile>) => void;
  skills: SkillProgress[];
  updateSkillScore: (skillName: string, delta: number) => void;
  activities: RecommendedActivity[];
  toggleActivityCompletion: (id: string) => void;
  vocabList: VocabWord[];
  updateVocabStatus: (id: string, status: 'New' | 'Learning' | 'Mastered') => void;
  addXpAndMinutes: (minutes: number, xp: number) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  resetAllProgress: () => void;
  isLessonModalOpen: boolean;
  openLessonModal: () => void;
  closeLessonModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Comprehensive Learner Data Model State initialized from LearnerService
  const [comprehensiveProfile, setComprehensiveProfile] = useState<ComprehensiveLearnerProfile>(
    () => learnerService.getProfile()
  );

  const evaluatedProfile = learnerProfileEngine.evaluate(comprehensiveProfile);

  // Legacy state with localStorage persistence
  const [profile, setProfile] = useState<LearnerProfile>(() => {
    const saved = localStorage.getItem('b2_coach_profile');
    return saved ? JSON.parse(saved) : initialProfile;
  });

  const [skills, setSkills] = useState<SkillProgress[]>(() => {
    const saved = localStorage.getItem('b2_coach_skills');
    return saved ? JSON.parse(saved) : initialSkillProgress;
  });

  const [activities, setActivities] = useState<RecommendedActivity[]>(() => {
    const saved = localStorage.getItem('b2_coach_activities');
    return saved ? JSON.parse(saved) : defaultActivities;
  });

  const [vocabList, setVocabList] = useState<VocabWord[]>(() => {
    const saved = localStorage.getItem('b2_coach_vocab');
    return saved ? JSON.parse(saved) : defaultVocab;
  });

  // `activeTab` is derived from the current URL so every page has its own route.
  const pathname = useRouterState({ select: (state: { location: { pathname: string } }) => state.location.pathname });
  const activeTab = pathToTab(pathname);
  const navigate = useNavigate();
  const setActiveTab = (tab: string) => {
    void navigate({ to: tabToPath(tab) });
  };

  const [isLessonModalOpen, setIsLessonModalOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('b2_coach_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('b2_coach_skills', JSON.stringify(skills));
  }, [skills]);

  useEffect(() => {
    localStorage.setItem('b2_coach_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('b2_coach_vocab', JSON.stringify(vocabList));
  }, [vocabList]);

  // Methods for Core Learner Data Model
  const updateLearnerUserProfile = (updates: Partial<UserProfile>) => {
    const updated = learnerService.updateUserProfile(updates);
    setComprehensiveProfile(updated);
  };

  const updateCoreSkill = (
    skillKey: CoreSkillKey,
    scoreDeltaOrValue: number,
    isAbsoluteScore: boolean = false,
    evidence?: string
  ) => {
    const updated = learnerService.updateSkillScore(
      skillKey,
      scoreDeltaOrValue,
      isAbsoluteScore,
      evidence
    );
    setComprehensiveProfile(updated);
  };

  const saveGrammarTopic = (topic: GrammarProfileItem) => {
    const updated = learnerService.saveGrammarTopic(topic);
    setComprehensiveProfile(updated);
  };

  const saveVocabularyItem = (vocab: VocabularyProfileItem) => {
    const updated = learnerService.saveVocabularyItem(vocab);
    setComprehensiveProfile(updated);
  };

  const logLearnerError = (
    error: Omit<ErrorLogItem, 'id' | 'firstDetected' | 'lastDetected'>
  ) => {
    const updated = learnerService.logError(error);
    setComprehensiveProfile(updated);
  };

  const recordLearnerSession = (session: Omit<SessionHistoryItem, 'id' | 'date'>) => {
    const updated = learnerService.recordSession(session);
    setComprehensiveProfile(updated);
  };

  const getAiContextPrompt = () => {
    return learnerService.buildAiContextPrompt();
  };

  // Legacy helper methods
  const updateProfile = (updated: Partial<LearnerProfile>) => {
    setProfile(prev => ({ ...prev, ...updated }));
  };

  const updateSkillScore = (skillName: string, delta: number) => {
    setSkills(prev =>
      prev.map(s => {
        if (s.skill === skillName) {
          const newScore = Math.min(100, Math.max(0, s.currentScore + delta));
          let newStatus = s.status;
          if (newScore >= s.b2TargetScore) newStatus = 'Mastered';
          else if (newScore >= 70) newStatus = 'Near Target';
          else if (newScore >= 55) newStatus = 'Improving';
          else newStatus = 'Needs Work';

          return {
            ...s,
            currentScore: newScore,
            recentChange: s.recentChange + (delta > 0 ? 1 : -1),
            status: newStatus
          };
        }
        return s;
      })
    );

    // Sync back to core learner service if skill name matches
    const skillKeyMap: Record<string, CoreSkillKey> = {
      Speaking: 'speaking',
      Listening: 'listening',
      Grammar: 'grammar',
      Vocabulary: 'vocabulary',
      Writing: 'writing',
      Pronunciation: 'pronunciation'
    };
    if (skillKeyMap[skillName]) {
      updateCoreSkill(skillKeyMap[skillName], delta, false);
    }
  };

  const toggleActivityCompletion = (id: string) => {
    setActivities(prev =>
      prev.map(act => {
        if (act.id === id) {
          const isNowCompleted = !act.completed;
          if (isNowCompleted) {
            addXpAndMinutes(act.durationMinutes, act.xpReward);
          }
          return { ...act, completed: isNowCompleted };
        }
        return act;
      })
    );
  };

  const updateVocabStatus = (id: string, status: 'New' | 'Learning' | 'Mastered') => {
    setVocabList(prev =>
      prev.map(v => (v.id === id ? { ...v, masteryStatus: status } : v))
    );
    if (status === 'Mastered') {
      updateSkillScore('Vocabulary', 2);
    }
  };

  const addXpAndMinutes = (minutes: number, _xp: number) => {
    setProfile(prev => ({
      ...prev,
      minutesCompletedToday: prev.minutesCompletedToday + minutes
    }));
    updateSkillScore('Speaking', 1);
  };

  const resetAllProgress = () => {
    localStorage.removeItem('b2_coach_profile');
    localStorage.removeItem('b2_coach_skills');
    localStorage.removeItem('b2_coach_activities');
    localStorage.removeItem('b2_coach_vocab');
    localStorage.removeItem('b2_coach_comprehensive_learner_profile');

    const freshModel = learnerService.resetToDefault();
    setComprehensiveProfile(freshModel);
    setProfile(initialProfile);
    setSkills(initialSkillProgress);
    setActivities(defaultActivities);
    setVocabList(defaultVocab);
  };

  const openLessonModal = () => setIsLessonModalOpen(true);
  const closeLessonModal = () => setIsLessonModalOpen(false);

  return (
    <AppContext.Provider
      value={{
        comprehensiveProfile,
        evaluatedProfile,
        updateLearnerUserProfile,
        updateCoreSkill,
        saveGrammarTopic,
        saveVocabularyItem,
        logLearnerError,
        recordLearnerSession,
        getAiContextPrompt,
        profile,
        updateProfile,
        skills,
        updateSkillScore,
        activities,
        toggleActivityCompletion,
        vocabList,
        updateVocabStatus,
        addXpAndMinutes,
        activeTab,
        setActiveTab,
        resetAllProgress,
        isLessonModalOpen,
        openLessonModal,
        closeLessonModal
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
