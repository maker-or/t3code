import type { RuntimeMode, ScopedThreadRef } from "@t3tools/contracts";
import type { DraftId } from "../composerDraftStore";

export type ComposerRuntimeModeTarget = ScopedThreadRef | DraftId;

export function updateComposerRuntimeMode(input: {
  target: ComposerRuntimeModeTarget;
  mode: RuntimeMode;
  isLocalDraftThread: boolean;
  setComposerDraftRuntimeMode: (target: ComposerRuntimeModeTarget, mode: RuntimeMode) => void;
  setDraftThreadContext: (
    target: ComposerRuntimeModeTarget,
    input: { runtimeMode: RuntimeMode },
  ) => void;
}): void {
  input.setComposerDraftRuntimeMode(input.target, input.mode);
  if (input.isLocalDraftThread) {
    input.setDraftThreadContext(input.target, { runtimeMode: input.mode });
  }
}
