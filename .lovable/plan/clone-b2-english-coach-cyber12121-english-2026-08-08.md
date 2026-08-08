# Clone: B2 English Coach (cyber12121/english)

Port the full app into this project, keeping Firebase for login and saved progress and your own Gemini key for the AI features. Everything is rebuilt on this project's stack (TanStack Start) instead of the original Express + Vite SPA setup, so it runs and deploys here without a separate server.

## What gets built

All nine screens, faithful to the original:

- Dashboard, Assessment, Progress
- Skill pages: Grammar, Vocabulary, Listening, Speaking, Writing
- Settings, Login

Plus the shared shell: header, desktop sidebar, mobile bottom nav, and the daily guided micro-lesson modal.

The original switched pages with a tab variable in one big component. Here each page becomes its own URL (`/`, `/grammar`, `/speaking`, `/progress`, …) so links, refresh, and the back button work. Navigation highlights the active page from the URL.

## Data, login, and AI

- **Firebase**: login (email/password + Google) and Firestore progress storage are carried over as-is using the Firebase web SDK in the browser. The repo already commits its Firebase web config, so I'll reuse those values — no keys to paste. If you'd rather point at a different Firebase project, say the word and I'll swap the config.
- **Gemini**: the original's `/api/ai/*` Express endpoints are recreated as server-side functions in this project (daily plan, speaking analysis, grammar lesson/exercise, vocabulary, writing, listening, assessment, evaluations). Prompts and model calls stay server-side; your `GEMINI_API_KEY` is stored as a project secret and never reaches the browser.
- The learner-profile, adaptive-planner, cross-skill, grammar and vocabulary engines plus the mock data are ported unchanged in behaviour.

## Technical notes

- New route files under `src/routes/` (one per page) with a shared layout route rendering header/sidebar/mobile nav/lesson modal around `<Outlet />`; `src/routes/index.tsx` becomes the Dashboard. `AppContext` keeps global UI state minus the tab switching; `AuthContext` is ported and gates authenticated pages, redirecting to `/login`.
- `server/aiService.ts` + `server/prompts.ts` move to server-only modules; each Express route becomes a `createServerFn` in `src/lib/ai.functions.ts`, called from components via `useServerFn`/TanStack Query. `src/services/aiClientService.ts` is rewritten to call those instead of `fetch('/api/ai/...')`. `server.ts` and the Express/tsx/esbuild scripts are dropped.
- Dependencies added: `firebase`, `@google/genai`, `lucide-react`, `motion`. Tailwind styling from `src/index.css` is merged into this project's `src/styles.css` as theme tokens; the original's hardcoded slate/indigo palette is mapped to semantic tokens so it stays consistent.
- `firestore.rules` is carried over as reference; it must be deployed from your own Firebase console.
- Per-page `head()` metadata (titles/descriptions) added for each route.

## Sequence

1. Install dependencies, port styles/types/data/engines.
2. Auth + app context, layout shell, navigation.
3. Server-side AI functions + client service, secret for `GEMINI_API_KEY`.
4. All nine pages and the lesson modal.
5. Build check and a browser pass over each route.

Note: I'll need to store your Gemini API key as a project secret before the AI screens can work — I'll prompt for it during implementation.
