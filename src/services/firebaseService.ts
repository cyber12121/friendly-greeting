import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  ComprehensiveLearnerProfile,
  UserProfile,
  SkillScoresProfile,
  GrammarProfileItem,
  VocabularyProfileItem,
  ErrorLogItem,
  SessionHistoryItem
} from '../types';
import { initialComprehensiveLearnerProfile } from '../data/mockLearnerModel';

/**
  * Dedicated Firestore Data Service Layer
  * Handles complete user isolation under users/{userId} and related top-level collections.
  */

export const firebaseService = {
  /**
   * Save / Sync core User document upon authentication
   */
  async saveUserDoc(uid: string, userData: { email: string | null; displayName: string | null; photoURL: string | null }) {
    if (!uid) return;
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      uid,
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      lastLoginAt: serverTimestamp()
    }, { merge: true });
  },

  /**
   * Create or initialize a comprehensive Learner Profile for a user
   */
  async createLearnerProfile(userId: string, initialProfile?: ComprehensiveLearnerProfile): Promise<ComprehensiveLearnerProfile> {
    if (!userId) throw new Error('User ID is required');

    const profileToSave: ComprehensiveLearnerProfile = initialProfile || {
      ...initialComprehensiveLearnerProfile,
      userProfile: {
        ...initialComprehensiveLearnerProfile.userProfile,
        userId
      }
    };

    // Save in user subcollection
    const profileRef = doc(db, 'users', userId, 'learnerProfiles', 'main');
    await setDoc(profileRef, {
      ...profileToSave,
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Also persist in top-level learnerProfiles collection for direct collection indexing
    const topProfileRef = doc(db, 'learnerProfiles', userId);
    await setDoc(topProfileRef, {
      ...profileToSave.userProfile,
      userId,
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Persist initial skill assessments
    await this.saveAssessment(userId, profileToSave.skillScores);

    // Persist grammar progress items
    for (const item of profileToSave.grammarProfile) {
      await this.updateGrammarProgress(userId, item);
    }

    // Persist vocabulary progress items
    for (const item of profileToSave.vocabularyProfile) {
      await this.updateVocabularyProgress(userId, item);
    }

    // Persist error logs
    for (const err of profileToSave.errorLog) {
      await this.saveErrors(userId, err);
    }

    // Persist session history
    for (const sess of profileToSave.sessionHistory) {
      await this.saveSession(userId, sess);
    }

    return profileToSave;
  },

  /**
   * Read the comprehensive Learner Profile for a user
   */
  async readLearnerProfile(userId: string): Promise<ComprehensiveLearnerProfile | null> {
    if (!userId) return null;

    try {
      const profileRef = doc(db, 'users', userId, 'learnerProfiles', 'main');
      const docSnap = await getDoc(profileRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as ComprehensiveLearnerProfile;

        // Fetch latest subcollections for up-to-date items
        const grammarSnap = await getDocs(collection(db, 'users', userId, 'grammarProgress'));
        const vocabSnap = await getDocs(collection(db, 'users', userId, 'vocabularyProgress'));
        const errorsSnap = await getDocs(collection(db, 'users', userId, 'errorLogs'));
        const sessionsSnap = await getDocs(collection(db, 'users', userId, 'learningSessions'));

        const grammarProfile: GrammarProfileItem[] = grammarSnap.empty 
          ? data.grammarProfile || []
          : grammarSnap.docs.map(d => d.data() as GrammarProfileItem);

        const vocabularyProfile: VocabularyProfileItem[] = vocabSnap.empty
          ? data.vocabularyProfile || []
          : vocabSnap.docs.map(d => d.data() as VocabularyProfileItem);

        const errorLog: ErrorLogItem[] = errorsSnap.empty
          ? data.errorLog || []
          : errorsSnap.docs.map(d => d.data() as ErrorLogItem);

        const sessionHistory: SessionHistoryItem[] = sessionsSnap.empty
          ? data.sessionHistory || []
          : sessionsSnap.docs.map(d => d.data() as SessionHistoryItem);

        return {
          ...data,
          userProfile: {
            ...initialComprehensiveLearnerProfile.userProfile,
            ...(data.userProfile || {}),
            userId
          },
          grammarProfile,
          vocabularyProfile,
          errorLog,
          sessionHistory
        };
      } else {
        // If profile doesn't exist yet, create it
        return await this.createLearnerProfile(userId);
      }
    } catch (error) {
      console.error('Error reading learner profile from Firestore:', error);
      return null;
    }
  },

  /**
   * Update User Profile metadata
   */
  async updateLearnerProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    if (!userId) return;

    const profileRef = doc(db, 'users', userId, 'learnerProfiles', 'main');
    await updateDoc(profileRef, {
      'userProfile': updates,
      updatedAt: serverTimestamp()
    });

    const topRef = doc(db, 'learnerProfiles', userId);
    await setDoc(topRef, {
      userId,
      ...updates,
      updatedAt: serverTimestamp()
    }, { merge: true });
  },

  /**
   * Save Skill Assessment
   */
  async saveAssessment(userId: string, skillScores: SkillScoresProfile): Promise<void> {
    if (!userId) return;

    const assessmentRef = doc(db, 'users', userId, 'skillAssessments', 'latest');
    await setDoc(assessmentRef, {
      userId,
      ...skillScores,
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Top-level collection sync
    const topRef = doc(db, 'skillAssessments', `${userId}_latest`);
    await setDoc(topRef, {
      userId,
      ...skillScores,
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Update main profile snapshot
    const profileRef = doc(db, 'users', userId, 'learnerProfiles', 'main');
    await setDoc(profileRef, { skillScores }, { merge: true });
  },

  /**
   * Update or add a Grammar Progress topic
   */
  async updateGrammarProgress(userId: string, item: GrammarProfileItem): Promise<void> {
    if (!userId) return;

    const grammarRef = doc(db, 'users', userId, 'grammarProgress', item.id);
    await setDoc(grammarRef, {
      userId,
      ...item,
      updatedAt: serverTimestamp()
    }, { merge: true });

    const topRef = doc(db, 'grammarProgress', `${userId}_${item.id}`);
    await setDoc(topRef, {
      userId,
      ...item,
      updatedAt: serverTimestamp()
    }, { merge: true });
  },

  /**
   * Update or add a Vocabulary Progress item
   */
  async updateVocabularyProgress(userId: string, item: VocabularyProfileItem): Promise<void> {
    if (!userId) return;

    const vocabRef = doc(db, 'users', userId, 'vocabularyProgress', item.id);
    await setDoc(vocabRef, {
      userId,
      ...item,
      updatedAt: serverTimestamp()
    }, { merge: true });

    const topRef = doc(db, 'vocabularyProgress', `${userId}_${item.id}`);
    await setDoc(topRef, {
      userId,
      ...item,
      updatedAt: serverTimestamp()
    }, { merge: true });
  },

  /**
   * Save an Error Log entry
   */
  async saveErrors(userId: string, item: ErrorLogItem): Promise<void> {
    if (!userId) return;

    const errorRef = doc(db, 'users', userId, 'errorLogs', item.id);
    await setDoc(errorRef, {
      userId,
      ...item,
      updatedAt: serverTimestamp()
    }, { merge: true });

    const topRef = doc(db, 'errorLogs', `${userId}_${item.id}`);
    await setDoc(topRef, {
      userId,
      ...item,
      updatedAt: serverTimestamp()
    }, { merge: true });
  },

  /**
   * Save a Learning Session
   */
  async saveSession(userId: string, item: SessionHistoryItem): Promise<void> {
    if (!userId) return;

    const sessionRef = doc(db, 'users', userId, 'learningSessions', item.id);
    await setDoc(sessionRef, {
      userId,
      ...item,
      createdAt: serverTimestamp()
    }, { merge: true });

    const topRef = doc(db, 'learningSessions', `${userId}_${item.id}`);
    await setDoc(topRef, {
      userId,
      ...item,
      createdAt: serverTimestamp()
    }, { merge: true });
  },

  /**
   * Save a Writing Submission
   */
  async saveWritingSubmission(
    userId: string, 
    submission: { id?: string; topic: string; content: string; feedback?: string; score?: number }
  ): Promise<void> {
    if (!userId) return;

    const subId = submission.id || `writ_${Date.now()}`;
    const writingRef = doc(db, 'users', userId, 'writingSubmissions', subId);
    const payload = {
      id: subId,
      userId,
      ...submission,
      createdAt: new Date().toISOString()
    };

    await setDoc(writingRef, payload, { merge: true });

    const topRef = doc(db, 'writingSubmissions', `${userId}_${subId}`);
    await setDoc(topRef, payload, { merge: true });
  },

  /**
   * Save a Listening Session
   */
  async saveListeningSession(
    userId: string, 
    session: { id?: string; audioTitle: string; score: number }
  ): Promise<void> {
    if (!userId) return;

    const sessId = session.id || `list_${Date.now()}`;
    const listenRef = doc(db, 'users', userId, 'listeningSessions', sessId);
    const payload = {
      id: sessId,
      userId,
      ...session,
      completedAt: new Date().toISOString()
    };

    await setDoc(listenRef, payload, { merge: true });

    const topRef = doc(db, 'listeningSessions', `${userId}_${sessId}`);
    await setDoc(topRef, payload, { merge: true });
  },

  /**
   * Save a Daily Plan (with full snapshot for cross-device restore)
   */
  async saveDailyPlan(
    userId: string, 
    plan: { day: number; objective: string; tasks: any[]; completed: boolean; snapshot?: any }
  ): Promise<void> {
    if (!userId) return;

    const planId = `plan_day_${plan.day}`;
    const planRef = doc(db, 'users', userId, 'dailyPlans', planId);
    const payload = {
      id: planId,
      userId,
      ...plan,
      updatedAt: new Date().toISOString()
    };

    await setDoc(planRef, payload, { merge: true });

    const topRef = doc(db, 'dailyPlans', `${userId}_${planId}`);
    await setDoc(topRef, payload, { merge: true });
  },

  /**
   * Fetch the most recently updated Daily Plan snapshot for a user
   */
  async getLatestDailyPlan(userId: string): Promise<any | null> {
    if (!userId) return null;
    try {
      const snap = await getDocs(collection(db, 'users', userId, 'dailyPlans'));
      let latest: any = null;
      snap.forEach((d) => {
        const data: any = d.data();
        if (!latest || (data?.updatedAt || '') > (latest?.updatedAt || '')) latest = data;
      });
      return latest;
    } catch (err) {
      console.warn('Failed to fetch daily plan from Firestore:', err);
      return null;
    }
  },


  /**
   * Save a Speaking Session Assessment
   */
  async saveSpeakingAssessment(
    userId: string,
    assessment: {
      id?: string;
      scenarioTitle: string;
      scenarioTopic: string;
      durationSeconds: number;
      assessmentData: any;
      createdAt?: string;
    }
  ): Promise<void> {
    if (!userId) return;

    const assessmentId = assessment.id || `spk_eval_${Date.now()}`;
    const spkRef = doc(db, 'users', userId, 'speakingAssessments', assessmentId);
    const payload = {
      id: assessmentId,
      userId,
      ...assessment,
      createdAt: assessment.createdAt || new Date().toISOString()
    };

    await setDoc(spkRef, payload, { merge: true });

    const topRef = doc(db, 'speakingAssessments', `${userId}_${assessmentId}`);
    await setDoc(topRef, payload, { merge: true });
  }
};
