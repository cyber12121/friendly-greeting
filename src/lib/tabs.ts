// The original app was a single page that swapped views with an `activeTab`
// string. Each view now has its own route, so these helpers translate between
// the legacy tab ids and real URLs.
export const TAB_PATHS: Record<string, string> = {
  dashboard: "/",
  assessment: "/assessment",
  grammar: "/grammar",
  vocabulary: "/vocabulary",
  listening: "/listening",
  speaking: "/speaking",
  writing: "/writing",
  progress: "/progress",
  planner: "/planner",
};

export function tabToPath(tab: string): string {
  return TAB_PATHS[tab] ?? "/";
}

export function pathToTab(pathname: string): string {
  const match = Object.entries(TAB_PATHS).find(
    ([, path]) => path !== "/" && pathname.startsWith(path),
  );
  return match ? match[0] : "dashboard";
}
