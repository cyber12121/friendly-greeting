export type CEFRLevel = 'B1' | 'B1+' | 'B2' | 'B2+' | 'C1';

export type SkillType = 'Speaking' | 'Listening' | 'Grammar' | 'Vocabulary' | 'Writing' | 'Pronunciation' | 'Fluency' | 'Communication';

// ==========================================
// CORE LEARNER DATA MODEL TYPES
// ==========================================

export interface UserProfile {
  userId: string;
  name: string;
  currentCEFRLevel: CEFRLevel;
  targetCEFRLevel: CEFRLevel;
  currentProgramDay: number;
  programStartDate: string; // ISO date string e.g. '2026-07-10'
  programDuration: number; // e.g. 90 days
  dailyStudyGoalMinutes: number;
}

export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type SkillTrend = 'improving' | 'stable' | 'declining';

export interface SkillScoreDetail {
  score: number; // 0 to 100
  confidenceLevel: ConfidenceLevel;
  lastAssessedDate: string; // ISO date string
  trend: SkillTrend;
  evidence: string[]; // e.g. ["Used inverted 3rd conditionals in conversation", "Accurate stress on 4-syllable words"]
}

export type CoreSkillKey = 
  | 'speaking' 
  | 'listening' 
  | 'grammar' 
  | 'vocabulary' 
  | 'writing' 
  | 'pronunciation' 
  | 'fluency' 
  | 'communication';

export interface SkillScoresProfile {
  speaking: SkillScoreDetail;
  listening: SkillScoreDetail;
  grammar: SkillScoreDetail;
  vocabulary: SkillScoreDetail;
  writing: SkillScoreDetail;
  pronunciation: SkillScoreDetail;
  fluency: SkillScoreDetail;
  communication: SkillScoreDetail;
}

export type GrammarTopicStatus = 'new' | 'learning' | 'developing' | 'mastered';

export interface GrammarProfileItem {
  id: string;
  topic: string;
  cefrLevel: CEFRLevel;
  status: GrammarTopicStatus;
  accuracy: number; // 0 to 100
  recognitionScore?: number; // 0 to 100
  controlledAccuracyScore?: number; // 0 to 100
  sentenceProductionScore?: number; // 0 to 100
  speakingUsageScore?: number; // 0 to 100
  writingUsageScore?: number; // 0 to 100
  scaffoldingLevel?: 'simplified' | 'standard' | 'advanced';
  lastPracticed: string; // ISO date
  timesPracticed: number;
  timesFailed: number;
  nextReviewDate: string; // ISO date
}

export type VocabularyStatus = 'new' | 'learning' | 'active' | 'mastered';
export type VocabularyCategory =
  | 'collocations'
  | 'useful_phrases'
  | 'phrasal_verbs'
  | 'topic_vocab'
  | 'conversational'
  | 'b2_academic';

export interface VocabularyProfileItem {
  id: string;
  expression: string;
  meaning: string;
  example: string;
  cefrLevel: CEFRLevel;
  category: VocabularyCategory;
  status: VocabularyStatus;
  recognitionScore: number; // 0 to 100 (recognition)
  recallScore: number; // 0 to 100 (recall)
  speakingUsageScore: number; // 0 to 100 (speaking production)
  writingUsageScore: number; // 0 to 100 (writing production)
  timesReviewed: number; // review count
  timesSuccessfullyUsed: number; // successful uses
  timesFailedToUse: number; // failed uses
  nextReviewDate: string; // ISO date
  collocations?: string[];
  b1Equivalent?: string;
  topic?: string;
  speakingPrompt?: {
    scenario: string;
    promptText: string;
    sampleTarget: string;
  };
  writingPrompt?: {
    contextType: string;
    promptText: string;
    sampleTarget: string;
  };
}

export type ErrorSeverity = 'minor' | 'moderate' | 'critical';
export type ErrorStatus = 'active' | 'improving' | 'resolved';

