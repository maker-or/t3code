import { EditorId, type ResolvedKeybindingsConfig } from "@t3tools/contracts";
import { memo, useCallback, useEffect, useMemo } from "react";
import { CaretDownIcon } from "@phosphor-icons/react";
import { isOpenFavoriteEditorShortcut, shortcutLabelForCommand } from "../../keybindings";
import { usePreferredEditor } from "../../editorPreferences";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Group, GroupSeparator } from "../ui/group";
import { Menu, MenuItem, MenuPopup, MenuShortcut, MenuTrigger } from "../ui/menu";
import { readLocalApi } from "~/localApi";
import { resolveOpenInPickerOptions } from "./OpenInPicker.logic";

export const OpenInPicker = memo(function OpenInPicker({
  keybindings,
  availableEditors,
  openInCwd,
  iconOnly = false,
  iconButtonClassName,
}: {
  keybindings: ResolvedKeybindingsConfig;
  availableEditors: ReadonlyArray<EditorId>;
  openInCwd: string | null;
  iconOnly?: boolean;
  iconButtonClassName?: string;
}) {
  const [preferredEditor, setPreferredEditor] = usePreferredEditor(availableEditors);
  const options = useMemo(
    () => resolveOpenInPickerOptions(navigator.platform, availableEditors),
    [availableEditors],
  );
  const primaryOption = options.find(({ value }) => value === preferredEditor) ?? null;

  const openInEditor = useCallback(
    (editorId: EditorId | null) => {
      const api = readLocalApi();
      if (!api || !openInCwd) return;
      const editor = editorId ?? preferredEditor;
      if (!editor) return;
      void api.shell.openInEditor(openInCwd, editor);
      setPreferredEditor(editor);
    },
    [preferredEditor, openInCwd, setPreferredEditor],
  );

  const openFavoriteEditorShortcutLabel = useMemo(
    () => shortcutLabelForCommand(keybindings, "editor.openFavorite"),
    [keybindings],
  );

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      const api = readLocalApi();
      if (!isOpenFavoriteEditorShortcut(e, keybindings)) return;
      if (!api || !openInCwd) return;
      if (!preferredEditor) return;

      e.preventDefault();
      void api.shell.openInEditor(openInCwd, preferredEditor);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [preferredEditor, keybindings, openInCwd]);

  if (iconOnly) {
    return (
      <div className="flex items-center">
        <button
          type="button"
          aria-label="Open in editor"
          className={iconButtonClassName}
          disabled={!preferredEditor || !openInCwd}
          onClick={() => openInEditor(preferredEditor)}
        >
          {primaryOption?.Icon && <primaryOption.Icon aria-hidden="true" className="size-5" />}
        </button>
        <Menu>
          <MenuTrigger
            render={
              <button
                type="button"
                aria-label="Choose editor"
                className="inline-flex size-5 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              />
            }
            disabled={!openInCwd}
          >
            <CaretDownIcon aria-hidden="true" size={12} />
          </MenuTrigger>
          <MenuPopup align="end">
            {options.length === 0 && <MenuItem disabled>No installed editors found</MenuItem>}
            {options.map(({ label, Icon, value }) => (
              <MenuItem key={value} onClick={() => openInEditor(value)}>
                <Icon aria-hidden="true" className="text-muted-foreground" />
                {label}
                {value === preferredEditor && openFavoriteEditorShortcutLabel && (
                  <MenuShortcut>{openFavoriteEditorShortcutLabel}</MenuShortcut>
                )}
              </MenuItem>
            ))}
          </MenuPopup>
        </Menu>
      </div>
    );
  }

  return (
    <Group aria-label="Subscription actions">
      <Button
        size="xs"
        variant="outline"
        disabled={!preferredEditor || !openInCwd}
        onClick={() => openInEditor(preferredEditor)}
      >
        {primaryOption?.Icon && <primaryOption.Icon aria-hidden="true" className="size-3.5" />}
        <span className="sr-only @3xl/header-actions:not-sr-only @3xl/header-actions:ml-0.5">
          Open
        </span>
      </Button>
      <GroupSeparator className="hidden @3xl/header-actions:block" />
      <Menu>
        <MenuTrigger render={<Button aria-label="Copy options" size="icon-xs" variant="outline" />}>
          <ChevronDownIcon aria-hidden="true" className="size-4" />
        </MenuTrigger>
        <MenuPopup align="end">
          {options.length === 0 && <MenuItem disabled>No installed editors found</MenuItem>}
          {options.map(({ label, Icon, value }) => (
            <MenuItem key={value} onClick={() => openInEditor(value)}>
              <Icon aria-hidden="true" className="text-muted-foreground" />
              {label}
              {value === preferredEditor && openFavoriteEditorShortcutLabel && (
                <MenuShortcut>{openFavoriteEditorShortcutLabel}</MenuShortcut>
              )}
            </MenuItem>
          ))}
        </MenuPopup>
      </Menu>
    </Group>
  );
});
