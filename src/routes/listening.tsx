import { createFileRoute } from "@tanstack/react-router";
import { ListeningPage } from "../pages/ListeningPage";

export const Route = createFileRoute("/listening")({
  head: () => ({
    meta: [
      { title: "Listening Lab — B2 English Coach" },
      {
        name: "description",
        content:
          "Train B2 listening comprehension with AI-generated audio tasks, inference questions and note-taking practice.",
      },
      { property: "og:title", content: "Listening Lab — B2 English Coach" },
      {
        property: "og:description",
        content: "AI-generated B2 listening comprehension practice.",
      },
    ],
  }),
  component: ListeningPage,
});
