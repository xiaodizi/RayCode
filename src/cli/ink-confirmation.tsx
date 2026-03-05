import { render } from "ink";
import { ConfirmationDialog } from "./ink-confirmation/index.js";
import type { ConfirmationRequest, ConfirmationResult, ConfirmationHandler } from "../core/confirmation-guard.js";
import type { InkConfirmationOptions } from "./ink-confirmation/types.js";

export class InkConfirmation {
  private options: Required<InkConfirmationOptions>;
  private history: ConfirmationRequest[] = [];

  private static readonly DEFAULT_OPTIONS: Required<InkConfirmationOptions> = {
    theme: 'default',
    timeout: 30000,
    showDetailsByDefault: false,
  };

  constructor(options: InkConfirmationOptions = {}) {
    this.options = {
      ...InkConfirmation.DEFAULT_OPTIONS,
      theme: options.theme || 'default',
      timeout: options.timeout || 30000,
      showDetailsByDefault: options.showDetailsByDefault || false,
    };
  }

  async confirm(request: ConfirmationRequest): Promise<ConfirmationResult> {
    this.history.push(request);

    return new Promise((resolve) => {
      let timeoutId: any = null;

      const handleResult = (result: ConfirmationResult) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        resolve(result);
      };

      try {
        const { waitUntilExit } = render(
          <ConfirmationDialog request={request} onResult={handleResult} />
        );

        timeoutId = setTimeout(() => {
          handleResult({
            confirmed: false,
            reason: "Confirmation timeout",
          });
        }, this.options.timeout);

        waitUntilExit().catch(() => {
          resolve({ confirmed: false, reason: "TUI render failed, fallback used" });
        });
      } catch (error) {
        resolve({ confirmed: false, reason: "TUI initialization failed" });
      }
    });
  }

  setTheme(theme: InkConfirmationOptions['theme']): void {
    this.options.theme = theme || 'default';
  }

  getHistory(): ConfirmationRequest[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }
}

export function createInkConfirmationHandler(options?: InkConfirmationOptions): ConfirmationHandler {
  const inkConfirmation = new InkConfirmation(options);
  return (request: ConfirmationRequest) => inkConfirmation.confirm(request);
}

export type { InkConfirmationOptions };
