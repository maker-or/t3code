import { useEffect, useRef, useState } from "react";

/** Minimum character gap before progressive reveal kicks in. */
const BUFFER_THRESHOLD = 15;
/** Reveal speed in characters per millisecond (~800 chars/sec). */
const CHARS_PER_MS = 0.8;

/**
 * Smooths out streaming text delivery for ChatMarkdown.
 *
 * During normal token-by-token streaming (≤15 chars per update), text passes
 * through instantly — the natural stream cadence IS the animation.
 *
 * When a large chunk arrives at once (>15 chars — common after tool calls or
 * when React batches several tokens into one render), the text is progressively
 * revealed at ~800 chars/sec so it looks like smooth streaming instead of a
 * jarring text dump.
 *
 * When streaming ends (`isStreaming` flips to `false`), any remaining buffered
 * text is flushed immediately so the final state is never stale.
 */
export function useStreamingReveal(targetText: string, isStreaming: boolean): string {
  const [displayed, setDisplayed] = useState(targetText);
  const revealLenRef = useRef(targetText.length);
  const rafRef = useRef(0);
  const lastTickRef = useRef(0);

  useEffect(() => {
    if (!isStreaming) {
      // Streaming ended — flush everything immediately
      cancelAnimationFrame(rafRef.current);
      revealLenRef.current = targetText.length;
      setDisplayed(targetText);
      return;
    }

    const gap = targetText.length - revealLenRef.current;

    // Small increment or text got shorter: pass through immediately.
    // Normal token-by-token streaming (1-15 chars) flows through here,
    // keeping the natural cadence of the LLM stream.
    if (gap <= BUFFER_THRESHOLD) {
      cancelAnimationFrame(rafRef.current);
      revealLenRef.current = targetText.length;
      setDisplayed(targetText);
      return;
    }

    // Large chunk (>15 chars at once) — progressively reveal.
    // This happens after tool calls, React render batching, or when
    // the server sends a big text block. Without this, the text would
    // "pop" in all at once.
    lastTickRef.current = performance.now();

    const tick = () => {
      const now = performance.now();
      const dt = now - lastTickRef.current;
      lastTickRef.current = now;

      const charsToAdd = Math.max(1, Math.round(CHARS_PER_MS * dt));
      const nextLen = Math.min(revealLenRef.current + charsToAdd, targetText.length);

      revealLenRef.current = nextLen;
      setDisplayed(targetText.slice(0, nextLen));

      if (nextLen < targetText.length) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [targetText, isStreaming]);

  return displayed;
}
