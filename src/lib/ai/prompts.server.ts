import { Type, Schema } from '@google/genai';

// ==========================================
// TAILORED LEARNER CONTEXT INTERFACE
// ==========================================
export interface LearnerContext {
  currentCEFRLevel: string;
  targetCEFRLevel: string;
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

// ==========================================
// JSON SCHEMAS FOR GEMINI RESPONSE
// ==========================================

// 1. Daily Plan Schema
export const dailyPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    dayNumber: { type: Type.INTEGER, description: 'Day number in the program' },
    dailyObjective: { type: Type.STRING, description: 'Primary learning goal for today based on weaknesses' },
    targetCEFR: { type: Type.STRING, description: 'Target CEFR level focus' },
    availableStudyTimeMinutes: { type: Type.INTEGER, description: 'Allocated study budget in minutes' },
    totalDurationMinutes: { type: Type.INTEGER, description: 'Sum of all activity durations' },
    adaptedAllocationReasoning: { type: Type.STRING, description: 'Detailed explanation of why specific time allocations & difficulties were chosen based on the 13 profile factors' },
    activities: {
      type: Type.ARRAY,
      description: 'List of structured activities covering Speaking, Grammar, Vocabulary, Listening, Writing, and Review',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          expectedSkill: { type: Type.STRING, description: 'Speaking, Grammar, Vocabulary, Listening, Writing, or Review' },
          route: { type: Type.STRING, description: 'speaking, grammar, vocabulary, listening, writing, or review' },
          topic: { type: Type.STRING, description: 'Specific activity topic or scenario' },
          objective: { type: Type.STRING, description: 'Pedagogical objective for this single activity' },
          estimatedDurationMinutes: { type: Type.INTEGER, description: 'Estimated minutes for activity' },
          difficulty: { type: Type.STRING, description: 'e.g. B1, B1+, B2, B2+, C1' },
          instructions: { type: Type.STRING, description: 'Step-by-step instructions for the learner' },
          targetGrammar: { type: Type.STRING, description: 'Specific grammar target or rule' },
          targetVocabulary: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'List of target vocabulary expressions to produce/review' },
          successCriteria: { type: Type.STRING, description: 'Explicit criteria for mastery or completion' },
          xpReward: { type: Type.INTEGER, description: 'XP points awarded upon completion' }
        },
        required: [
          'id',
          'title',
          'expectedSkill',
          'route',
          'topic',
          'objective',
          'estimatedDurationMinutes',
          'difficulty',
          'instructions',
          'targetGrammar',
          'targetVocabulary',
          'successCriteria',
          'xpReward'
        ]
      }
    }
  },
  required: [
    'dayNumber',
    'dailyObjective',
    'targetCEFR',
    'availableStudyTimeMinutes',
    'totalDurationMinutes',
    'adaptedAllocationReasoning',
    'activities'
  ]
};

// 2. Speaking Analysis Schema
export const analyzeSpeakingSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    aiResponse: { type: Type.STRING, description: 'In-character conversational reply to keep scenario moving' },
    pronunciationTip: { type: Type.STRING, description: 'Specific IPA stress or intonation tip' },
    b2Alternative: { type: Type.STRING, description: 'More sophisticated B2 alternative phrasing for what the user said' },
    grammarErrors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING },
          corrected: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ['original', 'corrected', 'explanation']
      }
    },
    vocabularyFeedback: {
      type: Type.OBJECT,
      properties: {
        advancedWordsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
        b2Suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ['advancedWordsUsed', 'b2Suggestions']
    },
    fluencyScore: { type: Type.INTEGER, description: '0 to 100 score' },
    cefrIndicator: { type: Type.STRING, description: 'e.g. B1+, B2, B2+' }
  },
  required: ['aiResponse', 'b2Alternative', 'grammarErrors', 'vocabularyFeedback', 'fluencyScore', 'cefrIndicator']
};

