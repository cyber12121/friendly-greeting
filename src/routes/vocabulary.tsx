import { createFileRoute } from "@tanstack/react-router";
import { VocabularyPage } from "../pages/VocabularyPage";

export const Route = createFileRoute("/vocabulary")({
  head: () => ({
    meta: [
      { title: "Vocabulary Builder — B2 English Coach" },
      {
        name: "description",
        content:
          "Learn and activate B2 collocations with spaced review and AI feedback on your own example sentences.",
      },
      { property: "og:title", content: "Vocabulary Builder — B2 English Coach" },
      {
        property: "og:description",
        content: "Spaced-review B2 vocabulary with AI usage feedback.",
      },
    ],
  }),
  component: VocabularyPage,
});
