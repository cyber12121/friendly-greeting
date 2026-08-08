import { createFileRoute } from "@tanstack/react-router";
import { AdaptivePlannerView } from "../components/AdaptivePlannerView";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Adaptive Daily Planner — B2 English Coach" },
      {
        name: "description",
        content:
          "See today's AI-generated adaptive study plan with reasoning, activity timings and completion tracking.",
      },
      { property: "og:title", content: "Adaptive Daily Planner — B2 English Coach" },
      {
        property: "og:description",
        content: "Today's AI-generated adaptive English study plan.",
      },
    ],
  }),
  component: AdaptivePlannerView,
});