// 2b. Post-Session Comprehensive Speaking Assessment Schema
export const evaluateSpeakingSessionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    fluencyScore: { type: Type.INTEGER, description: '0 to 100 score for flow and absence of undue hesitation' },
    grammarAccuracyScore: { type: Type.INTEGER, description: '0 to 100 score for structural correctness' },
    vocabularyRangeScore: { type: Type.INTEGER, description: '0 to 100 score for lexical variety and sophistication' },
    vocabularyUsageScore: { type: Type.INTEGER, description: '0 to 100 score for contextual appropriateness' },
    coherenceScore: { type: Type.INTEGER, description: '0 to 100 score for logical organization of thoughts' },
    complexityScore: { type: Type.INTEGER, description: '0 to 100 score for willingness to attempt complex B2 structures' },
    abilityToExplainScore: { type: Type.INTEGER, description: '0 to 100 score for clarity in providing reasons' },
    abilityToGiveExamplesScore: { type: Type.INTEGER, description: '0 to 100 score for concrete illustration of points' },
    interactionScore: { type: Type.INTEGER, description: '0 to 100 score for active turn-taking and response relevance' },
    overallCEFRLevel: { type: Type.STRING, description: 'Assessed CEFR level (B1, B1+, B2, B2+, C1)' },
    
    top3Mistakes: {
      type: Type.ARRAY,
      description: 'Exactly up to 3 priority mistakes to keep learner focused',
      items: {
        type: Type.OBJECT,
        properties: {
          errorType: { type: Type.STRING },
          original: { type: Type.STRING },
          corrected: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ['errorType', 'original', 'corrected', 'explanation']
      }
    },
    top3Improvements: {
      type: Type.ARRAY,
      description: 'Up to 3 specific areas where learner demonstrated strength or progress',
      items: { type: Type.STRING }
    },
    vocabularyGaps: {
      type: Type.ARRAY,
      description: 'Words or expressions the learner repeatedly lacked or avoided',
      items: {
        type: Type.OBJECT,
        properties: {
          expression: { type: Type.STRING },
          meaning: { type: Type.STRING },
          contextWhereNeeded: { type: Type.STRING }
        },
        required: ['expression', 'meaning', 'contextWhereNeeded']
      }
    },
    grammarPriorities: {
      type: Type.ARRAY,
      description: 'Key grammar topics that need targeted practice based on session performance',
      items: { type: Type.STRING }
    },
    nextSpeakingTarget: { type: Type.STRING, description: 'Clear, motivating next objective for the learner' },
    recurringErrors: {
      type: Type.ARRAY,
      description: 'Specific error patterns observed repeatedly during the session',
      items: { type: Type.STRING }
    },
    pronunciationScore: { type: Type.INTEGER, description: '0 to 100 score for pronunciation based on the speech transcription' },
    pronunciationObservations: {
      type: Type.ARRAY,
      description: 'Up to 3 specific actionable observations about intelligibility, word pronunciation, sentence stress, or common patterns (e.g. final consonants, weak vowels). Avoid vague remarks or claiming professional phonetic accuracy.',
      items: { type: Type.STRING }
    }
  },
  required: [
    'fluencyScore',
    'grammarAccuracyScore',
    'vocabularyRangeScore',
    'vocabularyUsageScore',
    'coherenceScore',
    'complexityScore',
    'abilityToExplainScore',
    'abilityToGiveExamplesScore',
    'interactionScore',
    'overallCEFRLevel',
    'top3Mistakes',
    'top3Improvements',
    'vocabularyGaps',
    'grammarPriorities',
    'nextSpeakingTarget',
    'recurringErrors',
    'pronunciationScore',
    'pronunciationObservations'
  ]
};

// 3. Grammar Lesson Schema
export const grammarLessonSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    title: { type: Type.STRING },
    cefrLevel: { type: Type.STRING },
    category: { type: Type.STRING },
    explanation: { type: Type.STRING },
    b1VsB2Comparison: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          b1Way: { type: Type.STRING },
          b2Way: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ['b1Way', 'b2Way', 'explanation']
      }
    },
    examples: { type: Type.ARRAY, items: { type: Type.STRING } },
    keyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ['id', 'title', 'cefrLevel', 'category', 'explanation', 'b1VsB2Comparison', 'examples', 'keyTakeaways']
};

// 4. Grammar Exercise Schema
export const grammarExerciseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    topic: { type: Type.STRING },
    exercises: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctIndex: { type: Type.INTEGER, description: '0-based index of correct option' },
          explanation: { type: Type.STRING },
          hint: { type: Type.STRING }
        },
        required: ['id', 'question', 'options', 'correctIndex', 'explanation', 'hint']
      }
    }
  },
  required: ['topic', 'exercises']
};

