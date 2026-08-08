import { learnerService } from './learnerService';
import { GrammarProfileItem, VocabularyProfileItem, ErrorLogItem } from '../types';

export type CrossSkillConnectionType = 
  | 'GRAMMAR_TO_SPEAKING'
  | 'GRAMMAR_TO_WRITING'
  | 'VOCABULARY_TO_SPEAKING'
  | 'VOCABULARY_TO_WRITING'
  | 'SPEAKING_TO_GRAMMAR'
  | 'SPEAKING_TO_VOCABULARY'
  | 'WRITING_TO_GRAMMAR'
  | 'WRITING_TO_VOCABULARY'
  | 'LISTENING_TO_VOCABULARY';

export interface CrossSkillBridgeNode {
  id: string;
  sourceSkill: 'Grammar' | 'Vocabulary' | 'Speaking' | 'Writing' | 'Listening';
  targetSkill: 'Speaking' | 'Writing' | 'Grammar' | 'Vocabulary';
  connectionType: CrossSkillConnectionType;
  sourceItemName: string; // e.g. "Inverted Conditionals" or "mitigate risk"
  naturalContextScenario: string; // e.g. "Workplace Budget Negotiation"
  taskPrompt: string; // The exact prompt for the target skill
  targetPhrasesOrStructures: string[]; // Key elements to produce or fix
  naturalUsageRationale: string; // Why this usage is authentic and not forced
  recommendedCEFR: string;
  isActivated: boolean;
}

export interface DependencyGraphData {
  grammarNodes: GrammarProfileItem[];
  vocabularyNodes: VocabularyProfileItem[];
  bridges: CrossSkillBridgeNode[];
  summaryStats: {
    totalActiveConnections: number;
    grammarToProductionCount: number;
    vocabToProductionCount: number;
    feedbackToRemediationCount: number;
    listeningExtractedTermsCount: number;
  };
}

