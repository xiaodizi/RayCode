import type { ConfirmationRequest, ConfirmationResult } from "../../core/confirmation-guard.js";
import type { CommandAnalysis } from "../confirmation-ui.js";
import type { RiskLevel } from "../confirmation-ui.js";

export type ViewMode = 'main' | 'detail' | 'editor';

export interface SafetyCheckItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface ConfirmationState {
  request: ConfirmationRequest;
  analysis: CommandAnalysis;
  view: ViewMode;
  selectedIndex: number;
  editedCommand: string;
  safetyChecks: SafetyCheckItem[];
  history: ConfirmationRequest[];
  result?: ConfirmationResult;
}

export interface InkConfirmationOptions {
  theme?: 'default' | 'cyberpunk' | 'minimal';
  timeout?: number;
  showDetailsByDefault?: boolean;
}

export interface ButtonConfig {
  label: string;
  shortcut?: string;
  action: () => void;
  variant: 'primary' | 'danger' | 'secondary';
}