// 4b. Grammar Production Evaluation Schema
export const evaluateGrammarProductionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    topic: { type: Type.STRING },
    sentenceProductionScore: { type: Type.INTEGER, description: '0-100 score for standalone sentence transformation/construction' },
    sentenceFeedback: { type: Type.STRING, description: 'Direct structural critique of the learner written sentence' },
    sentenceCorrection: { type: Type.STRING, description: 'Improved/corrected sentence if errors were found' },

    speakingUsageScore: { type: Type.INTEGER, description: '0-100 score for spoken register application' },
    speakingFeedback: { type: Type.STRING, description: 'Feedback on oral register and flow' },
    speakingCorrection: { type: Type.STRING, description: 'Polished spoken alternative' },

    writingUsageScore: { type: Type.INTEGER, description: '0-100 score for short paragraph formal writing application' },
    writingFeedback: { type: Type.STRING, description: 'Feedback on cohesion, register, and grammar precision in writing' },
    writingCorrection: { type: Type.STRING, description: 'Polished formal paragraph alternative' },

    overallGrammarAccuracy: { type: Type.INTEGER, description: '0-100 aggregate accuracy score' },
    recommendedScaffolding: { type: Type.STRING, description: 'simplified, standard, or advanced' },
    nextReviewDays: { type: Type.INTEGER, description: 'Days until next review (e.g. 1, 3, or 7)' },
    summaryFeedback: { type: Type.STRING, description: 'Encouraging diagnostic summary for the learner' }
  },
  required: [
    'topic',
    'sentenceProductionScore',
    'sentenceFeedback',
    'sentenceCorrection',
    'speakingUsageScore',
    'speakingFeedback',
    'speakingCorrection',
    'writingUsageScore',
    'writingFeedback',
    'writingCorrection',
    'overallGrammarAccuracy',
    'recommendedScaffolding',
    'nextReviewDays',
    'summaryFeedback'
  ]
};

// 5. Vocabulary Lesson Schema
export const vocabularyLessonSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    word: { type: Type.STRING },
    partOfSpeech: { type: Type.STRING },
    ipa: { type: Type.STRING },
    definition: { type: Type.STRING },
    b1Synonym: { type: Type.STRING },
    b2Example: { type: Type.STRING },
    collocations: { type: Type.ARRAY, items: { type: Type.STRING } },
    topic: { type: Type.STRING },
    nuanceNotes: { type: Type.STRING }
  },
  required: ['id', 'word', 'partOfSpeech', 'ipa', 'definition', 'b1Synonym', 'b2Example', 'collocations', 'topic', 'nuanceNotes']
};

// 6. Vocabulary Usage Analysis Schema
export const analyzeVocabularyUsageSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isCorrectUsage: { type: Type.BOOLEAN },
    score: { type: Type.INTEGER, description: '0-100 score' },
    feedback: { type: Type.STRING },
    naturalnessScore: { type: Type.INTEGER, description: '0-100 score' },
    alternativeSentences: { type: Type.ARRAY, items: { type: Type.STRING } },
    detectedCollocations: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ['isCorrectUsage', 'score', 'feedback', 'naturalnessScore', 'alternativeSentences', 'detectedCollocations']
};

// 6b. Comprehensive Vocabulary Production Evaluation Schema
export const evaluateVocabularyProductionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    expression: { type: Type.STRING },
    recognitionScore: { type: Type.INTEGER, description: '0-100 score for expression recognition' },
    recallScore: { type: Type.INTEGER, description: '0-100 score for fill-in-the-blank or cloze recall' },
    speakingUsageScore: { type: Type.INTEGER, description: '0-100 score for spoken scenario execution' },
    speakingFeedback: { type: Type.STRING, description: 'Detailed feedback on spoken context, collocations, and naturalness' },
    speakingCorrection: { type: Type.STRING, description: 'Polished spoken turn' },
    writingUsageScore: { type: Type.INTEGER, description: '0-100 score for formal written paragraph usage' },
    writingFeedback: { type: Type.STRING, description: 'Detailed feedback on formal written register and collocations' },
    writingCorrection: { type: Type.STRING, description: 'Polished written paragraph' },
    overallVocabScore: { type: Type.INTEGER, description: '0-100 aggregate score' },
    isMasteryQualified: { type: Type.BOOLEAN, description: 'True ONLY if all 4 dimensions (recognition, recall, speaking, writing) are >= 80' },
    nextReviewDays: { type: Type.INTEGER, description: 'Days until next spaced repetition review (e.g. 1, 3, 7, 14, 30)' },
    summaryFeedback: { type: Type.STRING, description: 'Encouraging diagnostic summary for the learner' }
  },
  required: [
    'expression',
    'recognitionScore',
    'recallScore',
    'speakingUsageScore',
    'speakingFeedback',
    'speakingCorrection',
    'writingUsageScore',
    'writingFeedback',
    'writingCorrection',
    'overallVocabScore',
    'isMasteryQualified',
    'nextReviewDays',
    'summaryFeedback'
  ]
};

