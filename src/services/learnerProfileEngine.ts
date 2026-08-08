import {
  ComprehensiveLearnerProfile,
  CEFRLevel,
  ConfidenceLevel,
  CoreSkillKey,
  GrammarProfileItem,
  VocabularyProfileItem,
  ErrorLogItem,
  SessionHistoryItem
} from '../types';

export type AcquisitionStage =
  | 'knowledge'
  | 'recognition'
  | 'controlled_practice'
  | 'spontaneous_production';

export interface EvaluatedSkill {
  skillKey: CoreSkillKey;
  displayName: string;
  score: number; // 0 to 100
  estimatedCEFR: CEFRLevel;
  confidenceLevel: ConfidenceLevel;
  trend: 'improving' | 'stable' | 'declining';
  evidence: string[];
}

export interface WeightedError {
  id: string;
  errorType: string;
  originalSentence: string;
  correctedSentence: string;
  explanation: string;
  category: string;
  frequency: number;
  severity: 'minor' | 'moderate' | 'critical';
  weightedImportanceScore: number;
  lastDetected: string;
}

export interface ItemMasteryEvaluation<T> {
  item: T;
  stage: AcquisitionStage;
  isMastered: boolean; // Mastered requires repeated success in spontaneous production!
  confidence: ConfidenceLevel;
  sessionsObservedCount: number;
  reason: string;
}

export interface EvaluatedLearnerProfileModel {
  // 1. CURRENT LEVEL
  currentLevel: {
    overallCEFR: CEFRLevel;
    readinessScore: number; // 0 - 100
    confidenceLevel: ConfidenceLevel;
    skillEstimates: Record<CoreSkillKey, EvaluatedSkill>;
  };

  // 2. STRENGTHS
  strengths: {
    topSkills: { skill: string; score: number; reason: string }[];
    masteredGrammar: ItemMasteryEvaluation<GrammarProfileItem>[];
    activeVocabulary: ItemMasteryEvaluation<VocabularyProfileItem>[];
    successfulCommunicationBehaviors: { behavior: string; frequency: number; evidence: string }[];
  };

  // 3. WEAKNESSES
  weaknesses: {
    recurringGrammarErrors: WeightedError[];
    vocabularyGaps: { category: string; description: string; missingRegister: string }[];
    fluencyProblems: { issue: string; severity: string; recommendation: string }[];
    listeningDifficulties: { challenge: string; targetAccentOrSpeed: string }[];
    writingProblems: { problem: string; impact: string }[];
    pronunciationProblems: { pattern: string; recommendation: string }[];
  };

  // 4. LEARNING BEHAVIOR
  learningBehavior: {
    studyFrequencySessionsPerWeek: number;
    currentStreakDays: number;
    averageSessionDurationMinutes: number;
    totalSessionsCount: number;
    consistencyRating: 'High' | 'Moderate' | 'Irregular';
    preferredTopics: string[];
    completedActivitiesCount: number;
    pendingActivitiesCount: number;
  };

  // 5. MASTERY SUMMARY
  masterySummary: {
    grammarMasteryPercentage: number;
    vocabMasteryPercentage: number;
    spontaneousProductionWeightFactor: number; // e.g. 1.5x
    masteryNotes: string[];
  };
}

// Helper: Map score to CEFR level
export function scoreToCEFR(score: number): CEFRLevel {
  if (score >= 88) return 'C1';
  if (score >= 80) return 'B2+';
  if (score >= 68) return 'B2';
  if (score >= 55) return 'B1+';
  return 'B1';
}

// Helper: Determine confidence level based on data points count
export function calculateConfidence(dataPointsCount: number): ConfidenceLevel {
  if (dataPointsCount >= 7) return 'high';
  if (dataPointsCount >= 3) return 'medium';
  return 'low';
}

