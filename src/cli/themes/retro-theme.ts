import { Theme, ThemeType } from "../../types/index.js";

export class RetroTheme implements Theme {
  name: ThemeType = 'retro';
  displayName = 'Retro Terminal';
  description = '80s/90s terminal with green/amber colors';

  static readonly COLORS = {
    primary: "\x1b[38;2;51;255;51m",
    secondary: "\x1b[38;2;255;176;0m",
    accent: "\x1b[38;2;51;255;51m",
    text: "\x1b[38;2;51;255;51m",
    muted: "\x1b[38;2;0;51;0m",
    gray: "\x1b[38;2;102;102;102m",
    success: "\x1b[38;2;51;255;51m",
    error: "\x1b[38;2;255;51;51m",
    warning: "\x1b[38;2;255;102;0m",
    info: "\x1b[38;2;51;255;51m",
    reset: "\x1b[0m",
    user: "\x1b[38;2;51;255;51m",
    assistant: "\x1b[38;2;255;176;0m",
    thinking: "\x1b[38;2;51;255;51m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    background: "\x1b[48;2;0;0;0m",
    border: "\x1b[38;2;51;255;51m",
  };

  readonly colors = RetroTheme.COLORS;

  static readonly BANNER_COLORS = {
    top: "\x1b[38;2;51;255;51m",
    middle: "\x1b[38;2;51;255;51m",
    bottom: "\x1b[38;2;51;255;51m",
    accent: "\x1b[38;2;255;176;0m",
  };

  readonly bannerColors = RetroTheme.BANNER_COLORS;

  renderUserPrompt(): string {
    const { primary, reset } = this.colors;
    return `${primary}READY>${reset} `;
  }

  renderUserMessage(message: string, _width?: number): string {
    const { primary, text, reset } = this.colors;
    return `\n${primary}USER>${reset} ${text}${message}${reset}`;
  }

  renderAssistantMessage(message: string, _width?: number): string {
    const { secondary, text, reset } = this.colors;
    return `\n${secondary}RAYCODE>${reset} ${text}${message}${reset}`;
  }

  renderThinking(frameIndex = 0): string {
    const { thinking, muted, reset } = this.colors;
    const spinners = ["|", "/", "-", "\\"];
    const spinner = spinners[frameIndex % spinners.length];
    return `${thinking}${spinner}${reset} ${muted}PROCESSING${reset}`;
  }

  renderSuccess(message: string): string {
    const { success, text, reset } = this.colors;
    return `${success}OK:${reset} ${text}${message}${reset}`;
  }

  renderError(message: string): string {
    const { error, text, reset } = this.colors;
    return `${error}ERROR:${reset} ${text}${message}${reset}`;
  }

  renderWarning(message: string): string {
    const { warning, text, reset } = this.colors;
    return `${warning}WARNING:${reset} ${text}${message}${reset}`;
  }

  renderInfo(message: string): string {
    const { info, text, reset } = this.colors;
    return `${info}INFO:${reset} ${text}${message}${reset}`;
  }

  renderCodeBlock(code: string, language?: string): string {
    const { muted, text, reset, border } = this.colors;

    const lines = code.split("\n");
    const maxDigits = lines.length.toString().length;

    const formatted = lines
      .map((line, idx) => {
        const lineNumber = (idx + 1).toString().padStart(maxDigits, " ");
        return `${muted}${lineNumber} ${border}|${reset} ${text}${line}${reset}`;
      })
      .join("\n");

    const header = language
      ? `${border}+-- ${language} --${"-".repeat(Math.max(0, 50 - language.length))}+${reset}\n`
      : `${border}+${"-".repeat(60)}+${reset}\n`;
    const footer = language
      ? `\n${border}+${"-".repeat(language.length + 52)}+${reset}`
      : `\n${border}+${"-".repeat(60)}+${reset}`;

    return header + formatted + footer;
  }

  renderProgress(current: number, total: number, width = 40): string {
    const { primary, muted, reset, accent } = this.colors;

    const percentage = Math.round((current / total) * 100);
    const filled = Math.round((current / total) * width);
    const empty = width - filled;

    const bar = `${primary}#${reset}`.repeat(filled) + `${muted}.${reset}`.repeat(empty);

    return `${primary}[${bar}${primary}]${reset} ${accent}${percentage}%${reset}`;
  }

  renderJSON(obj: any, indent = 2): string {
    const { text, primary, secondary, accent, reset } = this.colors;

    const jsonStr = JSON.stringify(obj, null, indent);

    return jsonStr
      .replace(/"([^"]*)"\s*:/g, `${primary}"$1"${reset}:`)
      .replace(/:\s*"([^"]*)"/g, `: "${text}$1${reset}"`)
      .replace(/:\s*(true|false|null)/g, `: ${secondary}$1${reset}`)
      .replace(/:\s*(\d+)/g, `: ${accent}$1${reset}`);
  }

  renderBanner(model: string, directory: string, version: string, _frame = 0): string {
    const { top, accent } = RetroTheme.BANNER_COLORS;
    const { text, muted, reset, bold } = this.colors;

    const logo = [
      `${top}    ========================================`,
      `${top}    ||  RAYCODE TERMINAL SYSTEM v${version}  ||`,
      `${top}    ========================================`,
    ];

    const modelDisplay = model.length > 20 ? model.substring(0, 17) + "..." : model;
    const dirDisplay = directory.length > 30 ? "..." + directory.substring(directory.length - 27) : directory;

    return `
${logo.join("\n")}
${reset}
${muted}=========================================================================${reset}
${muted}||${reset}  ${bold}SYSTEM:${reset} RAYCODE v${text}${version}${reset}  ${bold}MODEL:${reset} ${text}${modelDisplay}${reset}
${muted}||${reset}  ${bold}DIR:${reset} ${text}${dirDisplay}${reset}
${muted}||${reset}  ${bold}BAUD:${reset} 9600  ${bold}PORT:${reset} COM1  ${bold}STATUS:${reset} ${accent}ONLINE${reset}
${muted}=========================================================================${reset}
${muted}-------------------------------------------------------------------------${reset}
`;
  }
}