// 7. Writing Analysis Schema
export const analyzeWritingSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.INTEGER, description: '0 to 100 overall score' },
    taskAchievement: { type: Type.INTEGER, description: '0 to 100' },
    coherenceCohesion: { type: Type.INTEGER, description: '0 to 100' },
    lexicalResource: { type: Type.INTEGER, description: '0 to 100' },
    grammaticalAccuracy: { type: Type.INTEGER, description: '0 to 100' },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
    b2UpgradeSuggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING },
          suggested: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ['original', 'suggested', 'reason']
      }
    },
    detectedCEFRLevel: { type: Type.STRING, description: 'e.g. B1, B1+, B2, B2+' }
  },
  required: ['overallScore', 'taskAchievement', 'coherenceCohesion', 'lexicalResource', 'grammaticalAccuracy', 'strengths', 'improvements', 'b2UpgradeSuggestions', 'detectedCEFRLevel']
};

// 7b. Generate Adaptive Writing Task Schema
export const generateWritingTaskSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    title: { type: Type.STRING },
    type: { type: Type.STRING, description: 'email, essay, report, or proposal' },
    promptText: { type: Type.STRING },
    cefrLevel: { type: Type.STRING },
    targetGrammar: { type: Type.ARRAY, items: { type: Type.STRING } },
    targetVocabulary: { type: Type.ARRAY, items: { type: Type.STRING } },
    relatedSpeakingTopic: { type: Type.STRING },
    targetedWeaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
    usefulConnectors: { type: Type.ARRAY, items: { type: Type.STRING } },
    minWords: { type: Type.INTEGER },
    maxWords: { type: Type.INTEGER },
    recommendedTime: { type: Type.INTEGER }
  },
  required: ['id', 'title', 'type', 'promptText', 'cefrLevel', 'targetGrammar', 'targetVocabulary', 'relatedSpeakingTopic', 'targetedWeaknesses', 'usefulConnectors', 'minWords', 'maxWords', 'recommendedTime']
};

// 7c. Analyze Writing Draft Schema
export const analyzeWritingDraftSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    grammarScore: { type: Type.INTEGER },
    vocabularyScore: { type: Type.INTEGER },
    sentenceStructureScore: { type: Type.INTEGER },
    coherenceCohesionScore: { type: Type.INTEGER },
    organizationScore: { type: Type.INTEGER },
    taskCompletionScore: { type: Type.INTEGER },
    naturalnessScore: { type: Type.INTEGER },
    overallScore: { type: Type.INTEGER },
    assessedCEFRLevel: { type: Type.STRING },
    categorizedErrors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: 'grammar, vocabulary, sentenceStructure, coherence, organization, or naturalness' },
          originalSnippet: { type: Type.STRING },
          explanation: { type: Type.STRING },
          guidedHint: { type: Type.STRING, description: 'Guided hint encouraging independent correction without direct answer dump' }
        },
        required: ['category', 'originalSnippet', 'explanation', 'guidedHint']
      }
    },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    revisionChecklist: { type: Type.ARRAY, items: { type: Type.STRING } },
    vocabularyUpgradeHints: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING },
          suggested: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ['original', 'suggested', 'reason']
      }
    },
    summaryFeedback: { type: Type.STRING }
  },
  required: ['grammarScore', 'vocabularyScore', 'sentenceStructureScore', 'coherenceCohesionScore', 'organizationScore', 'taskCompletionScore', 'naturalnessScore', 'overallScore', 'assessedCEFRLevel', 'categorizedErrors', 'strengths', 'revisionChecklist', 'vocabularyUpgradeHints', 'summaryFeedback']
};

