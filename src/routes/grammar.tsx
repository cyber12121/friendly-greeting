import { createFileRoute } from "@tanstack/react-router";
import { GrammarPage } from "../pages/GrammarPage";

export const Route = createFileRoute("/grammar")({
  head: () => ({
    meta: [
      { title: "Grammar Lab — B2 English Coach" },
      {
        name: "description",
        content:
          "Adaptive B2 grammar lessons, controlled drills and sentence production tasks chosen from your error log.",
      },
      { property: "og:title", content: "Grammar Lab — B2 English Coach" },
      {
        property: "og:description",
        content: "Adaptive grammar drills targeting your recurring B2 errors.",
      },
    ],
  }),
  component: GrammarPage,
});