export interface ErrorLogItem {
  id: string;
  errorType: string;
  originalSentence: string;
  correctedSentence: string;
  explanation: string;
  category: string; // e.g. 'Grammar', 'Vocabulary', 'Syntax', 'Pronunciation'
  frequency: number;
  severity: ErrorSeverity;
  firstDetected: string; // ISO date
  lastDetected: string; // ISO date
  status: ErrorStatus;
}

export interface SessionHistoryItem {
  id: string;
  date: string; // ISO date
  activityType: string; // e.g., 'Speaking Scenario', 'Grammar Drill', 'Writing Submission'
  duration: number; // in minutes
  topic: string;
  score: number; // 0 to 100
  mistakes: string[];
  vocabularyUsed: string[];
  grammarUsed: string[];
  notes: string;
}

export interface ComprehensiveLearnerProfile {
  userProfile: UserProfile;
  skillScores: SkillScoresProfile;
  grammarProfile: GrammarProfileItem[];
  vocabularyProfile: VocabularyProfileItem[];
  errorLog: ErrorLogItem[];
  sessionHistory: SessionHistoryItem[];
}

// ==========================================
// LEGACY UI / APP INTERFACES
// ==========================================

export interface SkillProgress {
  skill: SkillType;
  currentScore: number; // 0 to 100
  b2TargetScore: number; // usually 80-85
  recentChange: number; // e.g. +5%
  status: 'Needs Work' | 'Improving' | 'Near Target' | 'Mastered';
  keyFocus: string;
}

export interface LearnerProfile {
  name: string;
  email: string;
  currentLevel: CEFRLevel;
  targetLevel: CEFRLevel;
  programDay: number;
  totalProgramDays: number;
  dailyGoalMinutes: number;
  minutesCompletedToday: number;
  streakDays: number;
  correctionStrictness: 'Gentle' | 'Balanced' | 'Strict B2 Academic';
  nativeLanguageAssistance: boolean;
  preferredFocusArea: SkillType;
}

export interface RecommendedActivity {
  id: string;
  title: string;
  description: string;
  skill: SkillType;
  durationMinutes: number;
  difficulty: CEFRLevel;
  completed: boolean;
  route: string;
  xpReward: number;
}

export interface SpeakingScenario {
  id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: CEFRLevel;
  targetPhrases: string[];
  initialAiMessage: string;
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  phoneticTip?: string;
  b2Alternative?: string;
}

export interface GrammarTopic {
  id: string;
  title: string;
  cefrLevel: CEFRLevel;
  category: string;
  explanation: string;
  formula?: string;
  b1VsB2Comparison: {
    b1Way: string;
    b2Way: string;
    explanation: string;
  }[];
  examples: string[];
  exercises: {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    hint: string;
  }[];
  sentenceProductionPrompt?: {
    instruction: string;
    startingText?: string;
    targetRule: string;
    sampleTarget: string;
  };
  speakingProductionPrompt?: {
    scenario: string;
    promptText: string;
    sampleTarget: string;
  };
  writingProductionPrompt?: {
    promptText: string;
    contextType: string;
    sampleTarget: string;
  };
}

export interface VocabWord {
  id: string;
  word: string;
  partOfSpeech: string;
  ipa: string;
  definition: string;
  b1Synonym: string;
  b2Example: string;
  collocations: string[];
  masteryStatus: 'New' | 'Learning' | 'Mastered';
  topic: string;
}

export interface WritingPrompt {
  id: string;
  title: string;
  type: 'Opinion Essay' | 'Formal Email' | 'Report' | 'Argumentative';
  promptText: string;
  minWords: number;
  maxWords: number;
  recommendedTime: number; // in mins
  usefulConnectors: string[];
  sampleB2Answer?: string;
}

export interface WritingFeedback {
  overallScore: number;
  taskAchievement: number; // 0 - 100
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalAccuracy: number;
  strengths: string[];
  improvements: string[];
  b2UpgradeSuggestions: {
    original: string;
    suggested: string;
    reason: string;
  }[];
}

export interface ListeningExercise {
  id: string;
  title: string;
  accent: string;
  duration: string;
  topic: string;
  difficulty: CEFRLevel;
  audioSimulatedText: string; // Used for audio synthesis or display
  transcript: string;
  questions: {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}
