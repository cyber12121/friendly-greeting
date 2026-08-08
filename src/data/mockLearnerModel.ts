import { ComprehensiveLearnerProfile } from '../types';

export const initialComprehensiveLearnerProfile: ComprehensiveLearnerProfile = {
  userProfile: {
    userId: 'usr_b2_alex_8921',
    name: 'Alex Rivera',
    currentCEFRLevel: 'B1+',
    targetCEFRLevel: 'B2',
    currentProgramDay: 14,
    programStartDate: '2026-07-25',
    programDuration: 90,
    dailyStudyGoalMinutes: 30
  },

  skillScores: {
    speaking: {
      score: 68,
      confidenceLevel: 'medium',
      lastAssessedDate: '2026-08-06',
      trend: 'improving',
      evidence: [
        'Used "From my perspective" accurately during negotiation roleplay.',
        'Sustained 2-minute response on workplace flexibility with minor pauses.',
        'Target for B2: Increase spontaneous use of hypotheticals.'
      ]
    },
    listening: {
      score: 74,
      confidenceLevel: 'high',
      lastAssessedDate: '2026-08-07',
      trend: 'improving',
      evidence: [
        'Comprehended fast-paced British audio podcast on urban transit.',
        'Accurately identified subtle speaker attitude and core arguments.'
      ]
    },
    grammar: {
      score: 70,
      confidenceLevel: 'medium',
      lastAssessedDate: '2026-08-05',
      trend: 'improving',
      evidence: [
        'Achieved 85% accuracy on 2nd and 3rd conditional exercises.',
        'Needs practice with subject-verb inversion after restrictive adverbs ("Rarely", "Seldom").'
      ]
    },
    vocabulary: {
      score: 65,
      confidenceLevel: 'medium',
      lastAssessedDate: '2026-08-06',
      trend: 'stable',
      evidence: [
        'Successfully introduced "pivotal" and "pragmatic" into written exercises.',
        'Tends to default to B1 synonyms ("clear", "prove") in rapid speaking.'
      ]
    },
    writing: {
      score: 62,
      confidenceLevel: 'low',
      lastAssessedDate: '2026-08-04',
      trend: 'improving',
      evidence: [
        'Drafted 180-word opinion essay using formal connective devices.',
        'Feedback highlighted opportunity to strengthen paragraph transition cohesion.'
      ]
    },
    pronunciation: {
      score: 72,
      confidenceLevel: 'medium',
      lastAssessedDate: '2026-08-07',
      trend: 'improving',
      evidence: [
        'Clear syllable stress on multisyllabic terms like "articulate" and "substantiate".',
        'Working on intonation contours in polite disagreement sentences.'
      ]
    },
    fluency: {
      score: 66,
      confidenceLevel: 'medium',
      lastAssessedDate: '2026-08-06',
      trend: 'improving',
      evidence: [
        'Reduced mid-sentence hesitation pauses from 2.4s to 1.7s.',
        'Increased continuous speech turns without reverting to native language placeholders.'
      ]
    },
    communication: {
      score: 71,
      confidenceLevel: 'high',
      lastAssessedDate: '2026-08-07',
      trend: 'improving',
      evidence: [
        'Successfully negotiated deadline adjustment in simulated stakeholder meeting.',
        'Effectively managed turn-taking and softened critical statements.'
      ]
    }
  },

  grammarProfile: [
    {
      id: 'g-mod-1',
      topic: 'Hypothetical Situations: 2nd & 3rd Conditionals',
      cefrLevel: 'B2',
      status: 'developing',
      accuracy: 78,
      lastPracticed: '2026-08-05',
      timesPracticed: 12,
      timesFailed: 3,
      nextReviewDate: '2026-08-09'
    },
    {
      id: 'g-mod-2',
      topic: 'Inversion for Formal Emphasis (Not only, Seldom)',
      cefrLevel: 'B2',
      status: 'learning',
      accuracy: 60,
      lastPracticed: '2026-08-04',
      timesPracticed: 6,
      timesFailed: 2,
      nextReviewDate: '2026-08-08'
    },
    {
      id: 'g-mod-3',
      topic: 'Mixed Conditionals (Past Cause, Present Effect)',
      cefrLevel: 'B2+',
      status: 'new',
      accuracy: 45,
      lastPracticed: '2026-08-01',
      timesPracticed: 2,
      timesFailed: 1,
      nextReviewDate: '2026-08-08'
    },
    {
      id: 'g-mod-4',
      topic: 'Passive Voice for Executive & Formal Reports',
      cefrLevel: 'B2',
      status: 'mastered',
      accuracy: 92,
      lastPracticed: '2026-08-03',
      timesPracticed: 15,
      timesFailed: 1,
      nextReviewDate: '2026-08-15'
    },
    {
      id: 'g-mod-5',
      topic: 'Relative Clauses with Prepositions (to whom, in which)',
      cefrLevel: 'B2',
      status: 'developing',
      accuracy: 74,
      lastPracticed: '2026-08-06',
      timesPracticed: 8,
      timesFailed: 2,
      nextReviewDate: '2026-08-10'
    }
  ],

  vocabularyProfile: [
    {
      id: 'v-mod-1',
      expression: 'articulate a vision',
      meaning: 'To clearly and persuasively convey future goals or strategic intent.',
      example: 'The CEO was able to articulate a clear vision during the annual shareholder address.',
      cefrLevel: 'B2',
      category: 'collocations',
      status: 'active',
      recognitionScore: 95,
      recallScore: 85,
      speakingUsageScore: 70,
      writingUsageScore: 85,
      timesReviewed: 14,
      timesSuccessfullyUsed: 9,
      timesFailedToUse: 1,
      nextReviewDate: '2026-08-11',
      collocations: ['articulate a vision', 'articulate strategy', 'articulate clearly'],
      b1Equivalent: 'explain future plans clearly',
      topic: 'Professional Communication',
      speakingPrompt: {
        scenario: 'Town Hall Executive Q&A',
        promptText: 'Explain your department goals for next quarter using "articulate a vision".',
        sampleTarget: 'In our quarterly update, I will articulate a vision focused on customer satisfaction and digital innovation.'
      },
      writingPrompt: {
        contextType: 'Executive Summary Memo',
        promptText: 'Draft a short paragraph summarizing strategic goals incorporating "articulate a vision".',
        sampleTarget: 'Leaders must articulate a vision that aligns cross-functional teams toward long-term organizational stability.'
      }
    },
    {
      id: 'v-mod-2',
      expression: 'substantiate a claim',
      meaning: 'To provide supporting evidence or data to prove an assertion.',
      example: 'The manager was required to substantiate her budget projection with market research.',
      cefrLevel: 'B2',
      category: 'b2_academic',
      status: 'learning',
      recognitionScore: 80,
      recallScore: 65,
      speakingUsageScore: 40,
      writingUsageScore: 70,
      timesReviewed: 8,
      timesSuccessfullyUsed: 4,
      timesFailedToUse: 2,
      nextReviewDate: '2026-08-08',
      collocations: ['substantiate a claim', 'substantiate findings', 'substantiate evidence'],
      b1Equivalent: 'prove an idea with facts',
      topic: 'Academic & Formal Writing',
      speakingPrompt: {
        scenario: 'Project Audit Review',
        promptText: 'Defend your cost estimate by promising to "substantiate a claim" with audit records.',
        sampleTarget: 'I will substantiate our cost claims by providing verified supplier invoices.'
      },
      writingPrompt: {
        contextType: 'Analytical Report',
        promptText: 'Write a short formal recommendation insisting on data to "substantiate a claim".',
        sampleTarget: 'Before approving capital expenditure, project managers must substantiate claims regarding projected ROI.'
      }
    },
    {
      id: 'v-mod-3',
      expression: 'play a pivotal role',
      meaning: 'To be of crucial importance in determining the success or outcome of something.',
      example: 'Securing the key account played a pivotal role in quarterly profitability.',
      cefrLevel: 'B2',
      category: 'collocations',
      status: 'mastered',
      recognitionScore: 100,
      recallScore: 92,
      speakingUsageScore: 88,
      writingUsageScore: 92,
      timesReviewed: 20,
      timesSuccessfullyUsed: 16,
      timesFailedToUse: 0,
      nextReviewDate: '2026-08-18',
      collocations: ['play a pivotal role', 'pivotal moment', 'pivotal decision'],
      b1Equivalent: 'be very important for something',
      topic: 'Business & Economics',
      speakingPrompt: {
        scenario: 'Annual Performance Appraisal',
        promptText: 'Highlight your team member\'s contribution stating they "played a pivotal role".',
        sampleTarget: 'Sarah played a pivotal role in negotiating our flagship distribution agreement.'
      },
      writingPrompt: {
        contextType: 'Case Study Summary',
        promptText: 'Summarize key factors behind success stating a specific strategy "played a pivotal role".',
        sampleTarget: 'Early investment in automated testing played a pivotal role in maintaining product quality.'
      }
    },
    {
      id: 'v-mod-4',
      expression: 'taking everything into consideration',
      meaning: 'Synthesizing all relevant factors before reaching a balanced conclusion.',
      example: 'Taking everything into consideration, the hybrid working model is most beneficial.',
      cefrLevel: 'B2',
      category: 'useful_phrases',
      status: 'learning',
      recognitionScore: 75,
      recallScore: 60,
      speakingUsageScore: 50,
      writingUsageScore: 65,
      timesReviewed: 6,
      timesSuccessfullyUsed: 3,
      timesFailedToUse: 2,
      nextReviewDate: '2026-08-08',
      collocations: ['taking everything into consideration', 'taking all factors into account'],
      b1Equivalent: 'after thinking about all things',
      topic: 'Decision Making & Discussion',
      speakingPrompt: {
        scenario: 'Strategy Evaluation Discussion',
        promptText: 'Conclude your team meeting recommendation using "taking everything into consideration".',
        sampleTarget: 'Taking everything into consideration, expanding into the Nordic region offers the strongest risk-reward profile.'
      },
      writingPrompt: {
        contextType: 'Opinion Essay Conclusion',
        promptText: 'Write a concluding sentence for an essay starting with "Taking everything into consideration".',
        sampleTarget: 'Taking everything into consideration, policy makers should balance environmental regulation with commercial competitiveness.'
      }
    },
    {
      id: 'v-mod-5',
      expression: 'weigh in on',
      meaning: 'To give an expert opinion or contribute to a discussion or decision.',
      example: 'The senior consultant was asked to weigh in on the restructuring plan.',
      cefrLevel: 'B2',
      category: 'phrasal_verbs',
      status: 'active',
      recognitionScore: 90,
      recallScore: 80,
      speakingUsageScore: 72,
      writingUsageScore: 80,
      timesReviewed: 10,
      timesSuccessfullyUsed: 7,
      timesFailedToUse: 1,
      nextReviewDate: '2026-08-12',
      collocations: ['weigh in on a discussion', 'weigh in on an issue', 'invited to weigh in on'],
      b1Equivalent: 'give an opinion on something',
      topic: 'Conversational Expressions',
      speakingPrompt: {
        scenario: 'Team Debate Session',
        promptText: 'Invite a colleague to "weigh in on" the proposed design changes.',
        sampleTarget: 'I would like to ask our lead architect to weigh in on the structural implications.'
      },
      writingPrompt: {
        contextType: 'Internal Email Thread',
        promptText: 'Ask executive stakeholders to "weigh in on" the final budget draft.',
        sampleTarget: 'Please weigh in on the revised financial targets prior to Friday\'s steering committee.'
      }
    },
    {
      id: 'v-mod-6',
      expression: 'mitigate risks',
      meaning: 'To take proactive steps to reduce the severity or probability of potential harm.',
      example: 'Proactive communication and security protocols helped mitigate risks effectively.',
      cefrLevel: 'B2',
      category: 'topic_vocab',
      status: 'active',
      recognitionScore: 88,
      recallScore: 78,
      speakingUsageScore: 65,
      writingUsageScore: 82,
      timesReviewed: 11,
      timesSuccessfullyUsed: 8,
      timesFailedToUse: 1,
      nextReviewDate: '2026-08-10',
      collocations: ['mitigate risks', 'mitigate potential harm', 'mitigate impact'],
      b1Equivalent: 'make problems less bad',
      topic: 'Problem Solving & Management',
      speakingPrompt: {
        scenario: 'Risk Assessment Briefing',
        promptText: 'Explain how your contingency plan will "mitigate risks" during transition.',
        sampleTarget: 'Implementing redundant cloud backups will mitigate risks associated with data migration.'
      },
      writingPrompt: {
        contextType: 'Compliance Brief',
        promptText: 'Outline security measures highlighting how they "mitigate risks".',
        sampleTarget: 'Adopting dual-factor authentication serves to mitigate risks of unauthorized data access.'
      }
    }
  ],

  errorLog: [
    {
      id: 'err-1',
      errorType: 'Inverted Conditional Auxiliary Order',
      originalSentence: 'Rarely we have seen such rapid growth.',
      correctedSentence: 'Rarely have we seen such rapid growth.',
      explanation: 'When starting a sentence with restrictive adverbs like "Rarely" or "Seldom", place the auxiliary verb before the subject.',
      category: 'Grammar',
      frequency: 4,
      severity: 'moderate',
      firstDetected: '2026-07-28',
      lastDetected: '2026-08-05',
      status: 'improving'
    },
    {
      id: 'err-2',
      errorType: 'Preposition after Verb',
      originalSentence: 'I discussed about the project plan.',
      correctedSentence: 'I discussed the project plan.',
      explanation: 'The verb "discuss" is transitive and takes a direct object without the preposition "about".',
      category: 'Syntax',
      frequency: 6,
      severity: 'minor',
      firstDetected: '2026-07-26',
      lastDetected: '2026-08-04',
      status: 'improving'
    },
    {
      id: 'err-3',
      errorType: 'Third Conditional Hypothetical Structure',
      originalSentence: 'If I knew about the meeting, I would go.',
      correctedSentence: 'Had I known about the meeting, I would have attended.',
      explanation: 'Past hypothetical scenarios require past perfect ("had known") and "would have + past participle" for B2 precision.',
      category: 'Grammar',
      frequency: 5,
      severity: 'critical',
      firstDetected: '2026-07-29',
      lastDetected: '2026-08-06',
      status: 'active'
    },
    {
      id: 'err-4',
      errorType: 'Overuse of Generic Adjectives',
      originalSentence: 'It was a very good solution to the big problem.',
      correctedSentence: 'It was a pragmatic solution to the pivotal challenge.',
      explanation: 'Upgrade basic B1 modifiers ("very good", "big") to precise B2 vocabulary ("pragmatic", "pivotal").',
      category: 'Vocabulary',
      frequency: 8,
      severity: 'minor',
      firstDetected: '2026-07-25',
      lastDetected: '2026-08-07',
      status: 'active'
    }
  ],

  sessionHistory: [
    {
      id: 'sess-101',
      date: '2026-08-07',
      activityType: 'Listening Comprehension',
      duration: 15,
      topic: 'Sustainable Urban Transit Podcast',
      score: 88,
      mistakes: ['Misheard exact transit funding source in fast passage'],
      vocabularyUsed: ['contentious', 'subsidies', 'infrastructure'],
      grammarUsed: ['Passive voice', 'Complex relative clauses'],
      notes: 'Strong performance on speaker attitude identification.'
    },
    {
      id: 'sess-102',
      date: '2026-08-06',
      activityType: 'Speaking Scenario',
      duration: 20,
      topic: 'Workplace Negotiation & Disagreement',
      score: 74,
      mistakes: ['Paused when forming inverted conditional'],
      vocabularyUsed: ['articulate', 'pragmatic', 'concede'],
      grammarUsed: ['Polite modals', '2nd Conditional'],
      notes: 'Demonstrated polite disagreement techniques effectively.'
    },
    {
      id: 'sess-103',
      date: '2026-08-05',
      activityType: 'Grammar Drill',
      duration: 12,
      topic: 'Conditionals & Inversion Mastery',
      score: 80,
      mistakes: ['Selected wrong auxiliary order in 1 question'],
      vocabularyUsed: ['substantiate'],
      grammarUsed: ['3rd Conditional', 'Formal Inversion'],
      notes: 'Showed steady improvement on inverted past conditional structures.'
    }
  ]
};
