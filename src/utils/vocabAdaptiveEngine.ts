import { ComprehensiveLearnerProfile, VocabularyProfileItem, VocabularyCategory, VocabularyStatus } from '../types';

export interface EvaluatedVocabRecommendation {
  item: VocabularyProfileItem;
  priorityScore: number;
  recommendationReason: string;
  isDueForReview: boolean;
  hasProductionGap: boolean;
  isMaintenanceMode: boolean;
  suggestedFocusType: 'recognition' | 'recall' | 'speaking_production' | 'writing_production' | 'full_production';
}

export function evaluateVocabRecommendations(
  profile: ComprehensiveLearnerProfile,
  allVocabLibrary: VocabularyProfileItem[] = []
): EvaluatedVocabRecommendation[] {
  const todayStr = new Date().toISOString().split('T')[0];

  // Merge library items with user's saved vocabulary profile
  const userVocabMap = new Map<string, VocabularyProfileItem>();
  (profile.vocabularyProfile || []).forEach(item => {
    userVocabMap.set(item.id, item);
  });

  const mergedItems: VocabularyProfileItem[] = [...allVocabLibrary];
  userVocabMap.forEach((userItem, id) => {
    const existingIdx = mergedItems.findIndex(i => i.id === id);
    if (existingIdx >= 0) {
      mergedItems[existingIdx] = { ...mergedItems[existingIdx], ...userItem };
    } else {
      mergedItems.push(userItem);
    }
  });

  return mergedItems.map(item => {
    const nextReview = item.nextReviewDate || todayStr;
    const isDueForReview = nextReview <= todayStr;
    const isMastered = item.status === 'mastered';
    
    // Check production scores
    const speakScore = item.speakingUsageScore ?? 50;
    const writeScore = item.writingUsageScore ?? 50;
    const recogScore = item.recognitionScore ?? 50;
    const recallScore = item.recallScore ?? 50;
    const failedUses = item.timesFailedToUse ?? 0;

    const hasProductionGap = recogScore >= 70 && (speakScore < 65 || writeScore < 65 || failedUses > 0);
    const isMaintenanceMode = isMastered && isDueForReview;

    let priorityScore = 50;
    let recommendationReason = 'Standard curriculum expression';
    let suggestedFocusType: 'recognition' | 'recall' | 'speaking_production' | 'writing_production' | 'full_production' = 'full_production';

    if (isDueForReview && !isMastered) {
      priorityScore += 35;
      recommendationReason = '⏰ Due for Spaced Repetition Review today';
    }

    if (hasProductionGap) {
      priorityScore += 30;
      recommendationReason = '🎯 Weak Production Gap: Scheduled into Speaking & Writing';
      suggestedFocusType = speakScore < writeScore ? 'speaking_production' : 'writing_production';
    }

    if (failedUses > 1) {
      priorityScore += 20;
      recommendationReason = `⚠️ Repeated errors (${failedUses} failed attempts). Needs scaffolding practice`;
    }

    if (isMaintenanceMode) {
      priorityScore += 15;
      recommendationReason = '🔮 Mastered expression due for Spaced Maintenance Review';
    } else if (isMastered && !isDueForReview) {
      priorityScore -= 40; // Reduce review frequency for mastered items
      recommendationReason = '✅ Mastered expression (reduced review frequency)';
    }

    if (item.status === 'new') {
      priorityScore += 10;
      recommendationReason = '✨ New expression for your target CEFR B2 level';
      suggestedFocusType = 'recognition';
    }

    return {
      item,
      priorityScore,
      recommendationReason,
      isDueForReview,
      hasProductionGap,
      isMaintenanceMode,
      suggestedFocusType
    };
  }).sort((a, b) => b.priorityScore - a.priorityScore);
}

