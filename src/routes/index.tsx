import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "../pages/DashboardPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — B2 English Coach" },
      {
        name: "description",
        content:
          "Your adaptive CEFR B2 English coaching dashboard: daily plan, streaks, skill scores and AI-guided practice.",
      },
      { property: "og:title", content: "Dashboard — B2 English Coach" },
      {
        property: "og:description",
        content: "Adaptive AI coaching toward CEFR B2 English mastery.",
      },
    ],
  }),
  component: DashboardPage,
});
