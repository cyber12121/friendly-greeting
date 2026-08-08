import { createFileRoute } from "@tanstack/react-router";
import { WritingPage } from "../pages/WritingPage";

export const Route = createFileRoute("/writing")({
  head: () => ({
    meta: [
      { title: "Writing Studio — B2 English Coach" },
      {
        name: "description",
        content:
          "Draft, revise and refine B2 essays and emails with AI feedback on register, cohesion and accuracy.",
      },
      { property: "og:title", content: "Writing Studio — B2 English Coach" },
      {
        property: "og:description",
        content: "AI-guided B2 writing drafts, revisions and error tracking.",
      },
    ],
  }),
  component: WritingPage,
});
