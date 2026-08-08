import { ComprehensiveLearnerProfile, GrammarTopic, GrammarProfileItem } from '../types';

export interface RecommendedGrammarTopicResult {
  topic: GrammarTopic;
  priorityScore: number;
  recommendationReason: string;
  badgeType: 'error_triggered' | 'review_due' | 'level_objective' | 'mastery_gap' | 'standard';
  history?: GrammarProfileItem;
}

export function evaluateGrammarRecommendations(
  profile: ComprehensiveLearnerProfile,
  allTopics: GrammarTopic[]
): RecommendedGrammarTopicResult[] {
  const today = new Date().toISOString().split('T')[0];
  const userLevel = profile.userProfile.currentCEFRLevel || 'B1+';
  const activeErrors = profile.errorLog.filter(e => e.status === 'active');
  const grammarHistory = profile.grammarProfile || [];

  return allTopics.map(topic => {
    let score = 50;
    let reasons: string[] = [];
    let badgeType: RecommendedGrammarTopicResult['badgeType'] = 'standard';

    // 1. Check history in grammarProfile
    const historyItem = grammarHistory.find(
      g => g.topic.toLowerCase() === topic.title.toLowerCase() || g.id === topic.id
    );

    // 2. Review Schedule Check
    if (historyItem) {
      if (historyItem.nextReviewDate && historyItem.nextReviewDate <= today) {
        score += 45;
        reasons.push('⏰ Scheduled for spaced repetition review today');
        badgeType = 'review_due';
      }
      if (historyItem.accuracy < 70 || historyItem.timesFailed >= 2) {
        score += 35;
        reasons.push(`⚠️ Low mastery (${historyItem.accuracy}%) with ${historyItem.timesFailed} recent errors`);
        if (badgeType === 'standard') badgeType = 'mastery_gap';
      }
    } else {
      score += 15;
      reasons.push('🆕 Unstudied B2 structure in curriculum');
    }

    // 3. Recurring Error Alignment
    const matchingErrors = activeErrors.filter(err => {
      const text = `${err.errorType} ${err.explanation} ${err.category} ${err.originalSentence}`.toLowerCase();
      const topicKeywords = topic.title.toLowerCase().split(' ');
      return topicKeywords.some(kw => kw.length > 3 && text.includes(kw));
    });

    if (matchingErrors.length > 0) {
      score += 50;
      reasons.push(`🔥 Recommended: Addresses ${matchingErrors.length} active error pattern(s) in your profile`);
      badgeType = 'error_triggered';
    }

    // 4. Learner Level & Objective Alignment
    if (topic.cefrLevel === userLevel) {
      score += 20;
    } else if (userLevel === 'B1+' && topic.cefrLevel === 'B2') {
      score += 25;
      reasons.push('🎯 Target B2 progression step');
      if (badgeType === 'standard') badgeType = 'level_objective';
    }

    // 5. Skill Objective Alignment
    if (profile.skillScores.speaking.score < 70 && topic.category.includes('Structure')) {
      score += 15;
      reasons.push('💬 Improves spoken sentence fluidity');
    }
    if (profile.skillScores.writing.score < 70 && topic.category.includes('Executive')) {
      score += 15;
      reasons.push('✍️ Boosts formal writing register');
    }

    return {
      topic,
      priorityScore: score,
      recommendationReason: reasons.join(' • ') || 'Core B2 grammar module',
      badgeType,
      history: historyItem
    };
  }).sort((a, b) => b.priorityScore - a.priorityScore);
}