export const crossSkillEngine = {
  /**
   * Builds the comprehensive Cross-Skill Dependency Graph using live learner state
   */
  buildDependencyGraph(): DependencyGraphData {
    const profile = learnerService.getProfile();
    const grammarList = profile.grammarProfile;
    const vocabList = profile.vocabularyProfile;
    const errorList = profile.errorLog;

    const bridges: CrossSkillBridgeNode[] = [];

    // 1. GRAMMAR -> SPEAKING BRIDGES
    grammarList.forEach((g) => {
      if (g.status !== 'mastered') {
        let scenario = 'Executive Strategy Meeting';
        let prompt = `Discuss project risks and propose alternative budgets using "${g.topic}".`;
        let rationale = `Hypothetical conditions like "${g.topic}" naturally arise during negotiations when weighing options.`;

        if (g.topic.toLowerCase().includes('conditional')) {
          scenario = 'Contract Review & Risk Contingency';
          prompt = `Explain to your team what would have happened if the vendor missed the deadline. Use inverted conditionals naturally.`;
          rationale = `Conditionals express past hypothetical situations in business post-mortems without artificial forcing.`;
        } else if (g.topic.toLowerCase().includes('passive')) {
          scenario = 'Formal News Broadcast / Quarterly Results';
          prompt = `Report quarterly company milestones using passive reporting verbs ("It is reported that...", "Sales are expected to...").`;
          rationale = `Passive reporting verbs establish professional objectivity and distance in formal presentations.`;
        }

        bridges.push({
          id: `bridge_g_spk_${g.id}`,
          sourceSkill: 'Grammar',
          targetSkill: 'Speaking',
          connectionType: 'GRAMMAR_TO_SPEAKING',
          sourceItemName: g.topic,
          naturalContextScenario: scenario,
          taskPrompt: prompt,
          targetPhrasesOrStructures: [g.topic],
          naturalUsageRationale: rationale,
          recommendedCEFR: g.cefrLevel,
          isActivated: g.status === 'learning' || g.status === 'developing'
        });
      }
    });

    // 2. GRAMMAR -> WRITING BRIDGES
    grammarList.forEach((g) => {
      if (g.accuracy < 85) {
        bridges.push({
          id: `bridge_g_wri_${g.id}`,
          sourceSkill: 'Grammar',
          targetSkill: 'Writing',
          connectionType: 'GRAMMAR_TO_WRITING',
          sourceItemName: g.topic,
          naturalContextScenario: 'Formal Incident Post-Mortem Report',
          taskPrompt: `Write a 150-word formal incident report explaining a project failure. Incorporate "${g.topic}" to express cause and mitigation.`,
          targetPhrasesOrStructures: [g.topic],
          naturalUsageRationale: `Written incident reports require precise grammatical structures to describe cause-and-effect relationships accurately.`,
          recommendedCEFR: g.cefrLevel,
          isActivated: true
        });
      }
    });

    // 3. VOCABULARY -> SPEAKING BRIDGES
    vocabList.forEach((v) => {
      if (v.speakingUsageScore < 70) {
        bridges.push({
          id: `bridge_v_spk_${v.id}`,
          sourceSkill: 'Vocabulary',
          targetSkill: 'Speaking',
          connectionType: 'VOCABULARY_TO_SPEAKING',
          sourceItemName: v.expression,
          naturalContextScenario: 'Stakeholder Alignment Call',
          taskPrompt: `In a 1-minute audio response, explain how your team plans to handle a project obstacle using the phrase "${v.expression}".`,
          targetPhrasesOrStructures: [v.expression, v.meaning],
          naturalUsageRationale: `The phrase "${v.expression}" naturally elevates workplace speech from basic B1 vocabulary to persuasive B2 execution.`,
          recommendedCEFR: v.cefrLevel,
          isActivated: true
        });
      }
    });

    // 4. VOCABULARY -> WRITING BRIDGES
    vocabList.forEach((v) => {
      if (v.writingUsageScore < 75) {
        bridges.push({
          id: `bridge_v_wri_${v.id}`,
          sourceSkill: 'Vocabulary',
          targetSkill: 'Writing',
          connectionType: 'VOCABULARY_TO_WRITING',
          sourceItemName: v.expression,
          naturalContextScenario: 'Policy Recommendation Brief',
          taskPrompt: `Draft a short memorandum proposing a workflow change. Use "${v.expression}" to justify your proposal effectively.`,
          targetPhrasesOrStructures: [v.expression],
          naturalUsageRationale: `Incorporating "${v.expression}" in written memos demonstrates academic and corporate vocabulary range.`,
          recommendedCEFR: v.cefrLevel,
          isActivated: true
        });
      }
    });

    // 5. SPEAKING -> GRAMMAR & VOCABULARY BRIDGES (From oral error logs)
    errorList.forEach((err) => {
      if (err.category === 'Grammar' && err.status === 'active') {
        bridges.push({
          id: `bridge_spk_grm_err_${err.id}`,
          sourceSkill: 'Speaking',
          targetSkill: 'Grammar',
          connectionType: 'SPEAKING_TO_GRAMMAR',
          sourceItemName: `Oral Error: ${err.errorType}`,
          naturalContextScenario: 'Targeted Oral Error Remediation',
          taskPrompt: `Correct spoken error pattern: "${err.originalSentence}". Complete 3 targeted grammar transformation drills to lock in "${err.correctedSentence}".`,
          targetPhrasesOrStructures: [err.correctedSentence],
          naturalUsageRationale: `Directly bridges real-time speaking errors into structured grammar drill loops for error extinction.`,
          recommendedCEFR: 'B2',
          isActivated: true
        });
      } else if (err.category === 'Vocabulary' && err.status === 'active') {
        bridges.push({
          id: `bridge_spk_voc_err_${err.id}`,
          sourceSkill: 'Speaking',
          targetSkill: 'Vocabulary',
          connectionType: 'SPEAKING_TO_VOCABULARY',
          sourceItemName: `Speaking Vocabulary Gap`,
          naturalContextScenario: 'Oral Lexical Precision Upgrade',
          taskPrompt: `Upgrade repetitive spoken phrasing in: "${err.originalSentence}". Replace with natural expression: "${err.correctedSentence}".`,
          targetPhrasesOrStructures: [err.correctedSentence],
          naturalUsageRationale: `Replaces generic words used during speaking with natural B2 collocations.`,
          recommendedCEFR: 'B2',
          isActivated: true
        });
      }
    });

    // 6. WRITING -> GRAMMAR & VOCABULARY BRIDGES
    errorList.forEach((err) => {
      if (err.category === 'Syntax' || err.category === 'Grammar') {
        bridges.push({
          id: `bridge_wri_grm_err_${err.id}`,
          sourceSkill: 'Writing',
          targetSkill: 'Grammar',
          connectionType: 'WRITING_TO_GRAMMAR',
          sourceItemName: `Writing Syntax Error`,
          naturalContextScenario: 'Written Clause Precision',
          taskPrompt: `Review written essay mistake: "${err.originalSentence}". Rewrite with proper conjunctions & syntax: "${err.correctedSentence}".`,
          targetPhrasesOrStructures: [err.correctedSentence],
          naturalUsageRationale: `Prevents recurring written syntax errors from compromising academic B2 writing scores.`,
          recommendedCEFR: 'B2',
          isActivated: true
        });
      }
    });

    // 7. LISTENING -> VOCABULARY EXTRACTION BRIDGES
    bridges.push(
      {
        id: 'bridge_lis_voc_1',
        sourceSkill: 'Listening',
        targetSkill: 'Vocabulary',
        connectionType: 'LISTENING_TO_VOCABULARY',
        sourceItemName: 'Audio Transcript Extraction: "strike a balance"',
        naturalContextScenario: 'Corporate Podcast Listening Material',
        taskPrompt: 'Extract "strike a balance" from listening audio transcript and complete a 2-minute oral application sentence.',
        targetPhrasesOrStructures: ['strike a balance', 'weigh up options'],
        naturalUsageRationale: 'Listening materials expose learners to authentic native phrasing that can immediately be harvested into active vocabulary.',
        recommendedCEFR: 'B2',
        isActivated: true
      },
      {
        id: 'bridge_lis_voc_2',
        sourceSkill: 'Listening',
        targetSkill: 'Vocabulary',
        connectionType: 'LISTENING_TO_VOCABULARY',
        sourceItemName: 'Audio Transcript Extraction: "bottom line"',
        naturalContextScenario: 'Business News Audio Feed',
        taskPrompt: 'Harvest "bottom line" from fast native monologue and construct a formal writing response using the phrase.',
        targetPhrasesOrStructures: ['the bottom line is', 'financial outlook'],
        naturalUsageRationale: 'Harvesting idiomatic business collocations from audio reinforces receptive-to-productive skill transfer.',
        recommendedCEFR: 'B2+',
        isActivated: true
      }
    );

    const grammarToProd = bridges.filter((b) => b.connectionType === 'GRAMMAR_TO_SPEAKING' || b.connectionType === 'GRAMMAR_TO_WRITING').length;
    const vocabToProd = bridges.filter((b) => b.connectionType === 'VOCABULARY_TO_SPEAKING' || b.connectionType === 'VOCABULARY_TO_WRITING').length;
    const feedbackToRemediation = bridges.filter((b) => b.connectionType === 'SPEAKING_TO_GRAMMAR' || b.connectionType === 'SPEAKING_TO_VOCABULARY' || b.connectionType === 'WRITING_TO_GRAMMAR' || b.connectionType === 'WRITING_TO_VOCABULARY').length;
    const listeningExtracted = bridges.filter((b) => b.connectionType === 'LISTENING_TO_VOCABULARY').length;

    return {
      grammarNodes: grammarList,
      vocabularyNodes: vocabList,
      bridges,
      summaryStats: {
        totalActiveConnections: bridges.filter((b) => b.isActivated).length,
        grammarToProductionCount: grammarToProd,
        vocabToProductionCount: vocabToProd,
        feedbackToRemediationCount: feedbackToRemediation,
        listeningExtractedTermsCount: listeningExtracted
      }
    };
  },

  /**
   * Process speaking oral feedback and bridge detected errors into Grammar & Vocabulary items
   */
  bridgeSpeakingFeedback(transcript: string, oralErrors: { type: string; orig: string; fix: string; category: string }[]) {
    oralErrors.forEach((err) => {
      learnerService.logError({
        errorType: err.type,
        originalSentence: err.orig,
        correctedSentence: err.fix,
        explanation: `Detected during live Speaking practice: "${err.orig}". Correct form: "${err.fix}".`,
        category: err.category || 'Grammar',
        frequency: 1,
        severity: 'moderate',
        status: 'active'
      });
    });
  },

  /**
   * Process writing feedback and bridge detected errors into Grammar & Vocabulary items
   */
  bridgeWritingFeedback(writtenText: string, writtenErrors: { type: string; orig: string; fix: string; category: string }[]) {
    writtenErrors.forEach((err) => {
      learnerService.logError({
        errorType: err.type,
        originalSentence: err.orig,
        correctedSentence: err.fix,
        explanation: `Detected during Writing task: "${err.orig}". Correct form: "${err.fix}".`,
        category: err.category || 'Syntax',
        frequency: 1,
        severity: 'moderate',
        status: 'active'
      });
    });
  },

  /**
   * Extract key vocabulary from listening audio transcript and schedule into Vocabulary profile
   */
  extractVocabularyFromListening(transcript: string, extractedCollocations: { expression: string; meaning: string; example: string }[]) {
    extractedCollocations.forEach((item) => {
      learnerService.saveVocabularyItem({
        id: `voc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        expression: item.expression,
        meaning: item.meaning,
        example: item.example,
        cefrLevel: 'B2',
        category: 'collocations',
        status: 'new',
        recognitionScore: 70,
        recallScore: 50,
        speakingUsageScore: 30,
        writingUsageScore: 30,
        timesReviewed: 1,
        timesSuccessfullyUsed: 0,
        timesFailedToUse: 0,
        nextReviewDate: new Date().toISOString().split('T')[0]
      });
    });
  }
};
