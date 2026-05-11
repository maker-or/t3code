import {
  type EnvironmentId,
  type EditorId,
  type ProjectId,
  type ProjectScript,
  type ResolvedKeybindingsConfig,
  type ThreadId,
} from "@t3tools/contracts";
import { scopeProjectRef, scopeThreadRef } from "@t3tools/client-runtime";
import { Link, useNavigate } from "@tanstack/react-router";
import { memo, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import GitActionsControl from "../GitActionsControl";
import { type DraftId } from "~/composerDraftStore";
import { PlusMinusIcon, TerminalIcon } from "@phosphor-icons/react";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";
import ProjectScriptsControl, { type NewProjectScriptInput } from "../ProjectScriptsControl";
import { SidebarTrigger } from "../ui/sidebar";
import { OpenInPicker } from "./OpenInPicker";
import { usePrimaryEnvironmentId } from "../../environments/primary";
import { selectSidebarThreadsForProjectRefs, useStore } from "../../store";
import { buildThreadRouteParams } from "../../threadRoutes";
import { useNewThreadHandler } from "../../hooks/useHandleNewThread";
import type { SidebarThreadSummary } from "../../types";
import { ThreadRunningIndicator } from "./ThreadRunningIndicator";

const EMPTY_THREAD_SUMMARIES: readonly SidebarThreadSummary[] = [];
const DOCK_ICON_BUTTON_CLASS_NAME =
  "inline-flex size-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40";

interface ChatHeaderProps {
  activeThreadEnvironmentId: EnvironmentId;
  activeThreadId: ThreadId;
  draftId?: DraftId;
  activeProjectId: ProjectId | undefined;
  activeProjectName: string | undefined;
  threadRunning: boolean;
  isGitRepo: boolean;
  openInCwd: string | null;
  activeProjectScripts: ProjectScript[] | undefined;
  preferredScriptId: string | null;
  keybindings: ResolvedKeybindingsConfig;
  availableEditors: ReadonlyArray<EditorId>;
  terminalAvailable: boolean;
  terminalOpen: boolean;
  terminalToggleShortcutLabel: string | null;
  diffToggleShortcutLabel: string | null;
  gitCwd: string | null;
  diffOpen: boolean;
  onRunProjectScript: (script: ProjectScript) => void;
  onAddProjectScript: (input: NewProjectScriptInput) => Promise<void>;
  onUpdateProjectScript: (scriptId: string, input: NewProjectScriptInput) => Promise<void>;
  onDeleteProjectScript: (scriptId: string) => Promise<void>;
  onToggleTerminal: () => void;
  onToggleDiff: () => void;
}

export function shouldShowOpenInPicker(input: {
  readonly activeProjectName: string | undefined;
  readonly activeThreadEnvironmentId: EnvironmentId;
  readonly primaryEnvironmentId: EnvironmentId | null;
}): boolean {
  return (
    Boolean(input.activeProjectName) &&
    input.primaryEnvironmentId !== null &&
    input.activeThreadEnvironmentId === input.primaryEnvironmentId
  );
}

export const ChatHeader = memo(function ChatHeader({
  activeThreadEnvironmentId,
  activeThreadId,
  draftId,
  activeProjectId,
  activeProjectName,
  threadRunning,
  isGitRepo,
  openInCwd,
  activeProjectScripts,
  preferredScriptId,
  keybindings,
  availableEditors,
  terminalAvailable,
  terminalOpen,
  terminalToggleShortcutLabel,
  diffToggleShortcutLabel,
  gitCwd,
  diffOpen,
  onRunProjectScript,
  onAddProjectScript,
  onUpdateProjectScript,
  onDeleteProjectScript,
  onToggleTerminal,
  onToggleDiff,
}: ChatHeaderProps) {
  const navigate = useNavigate();
  const primaryEnvironmentId = usePrimaryEnvironmentId();
  const showOpenInPicker = shouldShowOpenInPicker({
    activeProjectName,
    activeThreadEnvironmentId,
    primaryEnvironmentId,
  });
  const { handleNewThread } = useNewThreadHandler();
  const activeProjectRef = useMemo(
    () => (activeProjectId ? scopeProjectRef(activeThreadEnvironmentId, activeProjectId) : null),
    [activeProjectId, activeThreadEnvironmentId],
  );
  const preferredProjectScript = useMemo(() => {
    if (!activeProjectScripts?.length) {
      return null;
    }
    return (
      activeProjectScripts.find((script) => script.id === preferredScriptId) ??
      activeProjectScripts[0] ??
      null
    );
  }, [activeProjectScripts, preferredScriptId]);
  const projectThreads = useStore(
    useShallow((store) =>
      activeProjectRef
        ? selectSidebarThreadsForProjectRefs(store, [activeProjectRef])
        : EMPTY_THREAD_SUMMARIES,
    ),
  );

  return (
    <div className="@container/header-actions flex min-w-0 flex-1 items-center gap-2">
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden sm:gap-3">
        <SidebarTrigger className="size-7 shrink-0 md:hidden" />
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {projectThreads.map((thread) => {
            const selected =
              thread.environmentId === activeThreadEnvironmentId && thread.id === activeThreadId;
            return (
              <Link
                key={`${thread.environmentId}:${thread.id}`}
                to="/$environmentId/$threadId"
                params={buildThreadRouteParams({
                  environmentId: thread.environmentId,
                  threadId: thread.id,
                })}
                className={`flex max-w-48 shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                  selected
                    ? "bg-[#101110] px-3.5 py-2 text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                }`}
                title={thread.title}
              >
                {selected && threadRunning ? <ThreadRunningIndicator active /> : null}
                <span className="truncate">{thread.title}</span>
              </Link>
            );
          })}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  aria-label="New thread"
                  className="inline-flex size-7 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  onClick={() => {
                    if (activeProjectRef) {
                      void handleNewThread(activeProjectRef);
                    }
                  }}
                />
              }
            >
              +
            </TooltipTrigger>
            <TooltipPopup side="bottom">New thread</TooltipPopup>
          </Tooltip>
        </div>
        {activeProjectName && (
          <Badge variant="outline" className="min-w-0 shrink overflow-hidden">
            <span className="min-w-0 truncate">{activeProjectName}</span>
          </Badge>
        )}
        {activeProjectName && !isGitRepo && (
          <Badge variant="outline" className="shrink-0 text-[10px] text-amber-700">
            No Git
          </Badge>
        )}
      </div>
      <div className="fixed right-3 bottom-[calc(5dvh-18px)] z-40 flex h-10 shrink-0 items-center justify-end gap-2">
        {/*{activeProjectScripts && (
          <ProjectScriptsControl
            scripts={activeProjectScripts}
            keybindings={keybindings}
            preferredScriptId={preferredScriptId}
            onRunScript={onRunProjectScript}
            onAddScript={onAddProjectScript}
            onUpdateScript={onUpdateProjectScript}
            onDeleteScript={onDeleteProjectScript}
            dockIconOnly
            dockIconButtonClassName={DOCK_ICON_BUTTON_CLASS_NAME}
          />
        )}*/}
        {/*{showOpenInPicker && (
          <OpenInPicker
            keybindings={keybindings}
            availableEditors={availableEditors}
            openInCwd={openInCwd}
            iconOnly
            iconButtonClassName={DOCK_ICON_BUTTON_CLASS_NAME}
          />
        )}*/}
        {/*{activeProjectName && (
          <GitActionsControl
            gitCwd={gitCwd}
            activeThreadRef={scopeThreadRef(
              activeThreadEnvironmentId,
              activeThreadId,
            )}
            {...(draftId ? { draftId } : {})}
            dockIconOnly
            dockIconButtonClassName={DOCK_ICON_BUTTON_CLASS_NAME}
          />
        )}*/}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                className={DOCK_ICON_BUTTON_CLASS_NAME}
                aria-pressed={terminalOpen}
                aria-label="Toggle terminal drawer"
                disabled={!terminalAvailable}
                onClick={onToggleTerminal}
              />
            }
          >
            <TerminalIcon aria-hidden="true" size={22} weight={terminalOpen ? "fill" : "regular"} />
          </TooltipTrigger>
          <TooltipPopup side="top">
            {!terminalAvailable
              ? "Terminal is unavailable until this thread has an active project."
              : terminalToggleShortcutLabel
                ? `Toggle terminal drawer (${terminalToggleShortcutLabel})`
                : "Toggle terminal drawer"}
          </TooltipPopup>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                className={DOCK_ICON_BUTTON_CLASS_NAME}
                aria-pressed={diffOpen}
                aria-label="Toggle diff panel"
                disabled={!isGitRepo && !diffOpen}
                onClick={onToggleDiff}
              />
            }
          >
            <PlusMinusIcon aria-hidden="true" size={22} weight={diffOpen ? "fill" : "regular"} />
          </TooltipTrigger>
          <TooltipPopup side="top">
            {!isGitRepo && !diffOpen
              ? "Diff panel is unavailable because this project is not a git repository."
              : diffToggleShortcutLabel
                ? `Toggle diff panel (${diffToggleShortcutLabel})`
                : "Toggle diff panel"}
          </TooltipPopup>
        </Tooltip>
      </div>
    </div>
  );
});
