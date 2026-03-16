/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

import { useEffect, useCallback } from "react";

interface KeyboardShortcutsConfig {
  onToggleMic: () => void;
  onNewInterview: () => void;
  onOpenReport: () => void;
  onOpenSettings: () => void;
  onCloseModal: () => void;
  /** Whether any modal is currently open */
  hasOpenModal: boolean;
}

export function useKeyboardShortcuts({
  onToggleMic,
  onNewInterview,
  onOpenReport,
  onOpenSettings,
  onCloseModal,
  hasOpenModal,
}: KeyboardShortcutsConfig) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Esc always works (close modals)
      if (e.key === "Escape") {
        if (hasOpenModal) {
          e.preventDefault();
          onCloseModal();
        }
        return;
      }

      // Disable other shortcuts when typing
      if (isTyping) return;

      // Space → toggle mic
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        onToggleMic();
        return;
      }

      // Ctrl/Cmd + N → new interview
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        onNewInterview();
        return;
      }

      // Ctrl/Cmd + R → open report
      if ((e.ctrlKey || e.metaKey) && e.key === "r") {
        e.preventDefault();
        onOpenReport();
        return;
      }

      // Ctrl/Cmd + , → open settings
      if ((e.ctrlKey || e.metaKey) && e.key === ",") {
        e.preventDefault();
        onOpenSettings();
        return;
      }
    },
    [onToggleMic, onNewInterview, onOpenReport, onOpenSettings, onCloseModal, hasOpenModal],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
