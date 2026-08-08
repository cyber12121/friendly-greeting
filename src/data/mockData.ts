import {
  LearnerProfile,
  SkillProgress,
  RecommendedActivity,
  SpeakingScenario,
  GrammarTopic,
  VocabWord,
  WritingPrompt,
  ListeningExercise
} from '../types';

export const initialProfile: LearnerProfile = {
  name: "Alex Rivera",
  email: "alex.rivera@example.com",
  currentLevel: "B1+",
  targetLevel: "B2",
  programDay: 1,
  totalProgramDays: 90,
  dailyGoalMinutes: 30,
  minutesCompletedToday: 18,
  streakDays: 4,
  correctionStrictness: "Balanced",
  nativeLanguageAssistance: true,
  preferredFocusArea: "Speaking"
};

export const initialSkillProgress: SkillProgress[] = [
  {
    skill: 'Speaking',
    currentScore: 68,
    b2TargetScore: 82,
    recentChange: 4,
    status: 'Improving',
    keyFocus: 'Using linkers (e.g. "On the other hand", "Consequently") to sustain flow.'
  },
  {
    skill: 'Listening',
    currentScore: 74,
    b2TargetScore: 85,
    recentChange: 6,
    status: 'Near Target',
    keyFocus: 'Understanding fast natural speech & subtle speaker attitude.'
  },
  {
    skill: 'Grammar',
    currentScore: 70,
    b2TargetScore: 85,
    recentChange: 3,
    status: 'Improving',
    keyFocus: 'Mastering mixed conditionals & passive structures for formal registers.'
  },
  {
    skill: 'Vocabulary',
    currentScore: 65,
    b2TargetScore: 80,
    recentChange: 5,
    status: 'Needs Work',
    keyFocus: 'Replacing basic adjectives (good/bad) with precise B2 collocations.'
  },
  {
    skill: 'Writing',
    currentScore: 62,
    b2TargetScore: 80,
    recentChange: 2,
    status: 'Needs Work',
    keyFocus: 'Structuring 4-paragraph essay arguments with smooth transitions.'
  },
  {
    skill: 'Pronunciation',
    currentScore: 72,
    b2TargetScore: 82,
    recentChange: 3,
    status: 'Improving',
    keyFocus: 'Word stress in multi-syllable academic words & intonation units.'
  }
];

export const recommendedActivities: RecommendedActivity[] = [
  {
    id: 'act-1',
    title: 'Polite Disagreement in Meetings',
    description: 'Practice expressing non-confrontational nuance using B2 modal verbs.',
    skill: 'Speaking',
    durationMinutes: 10,
    difficulty: 'B2',
    completed: false,
    route: 'speaking',
    xpReward: 50
  },
  {
    id: 'act-2',
    title: 'Conditionals Upgrade: 2nd & 3rd',
    description: 'Transform B1 simple if-clauses into sophisticated hypothetical statements.',
    skill: 'Grammar',
    durationMinutes: 8,
    difficulty: 'B1+',
    completed: true,
    route: 'grammar',
    xpReward: 40
  },
  {
    id: 'act-3',
    title: '5 Essential B2 Workplace Verbs',
    description: 'Master "articulate", "implement", "facilitate", "concede", and "substantiate".',
    skill: 'Vocabulary',
    durationMinutes: 6,
    difficulty: 'B2',
    completed: false,
    route: 'vocabulary',
    xpReward: 30
  },
  {
    id: 'act-4',
    title: 'Remote Work Opinion Essay',
    description: 'Draft a 150-word response focusing on cohesive devices.',
    skill: 'Writing',
    durationMinutes: 12,
    difficulty: 'B2',
    completed: false,
    route: 'writing',
    xpReward: 60
  }
];

