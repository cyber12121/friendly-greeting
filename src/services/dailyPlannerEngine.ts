import { safeStorage } from '../lib/storage';
import { aiClientService } from './aiClientService';
import { firebaseService } from './firebaseService';
import { learnerService } from './learnerService';

export interface DailyPlanActivity {
  id: string;
  title: string;
  expectedSkill: 'Speaking' | 'Grammar' | 'Vocabulary' | 'Listening' | 'Writing' | 'Review';
  route: 'speaking' | 'grammar' | 'vocabulary' | 'listening' | 'writing' | 'review';
  topic: string;
  objective: string;
  estimatedDurationMinutes: number;
  difficulty: string;
  instructions: string;
  targetGrammar: string;
  targetVocabulary: string[];
  successCriteria: string;
  xpReward: number;
  completed?: boolean;
}

export interface AdaptiveDailyPlan {
  id: string;
  userId: string;
  dayNumber: number;
  dailyObjective: string;
  targetCEFR: string;
  availableStudyTimeMinutes: number;
  totalDurationMinutes: number;
  adaptedAllocationReasoning: string;
  activities: DailyPlanActivity[];
  generatedAt: string;
  completedCount: number;
}

const PLAN_STORAGE_KEY = 'b2_coach_adaptive_daily_plan';

export const dailyPlannerEngine = {
  /**
   * Get currently cached daily plan from safeStorage
   */
  getStoredPlan(): AdaptiveDailyPlan | null {
    try {
      const saved = safeStorage.getItem(PLAN_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse cached daily plan:', e);
    }
    return null;
  },

  /**
   * Save daily plan locally
   */
  savePlanLocally(plan: AdaptiveDailyPlan): void {
    try {
      safeStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plan));
    } catch (e) {
      console.error('Failed to save daily plan to safeStorage:', e);
    }
  },

  /**
   * Persist the full plan (including completions) to Firestore
   */
  async savePlanRemote(plan: AdaptiveDailyPlan, userId?: string): Promise<void> {
    const effectiveUserId = userId || plan.userId;
    if (!effectiveUserId || effectiveUserId === 'guest_user') return;
    try {
      await firebaseService.saveDailyPlan(effectiveUserId, {
        day: plan.dayNumber,
        objective: plan.dailyObjective,
        tasks: plan.activities,
        completed: plan.completedCount === plan.activities.length,
        snapshot: { ...plan, userId: effectiveUserId, updatedAt: new Date().toISOString() }
      });
    } catch (err) {
      console.warn('Failed to sync daily plan to Firestore:', err);
    }
  },

  /**
   * Load the plan, preferring the freshest of Firestore vs local cache
   * so completions stay consistent across devices.
   */
  async loadPlan(userId?: string): Promise<AdaptiveDailyPlan | null> {
    const local = this.getStoredPlan();
    if (!userId || userId === 'guest_user') return local;

    const remoteDoc = await firebaseService.getLatestDailyPlan(userId);
    const remote: AdaptiveDailyPlan | null = remoteDoc?.snapshot ?? null;
    if (!remote) {
      if (local) await this.savePlanRemote(local, userId);
      return local;
    }
    if (!local) {
      this.savePlanLocally(remote);
      return remote;
    }

    const remoteTime = (remoteDoc.updatedAt || remote.generatedAt || '') as string;
    const localTime = ((local as any).updatedAt || local.generatedAt || '') as string;
    if (remoteTime > localTime) {
      this.savePlanLocally(remote);
      return remote;
    }
    await this.savePlanRemote(local, userId);
    return local;
  },


  /**
   * Generate today's English lesson automatically from the learner profile with full 13-factor context
   */
  async generateTodayPlan(userId?: string): Promise<AdaptiveDailyPlan> {
    const profile = learnerService.getProfile();
    const effectiveUserId = userId || profile.userProfile.userId || 'guest_user';

    // Call AI backend with full 13-factor context
    const aiResponse = await aiClientService.generateDailyPlan();

    const rawActivities = Array.isArray(aiResponse.activities) ? aiResponse.activities : [];
    
    // Normalize activities to ensure required fields
    const activities: DailyPlanActivity[] = rawActivities.map((act: any, idx: number) => {
      const skillName = (act.expectedSkill || act.skill || 'Speaking') as DailyPlanActivity['expectedSkill'];
      let route: DailyPlanActivity['route'] = 'speaking';

      if (skillName.toLowerCase().includes('speaking')) route = 'speaking';
      else if (skillName.toLowerCase().includes('grammar')) route = 'grammar';
      else if (skillName.toLowerCase().includes('vocab')) route = 'vocabulary';
      else if (skillName.toLowerCase().includes('listen')) route = 'listening';
      else if (skillName.toLowerCase().includes('writ')) route = 'writing';
      else if (skillName.toLowerCase().includes('review')) route = 'review';

      return {
        id: act.id || `act_${idx}_${Date.now()}`,
        title: act.title || `${skillName} Activity`,
        expectedSkill: skillName,
        route,
        topic: act.topic || 'B2 Core Competency Practice',
        objective: act.objective || act.description || 'Improve skill precision and active fluency.',
        estimatedDurationMinutes: act.estimatedDurationMinutes || act.durationMinutes || 10,
        difficulty: act.difficulty || 'B2',
        instructions: act.instructions || 'Follow guided practice prompts carefully.',
        targetGrammar: act.targetGrammar || 'Target B2 Structures',
        targetVocabulary: Array.isArray(act.targetVocabulary) ? act.targetVocabulary : ['target collocations'],
        successCriteria: act.successCriteria || 'Complete exercises with >80% accuracy.',
        xpReward: act.xpReward || 25,
        completed: false
      };
    });

    const totalDuration = activities.reduce((sum, a) => sum + a.estimatedDurationMinutes, 0);

    const plan: AdaptiveDailyPlan = {
      id: `plan_day_${aiResponse.dayNumber || profile.userProfile.currentProgramDay || 1}_${Date.now()}`,
      userId: effectiveUserId,
      dayNumber: aiResponse.dayNumber || profile.userProfile.currentProgramDay || 1,
      dailyObjective: aiResponse.dailyObjective || aiResponse.focusTheme || 'Master B2 Fluency & Remediation',
      targetCEFR: aiResponse.targetCEFR || profile.userProfile.targetCEFRLevel || 'B2+',
      availableStudyTimeMinutes: aiResponse.availableStudyTimeMinutes || profile.userProfile.dailyStudyGoalMinutes || 45,
      totalDurationMinutes: totalDuration || 45,
      adaptedAllocationReasoning: aiResponse.adaptedAllocationReasoning || 'Adapted time and activity difficulties based on skill weaknesses and error logs.',
      activities,
      generatedAt: new Date().toISOString(),
      completedCount: 0
    };

    // Save locally + to Firestore
    this.savePlanLocally(plan);
    await this.savePlanRemote(plan, effectiveUserId);

    return plan;
  },

  /**
   * Toggle completion status of an activity
   */
  async toggleActivityCompleted(activityId: string, userId?: string): Promise<AdaptiveDailyPlan | null> {
    const plan = this.getStoredPlan();
    if (!plan) return null;

    const activity = plan.activities.find((a) => a.id === activityId);
    if (!activity) return plan;

    activity.completed = !activity.completed;
    plan.completedCount = plan.activities.filter((a) => a.completed).length;
    (plan as any).updatedAt = new Date().toISOString();

    this.savePlanLocally(plan);
    await this.savePlanRemote(plan, userId);

    return plan;
  }
};
