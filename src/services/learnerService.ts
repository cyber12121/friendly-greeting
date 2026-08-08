import {
  ComprehensiveLearnerProfile,
  UserProfile,
  CoreSkillKey,
  SkillScoreDetail,
  GrammarProfileItem,
  VocabularyProfileItem,
  ErrorLogItem,
  SessionHistoryItem
} from '../types';
import { initialComprehensiveLearnerProfile } from '../data/mockLearnerModel';
import { firebaseService } from './firebaseService';

const STORAGE_KEY = 'b2_coach_comprehensive_learner_profile';

export class LearnerService {
  private profile: ComprehensiveLearnerProfile;

  constructor() {
    this.profile = this.loadFromStorage();
  }

  private loadFromStorage(): ComprehensiveLearnerProfile {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure structure backward compatibility
        return {
          ...initialComprehensiveLearnerProfile,
          ...parsed,
          userProfile: { ...initialComprehensiveLearnerProfile.userProfile, ...(parsed.userProfile || {}) },
          skillScores: { ...initialComprehensiveLearnerProfile.skillScores, ...(parsed.skillScores || {}) }
        };
      }
    } catch (e) {
      console.warn('Failed to parse saved learner profile, falling back to initial default model.', e);
    }
    return initialComprehensiveLearnerProfile;
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
    } catch (e) {
      console.error('Error saving learner profile to localStorage', e);
    }
  }

  /**
   * Hydrate in-memory state with loaded profile from Firestore or Auth login
   */
  public setLoadedProfile(loaded: ComprehensiveLearnerProfile): ComprehensiveLearnerProfile {
    this.profile = loaded;
    this.saveToStorage();
    return this.getProfile();
  }

  /**
   * Get the full centralized learner profile.
   */
  public getProfile(): ComprehensiveLearnerProfile {
    return { ...this.profile };
  }

  /**
   * Update core user profile metadata.
   */
  public updateUserProfile(updates: Partial<UserProfile>): ComprehensiveLearnerProfile {
    this.profile.userProfile = {
      ...this.profile.userProfile,
      ...updates
    };
    this.saveToStorage();

    const userId = this.profile.userProfile.userId;
    if (userId) {
      firebaseService.updateLearnerProfile(userId, updates).catch(err => {
        console.error('Failed to sync userProfile update to Firestore:', err);
      });
    }

    return this.getProfile();
  }

  /**
   * Update or refine score for a specific core skill.
   */
  public updateSkillScore(
    skillKey: CoreSkillKey,
    scoreDeltaOrValue: number,
    isAbsoluteScore: boolean = false,
    newEvidence?: string
  ): ComprehensiveLearnerProfile {
    const currentSkillDetail = this.profile.skillScores[skillKey];
    const newScore = isAbsoluteScore
      ? Math.min(100, Math.max(0, scoreDeltaOrValue))
      : Math.min(100, Math.max(0, currentSkillDetail.score + scoreDeltaOrValue));

    const updatedEvidence = newEvidence
      ? [newEvidence, ...currentSkillDetail.evidence].slice(0, 5)
      : currentSkillDetail.evidence;

    const newTrend = newScore > currentSkillDetail.score ? 'improving' : newScore < currentSkillDetail.score ? 'declining' : 'stable';

    this.profile.skillScores[skillKey] = {
      ...currentSkillDetail,
      score: newScore,
      lastAssessedDate: new Date().toISOString().split('T')[0],
      trend: newTrend,
      evidence: updatedEvidence
    };

    this.saveToStorage();

    const userId = this.profile.userProfile.userId;
    if (userId) {
      firebaseService.saveAssessment(userId, this.profile.skillScores).catch(err => {
        console.error('Failed to sync skill assessment update to Firestore:', err);
      });
    }

    return this.getProfile();
  }

  /**
   * Add or update a grammar topic in the grammar profile.
   */
  public saveGrammarTopic(topic: GrammarProfileItem): ComprehensiveLearnerProfile {
    const existingIndex = this.profile.grammarProfile.findIndex(g => g.id === topic.id);
    if (existingIndex >= 0) {
      this.profile.grammarProfile[existingIndex] = topic;
    } else {
      this.profile.grammarProfile.unshift(topic);
    }
    this.saveToStorage();

    const userId = this.profile.userProfile.userId;
    if (userId) {
      firebaseService.updateGrammarProgress(userId, topic).catch(err => {
        console.error('Failed to sync grammar progress to Firestore:', err);
      });
    }

    return this.getProfile();
  }

  /**
   * Add or update a vocabulary item in the vocabulary profile.
   */
  public saveVocabularyItem(vocab: VocabularyProfileItem): ComprehensiveLearnerProfile {
    const existingIndex = this.profile.vocabularyProfile.findIndex(v => v.id === vocab.id);
    if (existingIndex >= 0) {
      this.profile.vocabularyProfile[existingIndex] = vocab;
    } else {
      this.profile.vocabularyProfile.unshift(vocab);
    }
    this.saveToStorage();

    const userId = this.profile.userProfile.userId;
    if (userId) {
      firebaseService.updateVocabularyProgress(userId, vocab).catch(err => {
        console.error('Failed to sync vocabulary progress to Firestore:', err);
      });
    }

    return this.getProfile();
  }

  /**
   * Record an error into the error log.
   */
  public logError(
    errorData: Omit<ErrorLogItem, 'id' | 'firstDetected' | 'lastDetected'>
  ): ComprehensiveLearnerProfile {
    const today = new Date().toISOString().split('T')[0];
    const existing = this.profile.errorLog.find(
      e => e.originalSentence.toLowerCase() === errorData.originalSentence.toLowerCase()
    );

    let loggedItem: ErrorLogItem;

    if (existing) {
      existing.frequency += 1;
      existing.lastDetected = today;
      existing.severity = errorData.severity;
      existing.status = 'active';
      loggedItem = existing;
    } else {
      loggedItem = {
        ...errorData,
        id: `err-${Date.now()}`,
        firstDetected: today,
        lastDetected: today
      };
      this.profile.errorLog.unshift(loggedItem);
    }

    this.saveToStorage();

    const userId = this.profile.userProfile.userId;
    if (userId) {
      firebaseService.saveErrors(userId, loggedItem).catch(err => {
        console.error('Failed to sync error log to Firestore:', err);
      });
    }

    return this.getProfile();
  }

  /**
   * Record a completed learning session.
   */
  public recordSession(
    sessionData: Omit<SessionHistoryItem, 'id' | 'date'>
  ): ComprehensiveLearnerProfile {
    const today = new Date().toISOString().split('T')[0];
    const newSession: SessionHistoryItem = {
      ...sessionData,
      id: `sess-${Date.now()}`,
      date: today
    };

    this.profile.sessionHistory.unshift(newSession);
    this.saveToStorage();

    const userId = this.profile.userProfile.userId;
    if (userId) {
      firebaseService.saveSession(userId, newSession).catch(err => {
        console.error('Failed to sync learning session to Firestore:', err);
      });
    }

    return this.getProfile();
  }

  /**
   * Get items due for review today based on date.
   */
  public getItemsDueForReview() {
    const today = new Date().toISOString().split('T')[0];
    const grammarDue = this.profile.grammarProfile.filter(g => g.nextReviewDate <= today);
    const vocabDue = this.profile.vocabularyProfile.filter(v => v.nextReviewDate <= today);

    return {
      grammarDue,
      vocabDue
    };
  }

  /**
   * Formats the entire learner profile into a structured prompt context string 
   * for the AI engine to generate personalized feedback, roleplays, or drills.
   */
  public buildAiContextPrompt(): string {
    const u = this.profile.userProfile;
    const s = this.profile.skillScores;

    const activeErrors = this.profile.errorLog
      .filter(e => e.status !== 'resolved')
      .map(e => `- [${e.category}] ${e.originalSentence} -> ${e.correctedSentence} (${e.explanation})`)
      .join('\n');

    const learningGrammar = this.profile.grammarProfile
      .filter(g => g.status === 'learning' || g.status === 'developing')
      .map(g => `- ${g.topic} (${g.status}, accuracy: ${g.accuracy}%)`)
      .join('\n');

    const learningVocab = this.profile.vocabularyProfile
      .filter(v => v.status === 'learning' || v.status === 'active')
      .map(v => `- ${v.expression}: "${v.meaning}" (Speaking usage score: ${v.speakingUsageScore})`)
      .join('\n');

    return `
LEARNER PROFILE CONTEXT:
Name: ${u.name} (User ID: ${u.userId})
Current CEFR Level: ${u.currentCEFRLevel} | Target CEFR Level: ${u.targetCEFRLevel}
Program Day: ${u.currentProgramDay} / ${u.programDuration}

SKILL DIAGNOSTICS (0-100):
- Speaking: ${s.speaking.score} (${s.speaking.trend})
- Listening: ${s.listening.score} (${s.listening.trend})
- Grammar: ${s.grammar.score} (${s.grammar.trend})
- Vocabulary: ${s.vocabulary.score} (${s.vocabulary.trend})
- Writing: ${s.writing.score} (${s.writing.trend})
- Pronunciation: ${s.pronunciation.score} (${s.pronunciation.trend})
- Fluency: ${s.fluency.score} (${s.fluency.trend})
- Communication: ${s.communication.score} (${s.communication.trend})

ACTIVE GRAMMAR TARGETS:
${learningGrammar || 'None'}

ACTIVE VOCABULARY TARGETS:
${learningVocab || 'None'}

RECENT RECURRING ERRORS TO CORRECT:
${activeErrors || 'No recurring errors detected.'}
`.trim();
  }

  /**
   * Process and integrate a comprehensive post-session speaking assessment into the profile and Firestore
   */
  public processSpeakingAssessment(assessmentData: any, scenarioTitle: string, durationSeconds: number): ComprehensiveLearnerProfile {
    if (typeof assessmentData.fluencyScore === 'number') {
      this.updateSkillScore('fluency', assessmentData.fluencyScore, true, `Post-session fluency: ${assessmentData.fluencyScore}/100`);
    }
    if (typeof assessmentData.grammarAccuracyScore === 'number') {
      const spkScore = Math.round(((assessmentData.fluencyScore || 75) + assessmentData.grammarAccuracyScore) / 2);
      this.updateSkillScore('speaking', spkScore, true, `Speaking assessment: ${assessmentData.overallCEFRLevel || 'B2'}`);
    }
    if (typeof assessmentData.pronunciationScore === 'number') {
      const evidenceStr = Array.isArray(assessmentData.pronunciationObservations) && assessmentData.pronunciationObservations.length > 0
        ? `Observed pronunciation issues & tips: ${assessmentData.pronunciationObservations.join(' | ')}`
        : `Pronunciation evaluated: ${assessmentData.pronunciationScore}/100`;
      this.updateSkillScore('pronunciation', assessmentData.pronunciationScore, true, evidenceStr);
    }

    if (Array.isArray(assessmentData.top3Mistakes)) {
      assessmentData.top3Mistakes.forEach((err: any) => {
        let category: 'Grammar' | 'Vocabulary' | 'Speaking' = 'Grammar';
        const typeLower = (err.errorType || '').toLowerCase();
        const explLower = (err.explanation || '').toLowerCase();
        if (typeLower.includes('vocab') || typeLower.includes('word') || typeLower.includes('lexical') || explLower.includes('vocabulary') || explLower.includes('word')) {
          category = 'Vocabulary';
        }
        this.logError({
          errorType: err.errorType || 'Speaking Precision',
          originalSentence: err.original || '',
          correctedSentence: err.corrected || '',
          explanation: err.explanation || '',
          category: category,
          frequency: 1,
          severity: 'moderate',
          status: 'active'
        });
      });
    }

    if (Array.isArray(assessmentData.grammarPriorities)) {
      assessmentData.grammarPriorities.forEach((topicName: string) => {
        const existing = this.profile.grammarProfile.find(
          g => g.topic.toLowerCase() === topicName.toLowerCase()
        );
        if (existing) {
          const newAccuracy = Math.max(50, existing.accuracy - 15);
          this.saveGrammarTopic({
            ...existing,
            accuracy: newAccuracy,
            status: 'developing',
            nextReviewDate: new Date().toISOString().split('T')[0]
          });
        } else {
          this.saveGrammarTopic({
            id: `grm_spk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            topic: topicName,
            cefrLevel: 'B2',
            accuracy: 65,
            status: 'learning',
            timesPracticed: 1,
            timesFailed: 0,
            lastPracticed: new Date().toISOString().split('T')[0],
            nextReviewDate: new Date().toISOString().split('T')[0]
          });
        }
      });
    }

    if (Array.isArray(assessmentData.vocabularyGaps)) {
      assessmentData.vocabularyGaps.forEach((gap: any) => {
        if (gap.expression) {
          this.saveVocabularyItem({
            id: `gap_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            expression: gap.expression,
            meaning: gap.meaning || 'Needed in context',
            example: gap.contextWhereNeeded || '',
            cefrLevel: 'B2',
            category: 'collocations',
            status: 'learning',
            recognitionScore: 60,
            recallScore: 40,
            speakingUsageScore: 20,
            writingUsageScore: 30,
            timesReviewed: 1,
            timesSuccessfullyUsed: 0,
            timesFailedToUse: 1,
            nextReviewDate: new Date().toISOString().split('T')[0]
          });
        }
      });
    }

    const sessionItem: SessionHistoryItem = {
      id: `spk_sess_${Date.now()}`,
      date: new Date().toISOString(),
      activityType: 'Speaking Coach Scenario',
      duration: Math.max(1, Math.round(durationSeconds / 60)),
      topic: scenarioTitle,
      score: assessmentData.fluencyScore || 80,
      mistakes: Array.isArray(assessmentData.top3Mistakes) ? assessmentData.top3Mistakes.map((m: any) => m.original || '') : [],
      vocabularyUsed: Array.isArray(assessmentData.vocabularyGaps) ? assessmentData.vocabularyGaps.map((v: any) => v.expression || '') : [],
      grammarUsed: Array.isArray(assessmentData.grammarPriorities) ? assessmentData.grammarPriorities : [],
      notes: `Overall Level: ${assessmentData.overallCEFRLevel || 'B2'}. Target: ${assessmentData.nextSpeakingTarget || 'Maintain fluency'}`
    };

    this.recordSession(sessionItem);

    const userId = this.profile.userProfile.userId;
    if (userId) {
      firebaseService.saveSpeakingAssessment(userId, {
        scenarioTitle,
        scenarioTopic: scenarioTitle,
        durationSeconds,
        assessmentData
      }).catch(err => {
        console.error('Failed to sync speaking assessment to Firestore:', err);
      });
    }

    return this.getProfile();
  }

  /**
   * Reset profile back to initial default model state.
   */
  public resetToDefault(): ComprehensiveLearnerProfile {
    this.profile = JSON.parse(JSON.stringify(initialComprehensiveLearnerProfile));
    this.saveToStorage();
    return this.getProfile();
  }
}

// Singleton export for quick service access across components/AI engines
export const learnerService = new LearnerService();
