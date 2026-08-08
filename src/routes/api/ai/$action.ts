import { createFileRoute } from "@tanstack/react-router";

type Body = Record<string, any>;

async function dispatch(action: string, body: Body) {
  const { aiService } = await import("../../../lib/ai/aiService.server");
  const ctx = body.context ?? {};

  switch (action) {
    case "daily-plan":
      return aiService.generateDailyPlan(ctx);
    case "analyze-speaking":
      return aiService.analyzeSpeaking(ctx, body.payload);
    case "evaluate-speaking-session":
      return aiService.evaluateSpeakingSession(ctx, body.payload);
    case "grammar-lesson":
      return aiService.generateGrammarLesson(ctx, body.topicName);
    case "grammar-exercise":
      return aiService.generateGrammarExercise(ctx, body.topicName, body.count ?? 3);
    case "evaluate-grammar-production":
      return aiService.evaluateGrammarProduction(ctx, body.payload);
    case "vocab-lesson":
      return aiService.generateVocabularyLesson(ctx, body.target);
    case "analyze-vocab":
      return aiService.analyzeVocabularyUsage(ctx, body.targetWord, body.userSentence);
    case "evaluate-vocab-production":
      return aiService.evaluateVocabProduction(ctx, body.payload);
    case "analyze-writing":
      return aiService.analyzeWriting(ctx, body.payload);
    case "generate-writing-task":
      return aiService.generateAdaptiveWritingTask(ctx, body.payload);
    case "analyze-writing-draft":
      return aiService.analyzeWritingDraft(ctx, body.payload);
    case "analyze-writing-revision":
      return aiService.analyzeWritingRevision(ctx, body.payload);
    case "listening-questions":
      return aiService.generateListeningQuestions(ctx, body.topic, body.difficulty ?? "B2");
    case "assess-cefr":
      return aiService.assessCEFR(ctx, body.performanceSummary);
    case "update-profile":
      return aiService.updateLearnerProfile(ctx, body.recentSessionData);
    case "weekly-review":
      return aiService.generateWeeklyReview(ctx, body.weeklyActivityLog);
    case "evaluate-b2-assessment":
      return aiService.evaluateB2Assessment(ctx, body.payload);
    default:
      return null;
  }
}

export const Route = createFileRoute("/api/ai/$action")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const action = params.action;
        try {
          const body = (await request.json()) as Body;
          const result = await dispatch(action, body);
          if (result === null) {
            return Response.json({ error: `Unknown AI action: ${action}` }, { status: 404 });
          }
          return Response.json(result);
        } catch (err) {
          console.error(`AI action ${action} failed:`, err);
          const message = err instanceof Error ? err.message : "AI request failed";
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});
