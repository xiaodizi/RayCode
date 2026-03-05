import { Theme, ThemeType } from "../../types/index.js";

export class CyberpunkTheme implements Theme {
  name: ThemeType = 'cyberpunk';
  displayName = 'Neon Cyberpunk';
  description = 'Neon colors and futuristic cyberpunk aesthetics';

  static readonly COLORS = {
    primary: "\x1b[38;2;0;243;255m",        // Neon Cyan #00f3ff
    secondary: "\x1b[38;2;255;0;200m",      // Neon Magenta #ff00c8
    accent: "\x1b[38;2;57;255;20m",          // Neon Green #39ff14
    text: "\x1b[38;2;200;255;255m",          // Cyan-tinted white
    muted: "\x1b[38;2;13;79;102m",           // Grid Blue #0d4f66
    gray: "\x1b[38;2;50;50;70m",             // Dark gray
    success: "\x1b[38;2;57;255;20m",         // Neon Green
    error: "\x1b[38;2;255;8;68m",            // Warning Red #ff0844
    warning: "\x1b[38;2;255;170;0m",         // Amber
    info: "\x1b[38;2;0;243;255m",            // Neon Cyan
    reset: "\x1b[0m",
    user: "\x1b[38;2;0;243;255m",            // Neon Cyan
    assistant: "\x1b[38;2;255;0;200m",       // Neon Magenta
    thinking: "\x1b[38;2;57;255;20m",         // Neon Green
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    background: "\x1b[48;2;10;10;15m",       // Deep Space Black #0a0a0f
    border: "\x1b[38;2;0;243;255m",           // Neon Cyan border
  };

  readonly colors = CyberpunkTheme.COLORS;

  static readonly BANNER_COLORS = {
    top: "\x1b[38;2;0;243;255m",      // Neon Cyan
    middle: "\x1b[38;2;255;0;200m",   // Neon Magenta
    bottom: "\x1b[38;2;57;255;20m",    // Neon Green
    accent: "\x1b[38;2;255;170;0m",    // Amber
  };

  readonly bannerColors = CyberpunkTheme.BANNER_COLORS;

  renderUserPrompt(): string {
    const { primary, reset } = this.colors;
    return `${primary}▶${reset} `;
  }

  renderUserMessage(message: string, _width?: number): string {
    const { primary, text, reset, bold, accent } = this.colors;
    return `\n${primary}┌──────────────────────────────────────────────────────┐${reset}
${primary}│${reset} ${bold}${accent}YOU${reset} ${primary}│${reset}
${primary}└──────────────────────────────────────────────────────┘${reset}
${text}${message}${reset}\n`;
  }

  renderAssistantMessage(message: string, _width?: number): string {
    const { secondary, text, reset, bold, accent } = this.colors;
    return `\n${secondary}┌──────────────────────────────────────────────────────┐${reset}
${secondary}│${reset} ${bold}${accent}RAYCODE${reset} ${secondary}│${reset}
${secondary}└──────────────────────────────────────────────────────┘${reset}
${text}${message}${reset}\n`;
  }

  renderThinking(frameIndex = 0): string {
    const { thinking, muted, reset, primary, secondary } = this.colors;
    const spinners = ["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"];
    const spinner = spinners[frameIndex % spinners.length];
    const colors = [primary, secondary, thinking];
    const color = colors[frameIndex % colors.length];
    return `${color}${spinner}${reset} ${muted}PROCESSING...${reset}`;
  }

  renderSuccess(message: string): string {
    const { success, text, reset, accent } = this.colors;
    return `${success}[OK]${reset} ${accent}${text}${message}${reset}`;
  }

  renderError(message: string): string {
    const { error, text, reset } = this.colors;
    return `${error}[ERROR]${reset} ${text}${message}${reset}`;
  }

  renderWarning(message: string): string {
    const { warning, text, reset } = this.colors;
    return `${warning}[WARN]${reset} ${text}${message}${reset}`;
  }

  renderInfo(message: string): string {
    const { info, text, reset } = this.colors;
    return `${info}[INFO]${reset} ${text}${message}${reset}`;
  }

