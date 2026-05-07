"use client";

import { useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";

interface DropdownAnimationOptions {
  /** Duration for open animation in ms */
  openDuration?: number;
  /** Duration for close animation in ms */
  closeDuration?: number;
  /** Enable/disable animation */
  enabled?: boolean;
}

const DEFAULT_OPEN_DURATION = 250;
const DEFAULT_CLOSE_DURATION = 150;

/**
 * Reusable hook for dropdown/popover animations.
 * Provides smooth scale + blur open/close transitions.
 */
export function useDropdownAnimation(options: DropdownAnimationOptions = {}) {
  const {
    openDuration = DEFAULT_OPEN_DURATION,
    closeDuration = DEFAULT_CLOSE_DURATION,
    enabled = true,
  } = options;
  const popupRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);

  const animateOpen = useCallback(() => {
    const popup = popupRef.current;
    if (!popup || isAnimatingRef.current || !enabled) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      gsap.set(popup, { opacity: 1, scale: 1, filter: "blur(0px)" });
      return;
    }

    isAnimatingRef.current = true;
    gsap.fromTo(
      popup,
      { opacity: 0, scale: 0.96, filter: "blur(4px)" },
      {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: openDuration / 1000,
        ease: "power3.out",
        onComplete: () => {
          isAnimatingRef.current = false;
        },
      },
    );
  }, [enabled, openDuration]);

  const animateClose = useCallback(() => {
    const popup = popupRef.current;
    if (!popup || isAnimatingRef.current || !enabled) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      gsap.set(popup, { opacity: 0, scale: 0.95, filter: "blur(4px)" });
      return;
    }

    isAnimatingRef.current = true;
    gsap.to(popup, {
      opacity: 0,
      scale: 0.95,
      filter: "blur(4px)",
      duration: closeDuration / 1000,
      ease: "power2.in",
      onComplete: () => {
        isAnimatingRef.current = false;
      },
    });
  }, [enabled, closeDuration]);

  const cleanup = useCallback(() => {
    const popup = popupRef.current;
    if (popup) {
      gsap.killTweensOf(popup);
    }
    isAnimatingRef.current = false;
  }, []);

  return {
    popupRef,
    animateOpen,
    animateClose,
    cleanup,
    isAnimating: isAnimatingRef.current,
  };
}

/**
 * Hook specifically for Select dropdowns
 */
export function useSelectDropdownAnimation(options: DropdownAnimationOptions = {}) {
  const {
    openDuration = DEFAULT_OPEN_DURATION,
    closeDuration = DEFAULT_CLOSE_DURATION,
    enabled = true,
  } = options;
  const popupRef = useRef<HTMLDivElement>(null);
  const prevOpenRef = useRef(false);

  useEffect(() => {
    const popup = popupRef.current;
    if (!popup) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Determine if opening or closing by checking visibility
    const isOpen = popup.style.opacity !== "0" && popup.style.visibility !== "hidden";

    if (isOpen && !prevOpenRef.current) {
      // Opening
      gsap.fromTo(
        popup,
        { opacity: 0, scale: 0.96, filter: "blur(4px)" },
        {
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          duration: openDuration / 1000,
          ease: "power3.out",
        },
      );
    } else if (!isOpen && prevOpenRef.current) {
      // Closing
      gsap.to(popup, {
        opacity: 0,
        scale: 0.95,
        filter: "blur(4px)",
        duration: closeDuration / 1000,
        ease: "power2.in",
      });
    }

    prevOpenRef.current = isOpen;
  }, [openDuration, closeDuration, enabled]);

  return popupRef;
}

/**
 * Hook specifically for Menu dropdowns
 */
export function useMenuDropdownAnimation(options: DropdownAnimationOptions = {}) {
  const {
    openDuration = DEFAULT_OPEN_DURATION,
    closeDuration = DEFAULT_CLOSE_DURATION,
    enabled = true,
  } = options;
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const popup = popupRef.current;
    if (!popup || !enabled) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Menu open animation - different for menus (slide + fade)
    gsap.fromTo(
      popup,
      { opacity: 0, y: -8 },
      {
        opacity: 1,
        y: 0,
        duration: openDuration / 1000,
        ease: "power3.out",
      },
    );
  }, [enabled, openDuration]);

  return popupRef;
}
