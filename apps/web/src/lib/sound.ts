import SndModule from "snd-lib";

export const Snd: any = (SndModule as any).default || SndModule;
export const snd = new Snd();

export function playTapSound() {
  // Stop any currently playing tap sounds to prevent stacking/phasing distortion on rapid sweeps
  snd.stop(Snd.SOUNDS.TAP);
  // Play the first tap variation consistently at a lower volume
  snd.play(Snd.SOUNDS.TAP, { index: 0, volume: 0.2 });
}

export function initSound() {
  snd
    .load(Snd.KITS.SND01 as string)
    .then(() => {
      document.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        if (
          target.closest("button") ||
          target.closest("a") ||
          target.closest('[role="button"]') ||
          target.closest('[role="menuitem"]') ||
          target.closest('[role="switch"]') ||
          target.closest('[role="tab"]')
        ) {
          playTapSound();
        }
      });
    })
    .catch((err: any) => {
      console.warn("Failed to load sound kit", err);
    });
}