export function calculateVocabMasteryAndInterval(
  item: VocabularyProfileItem,
  performance: {
    recognitionScore?: number;
    recallScore?: number;
    speakingUsageScore?: number;
    writingUsageScore?: number;
    isSuccess: boolean;
  }
): {
  updatedItem: VocabularyProfileItem;
  isNowMastered: boolean;
  nextReviewDays: number;
} {
  const now = new Date();
  
  const newRecog = performance.recognitionScore !== undefined
    ? Math.round((item.recognitionScore * 0.4) + (performance.recognitionScore * 0.6))
    : item.recognitionScore;

  const newRecall = performance.recallScore !== undefined
    ? Math.round((item.recallScore * 0.4) + (performance.recallScore * 0.6))
    : item.recallScore;

  const newSpeak = performance.speakingUsageScore !== undefined
    ? Math.round((item.speakingUsageScore * 0.4) + (performance.speakingUsageScore * 0.6))
    : item.speakingUsageScore;

  const newWrite = performance.writingUsageScore !== undefined
    ? Math.round((item.writingUsageScore * 0.4) + (performance.writingUsageScore * 0.6))
    : item.writingUsageScore;

  const timesReviewed = item.timesReviewed + 1;
  const timesSuccessfullyUsed = performance.isSuccess ? item.timesSuccessfullyUsed + 1 : item.timesSuccessfullyUsed;
  const timesFailedToUse = !performance.isSuccess ? item.timesFailedToUse + 1 : Math.max(0, item.timesFailedToUse - 1);

  // Strict 4-Dimensional Mastery Requirement:
  // Recognition >= 80 AND Recall >= 80 AND Speaking >= 80 AND Writing >= 80 AND Successful Uses >= 3
  const isMasteryQualified =
    newRecog >= 80 &&
    newRecall >= 80 &&
    newSpeak >= 80 &&
    newWrite >= 80 &&
    timesSuccessfullyUsed >= 3 &&
    timesReviewed >= 3;

  let newStatus: VocabularyStatus = item.status;
  if (isMasteryQualified) {
    newStatus = 'mastered';
  } else if ((newRecog + newRecall + newSpeak + newWrite) / 4 >= 65) {
    newStatus = 'active';
  } else {
    newStatus = 'learning';
  }

  // Calculate Spaced Repetition Next Review Days
  let nextReviewDays = 1;
  if (!performance.isSuccess || timesFailedToUse > 1) {
    nextReviewDays = 1; // Immediate review tomorrow
  } else if (newStatus === 'mastered') {
    nextReviewDays = 14 + Math.min(16, timesSuccessfullyUsed * 2); // 14 to 30 days for maintenance
  } else if (newStatus === 'active') {
    nextReviewDays = 5 + Math.min(5, timesSuccessfullyUsed); // 5 to 10 days
  } else {
    nextReviewDays = 3; // 3 days for developing items
  }

  const nextReviewDateObj = new Date(now.valueOf() + nextReviewDays * 24 * 60 * 60 * 1000);
  const nextReviewDate = nextReviewDateObj.toISOString().split('T')[0];

  const updatedItem: VocabularyProfileItem = {
    ...item,
    recognitionScore: newRecog,
    recallScore: newRecall,
    speakingUsageScore: newSpeak,
    writingUsageScore: newWrite,
    timesReviewed,
    timesSuccessfullyUsed,
    timesFailedToUse,
    status: newStatus,
    nextReviewDate
  };

  return {
    updatedItem,
    isNowMastered: newStatus === 'mastered' && item.status !== 'mastered',
    nextReviewDays
  };
}

export function getWeakVocabularyForProduction(
  profile: ComprehensiveLearnerProfile,
  limit: number = 3
): VocabularyProfileItem[] {
  const items = profile.vocabularyProfile || [];
  const weakItems = items.filter(
    item =>
      item.status === 'learning' ||
      item.speakingUsageScore < 70 ||
      item.writingUsageScore < 70 ||
      item.timesFailedToUse > 0
  );

  return weakItems
    .sort((a, b) => (a.speakingUsageScore + a.writingUsageScore) - (b.speakingUsageScore + b.writingUsageScore))
    .slice(0, limit);
}