// 7d. Analyze Writing Revision Schema
export const analyzeWritingRevisionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    draftScore: { type: Type.INTEGER },
    revisionScore: { type: Type.INTEGER },
    improvementDelta: { type: Type.INTEGER },
    grammarScore: { type: Type.INTEGER },
    vocabularyScore: { type: Type.INTEGER },
    sentenceStructureScore: { type: Type.INTEGER },
    coherenceScore: { type: Type.INTEGER },
    cohesionScore: { type: Type.INTEGER },
    organizationScore: { type: Type.INTEGER },
    taskCompletionScore: { type: Type.INTEGER },
    naturalnessScore: { type: Type.INTEGER },
    overallScore: { type: Type.INTEGER },
    assessedCEFRLevel: { type: Type.STRING },
    resolvedErrors: { type: Type.ARRAY, items: { type: Type.STRING } },
    remainingAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    finalDiagnosticFeedback: { type: Type.STRING },
    skillScoreDelta: { type: Type.NUMBER }
  },
  required: ['draftScore', 'revisionScore', 'improvementDelta', 'grammarScore', 'vocabularyScore', 'sentenceStructureScore', 'coherenceScore', 'cohesionScore', 'organizationScore', 'taskCompletionScore', 'naturalnessScore', 'overallScore', 'assessedCEFRLevel', 'resolvedErrors', 'remainingAreas', 'strengths', 'finalDiagnosticFeedback', 'skillScoreDelta']
};

// 8. Listening Questions Schema
export const generateListeningQuestionsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    title: { type: Type.STRING },
    accent: { type: Type.STRING, description: 'e.g. British Received Pronunciation, General American, Australian, Scottish, Irish' },
    duration: { type: Type.STRING, description: 'e.g. 2 mins' },
    topic: { type: Type.STRING },
    difficulty: { type: Type.STRING, description: 'B1, B1+, B2-, or B2' },
    audioSimulatedText: { type: Type.STRING, description: 'Text for TTS or simulated listening audio' },
    transcript: { type: Type.STRING },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctIndex: { type: Type.INTEGER },
          explanation: { type: Type.STRING },
          questionType: { type: Type.STRING, description: 'main_idea, specific_detail, vocabulary, speaker_intention, paraphrasing, or implied_meaning' }
        },
        required: ['id', 'question', 'options', 'correctIndex', 'explanation', 'questionType']
      }
    },
    harvestableVocabulary: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          expression: { type: Type.STRING },
          meaning: { type: Type.STRING },
          example: { type: Type.STRING }
        },
        required: ['expression', 'meaning', 'example']
      }
    },
    speakingBridge: {
      type: Type.OBJECT,
      properties: {
        scenario: { type: Type.STRING },
        promptText: { type: Type.STRING }
      },
      required: ['scenario', 'promptText']
    }
  },
  required: ['id', 'title', 'accent', 'duration', 'topic', 'difficulty', 'audioSimulatedText', 'transcript', 'questions', 'harvestableVocabulary', 'speakingBridge']
};

// 9. Assess CEFR Schema
export const assessCEFRSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    estimatedCEFRLevel: { type: Type.STRING, description: 'B1, B1+, B2, B2+, or C1' },
    overallScore: { type: Type.INTEGER, description: '0 to 100 overall readiness' },
    breakdown: {
      type: Type.OBJECT,
      properties: {
        speaking: { type: Type.OBJECT, properties: { score: { type: Type.INTEGER }, level: { type: Type.STRING }, reason: { type: Type.STRING } }, required: ['score', 'level', 'reason'] },
        listening: { type: Type.OBJECT, properties: { score: { type: Type.INTEGER }, level: { type: Type.STRING }, reason: { type: Type.STRING } }, required: ['score', 'level', 'reason'] },
        grammar: { type: Type.OBJECT, properties: { score: { type: Type.INTEGER }, level: { type: Type.STRING }, reason: { type: Type.STRING } }, required: ['score', 'level', 'reason'] },
        vocabulary: { type: Type.OBJECT, properties: { score: { type: Type.INTEGER }, level: { type: Type.STRING }, reason: { type: Type.STRING } }, required: ['score', 'level', 'reason'] },
        writing: { type: Type.OBJECT, properties: { score: { type: Type.INTEGER }, level: { type: Type.STRING }, reason: { type: Type.STRING } }, required: ['score', 'level', 'reason'] }
      },
      required: ['speaking', 'listening', 'grammar', 'vocabulary', 'writing']
    },
    readinessForB2Exam: { type: Type.INTEGER, description: '0 to 100 readiness percentage' },
    recommendedFocusAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
    summaryReasoning: { type: Type.STRING }
  },
  required: ['estimatedCEFRLevel', 'overallScore', 'breakdown', 'readinessForB2Exam', 'recommendedFocusAreas', 'summaryReasoning']
};