export const speakingScenarios: SpeakingScenario[] = [
  {
    id: 'spk-1',
    title: 'Workplace Negotiation & Disagreement',
    description: 'Simulate a strategic meeting where you advocate for extending a project deadline while keeping stakeholder trust.',
    topic: 'Professional Negotiation',
    difficulty: 'B2',
    targetPhrases: [
      'I see your point, however...',
      'Would it be possible to consider...',
      'From my perspective...',
      'Taking everything into account...'
    ],
    initialAiMessage: "Hello Alex! Thanks for coming to this project sync. Our client wants us to launch the platform 2 weeks early. I think we should agree. What is your take on this?"
  },
  {
    id: 'spk-2',
    title: 'Environmental Sustainability Pitch',
    description: 'Discuss eco-friendly initiatives for an urban city center and evaluate prospective pros & cons.',
    topic: 'Global Issues & Solutions',
    difficulty: 'B1+',
    targetPhrases: [
      'The primary advantage is...',
      'In spite of the initial costs...',
      'This would significantly reduce...',
      'It is worth noting that...'
    ],
    initialAiMessage: "Welcome to our city council brainstorm session! We are debating whether to ban private diesel vehicles from downtown. Do you support this proposal?"
  },
  {
    id: 'spk-3',
    title: 'Describing a Memorable Travel Dilemma',
    description: 'Relate a past flight delay or missed connection using complex narrative time tenses (Past Perfect, Past Continuous).',
    topic: 'Travel & Problem Solving',
    difficulty: 'B2',
    targetPhrases: [
      'By the time I arrived...',
      'Had I known earlier...',
      'It turned out that...',
      'To make matters worse...'
    ],
    initialAiMessage: "Tell me about a time when travel plans didn't go as expected. What happened and how did you resolve the situation?"
  }
];

