import { useState, useCallback, useMemo } from "react";
import type { ConfirmationRequest, ConfirmationResult } from "../../core/confirmation-guard.js";
import type { ConfirmationState, ViewMode, SafetyCheckItem } from "../types.js";
import { ConfirmationUI } from "../confirmation-ui.js";

function createSafetyChecks(analysis: ReturnType<typeof ConfirmationUI.analyzeCommand>): SafetyCheckItem[] {
  return [
    { id: "review", label: "I have reviewed the command carefully", checked: false },
    { id: "backup", label: "I have backups of important data", checked: false },
    { id: "understand", label: "I understand the risks involved", checked: false },
  ];
}

export function useConfirmation(request: ConfirmationRequest) {
  const analysis = useMemo(() => ConfirmationUI.analyzeCommand(request.command), [request.command]);

  const [state, setState] = useState<ConfirmationState>({
    request,
    analysis,
    view: 'main',
    selectedIndex: 0,
    editedCommand: request.command,
    safetyChecks: createSafetyChecks(analysis),
    history: [],
  });

  const setView = useCallback((view: ViewMode) => {
    setState(prev => ({ ...prev, view }));
  }, []);

  const setSelectedIndex = useCallback((index: number) => {
    setState(prev => ({ ...prev, selectedIndex: index }));
  }, []);

  const setEditedCommand = useCallback((command: string) => {
    setState(prev => ({ ...prev, editedCommand: command }));
  }, []);

  const toggleSafetyCheck = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      safetyChecks: prev.safetyChecks.map(check =>
        check.id === id ? { ...check, checked: !check.checked } : check
      ),
    }));
  }, []);

  const confirm = useCallback((): ConfirmationResult => {
    return { confirmed: true, reason: "User confirmed via TUI" };
  }, []);

  const cancel = useCallback((): ConfirmationResult => {
    return { confirmed: false, reason: "User cancelled via TUI" };
  }, []);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      view: 'main',
      selectedIndex: 0,
      editedCommand: request.command,
      safetyChecks: createSafetyChecks(analysis),
    }));
  }, [request.command, analysis]);

  return {
    state,
    setState,
    setView,
    setSelectedIndex,
    setEditedCommand,
    toggleSafetyCheck,
    confirm,
    cancel,
    reset,
  };
}