// 10. Update Learner Profile Schema
export const updateLearnerProfileSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    updatedSkillDelta: {
      type: Type.OBJECT,
      properties: {
        speakingDelta: { type: Type.NUMBER },
        listeningDelta: { type: Type.NUMBER },
        grammarDelta: { type: Type.NUMBER },
        vocabularyDelta: { type: Type.NUMBER },
        writingDelta: { type: Type.NUMBER },
        fluencyDelta: { type: Type.NUMBER }
      },
      required: ['speakingDelta', 'listeningDelta', 'grammarDelta', 'vocabularyDelta', 'writingDelta', 'fluencyDelta']
    },
    newErrorsDetected: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          errorType: { type: Type.STRING },
          originalSentence: { type: Type.STRING },
          correctedSentence: { type: Type.STRING },
          explanation: { type: Type.STRING },
          category: { type: Type.STRING },
          severity: { type: Type.STRING, description: 'minor, moderate, or critical' }
        },
        required: ['errorType', 'originalSentence', 'correctedSentence', 'explanation', 'category', 'severity']
      }
    },
    grammarStatusUpdates: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          accuracyChange: { type: Type.NUMBER },
          suggestedStatus: { type: Type.STRING, description: 'learning, developing, mastered' }
        },
        required: ['topic', 'accuracyChange', 'suggestedStatus']
      }
    },
    vocabStatusUpdates: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          expression: { type: Type.STRING },
          usageScoreChange: { type: Type.NUMBER },
          suggestedStatus: { type: Type.STRING, description: 'learning, active, mastered' }
        },
        required: ['expression', 'usageScoreChange', 'suggestedStatus']
      }
    },
    earnedXP: { type: Type.INTEGER },
    summaryNote: { type: Type.STRING }
  },
  required: ['updatedSkillDelta', 'newErrorsDetected', 'grammarStatusUpdates', 'vocabStatusUpdates', 'earnedXP', 'summaryNote']
};

// 11. Weekly Review Schema
export const generateWeeklyReviewSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    weekNumber: { type: Type.INTEGER },
    summaryTitle: { type: Type.STRING },
    totalPracticeMinutes: { type: Type.INTEGER },
    keyAccomplishments: { type: Type.ARRAY, items: { type: Type.STRING } },
    persistentErrorsToTarget: { type: Type.ARRAY, items: { type: Type.STRING } },
    skillGrowthHighlights: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          skill: { type: Type.STRING },
          changeDescription: { type: Type.STRING }
        },
        required: ['skill', 'changeDescription']
      }
    },
    nextWeekFocusPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
    motivationalNote: { type: Type.STRING }
  },
  required: ['weekNumber', 'summaryTitle', 'totalPracticeMinutes', 'keyAccomplishments', 'persistentErrorsToTarget', 'skillGrowthHighlights', 'nextWeekFocusPlan', 'motivationalNote']
};

