import { createFileRoute } from "@tanstack/react-router";
import { AssessmentPage } from "../pages/AssessmentPage";

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "B2 Assessment — B2 English Coach" },
      {
        name: "description",
        content:
          "Take the full CEFR B2 placement assessment across grammar, vocabulary, listening, writing and speaking.",
      },
      { property: "og:title", content: "B2 Assessment — B2 English Coach" },
      {
        property: "og:description",
        content: "Full CEFR B2 assessment with AI-scored skill breakdown.",
      },
    ],
  }),
  component: AssessmentPage,
});
