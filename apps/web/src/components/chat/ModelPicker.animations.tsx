"use client";

import { useRef, useCallback, useEffect } from "react";
import { gsap } from "gsap";

const EASE_OUT = "power3.out";
const STAGGER_DELAY = 50;
const BUTTON_DURATION = 160;
const ROW_ENTER_DURATION = 400;

interface ModelPickerAnimationsConfig {
  enabled?: boolean;
}

export function useModelPickerAnimations(config: ModelPickerAnimationsConfig = {}) {
  const { enabled = true } = config;
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sidebarButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const starButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const selectedIndicatorRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const animateRowEnter = useCallback(
    (index: number) => {
      if (!enabled) return;
      const row = rowRefs.current[index];
      if (!row) return;

      gsap.fromTo(
        row,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: ROW_ENTER_DURATION / 1000,
          delay: index * STAGGER_DELAY / 1000,
          ease: EASE_OUT,
          overwrite: "auto",
        },
      );
    },
    [enabled],
  );

  const animateAllRowsEnter = useCallback(() => {
    if (!enabled) return;
    rowRefs.current.forEach((row, index) => {
      if (!row) return;
      gsap.fromTo(
        row,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: ROW_ENTER_DURATION / 1000,
          delay: index * STAGGER_DELAY / 1000,
          ease: EASE_OUT,
          overwrite: "auto",
        },
      );
    });
  }, [enabled]);

  const animateSidebarButton = useCallback(
    (button: HTMLButtonElement, isSelected: boolean) => {
      if (!enabled) return;

      gsap.fromTo(
        button,
        { scale: 0.85, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.2,
          ease: EASE_OUT,
        },
      );
    },
    [enabled],
  );

  const animateSelectedIndicator = useCallback(
    (indicator: HTMLDivElement, direction: "in" | "out") => {
      if (!enabled) return;

      if (direction === "in") {
        gsap.fromTo(
          indicator,
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, duration: 0.2, ease: EASE_OUT },
        );
      } else {
        gsap.to(indicator, { scaleX: 0, duration: 0.1, ease: EASE_OUT });
      }
    },
    [enabled],
  );

  const animateFavoriteStar = useCallback(
    (button: HTMLButtonElement, isFavorite: boolean) => {
      if (!enabled) return;

      gsap.fromTo(
        button,
        { scale: 0.5, rotation: -30 },
        {
          scale: 1,
          rotation: 0,
          duration: 0.3,
          ease: "back.out(2)",
        },
      );
    },
    [enabled],
  );

  const animateSearchFocus = useCallback(
    (container: HTMLDivElement, isFocused: boolean) => {
      if (!enabled) return;

      gsap.to(container, {
        boxShadow: isFocused
          ? "0 0 0 2px var(--primary), 0 4px 12px rgba(0,0,0,0.1)"
          : "0 1px 3px rgba(0,0,0,0.04)",
        duration: 0.2,
        ease: EASE_OUT,
      });
    },
    [enabled],
  );

  return {
    rowRefs,
    sidebarButtonRefs,
    starButtonRefs,
    selectedIndicatorRefs,
    animateRowEnter,
    animateAllRowsEnter,
    animateSidebarButton,
    animateSelectedIndicator,
    animateFavoriteStar,
    animateSearchFocus,
  };
}

export function cleanupModelPickerAnimations() {
  gsap.killTweensOf("*");
}