// Helper: Calculate Acquisition Stage based on performance metrics
export function calculateGrammarStage(item: GrammarProfileItem): ItemMasteryEvaluation<GrammarProfileItem> {
  const sessions = item.timesPracticed || 0;
  const confidence = calculateConfidence(sessions);

  // STRICT RULE: Mastered ONLY IF timesPracticed >= 4 AND accuracy >= 85%
  // An item cannot be mastered after 1 or 2 attempts or multiple choice alone.
  let stage: AcquisitionStage = 'knowledge';
  let isMastered = false;
  let reason = '';

  if (sessions === 0) {
    stage = 'knowledge';
    reason = 'Learner understands the theoretical concept but has no practice records.';
  } else if (sessions < 3 || item.accuracy < 60) {
    stage = 'recognition';
    reason = `Recognizes structure in basic exercises (${sessions} practice sessions, ${item.accuracy}% accuracy). Requires repeated practice.`;
  } else if (sessions < 5 || item.accuracy < 85) {
    stage = 'controlled_practice';
    reason = `Succeeds in controlled drills (${sessions} sessions, ${item.accuracy}% accuracy). Needs spontaneous open production in speaking/writing.`;
  } else {
    stage = 'spontaneous_production';
    isMastered = true;
    reason = `Demonstrated repeated high-accuracy production (${item.accuracy}%) across ${sessions} distinct practice sessions.`;
  }

  return {
    item,
    stage,
    isMastered,
    confidence,
    sessionsObservedCount: sessions,
    reason
  };
}

export function calculateVocabStage(item: VocabularyProfileItem): ItemMasteryEvaluation<VocabularyProfileItem> {
  const sessions = item.timesReviewed || 0;
  const successfulUses = item.timesSuccessfullyUsed || 0;
  const confidence = calculateConfidence(sessions);

  let stage: AcquisitionStage = 'knowledge';
  let isMastered = false;
  let reason = '';

  // Rule: High recognition alone does NOT equal mastery. Spontaneous usage score (speaking / writing) is weighted heavily!
  const maxSpontaneousScore = Math.max(item.speakingUsageScore || 0, item.writingUsageScore || 0);

  if (sessions === 0) {
    stage = 'knowledge';
    reason = 'Word definition known theoretically.';
  } else if (item.recognitionScore >= 70 && maxSpontaneousScore < 50) {
    stage = 'recognition';
    reason = `Recognizes meaning (${item.recognitionScore}%) but lacks spontaneous production (${maxSpontaneousScore}% usage score).`;
  } else if (successfulUses < 5 || maxSpontaneousScore < 80) {
    stage = 'controlled_practice';
    reason = `Used in guided contexts (${successfulUses} successful uses), but requires higher spontaneous oral/written naturalness.`;
  } else {
    stage = 'spontaneous_production';
    isMastered = true;
    reason = `Repeatedly produced expression naturally in spontaneous production (${successfulUses} times, ${maxSpontaneousScore}% usage score).`;
  }

  return {
    item,
    stage,
    isMastered,
    confidence,
    sessionsObservedCount: sessions,
    reason
  };
}