// 12. Final B2 Assessment Schema
export const b2AssessmentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overallCEFR: { type: Type.STRING, description: 'Overall assessed CEFR level. Evaluate strictly, DO NOT automatically label the learner B2 unless evidence strongly supports it. E.g., B1, B1+, B2-, B2, B2+, C1' },
    overallScore: { type: Type.INTEGER, description: 'Overall score from 0 to 100 representing composite performance across all skills' },
    b2ReadinessPercentage: { type: Type.INTEGER, description: 'Percentage indicator (0 to 100) of B2 exam readiness based on evidence' },
    skillBreakdown: {
      type: Type.OBJECT,
      properties: {
        speaking: {
          type: Type.OBJECT,
          properties: {
            level: { type: Type.STRING, description: 'Assessed CEFR for speaking' },
            score: { type: Type.INTEGER },
            evidence: { type: Type.STRING, description: 'Concrete quote or observed behavior from the student transcript as evidence of their level' },
            strengths: { type: Type.STRING },
            weaknesses: { type: Type.STRING }
          },
          required: ['level', 'score', 'evidence', 'strengths', 'weaknesses']
        },
        listening: {
          type: Type.OBJECT,
          properties: {
            level: { type: Type.STRING, description: 'Assessed CEFR for listening' },
            score: { type: Type.INTEGER },
            evidence: { type: Type.STRING, description: 'Observed correctness across detail, main idea, and inference questions' },
            strengths: { type: Type.STRING },
            weaknesses: { type: Type.STRING }
          },
          required: ['level', 'score', 'evidence', 'strengths', 'weaknesses']
        },
        writing: {
          type: Type.OBJECT,
          properties: {
            level: { type: Type.STRING, description: 'Assessed CEFR for writing' },
            score: { type: Type.INTEGER },
            evidence: { type: Type.STRING, description: 'Concrete phrase, grammar structure, or vocabulary choice from writing text as evidence' },
            strengths: { type: Type.STRING },
            weaknesses: { type: Type.STRING }
          },
          required: ['level', 'score', 'evidence', 'strengths', 'weaknesses']
        },
        grammar: {
          type: Type.OBJECT,
          properties: {
            level: { type: Type.STRING, description: 'Assessed CEFR for grammar' },
            score: { type: Type.INTEGER },
            evidence: { type: Type.STRING, description: 'Observed grammatical errors or correct uses of advanced structures (e.g. Inverted conditionals)' },
            strengths: { type: Type.STRING },
            weaknesses: { type: Type.STRING }
          },
          required: ['level', 'score', 'evidence', 'strengths', 'weaknesses']
        },
        vocabulary: {
          type: Type.OBJECT,
          properties: {
            level: { type: Type.STRING, description: 'Assessed CEFR for vocabulary' },
            score: { type: Type.INTEGER },
            evidence: { type: Type.STRING, description: 'Concrete vocabulary terms successfully used or missed from recognition, recall, and production' },
            strengths: { type: Type.STRING },
            weaknesses: { type: Type.STRING }
          },
          required: ['level', 'score', 'evidence', 'strengths', 'weaknesses']
        }
      },
      required: ['speaking', 'listening', 'writing', 'grammar', 'vocabulary']
    },
    areasPreventingB2: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Explanation of which skills or linguistic sub-domains are below B2. If none, this should be empty.' },
    recommendedNextStep: { type: Type.STRING, description: 'A single immediate, actionable focus area (e.g. "Master subjunctive inversion under cognitive load")' },
    personalizedContinuationPlan: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A detailed step-by-step pathway/plan to guide the learner' }
  },
  required: ['overallCEFR', 'overallScore', 'b2ReadinessPercentage', 'skillBreakdown', 'areasPreventingB2', 'recommendedNextStep', 'personalizedContinuationPlan']
};

// ==========================================
// PROMPT GENERATOR FUNCTIONS
// ==========================================

export function formatLearnerContextPrompt(ctx: LearnerContext): string {
  return `
Comprehensive 13-Factor Learner Context:
1. Current CEFR Level: ${ctx.currentCEFRLevel}
2. Target CEFR Level: ${ctx.targetCEFRLevel}
3. Current Skill Scores: ${JSON.stringify(ctx.skillScores || {})}
4. Recent Performance: ${JSON.stringify(ctx.recentPerformance || [])}
5. Recurring Errors: ${JSON.stringify(ctx.recurringErrors || ctx.recentErrorsSummary || [])}
6. Grammar Needing Review: ${JSON.stringify(ctx.grammarNeedingReview || [])}
7. Vocabulary Needing Review: ${JSON.stringify(ctx.vocabularyNeedingReview || [])}
8. Listening Difficulty Level: ${ctx.listeningDifficulty || 'B2'}
9. Speaking Performance Level: ${ctx.speakingPerformance || 'B1+'}
10. Writing Performance Level: ${ctx.writingPerformance || 'B1+'}
11. Previous Activities: ${JSON.stringify(ctx.previousActivities || [])}
12. Spaced Review Schedule: ${JSON.stringify(ctx.spacedReviewSchedule || [])}
13. Daily Available Study Time: ${ctx.availableStudyTimeMinutes || 45} minutes

Program Day: Day ${ctx.programDay || 1}
Weakest Skills: ${ctx.weakestSkills ? ctx.weakestSkills.join(', ') : 'None specified'}
Correction Strictness: ${ctx.correctionStrictness || 'Balanced B2'}
Preferred Focus: ${ctx.preferredFocusArea || 'General B2'}
`.trim();
}
