import { learnerService } from './learnerService';
import { CEFRLevel } from '../types';

export interface LearnerContextPayload {
  currentCEFRLevel: CEFRLevel;
  targetCEFRLevel: CEFRLevel;
  programDay?: number;
  availableStudyTimeMinutes?: number;
  weakestSkills?: string[];
  recentErrorsSummary?: string[];
  skillScores?: Record<string, number>;
  recentPerformance?: any[];
  recurringErrors?: any[];
  grammarNeedingReview?: any[];
  vocabularyNeedingReview?: any[];
  listeningDifficulty?: string;
  speakingPerformance?: string;
  writingPerformance?: string;
  previousActivities?: any[];
  spacedReviewSchedule?: any[];
  correctionStrictness?: string;
  preferredFocusArea?: string;
}

// Helper to construct relevant context from current learner profile without sending unnecessary database fields
export function getLearnerContext(): LearnerContextPayload {
  const profile = learnerService.getProfile();

  // Find weakest skills
  const skillEntries = Object.entries(profile.skillScores);
  const sortedSkills = skillEntries.sort((a, b) => a[1].score - b[1].score);
  const weakestSkills = sortedSkills.slice(0, 2).map(([key]) => key);

  // Extract simplified skill scores map
  const skillScoresMap: Record<string, number> = {};
  for (const [k, v] of Object.entries(profile.skillScores)) {
    skillScoresMap[k] = v.score;
  }

  // Extract recent active error messages
  const activeErrors = profile.errorLog.filter((err) => err.status === 'active');
  const recentErrorsSummary = activeErrors
    .slice(0, 5)
    .map((err) => `${err.errorType}: "${err.originalSentence}" -> "${err.correctedSentence}"`);

  // Extract items needing review
  const grammarNeedingReview = profile.grammarProfile
    .filter((g) => g.status !== 'mastered')
    .map((g) => ({ topic: g.topic, cefrLevel: g.cefrLevel, accuracy: g.accuracy, status: g.status }));

  const vocabularyNeedingReview = profile.vocabularyProfile
    .filter((v) => v.status !== 'mastered' || v.speakingUsageScore < 60)
    .map((v) => ({ expression: v.expression, meaning: v.meaning, status: v.status, speakScore: v.speakingUsageScore }));

  const recentPerformance = profile.sessionHistory.slice(0, 5).map((s) => ({
    activityType: s.activityType,
    topic: s.topic,
    score: s.score,
    duration: s.duration
  }));

  const listeningScore = profile.skillScores.listening?.score || 75;
  const listeningDifficulty = listeningScore > 80 ? 'B2+' : listeningScore > 65 ? 'B2' : 'B1+';

  const speakingScore = profile.skillScores.speaking?.score || 65;
  const speakingPerformance = speakingScore < 70 ? 'Weak / Needs Fluency & Duration' : 'Satisfactory B2';

  const writingScore = profile.skillScores.writing?.score || 65;
  const writingPerformance = writingScore < 70 ? 'Needs Grammar Precision & Vocabulary Variety' : 'Satisfactory B2';

  const spacedReviewSchedule = profile.grammarProfile
    .filter((g) => g.nextReviewDate)
    .map((g) => ({ topic: g.topic, reviewDate: g.nextReviewDate }));

  return {
    currentCEFRLevel: profile.userProfile.currentCEFRLevel,
    targetCEFRLevel: profile.userProfile.targetCEFRLevel,
    programDay: profile.userProfile.currentProgramDay,
    availableStudyTimeMinutes: profile.userProfile.dailyStudyGoalMinutes || 45,
    weakestSkills,
    recentErrorsSummary,
    skillScores: skillScoresMap,
    recentPerformance,
    recurringErrors: activeErrors.map((e) => ({ type: e.errorType, orig: e.originalSentence, fix: e.correctedSentence })),
    grammarNeedingReview,
    vocabularyNeedingReview,
    listeningDifficulty,
    speakingPerformance,
    writingPerformance,
    previousActivities: profile.sessionHistory.slice(0, 3).map((s) => s.topic),
    spacedReviewSchedule,
    correctionStrictness: 'Balanced B2 Academic',
    preferredFocusArea: weakestSkills[0] || 'Grammar'
  };
}

async function postToAI<T>(endpoint: string, body: Record<string, any>): Promise<T> {
  const res = await fetch(`/api/ai/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Server error (${res.status}) on ${endpoint}`);
  }

  return res.json() as Promise<T>;
}