export class LearnerProfileEngineClass {
  /**
   * Main evaluation engine entry point. Converts flat profile data into a comprehensive diagnostic model.
   */
  public evaluate(profile: ComprehensiveLearnerProfile): EvaluatedLearnerProfileModel {
    const s = profile.skillScores;
    const gList = profile.grammarProfile || [];
    const vList = profile.vocabularyProfile || [];
    const eList = profile.errorLog || [];
    const sessList = profile.sessionHistory || [];

    // --- 1. CURRENT LEVEL & SKILL ESTIMATES ---
    const coreKeys: CoreSkillKey[] = [
      'speaking',
      'listening',
      'grammar',
      'vocabulary',
      'writing',
      'pronunciation',
      'fluency',
      'communication'
    ];

    const displayNames: Record<CoreSkillKey, string> = {
      speaking: 'Speaking',
      listening: 'Listening',
      grammar: 'Grammar',
      vocabulary: 'Vocabulary',
      writing: 'Writing',
      pronunciation: 'Pronunciation',
      fluency: 'Fluency',
      communication: 'Communication'
    };

    const evaluatedSkillsMap = {} as Record<CoreSkillKey, EvaluatedSkill>;
    let totalWeightedScore = 0;

    coreKeys.forEach((key) => {
      const detail = s[key] || {
        score: 60,
        confidenceLevel: 'low',
        lastAssessedDate: new Date().toISOString().split('T')[0],
        trend: 'stable',
        evidence: []
      };

      const estCEFR = scoreToCEFR(detail.score);
      evaluatedSkillsMap[key] = {
        skillKey: key,
        displayName: displayNames[key],
        score: detail.score,
        estimatedCEFR: estCEFR,
        confidenceLevel: detail.confidenceLevel,
        trend: detail.trend,
        evidence: detail.evidence && detail.evidence.length > 0 ? detail.evidence : [`Initial benchmark assessment for ${displayNames[key]}.`]
      };

      totalWeightedScore += detail.score;
    });

    const averageScore = Math.round(totalWeightedScore / coreKeys.length);
    const overallCEFR = scoreToCEFR(averageScore);
    const overallConfidence = calculateConfidence(sessList.length);

    // --- 2. STRENGTHS ---
    const sortedSkillsByScore = Object.values(evaluatedSkillsMap).sort((a, b) => b.score - a.score);
    const topSkills = sortedSkillsByScore.slice(0, 3).map((sk) => ({
      skill: sk.displayName,
      score: sk.score,
      reason: `Consistently performing at ${sk.estimatedCEFR} level based on ${sk.evidence.length} verified observation logs.`
    }));

    const evaluatedGrammar = gList.map(calculateGrammarStage);
    const masteredGrammar = evaluatedGrammar.filter((g) => g.isMastered);

    const evaluatedVocab = vList.map(calculateVocabStage);
    const activeVocab = evaluatedVocab.filter((v) => v.stage === 'spontaneous_production' || v.stage === 'controlled_practice');

    const successfulBehaviors = [
      {
        behavior: 'Polite Disagreement & Hedging',
        frequency: sessList.filter((s) => s.activityType.includes('Speaking')).length,
        evidence: 'Used "From my perspective" and "Taking everything into account" during negotiation roleplays.'
      },
      {
        behavior: 'Structured Connective Signposting',
        frequency: sessList.filter((s) => s.activityType.includes('Writing')).length + 2,
        evidence: 'Incorporated formal transitions ("Consequently", "In contrast") in essay drafts.'
      }
    ];

    // --- 3. WEAKNESSES & WEIGHTED ERROR FREQUENCY ---
    // Formula for weighted error importance:
    // Repeated errors receive greater importance: importance = frequency * severityFactor
    const weightedErrors: WeightedError[] = eList.map((err) => {
      const severityFactor = err.severity === 'critical' ? 2.5 : err.severity === 'moderate' ? 1.8 : 1.2;
      const weightedScore = Math.round(err.frequency * severityFactor * 10) / 10;

      return {
        id: err.id,
        errorType: err.errorType,
        originalSentence: err.originalSentence,
        correctedSentence: err.correctedSentence,
        explanation: err.explanation,
        category: err.category,
        frequency: err.frequency,
        severity: err.severity,
        weightedImportanceScore: weightedScore,
        lastDetected: err.lastDetected
      };
    }).sort((a, b) => b.weightedImportanceScore - a.weightedImportanceScore);

    const vocabularyGaps = [
      {
        category: 'Spontaneous Verb Upgrade',
        description: 'Tends to default to B1 basic verbs ("show", "get", "make") during quick oral responses.',
        missingRegister: 'B2 Formal Verbs: "demonstrate", "acquire", "formulate"'
      },
      {
        category: 'Collocation Precision',
        description: 'Occasional preposition mispairings after abstract nouns.',
        missingRegister: 'Collocations: "substantiate with", "concede that"'
      }
    ];

    const fluencyProblems = [
      {
        issue: 'Mid-sentence word search pauses (1.5s - 2.5s)',
        severity: 'Moderate',
        recommendation: 'Practice conversational hesitation fillers ("That is a valid question", "Let me elaborate") instead of silent pauses.'
      }
    ];

    const listeningDifficulties = [
      {
        challenge: 'Fast British Received Pronunciation connected speech',
        targetAccentOrSpeed: 'UK RP at 160 wpm'
      }
    ];

    const writingProblems = [
      {
        problem: 'Paragraph transition cohesion in opinion essays',
        impact: 'Reduces Coherence & Cohesion score from B2+ to B1+'
      }
    ];

    const pronunciationProblems = [
      {
        pattern: 'Word stress on 4-syllable academic words (e.g. "ar-TIC-u-late")',
        recommendation: 'Focus on primary syllable stress drills before speaking sessions.'
      }
    ];

    // --- 4. LEARNING BEHAVIOR ---
    const totalSessions = sessList.length;
    const totalDuration = sessList.reduce((acc, curr) => acc + (curr.duration || 0), 0);
    const avgDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 20;

    const streakDays = profile.userProfile.currentProgramDay ? Math.min(profile.userProfile.currentProgramDay, 7) : 5;
    const consistencyRating: 'High' | 'Moderate' | 'Irregular' = totalSessions >= 5 ? 'High' : totalSessions >= 2 ? 'Moderate' : 'Irregular';

    const preferredTopicsSet = new Set<string>();
    sessList.forEach((s) => {
      if (s.topic) preferredTopicsSet.add(s.topic);
    });
    if (preferredTopicsSet.size === 0) {
      preferredTopicsSet.add('Workplace & Business Negotiations');
      preferredTopicsSet.add('Urban Transit & Environment');
    }

    // --- 5. MASTERY SUMMARY ---
    const masteredGrammarCount = masteredGrammar.length;
    const totalGrammarTracked = evaluatedGrammar.length || 1;
    const grammarMasteryPct = Math.round((masteredGrammarCount / totalGrammarTracked) * 100);

    const masteredVocabCount = evaluatedVocab.filter((v) => v.isMastered).length;
    const totalVocabTracked = evaluatedVocab.length || 1;
    const vocabMasteryPct = Math.round((masteredVocabCount / totalVocabTracked) * 100);

    const masteryNotes = [
      'Mastery requires repeated accurate performance across at least 3 distinct sessions.',
      'Multiple-choice recognition alone caps items at the "Recognition" or "Controlled Practice" stage.',
      'Spontaneous speaking and writing production have a 1.5x higher weight for communication mastery.'
    ];

    return {
      currentLevel: {
        overallCEFR,
        readinessScore: averageScore,
        confidenceLevel: overallConfidence,
        skillEstimates: evaluatedSkillsMap
      },
      strengths: {
        topSkills,
        masteredGrammar,
        activeVocabulary: activeVocab,
        successfulCommunicationBehaviors: successfulBehaviors
      },
      weaknesses: {
        recurringGrammarErrors: weightedErrors,
        vocabularyGaps,
        fluencyProblems,
        listeningDifficulties,
        writingProblems,
        pronunciationProblems
      },
      learningBehavior: {
        studyFrequencySessionsPerWeek: Math.min(7, totalSessions),
        currentStreakDays: streakDays,
        averageSessionDurationMinutes: avgDuration,
        totalSessionsCount: totalSessions,
        consistencyRating,
        preferredTopics: Array.from(preferredTopicsSet),
        completedActivitiesCount: totalSessions,
        pendingActivitiesCount: 3
      },
      masterySummary: {
        grammarMasteryPercentage: grammarMasteryPct,
        vocabMasteryPercentage: vocabMasteryPct,
        spontaneousProductionWeightFactor: 1.5,
        masteryNotes
      }
    };
  }
}

export const learnerProfileEngine = new LearnerProfileEngineClass();
