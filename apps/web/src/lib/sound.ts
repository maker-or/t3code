type SoundName = keyof typeof SOUND_PRESETS;

type TonePreset = {
  duration: number;
  frequency: number;
  type: OscillatorType;
  volume: number;
};

type SoundEnvironment = {
  createAudioContext: (() => AudioContext) | undefined;
  document: Document;
  matchMedia: typeof window.matchMedia | undefined;
  now: (() => number) | undefined;
};

type ManagedListener = {
  handler: EventListener;
  options: AddEventListenerOptions | boolean | undefined;
  type: string;
};

const SOUND_PRESETS = {
  click: {
    frequency: 520,
    duration: 0.06,
    type: "sine" as const,
    volume: 0.04,
  },
  // hover: {
  //   frequency: 1320,
  //   duration: 0.075,
  //   type: "triangle" as const,
  //   volume: 0.02,
  // },
} satisfies Record<string, TonePreset>;

const INTERACTIVE_SELECTOR = [
  "button",
  "a[href]",
  "summary",
  "[role='button']",
  "[role='menuitem']",
  "[role='menuitemcheckbox']",
  "[role='menuitemradio']",
  "[role='radio']",
  "[role='switch']",
  "[role='tab']",
  "[data-slot='button']",
  "[data-slot='menu-trigger']",
  "[data-slot='menu-item']",
  "[data-slot='menu-checkbox-item']",
  "[data-slot='menu-radio-item']",
].join(",");

function isHTMLElement(value: EventTarget | null): value is HTMLElement {
  return value instanceof HTMLElement;
}

function isDisabledInteractiveElement(element: HTMLElement) {
  if (element.matches(":disabled, [aria-disabled='true'], [data-disabled]")) {
    return true;
  }

  const fieldset = element.closest("fieldset");
  if (fieldset instanceof HTMLFieldSetElement && fieldset.disabled) {
    return true;
  }

  return false;
}

function isInertSubtree(element: HTMLElement) {
  return element.closest("[inert]") !== null;
}

export function resolveInteractiveElement(target: EventTarget | null) {
  if (!isHTMLElement(target)) {
    return null;
  }

  const candidate = target.closest<HTMLElement>(INTERACTIVE_SELECTOR);
  if (!candidate) {
    return null;
  }

  if (isDisabledInteractiveElement(candidate) || isInertSubtree(candidate)) {
    return null;
  }

  return candidate;
}

function createSynthSoundController(environment: SoundEnvironment) {
  let audioContext: AudioContext | null = null;
  let contextPromise: Promise<AudioContext | null> | null = null;
  let hasUserInteracted = false;
  const listeners: ManagedListener[] = [];

  const getAudioContext = async () => {
    if (audioContext) {
      if (audioContext.state === "suspended") {
        try {
          await audioContext.resume();
        } catch {
          return null;
        }
      }
      return audioContext;
    }

    if (contextPromise) {
      return contextPromise;
    }

    contextPromise = Promise.resolve()
      .then(() => {
        try {
          return environment.createAudioContext?.() ?? new AudioContext();
        } catch {
          return null;
        }
      })
      .then(async (context) => {
        if (!context) {
          return null;
        }

        if (context.state === "suspended" && hasUserInteracted) {
          try {
            await context.resume();
          } catch {
            return null;
          }
        }

        audioContext = context;
        return context;
      })
      .finally(() => {
        contextPromise = null;
      });

    return contextPromise;
  };

  const playSound = async (name: SoundName) => {
    if (!hasUserInteracted) {
      return;
    }

    const context = await getAudioContext();
    if (!context) {
      return;
    }

    const preset = SOUND_PRESETS[name];
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startAt = context.currentTime;
    const attackAt = startAt + 0.004;
    const stopAt = startAt + preset.duration;

    oscillator.type = preset.type;
    oscillator.frequency.setValueAtTime(preset.frequency, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(preset.volume, attackAt);
    gain.gain.exponentialRampToValueAtTime(0.0001, stopAt);

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(startAt);
    oscillator.stop(stopAt + 0.01);
  };

  const addManagedListener = (
    type: string,
    handler: EventListener,
    options?: AddEventListenerOptions | boolean,
  ) => {
    environment.document.addEventListener(type, handler, options);
    listeners.push({ type, handler, options });
  };

  const handleClick: EventListener = (event) => {
    if (!(event instanceof MouseEvent)) {
      return;
    }

    hasUserInteracted = true;
    if (resolveInteractiveElement(event.target)) {
      void playSound("click");
    }
  };

  const handlePointerDown = () => {
    hasUserInteracted = true;
  };

  const handleKeyDown = () => {
    hasUserInteracted = true;
  };

  return {
    init() {
      addManagedListener("pointerdown", handlePointerDown, { passive: true });
      addManagedListener("keydown", handleKeyDown, { passive: true });
      addManagedListener("click", handleClick, { passive: true });
      // Hover SFX disabled for now.
    },
    playClickSound() {
      hasUserInteracted = true;
      void playSound("click");
    },
    playHoverSound() {
      // Hover SFX disabled for now.
    },
    teardown() {
      for (const listener of listeners) {
        environment.document.removeEventListener(listener.type, listener.handler, listener.options);
      }
      listeners.length = 0;
    },
  };
}

let singletonController: ReturnType<typeof createSynthSoundController> | null = null;

export function playClickSound() {
  singletonController?.playClickSound();
}

export function playHoverSound() {
  singletonController?.playHoverSound();
}

export function initSound() {
  if (singletonController || typeof document === "undefined") {
    return;
  }

  singletonController = createSynthSoundController({
    document,
    matchMedia: typeof window !== "undefined" ? window.matchMedia.bind(window) : undefined,
    now: undefined,
    createAudioContext: undefined,
  });
  singletonController.init();
}

export function resetSoundForTests() {
  singletonController?.teardown();
  singletonController = null;
}

export const soundTestExports = {
  SOUND_PRESETS,
  createSynthSoundController,
  resolveInteractiveElement,
};
