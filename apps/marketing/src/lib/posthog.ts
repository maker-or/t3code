const DEFAULT_POSTHOG_HOST = "https://us.i.posthog.com";
const STORAGE_KEY = "t3-marketing-posthog-distinct-id";

interface PosthogEventProperties extends Record<string, unknown> {
  readonly page?: string;
  readonly pagePath?: string;
}

function resolvePosthogKey(): string | undefined {
  return import.meta.env.PUBLIC_POSTHOG_KEY?.trim() || undefined;
}

function resolvePosthogHost(): string {
  return import.meta.env.PUBLIC_POSTHOG_HOST?.trim() || DEFAULT_POSTHOG_HOST;
}

function getDistinctId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) {
      return existing;
    }

    const next =
      window.crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.localStorage.setItem(STORAGE_KEY, next);
    return next;
  } catch {
    return null;
  }
}

export function trackPosthogEvent(event: string, properties?: PosthogEventProperties): void {
  if (typeof window === "undefined") {
    return;
  }

  const apiKey = resolvePosthogKey();
  const distinctId = getDistinctId();
  if (!apiKey || !distinctId) {
    return;
  }

  const payload = {
    api_key: apiKey,
    batch: [
      {
        event,
        distinct_id: distinctId,
        properties: {
          $process_person_profile: false,
          appVersion: import.meta.env.PUBLIC_APP_VERSION,
          clientType: "marketing-site",
          path: window.location.pathname,
          referrer: document.referrer || undefined,
          userAgent: window.navigator.userAgent,
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
