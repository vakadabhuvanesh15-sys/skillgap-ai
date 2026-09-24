type AnalyticsValue = string | number | boolean;
type AnalyticsData = Record<string, AnalyticsValue>;

declare global {
  interface Window {
    posthog?: {
      capture(event: string, properties?: AnalyticsData): void;
    };
    plausible?: (
      event: string,
      options?: { props?: AnalyticsData },
    ) => void;
  }
}

/**
 * Optional third-party analytics bridge.
 *
 * PostHog is the recommended provider for funnels and event properties.
 * Plausible is supported as a lightweight privacy-first alternative.
 * Neither SDK is required for the app to run, so development and preview
 * builds safely no-op until a provider is installed and configured.
 */
export function trackEvent(name: string, data?: AnalyticsData): void {
  if (typeof window === "undefined") return;

  try {
    if (window.posthog?.capture) {
      window.posthog.capture(name, data);
      return;
    }

    window.plausible?.(name, data ? { props: data } : undefined);
  } catch {
    // Analytics must never interrupt the student flow.
  }
}

function storedCareer(): string | undefined {
  try {
    const saved = localStorage.getItem("skillgap-ai-store");
    const profile = saved ? JSON.parse(saved).profile : undefined;
    return typeof profile?.targetCareer === "string"
      ? profile.targetCareer
      : undefined;
  } catch {
    return undefined;
  }
}

function eventContext(source_location: string): AnalyticsData {
  const career = storedCareer();
  return career
    ? { source_location, career }
    : { source_location };
}

if (typeof document !== "undefined") {
  document.addEventListener(
    "click",
    (event) => {
      const target = event.target as HTMLElement | null;
      const element = target?.closest<HTMLElement>("[data-testid]");
      const testId = element?.dataset.testid;
      if (!element || !testId) return;

      if (
        testId === "link-start" ||
        testId === "button-landing-start" ||
        testId === "button-landing-next-skill" ||
        testId === "button-landing-bottom"
      ) {
        trackEvent("demo_opened", {
          ...eventContext(testId === "link-start" ? "landing_header" : "landing"),
          action_type: "open",
        });
        trackEvent("onboarding_started", {
          ...eventContext("demo_entry"),
          action_type: "start",
        });
        return;
      }

      if (
        testId === "button-onboarding-next" &&
        element.textContent?.includes("Build my path")
      ) {
        trackEvent("onboarding_completed", {
          ...eventContext("onboarding"),
          action_type: "build_path",
        });
        return;
      }

      if (
        testId.startsWith("button-stage-") &&
        !element.classList.contains("checked")
      ) {
        trackEvent("roadmap_milestone_completed", {
          ...eventContext("roadmap"),
          milestone: testId.replace("button-stage-", ""),
          action_type: "complete",
        });
        return;
      }

      if (
        testId.startsWith("button-project-") &&
        element.textContent?.includes("Start project")
      ) {
        trackEvent("project_started", {
          ...eventContext("projects"),
          project: testId.replace("button-project-", ""),
          action_type: "start",
        });
        return;
      }

      if (
        testId.startsWith("button-task-") &&
        !element.classList.contains("checked")
      ) {
        trackEvent("weekly_task_completed", {
          ...eventContext("weekly_plan"),
          task: testId.replace("button-task-", ""),
          action_type: "complete",
        });
      }
    },
    { capture: true, passive: true },
  );
}