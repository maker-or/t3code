import { type RuntimeMode } from "@t3tools/contracts";
import { LockIcon, LockOpenIcon, PenLineIcon, type LucideIcon } from "lucide-react";

export interface RuntimeModePresentation {
  readonly label: string;
  readonly description: string;
  readonly icon: LucideIcon;
}

export const runtimeModePresentationByMode: Record<RuntimeMode, RuntimeModePresentation> = {
  "approval-required": {
    label: "Supervised",
    description: "Ask before commands and file changes.",
    icon: LockIcon,
  },
  "auto-accept-edits": {
    label: "Auto-accept edits",
    description: "Auto-approve edits, ask before other actions.",
    icon: PenLineIcon,
  },
  "full-access": {
    label: "Full access",
    description: "Allow commands and edits without prompts.",
    icon: LockOpenIcon,
  },
};

export const runtimeModeOptions = Object.keys(runtimeModePresentationByMode) as RuntimeMode[];