export const grammarTopics: GrammarTopic[] = [
  {
    id: 'gram-1',
    title: 'Hypothetical Situations: 2nd & 3rd Conditionals',
    cefrLevel: 'B2',
    category: 'Verb Tenses & Moods',
    formula: 'Had + Subject + Past Participle, Subject + would have + Past Participle',
    explanation: 'At B2 level, learners move beyond basic real conditionals (If I study, I pass) to express nuance, regret, and hypothetical scenarios in past and present timelines.',
    b1VsB2Comparison: [
      {
        b1Way: "If I have more money, I will buy a new laptop.",
        b2Way: "If I were to secure a bonus, I would invest in a high-end laptop.",
        explanation: "B2 uses subjunctive 'were to' and precise vocabulary like 'secure a bonus' instead of simple 'have money'."
      },
      {
        b1Way: "I didn't prepare well, so I lost the deal.",
        b2Way: "Had I prepared more thoroughly, I would have closed the deal.",
        explanation: "B2 employs inversion ('Had I...') for formal emphasis in conditional past structures."
      }
    ],
    examples: [
      "Had we anticipated the demand, we would have increased stock.",
      "If the council were to subsidize solar energy, adoption would surge.",
      "Supposing you were offered the job abroad, would you relocate?"
    ],
    exercises: [
      {
        id: 'ex-1',
        question: 'Select the B2 conditional sentence that correctly expresses past regret with inversion:',
        options: [
          'If I studied harder, I would pass the test.',
          'Had I known about the road closure, I would have taken the train.',
          'If I know about the road closure, I had taken the train.',
          'Should I know about the train, I would take it.'
        ],
        correctIndex: 1,
        explanation: '"Had I known..." is an inverted 3rd conditional used for past unreal regret.',
        hint: 'Look for past perfect inversion ("Had + subject + past participle").'
      },
      {
        id: 'ex-2',
        question: 'Complete the sentence: "If the management ______ to approve our proposal, we could launch next month."',
        options: [
          'was',
          'were',
          'will be',
          'is'
        ],
        correctIndex: 1,
        explanation: 'In formal B2 conditional structures, "were" is preferred over "was" for all subjects in unreal present/future.',
        hint: 'Formal conditional subjunctive prefers "were".'
      }
    ],
    sentenceProductionPrompt: {
      instruction: 'Rewrite this sentence using an inverted 3rd conditional structure: "Because we did not conduct market research, we failed to notice the competitor."',
      startingText: 'Had we...',
      targetRule: 'Inverted 3rd Conditional (Had + Subject + Past Participle)',
      sampleTarget: 'Had we conducted market research, we would not have failed to notice the competitor.'
    },
    speakingProductionPrompt: {
      scenario: 'You are explaining a project setback to your manager during a team retrospective.',
      promptText: 'Explain what would have happened if your team had received client feedback two weeks earlier, using an inverted conditional.',
      sampleTarget: 'Had we received client feedback earlier, we would have adjusted the release timeline smoothly.'
    },
    writingProductionPrompt: {
      promptText: 'Write a short 2-3 sentence formal paragraph summarizing a risk mitigation strategy using hypothetical B2 conditional structures.',
      contextType: 'Executive Summary',
      sampleTarget: 'Had the risk assessment been completed during Q1, potential supply chain delays would have been mitigated. If the board were to approve additional contingency reserves, project stability would be secured.'
    }
  },
  {
    id: 'gram-2',
    title: 'Inversion for Formal Emphasis',
    cefrLevel: 'B2',
    category: 'Sentence Structure & Register',
    formula: 'Negative/Restrictive Adverb (Not only, Seldom, Rarely) + Auxiliary Verb + Subject + Main Verb',
    explanation: 'Inversion flips the subject and auxiliary verb after negative or restrictive adverbials (e.g., "Not only", "Seldom", "Rarely") to add rhetorical weight to speech and writing.',
    b1VsB2Comparison: [
      {
        b1Way: "She is smart and she also speaks three languages.",
        b2Way: "Not only is she highly articulate, but she also speaks three languages fluently.",
        explanation: "Inversion ('Not only is she...') elevates simple addition to formal persuasion."
      }
    ],
    examples: [
      "Seldom have I witnessed such dedication from a team.",
      "Under no circumstances should sensitive data be shared.",
      "Hardly had we arrived when the keynote speech began."
    ],
    exercises: [
      {
        id: 'ex-3',
        question: 'Which sentence correctly applies B2 inversion after "Rarely"?',
        options: [
          'Rarely we see such impressive results.',
          'Rarely have we seen such impressive results.',
          'Rarely we have seen such results.',
          'Rarely do we seeing such results.'
        ],
        correctIndex: 1,
        explanation: 'After "Rarely", the auxiliary verb ("have") comes before the subject ("we").',
        hint: 'Order: Restrictive adverb + auxiliary verb + subject + main verb.'
      }
    ],
    sentenceProductionPrompt: {
      instruction: 'Transform this sentence into inverted form starting with "Not only": "The new software is cost-effective and it reduces processing time significantly."',
      startingText: 'Not only...',
      targetRule: 'Inversion after Not Only',
      sampleTarget: 'Not only is the new software cost-effective, but it also reduces processing time significantly.'
    },
    speakingProductionPrompt: {
      scenario: 'You are presenting a new product pitch to executive stakeholders.',
      promptText: 'Emphasize the unique quality of your solution using "Seldom" or "Rarely" with subject-verb inversion.',
      sampleTarget: 'Seldom have customers experienced such seamless automated onboarding.'
    },
    writingProductionPrompt: {
      promptText: 'Write a short formal memo paragraph stressing compliance regulations using inverted syntax ("Under no circumstances..." or "Not only...").',
      contextType: 'Compliance Memo',
      sampleTarget: 'Under no circumstances should client records be modified without supervisory authorization. Not only does compliance protect user privacy, but it also preserves organizational integrity.'
    }
  },
  {
    id: 'gram-3',
    title: 'Mixed Conditionals (Past Cause, Present Effect)',
    cefrLevel: 'B2+',
    category: 'Verb Tenses & Moods',
    formula: 'If + Subject + Past Perfect (Had + V3), Subject + would/could + Base Verb',
    explanation: 'Mixed conditionals connect a past unreal cause or decision with an ongoing present result (e.g. "If I had moved to London last year, I would be working in finance now").',
    b1VsB2Comparison: [
      {
        b1Way: "I didn't study medicine, so I am not a doctor today.",
        b2Way: "Had I pursued medicine in university, I would be practicing as a specialist today.",
        explanation: "Mixed conditional combines past unreal condition with present reality."
      }
    ],
    examples: [
      "If we had invested in renewable energy years ago, our operational costs would be lower now.",
      "Had she accepted the overseas assignment, she would be leading the European division today."
    ],
    exercises: [
      {
        id: 'ex-4',
        question: 'Choose the correct mixed conditional sentence structure:',
        options: [
          'If I studied engineering past, I am engineer now.',
          'If I had taken the offer last year, I would be living in Tokyo today.',
          'If I take the offer last year, I would live in Tokyo.',
          'Had I take the offer, I will be living in Tokyo.'
        ],
        correctIndex: 1,
        explanation: 'Past condition ("had taken") paired with present state ("would be living").',
        hint: 'Match past perfect condition with present modal + verb.'
      }
    ],
    sentenceProductionPrompt: {
      instruction: 'Combine these facts into a mixed conditional sentence: "We did not sign the contract in January. Consequently, we are not market leaders today."',
      startingText: 'If we had...',
      targetRule: 'Mixed Conditional (Past Cause -> Present State)',
      sampleTarget: 'If we had signed the contract in January, we would be market leaders today.'
    },
    speakingProductionPrompt: {
      scenario: 'Career coaching discussion about past decisions and present career status.',
      promptText: 'Explain how a past educational or professional choice influences your current professional situation using a mixed conditional.',
      sampleTarget: 'If I had specialized in data science earlier, I would be managing machine learning projects today.'
    },
    writingProductionPrompt: {
      promptText: 'Draft a short strategic reflection on company growth comparing past decisions with current market standing.',
      contextType: 'Business Reflection',
      sampleTarget: 'Had our team established international distribution channels two years ago, we would enjoy a dominant market share today. Continuing to expand our digital infrastructure remains essential.'
    }
  },
  {
    id: 'gram-4',
    title: 'Passive Voice for Executive & Formal Reports',
    cefrLevel: 'B2',
    category: 'Executive & Academic Register',
    formula: 'Subject + be (is/was/has been) + Past Participle + (by agent / reporting clause)',
    explanation: 'Passive structures and formal reporting verbs ("It is widely asserted that...", "The decision was finalized...") shift focus from personal pronouns to objective facts and institutional accountability.',
    b1VsB2Comparison: [
      {
        b1Way: "People say that the company lost money.",
        b2Way: "It is widely reported that the organization incurred substantial financial losses.",
        explanation: "B2 passive reporting verb construction avoids conversational 'People say'."
      }
    ],
    examples: [
      "The comprehensive audit was completed ahead of schedule.",
      "It is estimated that global demand will expand by twelve percent.",
      "Measures have been instituted to ensure full regulatory compliance."
    ],
    exercises: [
      {
        id: 'ex-5',
        question: 'Which option represents a formal B2 passive reporting structure?',
        options: [
          'They think that the policy is good.',
          'It is generally acknowledged that the policy has proven effective.',
          'Some people believe the policy works fine.',
          'We say the policy is effective.'
        ],
        correctIndex: 1,
        explanation: '"It is generally acknowledged that..." provides formal objective distance.',
        hint: 'Look for impersonal passive structure ("It is + past participle + that").'
      }
    ],
    sentenceProductionPrompt: {
      instruction: 'Rephrase this conversational sentence into a formal passive reporting structure: "Management decided to restructure the engineering division."',
      startingText: 'It was decided that...',
      targetRule: 'Passive Reporting Structure',
      sampleTarget: 'It was decided that the engineering division would be restructured.'
    },
    speakingProductionPrompt: {
      scenario: 'Delivering an official status update to board members.',
      promptText: 'Report a recent corporate decision or achievement using formal passive voice.',
      sampleTarget: 'The Q3 performance targets have been successfully met, and new quality assurance procedures were implemented.'
    },
    writingProductionPrompt: {
      promptText: 'Write a brief formal progress report section explaining project milestones completed and upcoming actions using passive voice.',
      contextType: 'Progress Report',
      sampleTarget: 'A thorough review of the system architecture was conducted during the first phase. Corrective measures have been initiated to resolve latent vulnerabilities before deployment.'
    }
  }
];