  renderCodeBlock(code: string, language?: string): string {
    const { muted, text, reset, border, accent } = this.colors;

    const lines = code.split("\n");
    const maxDigits = lines.length.toString().length;

    const formatted = lines
      .map((line, idx) => {
        const lineNumber = (idx + 1).toString().padStart(maxDigits, "0");
        return `${muted}${lineNumber} ${border}║${reset} ${text}${line}${reset}`;
      })
      .join("\n");

    const header = language
      ? `${border}╔══ ${accent}${language.toUpperCase()}${reset} ${border}${"═".repeat(Math.max(0, 48 - language.length))}╗${reset}\n`
      : `${border}╔${"═".repeat(60)}╗${reset}\n`;
    const footer = language
      ? `\n${border}╚${"═".repeat(language.length + 50)}╝${reset}`
      : `\n${border}╚${"═".repeat(60)}╝${reset}`;

    return header + formatted + footer;
  }

  renderProgress(current: number, total: number, width = 40): string {
    const { primary, secondary, muted, reset, accent } = this.colors;

    const percentage = Math.round((current / total) * 100);
    const filled = Math.round((current / total) * width);
    const empty = width - filled;

    const bar = `${primary}█${reset}`.repeat(filled) + `${muted}▒${reset}`.repeat(empty);

    return `${secondary}[${bar}${secondary}]${reset} ${accent}${percentage}%${reset}`;
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

  renderBanner(model: string, directory: string, version: string, frame = 0): string {
    const { top, middle, bottom, accent } = CyberpunkTheme.BANNER_COLORS;
    const { text, muted, reset, bold } = this.colors;

    const pulseFrame = frame % 6;
    const pulseIntensity = Math.sin((pulseFrame / 6) * Math.PI) * 0.5 + 0.5;

    const logo = [
      `${top}    ██████╗ ${middle} █████╗ ${bottom}██╗   ██╗${accent} ██████╗ ${top} ██████╗ ${bottom}██████╗ ${accent}███████╗`,
      `${middle}    ██╔══██╗${bottom}██╔══██╗${accent}╚██╗ ██╔╝${top}██╔════╝ ${middle}██╔═══██╗${accent}██╔══██╗${top}██╔════╝`,
      `${bottom}    ██████╔╝${accent}███████║${top} ╚████╔╝ ${bottom}██║      ${accent}██║   ██║${top}██║  ██║${bottom}█████╗  `,
      `${accent}    ██╔══██╗${top}██╔══██║${middle}  ╚██╔╝  ${accent}██║      ${top}██║   ██║${middle}██║  ██║${accent}██╔══╝  `,
      `${top}    ██║  ██║${middle}██║  ██║${bottom}   ██║   ${top}╚██████╗${middle}╚██████╔╝${bottom}██████╔╝${top}███████╗`,
      `${middle}    ╚═╝  ╚═╝${bottom}╚═╝  ╚═╝${accent}   ╚═╝    ${middle}╚═════╝ ${bottom}╚═════╝ ${accent}╚═════╝ ${middle}╚══════╝`,
    ];

    const modelDisplay = model.length > 20 ? model.substring(0, 17) + "..." : model;
    const dirDisplay = directory.length > 30 ? "..." + directory.substring(directory.length - 27) : directory;

    const statusText = pulseIntensity > 0.7 ? "ONLINE" : "STANDBY";
    const statusColor = pulseIntensity > 0.7 ? accent : muted;

    return `
${logo.join("\n")}
${reset}
${muted}╔═════════════════════════════════════════════════════════════════════╗${reset}
${muted}║${reset}  ${bold}VERSION${reset}: ${text}${version}${reset}  ${bold}MODEL${reset}: ${text}${modelDisplay}${reset}
${muted}║${reset}  ${bold}DIRECTORY${reset}: ${text}${dirDisplay}${reset}
${muted}║${reset}  ${bold}STATUS${reset}: ${statusColor}${statusText}${reset}
${muted}╚═════════════════════════════════════════════════════════════════════╝${reset}
${top}════════════════════════════════════════════════════════════════════════${reset}
`;
  }
}
