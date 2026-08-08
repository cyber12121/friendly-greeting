import { createFileRoute } from "@tanstack/react-router";
import { ProgressPage } from "../pages/ProgressPage";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress & Analytics — B2 English Coach" },
      {
        name: "description",
        content:
          "Track CEFR skill estimates, grammar mastery, vocabulary activation and weekly progress toward B2.",
      },
      { property: "og:title", content: "Progress & Analytics — B2 English Coach" },
      {
        property: "og:description",
        content: "Skill-by-skill CEFR analytics and mastery evidence.",
      },
    ],
  }),
  component: ProgressPage,
});