export const vocabWords: VocabWord[] = [
  {
    id: 'v-1',
    word: 'articulate',
    partOfSpeech: 'adjective / verb',
    ipa: '/ɑːrˈtɪk.jə.lət/',
    definition: 'Able to express thoughts and ideas clearly and effectively in speech or writing.',
    b1Synonym: 'clear / fluent',
    b2Example: 'She gave an articulate defense of the new environmental strategy during the panel.',
    collocations: ['articulate speaker', 'articulate vision', 'highly articulate'],
    masteryStatus: 'Learning',
    topic: 'Professional Communication'
  },
  {
    id: 'v-2',
    word: 'substantiate',
    partOfSpeech: 'verb',
    ipa: '/səbˈstæn.ʃi.eɪt/',
    definition: 'To provide evidence to support or prove the truth of a claim or argument.',
    b1Synonym: 'prove / support',
    b2Example: 'The researcher was asked to substantiate his findings with reliable survey data.',
    collocations: ['substantiate a claim', 'substantiate evidence', 'fail to substantiate'],
    masteryStatus: 'New',
    topic: 'Academic & Formal Writing'
  },
  {
    id: 'v-3',
    word: 'pivotal',
    partOfSpeech: 'adjective',
    ipa: '/ˈpɪv.ə.təl/',
    definition: 'Of crucial importance in relation to the development or success of something else.',
    b1Synonym: 'very important / key',
    b2Example: 'Securing the international partnership played a pivotal role in company growth.',
    collocations: ['pivotal moment', 'pivotal role', 'pivotal decision'],
    masteryStatus: 'Mastered',
    topic: 'Business & Economics'
  },
  {
    id: 'v-4',
    word: 'concede',
    partOfSpeech: 'verb',
    ipa: '/kənˈsiːd/',
    definition: 'To admit that something is true or valid after first denying or resisting it.',
    b1Synonym: 'admit / accept',
    b2Example: 'Although he maintained his stance initially, he ultimately conceded that the opposing strategy was more viable.',
    collocations: ['concede defeat', 'concede a point', 'unwilling to concede'],
    masteryStatus: 'Learning',
    topic: 'Negotiation & Debate'
  },
  {
    id: 'v-5',
    word: 'pragmatic',
    partOfSpeech: 'adjective',
    ipa: '/præɡˈmæt.ɪk/',
    definition: 'Solving problems in a sensible, realistic way based on practical conditions rather than theoretical rules.',
    b1Synonym: 'practical / realistic',
    b2Example: 'We need to take a pragmatic approach to solving the supply chain bottleneck.',
    collocations: ['pragmatic solution', 'pragmatic approach', 'be pragmatic about'],
    masteryStatus: 'New',
    topic: 'Problem Solving'
  }
];

