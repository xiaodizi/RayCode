import { Theme, ThemeType } from "../../types/index.js";

export class MinimalTheme implements Theme {
  name: ThemeType = 'minimal';
  displayName = 'Minimal Dark';
  description = 'Clean, minimal dark theme inspired by VS Code';

  static readonly COLORS = {
    primary: "\x1b[38;2;59;130;246m",        // Focus Blue #3B82F6
    secondary: "\x1b[38;2;229;231;235m",      // Light Gray #E5E7EB
    accent: "\x1b[38;2;16;185;129m",           // Success Green #10B981
    text: "\x1b[38;2;255;255;255m",            // Pure White
    muted: "\x1b[38;2;107;114;128m",           // Medium Gray #6B7280
    gray: "\x1b[38;2;156;163;175m",            // Gray #9CA3AF
    success: "\x1b[38;2;16;185;129m",          // Success Green
    error: "\x1b[38;2;239;68;68m",             // Red #EF4444
    warning: "\x1b[38;2;245;158;11m",          // Amber #F59E0B
    info: "\x1b[38;2;59;130;246m",             // Focus Blue
    reset: "\x1b[0m",
    user: "\x1b[38;2;255;255;255m",            // White
    assistant: "\x1b[38;2;229;231;235m",       // Light Gray
    thinking: "\x1b[38;2;107;114;128m",         // Medium Gray
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    background: "\x1b[48;2;17;24;39m",         // Slate 900 #111827
    border: "\x1b[38;2;55;65;81m",              // Slate 700 #374151
  };

  readonly colors = MinimalTheme.COLORS;

  static readonly BANNER_COLORS = {
    top: "\x1b[38;2;229;231;235m",       // Light Gray
    middle: "\x1b[38;2;156;163;175m",    // Gray
    bottom: "\x1b[38;2;107;114;128m",    // Medium Gray
    accent: "\x1b[38;2;59;130;246m",      // Focus Blue
  };

  readonly bannerColors = MinimalTheme.BANNER_COLORS;

  renderUserPrompt(): string {
    const { muted, reset } = this.colors;
    return `${muted}>${reset} `;
  }

  renderUserMessage(message: string, _width?: number): string {
    const { text, bold, reset } = this.colors;
    return `\n${bold}You${reset}
${text}${message}${reset}\n`;
  }

  renderAssistantMessage(message: string, _width?: number): string {
    const { secondary, bold, reset } = this.colors;
    return `\n${bold}RayCode${reset}
${secondary}${message}${reset}\n`;
  }

  renderThinking(frameIndex = 0): string {
    const { thinking, reset } = this.colors;
    const spinners = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    const spinner = spinners[frameIndex % spinners.length];
    return `${thinking}${spinner} Thinking...${reset}`;
  }

  renderSuccess(message: string): string {
    const { success, text, reset } = this.colors;
    return `${success}✓${reset} ${text}${message}${reset}`;
  }

  renderError(message: string): string {
    const { error, text, reset } = this.colors;
    return `${error}✗${reset} ${text}${message}${reset}`;
  }

  renderWarning(message: string): string {
    const { warning, text, reset } = this.colors;
    return `${warning}⚠${reset} ${text}${message}${reset}`;
  }

  renderInfo(message: string): string {
    const { info, text, reset } = this.colors;
    return `${info}ℹ${reset} ${text}${message}${reset}`;
  }

  renderCodeBlock(code: string, language?: string): string {
    const { muted, text, reset, border, gray } = this.colors;

    const lines = code.split("\n");
    const maxDigits = lines.length.toString().length;

    const formatted = lines
      .map((line, idx) => {
        const lineNumber = (idx + 1).toString().padStart(maxDigits, " ");
        return `${muted}${lineNumber} ${border}│${reset} ${text}${line}${reset}`;
      })
      .join("\n");

    const header = language
      ? `${gray}┌─ ${language} ─${"─".repeat(Math.max(0, 50 - language.length))}┐${reset}\n`
      : "";
    const footer = language
      ? `\n${gray}└${"─".repeat(language.length + 52)}┘${reset}`
      : "";

    return header + formatted + footer;
  }

  renderProgress(current: number, total: number, width = 40): string {
    const { primary, muted, reset } = this.colors;

    const percentage = Math.round((current / total) * 100);
    const filled = Math.round((current / total) * width);
    const empty = width - filled;

    const bar = `${primary}█${reset}`.repeat(filled) + `${muted}░${reset}`.repeat(empty);

    return `${primary}[${bar}${primary}]${reset} ${muted}${percentage}%${reset}`;
  }

  renderJSON(obj: any, indent = 2): string {
    const { text, primary, muted, gray, reset } = this.colors;

    const jsonStr = JSON.stringify(obj, null, indent);

    return jsonStr
      .replace(/"([^"]*)"\s*:/g, `${primary}"$1"${reset}:`)
      .replace(/:\s*"([^"]*)"/g, `: "${text}$1${reset}"`)
      .replace(/:\s*(true|false|null)/g, `: ${muted}$1${reset}`)
      .replace(/:\s*(\d+)/g, `: ${gray}$1${reset}`);
  }

  renderBanner(model: string, directory: string, version: string, _frame = 0): string {
    const { accent } = MinimalTheme.BANNER_COLORS;
    const { text, muted, reset, bold, secondary } = this.colors;

    const modelDisplay = model.length > 20 ? model.substring(0, 17) + "..." : model;
    const dirDisplay = directory.length > 40 ? "..." + directory.substring(directory.length - 37) : directory;

    return `
${bold}${text}RayCode${reset} ${accent}v${version}${reset}

${muted}Model:${reset} ${text}${modelDisplay}${reset}
${muted}Directory:${reset} ${text}${dirDisplay}${reset}

${secondary}────────────────────────────────────────────────────────────────────────${reset}
`;
  }
}
