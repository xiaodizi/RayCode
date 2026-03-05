import type { ToolResult } from "../types/index.js";

export interface ConfirmationOptions {
  timeout?: number;
  enabled?: boolean;
  bypassFlags?: string[];
}

export interface ConfirmationRequest {
  command: string;
  cwd?: string;
  env?: Record<string, string>;
}

export interface ConfirmationResult {
  confirmed: boolean;
  reason?: string;
  bypassed?: boolean;
}

export type ConfirmationHandler = (
  request: ConfirmationRequest
) => Promise<ConfirmationResult>;

const DEFAULT_OPTIONS: Required<ConfirmationOptions> = {
  timeout: 30000,
  enabled: true,
  bypassFlags: ["--yes", "-y", "--no-confirm", "--force", "-f"],
};

export class ConfirmationGuard {
  private options: Required<ConfirmationOptions>;
  private handler: ConfirmationHandler | null = null;

  constructor(options: ConfirmationOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  setHandler(handler: ConfirmationHandler): void {
    this.handler = handler;
  }

  setEnabled(enabled: boolean): void {
    this.options.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.options.enabled;
  }

  shouldBypass(command: string): boolean {
    for (const flag of this.options.bypassFlags) {
      if (command.includes(flag)) {
        return true;
      }
    }
    return false;
  }

  async confirm(request: ConfirmationRequest): Promise<ConfirmationResult> {
    if (!this.options.enabled) {
      return { confirmed: true, bypassed: false };
    }

    if (this.shouldBypass(request.command)) {
      return { confirmed: true, bypassed: true };
    }

    if (!this.handler) {
      console.warn("ConfirmationGuard: No handler set, auto-confirming");
      return { confirmed: true, bypassed: false };
    }

    try {
      const result = await Promise.race([
        this.handler(request),
        this.createTimeout(),
      ]);
      return result;
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") {
        return { confirmed: false, reason: "Confirmation timeout" };
      }
      return {
        confirmed: false,
        reason: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private createTimeout(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        const error = new Error("Confirmation timeout");
        error.name = "TimeoutError";
        reject(error);
      }, this.options.timeout);
    });
  }

  extractCleanCommand(command: string): string {
    let clean = command;
    for (const flag of this.options.bypassFlags) {
      clean = clean.replace(new RegExp(`\\s+${flag}`, "g"), "");
      clean = clean.replace(new RegExp(`^${flag}\\s+`, "g"), "");
    }
    return clean.trim();
  }
}

export const confirmationGuard = new ConfirmationGuard();

export function createInkConfirmationHandler(): ConfirmationHandler {
  return async (request: ConfirmationRequest): Promise<ConfirmationResult> => {
    try {
      const { createInkConfirmationHandler: createHandler } = await import("../cli/ink-confirmation.js");
      const handler = createHandler();
      return handler(request);
    } catch (error) {
      console.warn("Ink confirmation unavailable, falling back to simple confirmation");
      return { confirmed: true, bypassed: false };
    }
  };
}

// Add this method to ConfirmationGuard class - since we can't easily modify the class above,
// users can call setHandler(createInkConfirmationHandler()) directly

