import { Theme, ThemeType } from "../../types/index.js";

export class AuroraTheme implements Theme {
  name: ThemeType = 'aurora';
  displayName = 'Aurora Gradient';
  description = 'Soft gradient colors inspired by aurora borealis';

  static readonly COLORS = {
    primary: "\x1b[38;2;139;92;246m",      // Aurora Purple #8B5CF6
    secondary: "\x1b[38;2;59;130;246m",    // Aurora Blue #3B82F6
    accent: "\x1b[38;2;6;182;212m",         // Aurora Cyan #06B6D4
    text: "\x1b[38;2;248;250;252m",         // Pure white text
    muted: "\x1b[38;2;148;163;184m",        // Slate gray
    gray: "\x1b[38;2;100;116;139m",         // Slate 500
    success: "\x1b[38;2;16;185;129m",       // Emerald green
    error: "\x1b[38;2;239;68;68m",          // Red
    warning: "\x1b[38;2;245;158;11m",       // Amber
    info: "\x1b[38;2;6;182;212m",           // Cyan
    reset: "\x1b[0m",
    user: "\x1b[38;2;139;92;246m",          // Aurora Purple
    assistant: "\x1b[38;2;59;130;246m",     // Aurora Blue
    thinking: "\x1b[38;2;236;72;153m",      // Aurora Pink
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    background: "\x1b[48;2;15;23;42m",      // Slate 900
    border: "\x1b[38;2;51;65;85m",           // Slate 700
  };

  readonly colors = AuroraTheme.COLORS;

  static readonly BANNER_COLORS = {
    top: "\x1b[38;2;139;92;246m",     // Purple
    middle: "\x1b[38;2;59;130;246m",  // Blue
    bottom: "\x1b[38;2;6;182;212m",    // Cyan
    accent: "\x1b[38;2;236;72;153m",   // Pink
  };

  readonly bannerColors = AuroraTheme.BANNER_COLORS;

  renderUserPrompt(): string {
    const { primary, reset } = this.colors;
    return `${primary}❯${reset} `;
  }

  renderUserMessage(message: string, _width?: number): string {
    const { primary, text, reset, bold } = this.colors;
    return `\n${primary}╭──────────────────────────────────────────────────────╮${reset}
${primary}│${reset} ${bold}You${reset}
${primary}╰──────────────────────────────────────────────────────╯${reset}
${text}${message}${reset}\n`;
  }

  renderAssistantMessage(message: string, _width?: number): string {
    const { secondary, text, reset, bold } = this.colors;
    return `\n${secondary}╭──────────────────────────────────────────────────────╮${reset}
${secondary}│${reset} ${bold}RayCode${reset}
${secondary}╰──────────────────────────────────────────────────────╯${reset}
${text}${message}${reset}\n`;
  }

  renderThinking(frameIndex = 0): string {
    const { thinking, muted, reset } = this.colors;
    const spinners = ["◐", "◓", "◑", "◒"];
    const spinner = spinners[frameIndex % spinners.length];
    return `${thinking}${spinner}${reset} ${muted}Thinking...${reset}`;
  }

  renderSuccess(message: string): string {
    const { success, text, reset } = this.colors;
    return `${success}✅${reset} ${text}${message}${reset}`;
  }

  renderError(message: string): string {
    const { error, text, reset } = this.colors;
    return `${error}❌${reset} ${text}${message}${reset}`;
  }

  renderWarning(message: string): string {
    const { warning, text, reset } = this.colors;
    return `${warning}⚠️${reset} ${text}${message}${reset}`;
  }

  renderInfo(message: string): string {
    const { info, text, reset } = this.colors;
    return `${info}ℹ️${reset} ${text}${message}${reset}`;
  }

  renderCodeBlock(code: string, language?: string): string {
    const { muted, text, reset, border, accent } = this.colors;

    const lines = code.split("\n");
    const maxDigits = lines.length.toString().length;

    const formatted = lines
      .map((line, idx) => {
        const lineNumber = (idx + 1).toString().padStart(maxDigits, " ");
        return `${muted}${lineNumber} ${border}│${reset} ${text}${line}${reset}`;
      })
      .join("\n");

    const header = language
      ? `${border}╭── ${accent}${language}${reset} ${border}${"─".repeat(Math.max(0, 50 - language.length))}╮${reset}\n`
      : `${border}╭${"─".repeat(60)}╮${reset}\n`;
    const footer = language
      ? `\n${border}╰${"─".repeat(language.length + 52)}╯${reset}`
      : `\n${border}╰${"─".repeat(60)}╯${reset}`;

    return header + formatted + footer;
  }

  renderProgress(current: number, total: number, width = 40): string {
    const { primary, secondary, muted, reset, accent } = this.colors;

    const percentage = Math.round((current / total) * 100);
    const filled = Math.round((current / total) * width);
    const empty = width - filled;

    const gradientFill = filled > 0
      ? `${primary}${"█".repeat(Math.floor(filled * 0.3))}${secondary}${"█".repeat(Math.floor(filled * 0.4))}${accent}${"█".repeat(filled - Math.floor(filled * 0.7))}`
      : "";
    const bar = gradientFill + `${muted}░${reset}`.repeat(empty);

    return `${primary}[${bar}${primary}]${reset} ${muted}${percentage}%${reset}`;
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
    const { top, middle, bottom, accent } = AuroraTheme.BANNER_COLORS;
    const { text, muted, reset, bold } = this.colors;

    const logo = [
      `${top}    ██████╗  █████╗ ██╗   ██╗ ██████╗ ██████╗ ██████╗ ███████╗`,
      `${middle}    ██╔══██╗██╔══██╗╚██╗ ██╔╝██╔════╝██╔═══██╗██╔══██╗██╔════╝`,
      `${bottom}    ██████╔╝███████║ ╚████╔╝ ██║     ██║   ██║██║  ██║█████╗  `,
      `${accent}    ██╔══██╗██╔══██║  ╚██╔╝  ██║     ██║   ██║██║  ██║██╔══╝  `,
      `${top}    ██║  ██║██║  ██║   ██║   ╚██████╗╚██████╔╝██████╔╝███████╗`,
      `${middle}    ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝`,
    ];

    const modelDisplay = model.length > 20 ? model.substring(0, 17) + "..." : model;
    const dirDisplay = directory.length > 30 ? "..." + directory.substring(directory.length - 27) : directory;

    return `
${logo.join("\n")}
${reset}
${muted}┌─────────────────────────────────────────────────────────────────────┐${reset}
${muted}│${reset}  ${bold}Version${reset}: ${text}${version}${reset}  ${bold}Model${reset}: ${text}${modelDisplay}${reset}
${muted}│${reset}  ${bold}Directory${reset}: ${text}${dirDisplay}${reset}
${muted}└─────────────────────────────────────────────────────────────────────┘${reset}
${muted}────────────────────────────────────────────────────────────────────────${reset}
`;
  }
}
