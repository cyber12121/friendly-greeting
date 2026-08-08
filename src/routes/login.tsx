import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LoginPage } from "../pages/LoginPage";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Account & Sign In — B2 English Coach" },
      {
        name: "description",
        content:
          "Sign in to sync your B2 learner profile, progress history and adaptive plan across devices.",
      },
      { property: "og:title", content: "Account & Sign In — B2 English Coach" },
      {
        property: "og:description",
        content: "Sign in to sync your B2 learner profile and progress.",
      },
    ],
  }),
  component: LoginRoute,
});

function LoginRoute() {
  const navigate = useNavigate();
  return <LoginPage onContinue={() => void navigate({ to: "/" })} />;
}
