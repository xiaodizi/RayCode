import { Theme, ThemeType } from "../types/index.js";
import { getTheme, listThemes } from "./themes/index.js";

export class UIEngine {
  private currentTheme: Theme;
  private frameIndex: number = 0;

  constructor(initialTheme: ThemeType = 'aurora') {
    this.currentTheme = getTheme(initialTheme);
  }

  setTheme(type: ThemeType): void {
    this.currentTheme = getTheme(type);
  }

  getTheme(): Theme {
    return this.currentTheme;
  }

  getThemeType(): ThemeType {
    return this.currentTheme.name;
  }

  listAvailableThemes(): ReturnType<typeof listThemes> {
    return listThemes();
  }

  nextFrame(): void {
    this.frameIndex++;
  }

  getFrameIndex(): number {
    return this.frameIndex;
  }

  // Delegate all rendering to the current theme
  renderUserPrompt(): string {
    return this.currentTheme.renderUserPrompt();
  }

  renderUserMessage(message: string, width?: number): string {
    return this.currentTheme.renderUserMessage(message, width);
  }

  renderAssistantMessage(message: string, width?: number): string {
    return this.currentTheme.renderAssistantMessage(message, width);
  }

  renderThinking(): string {
    return this.currentTheme.renderThinking(this.frameIndex);
  }

  renderSuccess(message: string): string {
    return this.currentTheme.renderSuccess(message);
  }

  renderError(message: string): string {
    return this.currentTheme.renderError(message);
  }

  renderWarning(message: string): string {
    return this.currentTheme.renderWarning(message);
  }

  renderInfo(message: string): string {
    return this.currentTheme.renderInfo(message);
  }

  renderCodeBlock(code: string, language?: string): string {
    return this.currentTheme.renderCodeBlock(code, language);
  }

  renderProgress(current: number, total: number, width?: number): string {
    return this.currentTheme.renderProgress(current, total, width);
  }

  renderJSON(obj: any, indent?: number): string {
    return this.currentTheme.renderJSON(obj, indent);
  }

  renderBanner(model: string, directory: string, version: string): string {
    return this.currentTheme.renderBanner(model, directory, version, this.frameIndex);
  }

  renderFooter(): string {
    if (this.currentTheme.renderFooter) {
      return this.currentTheme.renderFooter();
    }
    return '';
  }

  renderUserPromptWithCursor(): string {
    if ('renderUserPromptWithCursor' in this.currentTheme) {
      return (this.currentTheme as any).renderUserPromptWithCursor();
    }
    return this.currentTheme.renderUserPrompt();
  }

  // Helper methods for accessing colors
  get colors() {
    return this.currentTheme.colors;
  }
}
