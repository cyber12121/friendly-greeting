import { createFileRoute } from "@tanstack/react-router";
import { SpeakingPage } from "../pages/SpeakingPage";

export const Route = createFileRoute("/speaking")({
  head: () => ({
    meta: [
      { title: "Speaking Practice — B2 English Coach" },
      {
        name: "description",
        content:
          "Practise spontaneous B2 speaking with AI scenario partners and instant fluency, grammar and pronunciation feedback.",
      },
      { property: "og:title", content: "Speaking Practice — B2 English Coach" },
      {
        property: "og:description",
        content: "AI speaking scenarios with fluency and accuracy feedback.",
      },
    ],
  }),
  component: SpeakingPage,
});