export const writingPrompts: WritingPrompt[] = [
  {
    id: 'wp-1',
    title: 'Opinion Essay: Flexible & Remote Work',
    type: 'Opinion Essay',
    promptText: 'Some people argue that working remotely increases worker productivity and wellbeing, while others claim it harms team collaboration and organizational culture. Discuss both sides and give your own B2-reasoned opinion.',
    minWords: 150,
    maxWords: 250,
    recommendedTime: 20,
    usefulConnectors: [
      'On the one hand...',
      'Conversely, opponents contend that...',
      'While it is indisputable that...',
      'Ultimately, I am inclined to believe that...'
    ],
    sampleB2Answer: "In recent years, the shift toward remote work has transformed corporate dynamics. While proponents emphasize enhanced work-life balance and time saved on commuting, critics argue that physical isolation can weaken interpersonal trust and team cohesion.\n\nOn the one hand, flexibility allows employees to tailor their working environment to maximum focus. Consequently, many report higher output. On the other hand, spontaneous collaboration and creative brainstorming are often harder to foster virtually.\n\nTaking everything into consideration, I firmly believe a hybrid model strikes the ideal balance between individual autonomy and collective synergy."
  },
  {
    id: 'wp-2',
    title: 'Formal Email: Requesting Project Extension',
    type: 'Formal Email',
    promptText: 'Write a formal email to your supervisor explaining why your current software delivery deadline needs to be pushed back by one week. Provide justification and outline mitigation steps.',
    minWords: 120,
    maxWords: 180,
    recommendedTime: 15,
    usefulConnectors: [
      'I am writing to inform you that...',
      'Due to unforeseen circumstances...',
      'To mitigate any potential disruption...',
      'Thank you for your understanding and guidance.'
    ]
  }
];

export const listeningExercises: ListeningExercise[] = [
  {
    id: 'lis-1',
    title: 'Podcast: The Shift Toward Sustainable Urban Transit',
    accent: 'Standard British (RP)',
    duration: '2:15 min',
    topic: 'Environment & Technology',
    difficulty: 'B2',
    audioSimulatedText: "Welcome back to Urban Horizons. Today we analyze how European capitals are redesigning transit systems. Rather than relying solely on electric cars, urban planners are prioritizing high-speed light rail combined with extensive bicycle highways. However, funding remains a contentious topic among city delegates...",
    transcript: "Speaker A: Welcome back to Urban Horizons. Today we analyze how European capitals are redesigning transit systems.\nSpeaker B: That's right. Rather than relying solely on electric cars, urban planners are prioritizing high-speed light rail combined with extensive bicycle highways. However, funding remains a contentious topic among city delegates.\nSpeaker A: Exactly. While green subsidies have expanded, critics argue that local tax revenue is insufficient to cover maintenance long term.",
    questions: [
      {
        id: 'q-1',
        question: 'What primary alternative to electric cars are urban planners prioritizing in the podcast?',
        options: [
          'Underground highways for diesel buses',
          'High-speed light rail and extensive bicycle highways',
          'Private electric scooters exclusively',
          'Hydrogen fuel cell aircraft'
        ],
        correctIndex: 1,
        explanation: 'The transcript states: "urban planners are prioritizing high-speed light rail combined with extensive bicycle highways."',
      },
      {
        id: 'q-2',
        question: 'What main objection do critics raise regarding the new transit plans?',
        options: [
          'Citizens dislike riding bicycles',
          'Local tax revenue may be insufficient for long-term maintenance',
          'The light rail trains run too slowly',
          'Subsidies are not available anywhere'
        ],
        correctIndex: 1,
        explanation: 'Speaker A notes critics argue that "local tax revenue is insufficient to cover maintenance long term."',
      }
    ]
  }
];
