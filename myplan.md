# T3 Code UI Redesign Plan

## Summary

Rework the web app into a strict 3-column layout without changing any backend behavior, RPC protocol, orchestration logic, or provider functionality.

The new layout will be:

- Left: compact icon-only sidebar
- Center: agent/chat panel with thread tabs
- Right: a single view panel that swaps between diff and terminal modes
- Bottom-right: icon-only action cluster for secondary controls

Assumptions locked from your answers:

- Sidebar stays permanently collapsed by default as an icon rail
- Diff and terminal are mutually exclusive modes inside the same right panel
- Bottom-right controls are icons only, with tooltips and no labels

## Scope

### In scope

- Web UI layout and component restructuring
- Sidebar visual simplification
- Chat header reorganization into thread tabs
- View panel mode switching between diff and terminal
- Bottom-right icon action cluster placement
- Responsive behavior for desktop and smaller widths, preserving existing functionality

### Out of scope

- Server behavior
- WebSocket protocol
- Orchestration event model
- Provider/session logic
- Any feature changes to agent execution, diff generation, terminal execution, or git actions

## Layout Model

### Column 1: Sidebar

- Reduce the sidebar to a narrow icon rail
- Show only project favicon or folder icon
- Remove visible search UI from the sidebar
- Keep search available only through `Cmd/Ctrl + K`
- Remove sort controls from the UI
- Remove the `T3 Code alpha` title
- Remove the `Projects` heading
- Move the add-project control to the bottom of the rail
- Remove the settings button from the sidebar entirely
- Hide per-project thread counts from the sidebar

### Column 2: Chat / Agent Panel

- Remove the current top-row actions from the thread header
- Replace them with a tab-like thread strip
- Show all threads for the active project in that strip
- Add a `+` control in the strip to create a new thread
- Keep the actual chat interaction and message flow unchanged
- Keep the thread as the main focus of the center column

### Column 3: View Panel

- Use the existing diff panel trigger and agent-edit trigger to open this column
- Reuse the same container for terminal when terminal drawer is toggled
- Treat diff and terminal as exclusive modes of the same panel
- Preserve current behavior for showing diff when files change
- Preserve current behavior for opening terminal from the toggle

### Bottom-Right Action Cluster

- Reserve the bottom-right free-space area for secondary controls
- Use icon-only buttons with tooltips
- Include:
- Settings
- Add action
- Toggle diff
- Toggle terminal
- Open IDE
- GitHub action
- Keep these visually small and non-dominant
- No text labels

## Implementation Plan

### 1. Introduce a single layout shell for the 3-column structure

- Refactor the app shell so the main workspace is explicitly partitioned into left, center, and right regions
- Ensure the shell owns the overall height/spacing rules so all three panels align consistently
- Keep the existing app routes and outlet behavior intact inside the new shell

### 2. Rebuild the sidebar as a compact rail

- Extract sidebar content into a minimal icon list
- Remove search input, sort control, title, heading, and project counts from rendering
- Keep project items clickable and visually distinct
- Move add-project to a fixed bottom slot
- Move settings out of the sidebar entirely
- Preserve project selection and active-state logic
- Use tooltip affordances where labels are no longer visible

### 3. Rework the chat header into thread tabs

- Replace header-level buttons with a thread tab strip
- Make tabs represent thread selection within the active project
- Add a `+` button for thread creation
- Preserve thread switching semantics and selection state
- Keep the rest of the chat view behavior unchanged
- Make the strip horizontally scrollable if the project has many threads

### 4. Convert the right-side area into a mode-based panel

- Make the panel switch between diff mode and terminal mode
- Preserve the existing diff entry points
- Preserve the existing terminal drawer entry point
- Ensure the panel remembers its last active mode if that is already supported by current state
- Keep mode changes local to the panel UI and do not alter underlying command handling

### 5. Move secondary actions into the bottom-right cluster

- Build a compact floating or anchored action group in the bottom-right gutter
- Wire it to the existing actions already supported by the app
- Use icon-only buttons and tooltips
- Ensure it does not conflict with the main chat composer or the right panel
- Place settings here rather than in the sidebar

### 6. Preserve existing functionality and state flows

- Do not change the server-side contract layer
- Do not change WebSocket request tags, orchestration events, or provider logic
- Reuse existing state, hooks, and handlers wherever possible
- Keep current keyboard shortcuts and command palette behavior intact
- Make sure `Cmd/Ctrl + K` remains the search entry point even though search is removed from the sidebar UI

## Likely Files to Touch

These are the areas I would expect to change during implementation:

- `apps/web/src/components/AppSidebarLayout.tsx`
- `apps/web/src/components/Sidebar.tsx`
- `apps/web/src/components/Sidebar.logic.ts`
- `apps/web/src/components/ChatView.tsx`
- `apps/web/src/components/ChatView.logic.ts`
- `apps/web/src/components/chat/ChatHeader.tsx`
- `apps/web/src/components/chat/ComposerPrimaryActions.tsx`
- `apps/web/src/components/DiffPanel.tsx`
- `apps/web/src/components/DiffPanelShell.tsx`
- `apps/web/src/components/ThreadTerminalDrawer.tsx`
- `apps/web/src/components/WebSocketConnectionSurface.tsx`
- any bottom-bar or action-cluster component currently used by the shell

This should stay entirely in `apps/web` unless a structural issue forces a shared UI helper extraction.

## Public API / Interface Impact

- No contract or protocol changes are expected
- No server API changes are expected
- If needed, a small internal UI state enum may be introduced for the right panel mode, but it should remain client-local
- Any new helper should be UI-only and should not leak into `packages/contracts`

## Edge Cases and Failure Modes

- Many threads in one project: the tab strip must scroll cleanly and remain usable
- Small window widths: the three columns must not collapse in a way that makes the app unusable
- Missing favicon: fall back to the existing folder/project icon
- Panel mode changes while streaming: mode switches must not interrupt the agent stream or lose the current conversation state
- Terminal and diff toggles fired in quick succession: the panel should deterministically show one mode at a time
- Auth or connection loss: existing connection overlays and recovery behavior must remain unchanged

## Test Plan

### UI behavior tests

- Sidebar renders without search, sort, title, heading, or visible thread counts
- Sidebar still renders project icons and bottom add-project control
- Settings is no longer in the sidebar
- Thread strip shows all threads for the active project
- `+` creates a new thread
- Right panel shows diff mode when diff is toggled
- Right panel shows terminal mode when terminal is toggled
- Right panel never shows both at once
- Bottom-right icons render without text labels

### Regression tests

- Existing chat send/receive behavior still works
- Existing diff opening from file edits still works
- Existing terminal opening still works
- Keyboard shortcut search still opens via `Cmd/Ctrl + K`
- Project and thread selection state still persists across navigation/reconnects

### Verification

- Run `bun fmt`
- Run `bun lint`
- Run `bun typecheck`
- Add or update targeted `vitest` coverage for the layout logic and the affected components
- If the UI is visually sensitive, do a browser pass after implementation to verify spacing and panel interaction

## Assumptions

- The redesign is for the web UI only
- The sidebar should be permanently compact unless you later request an explicit expand interaction
- The right panel should behave like a single mode switcher, not a split pane
- The icon-only bottom-right cluster is the final place for the relocated settings control
- Search remains available through shortcut/command palette, even though it is removed from visible sidebar UI

## Recommended Build Order

1. Build the new 3-column shell and panel sizing rules
2. Convert the sidebar to the icon rail
3. Rework the chat header into thread tabs
4. Convert the right panel into diff/terminal modes
5. Add the bottom-right icon action cluster
6. Polish responsive behavior and run the full validation pass
