const DEFAULT_POSTHOG_HOST = "https://us.i.posthog.com";
const POSTHOG_STORAGE_KEY = "t3-posthog-distinct-id";

interface PosthogEventProperties extends Record<string, unknown> {
  readonly page?: string;
  readonly pagePath?: string;
}

function resolvePosthogKey(): string | undefined {
  return import.meta.env.VITE_POSTHOG_KEY?.trim() || undefined;
}

function resolvePosthogHost(): string {
  return import.meta.env.VITE_POSTHOG_HOST?.trim() || DEFAULT_POSTHOG_HOST;
}

function getDistinctId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const existing = window.localStorage.getItem(POSTHOG_STORAGE_KEY);
    if (existing) {
      return existing;
    }

    const next =
      window.crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.localStorage.setItem(POSTHOG_STORAGE_KEY, next);
    return next;
  } catch {
    return null;
  }
}

function buildBaseProperties(): Readonly<Record<string, unknown>> {
  return {
    $process_person_profile: false,
    appVersion: import.meta.env.APP_VERSION,
    clientType: "marketing-site",
    path: window.location.pathname,
    referrer: document.referrer || undefined,
    userAgent: window.navigator.userAgent,
  };
}

export function trackPosthogEvent(event: string, properties?: PosthogEventProperties): void {
  const apiKey = resolvePosthogKey();
  const distinctId = getDistinctId();
  if (!apiKey || !distinctId || typeof window === "undefined") {
    return;
  }

  const payload = {
    api_key: apiKey,
    batch: [
      {
        event,
        distinct_id: distinctId,
        properties: {
          ...buildBaseProperties(),
          ...properties,
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  void fetch(`${resolvePosthogHost()}/batch/`, {
    body: JSON.stringify(payload),
    headers: {
      "content-type": "application/json",
    },
    keepalive: true,
    method: "POST",
    mode: "cors",
  }).catch(() => undefined);
}