export const aiClientService = {
  // 1. generateDailyPlan
  async generateDailyPlan(customContext?: Partial<LearnerContextPayload>) {
    const context = { ...getLearnerContext(), ...customContext };
    return postToAI<any>('daily-plan', { context });
  },

  // 2. analyzeSpeaking
  async analyzeSpeaking(payload: {
    scenarioTitle: string;
    scenarioTopic: string;
    userTranscript: string;
    chatHistory?: { sender: string; text: string }[];
    sessionConfig?: {
      currentLevel?: string;
      todaysObjective?: string;
      targetGrammar?: string;
      targetVocabulary?: string[];
      recentSpeakingWeaknesses?: string;
      topicDifficulty?: string;
      turnNumber?: number;
    };
  }) {
    const context = getLearnerContext();
    return postToAI<any>('analyze-speaking', { context, payload });
  },

  // 2b. evaluateSpeakingSession
  async evaluateSpeakingSession(payload: {
    scenarioTitle: string;
    scenarioTopic: string;
    durationSeconds: number;
    chatHistory: { sender: string; text: string }[];
    sessionConfig?: {
      currentLevel?: string;
      todaysObjective?: string;
      targetGrammar?: string;
      targetVocabulary?: string[];
      recentSpeakingWeaknesses?: string;
      topicDifficulty?: string;
    };
  }) {
    const context = getLearnerContext();
    return postToAI<any>('evaluate-speaking-session', { context, payload });
  },

  // 3. generateGrammarLesson
  async generateGrammarLesson(topicName: string) {
    const context = getLearnerContext();
    return postToAI<any>('grammar-lesson', { context, topicName });
  },

  // 4. generateGrammarExercise
  async generateGrammarExercise(topicName: string, count: number = 3) {
    const context = getLearnerContext();
    return postToAI<any>('grammar-exercise', { context, topicName, count });
  },

  // 4b. evaluateGrammarProduction
  async evaluateGrammarProduction(payload: {
    topicName: string;
    sentenceProductionText: string;
    speakingProductionText: string;
    writingProductionText: string;
    controlledScore: number;
  }) {
    const context = getLearnerContext();
    return postToAI<any>('evaluate-grammar-production', { context, payload });
  },

  // 5. generateVocabularyLesson
  async generateVocabularyLesson(target: string) {
    const context = getLearnerContext();
    return postToAI<any>('vocab-lesson', { context, target });
  },

  // 6. analyzeVocabularyUsage
  async analyzeVocabularyUsage(targetWord: string, userSentence: string) {
    const context = getLearnerContext();
    return postToAI<any>('analyze-vocab', { context, targetWord, userSentence });
  },

  // 6b. evaluateVocabProduction
  async evaluateVocabProduction(payload: {
    expression: string;
    recognitionScore: number;
    recallScore: number;
    speakingProductionText: string;
    writingProductionText: string;
  }) {
    const context = getLearnerContext();
    return postToAI<any>('evaluate-vocab-production', { context, payload });
  },

  // 7. analyzeWriting
  async analyzeWriting(payload: { promptTitle: string; promptType: string; userSubmission: string }) {
    const context = getLearnerContext();
    return postToAI<any>('analyze-writing', { context, payload });
  },

  // 7b. generateWritingTask
  async generateWritingTask(payload: {
    cefrLevel?: string;
    grammarTargets?: string[];
    vocabularyTargets?: string[];
    recentSpeakingTopics?: string[];
    writingWeaknesses?: string[];
  }) {
    const context = getLearnerContext();
    return postToAI<any>('generate-writing-task', { context, payload });
  },

  // 7c. analyzeWritingDraft
  async analyzeWritingDraft(payload: {
    taskTitle: string;
    taskType: string;
    promptText: string;
    targetGrammar: string[];
    targetVocabulary: string[];
    draftText: string;
  }) {
    const context = getLearnerContext();
    return postToAI<any>('analyze-writing-draft', { context, payload });
  },

  // 7d. analyzeWritingRevision
  async analyzeWritingRevision(payload: {
    taskTitle: string;
    initialDraft: string;
    revisionText: string;
    draftFeedback: any;
  }) {
    const context = getLearnerContext();
    return postToAI<any>('analyze-writing-revision', { context, payload });
  },

  // 8. generateListeningQuestions
  async generateListeningQuestions(topic: string, difficulty: string = 'B2') {
    const context = getLearnerContext();
    return postToAI<any>('listening-questions', { context, topic, difficulty });
  },

  // 9. assessCEFR
  async assessCEFR() {
    const context = getLearnerContext();
    const profile = learnerService.getProfile();

    // Pass compact performance summary
    const performanceSummary = {
      skillScores: profile.skillScores,
      activeErrorsCount: profile.errorLog.filter((e) => e.status === 'active').length,
      totalSessionsCompleted: profile.sessionHistory.length,
      recentSessions: profile.sessionHistory.slice(0, 5)
    };

    return postToAI<any>('assess-cefr', { context, performanceSummary });
  },

  // 10. updateLearnerProfile
  async updateLearnerProfile(recentSessionData: Record<string, any>) {
    const context = getLearnerContext();
    return postToAI<any>('update-profile', { context, recentSessionData });
  },

  // 11. generateWeeklyReview
  async generateWeeklyReview() {
    const context = getLearnerContext();
    const profile = learnerService.getProfile();

    const weeklyActivityLog = {
      totalSessionsThisWeek: profile.sessionHistory.length,
      recentSessions: profile.sessionHistory.slice(0, 7),
      activeErrors: profile.errorLog.map((e) => ({ type: e.errorType, status: e.status }))
    };

    return postToAI<any>('weekly-review', { context, weeklyActivityLog });
  },

  // 12. evaluateB2Assessment
  async evaluateB2Assessment(payload: {
    grammarAnswers: any[];
    vocabAnswers: any[];
    listeningAnswers: any[];
    writingText: string;
    speakingTranscripts: {
      spontaneous: string;
      abstract: string;
      storytelling: string;
      debate: string;
    };
  }) {
    const context = getLearnerContext();
    return postToAI<any>('evaluate-b2-assessment', { context, payload });
  }
};
