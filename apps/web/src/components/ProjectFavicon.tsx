import { useEffect, useRef, memo } from "react";
import { gsap } from "gsap";
import type { CSSProperties } from "react";
import type { EnvironmentId } from "@t3tools/contracts";

const ACTIVE_PROJECT_ICON_COLOR_SETS = [
  { primary: "#506546", secondary: "#132E1E", text: "#6D9C4D" },
  { primary: "#425860", secondary: "#1C2836", text: "#496F92" },
  { primary: "#60425F", secondary: "#361C2F", text: "#86468C" },
  { primary: "#604E42", secondary: "#36291C", text: "#8C6346" },
  { primary: "#604242", secondary: "#361C1C", text: "#8C4746" },
  { primary: "#444260", secondary: "#291C36", text: "#5A468C" },
] as const;

const INACTIVE_PROJECT_ICON_COLORS = {
  primary: "#222523",
  secondary: "#000000",
  text: "#3A3A3A",
} as const;

function initialsForProject(value: string): string {
  const parts = value
    .trim()
    .split(/[\s._/-]+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }

  return (parts[0] ?? value).slice(0, 2).toUpperCase();
}

function activeColorSetForProject(value: string): (typeof ACTIVE_PROJECT_ICON_COLOR_SETS)[number] {
  let hash = 0;
  for (let index = 0; index < value.length; index++) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return ACTIVE_PROJECT_ICON_COLOR_SETS[hash % ACTIVE_PROJECT_ICON_COLOR_SETS.length]!;
}

export const ProjectFavicon = memo(function ProjectFavicon(input: {
  environmentId: EnvironmentId;
  cwd: string;
  projectName?: string;
  active?: boolean;
  className?: string;
}) {
  const label =
    input.projectName?.trim() || input.cwd.split(/[\\/]/).filter(Boolean).at(-1) || "PR";
  const colors = input.active ? activeColorSetForProject(label) : INACTIVE_PROJECT_ICON_COLORS;

  const spanRef = useRef<HTMLSpanElement>(null);
  const prevActiveRef = useRef(input.active);

  useEffect(() => {
    const span = spanRef.current;
    if (!span) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      span.style.setProperty("--project-icon-primary", colors.primary);
      span.style.setProperty("--project-icon-secondary", colors.secondary);
      span.style.setProperty("--project-icon-text", colors.text);
      return;
    }

    // Only animate if active state changed
    if (prevActiveRef.current !== input.active) {
      gsap.to(span, {
        "--project-icon-primary": colors.primary,
        "--project-icon-secondary": colors.secondary,
        "--project-icon-text": colors.text,
        duration: 0.25,
        ease: "power3.out",
      });
      prevActiveRef.current = input.active;
    } else {
      // Initial render - set values directly
      span.style.setProperty("--project-icon-primary", colors.primary);
      span.style.setProperty("--project-icon-secondary", colors.secondary);
      span.style.setProperty("--project-icon-text", colors.text);
    }
  }, [input.active, colors]);

  return (
    <span
      ref={spanRef}
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-[4px] bg-[linear-gradient(180deg,var(--project-icon-primary)_0%,var(--project-icon-secondary)_100%)] leading-none text-[var(--project-icon-text)] tracking-[-0.04em] ${input.className ?? ""}`}
    >
      {initialsForProject(label)}
    </span>
  );
});
