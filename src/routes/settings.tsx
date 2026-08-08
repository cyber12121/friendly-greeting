import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "../pages/SettingsPage";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — B2 English Coach" },
      {
        name: "description",
        content:
          "Configure your daily study goal, target CEFR level, correction strictness and coaching preferences.",
      },
      { property: "og:title", content: "Settings — B2 English Coach" },
      {
        property: "og:description",
        content: "Personalise study goals and coaching preferences.",
      },
    ],
  }),
  component: SettingsPage,
});
