import { Theme, ThemeType, ThemeColors } from "../../types/index.js";
import figlet from 'figlet';

export class ElegantGradientTheme implements Theme {
  name: ThemeType = "elegant";
  displayName = "Elegant Gradient";
  description = "Elegant gradient design with soft borders and clear visual hierarchy";

  // Elegant Gradient 配色方案
  private static readonly RAW_COLORS = {
    // 背景色
    bg: "\x1b[48;2;30;27;75m",             // #1e1b4b - 深紫主背景
    cardBg: "\x1b[48;2;31;41;55m",          // #1f2937 - 卡片背景
    codeBg: "\x1b[48;2;17;24;39m",          // #111827 - 代码块背景

    // 前景色
    text: "\x1b[38;2;255;255;255m",         // #ffffff - 纯白文本
    muted: "\x1b[38;2;156;163;175m",        // #9ca3af - 次要文本

    // 主题色
    primary: "\x1b[38;2;249;115;22m",       // #f97316 - 暖橙 (用户消息)
    accent: "\x1b[38;2;6;182;212m",        // #06b6d4 - 青蓝 (助手消息)
    secondary: "\x1b[38;2;8;145;178m",      // #0891b2 - 深青蓝

    // 边框
    border: "\x1b[38;2;75;85;99m",         // #4b5563 - 柔和灰边框

    // 状态色
    success: "\x1b[38;2;34;197;94m",        // #22c55e - 成功绿
    error: "\x1b[38;2;239;68;68m",         // #ef4444 - 错误红
    warning: "\x1b[38;2;251;191;36m",      // #fbbf24 - 警告黄
    info: "\x1b[38;2;59;130;246m",         // #3b82f6 - 信息蓝

    // 样式
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    italic: "\x1b[3m",
    underline: "\x1b[4m",
  };

  readonly colors: ThemeColors = {
    primary: ElegantGradientTheme.RAW_COLORS.primary,
    secondary: ElegantGradientTheme.RAW_COLORS.secondary,
    accent: ElegantGradientTheme.RAW_COLORS.accent,
    text: ElegantGradientTheme.RAW_COLORS.text,
    muted: ElegantGradientTheme.RAW_COLORS.muted,
    gray: ElegantGradientTheme.RAW_COLORS.muted,
    success: ElegantGradientTheme.RAW_COLORS.success,
    error: ElegantGradientTheme.RAW_COLORS.error,
    warning: ElegantGradientTheme.RAW_COLORS.warning,
    info: ElegantGradientTheme.RAW_COLORS.info,
    reset: ElegantGradientTheme.RAW_COLORS.reset,
    user: ElegantGradientTheme.RAW_COLORS.primary,
    assistant: ElegantGradientTheme.RAW_COLORS.accent,
    thinking: ElegantGradientTheme.RAW_COLORS.muted,
    bold: ElegantGradientTheme.RAW_COLORS.bold,
    dim: ElegantGradientTheme.RAW_COLORS.dim,
    italic: ElegantGradientTheme.RAW_COLORS.italic,
    background: ElegantGradientTheme.RAW_COLORS.bg,
    border: ElegantGradientTheme.RAW_COLORS.border,
    codeBorder: ElegantGradientTheme.RAW_COLORS.border,
    codeBg: ElegantGradientTheme.RAW_COLORS.codeBg,
  };

  private get rawColors() {
    return ElegantGradientTheme.RAW_COLORS;
  }

  // 绘制代码块
  private drawCodeBox(content: string, language?: string): string {
    const { codeBg, border, text, reset, muted } = this.rawColors;
    const lines = content.split("\n");
    const maxLineNum = lines.length.toString().length;

    const header = language
      ? `${border}┌─ ${language} ${"─".repeat(Math.max(0, 60 - language.length - 2))}┐${reset}\n`
      : `${border}┌${"─".repeat(60)}┐${reset}\n`;

    const contentLines = lines.map((line, idx) => {
      const lineNum = (idx + 1).toString().padStart(maxLineNum, " ");
      return `${codeBg}${border}║${reset} ${muted}${lineNum}${reset} ${border}│${reset} ${text}${line}${reset}`;
    }).join("\n");

    const footer = `${border}└${"─".repeat(60)}┘${reset}`;

    return header + contentLines + "\n" + footer;
  }

  renderUserPrompt(): string {
    const { primary, reset, bold } = this.rawColors;
    return `${primary}${bold}▶${reset} `;
  }

  renderUserMessage(message: string, _width?: number): string {
    const { bold, primary, reset } = this.rawColors;
    // 简洁格式: 只显示图标和颜色,不使用复杂边框
    return `${primary}${bold}💬 You:${reset} ${message}`;
  }

  renderAssistantMessage(message: string, _width?: number): string {
    const { bold, accent, reset } = this.rawColors;
    // 简洁格式: 只显示图标和颜色,不使用复杂边框
    return `${accent}${bold}✨ RayCode:${reset} ${message}`;
  }

  renderThinking(frameIndex = 0): string {
    const { muted, reset, accent } = this.rawColors;
    const spinners = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    const spinner = spinners[frameIndex % spinners.length];
    return `${accent}${spinner}${reset} ${muted}Thinking...${reset}`;
  }

  renderSuccess(message: string): string {
    const { success, text, reset, bold } = this.rawColors;
    return `${success}${bold}✓${reset} ${text}${message}${reset}`;
  }

  renderError(message: string): string {
    const { error, text, reset, bold } = this.rawColors;
    return `${error}${bold}✗${reset} ${text}${message}${reset}`;
  }

  renderWarning(message: string): string {
    const { warning, text, reset, bold } = this.rawColors;
    return `${warning}${bold}⚠${reset} ${text}${message}${reset}`;
  }

  renderInfo(message: string): string {
    const { info, text, reset, bold } = this.rawColors;
    return `${info}${bold}ℹ${reset} ${text}${message}${reset}`;
  }

  renderCodeBlock(code: string, language?: string): string {
    const { reset } = this.rawColors;
    return "\n" + this.drawCodeBox(code, language) + "\n" + reset;
  }

  renderProgress(current: number, total: number, width: number = 50): string {
    const { accent, muted, reset } = this.rawColors;
    const progress = Math.min(100, Math.max(0, (current / total) * 100));
    const filled = Math.floor((progress / 100) * width);
    const empty = width - filled;

    const bar = `${accent}${"━".repeat(filled)}${muted}${"━".repeat(empty)}${reset}`;
    const percentage = `${accent}${Math.round(progress)}%${reset}`;

    return `${bar} ${percentage}`;
  }

  renderJSON(obj: any, indent: number = 2): string {
    const { accent, muted, text, reset } = this.rawColors;
    const jsonStr = JSON.stringify(obj, null, indent);

    // 简单的语法高亮
    let highlighted = jsonStr
      .replace(/"([^"]+)":/g, `${accent}"$1"${reset}${text}:${reset}`)
      .replace(/"([^"]+)"/g, `${accent}"$1"${reset}`)
      .replace(/(\d+):/g, `${accent}$1${reset}${text}:${reset}`)
      .replace(/: (\d+)/g, `${text}: ${accent}$1${reset}`)
      .replace(/: (true|false)/g, `${text}: ${accent}$1${reset}`)
      .replace(/: (null)/g, `${text}: ${muted}$1${reset}`);

    return highlighted;
  }

  renderBanner(model: string, directory: string, version: string, frame?: number): string {
    const { accent, secondary, text, muted, border, reset, bold, primary } = this.rawColors;

    // 使用 figlet 生成 ASCII 艺术字
    const logo = figlet.textSync("RayCode", {
      font: "Standard",
      width: 60,
      whitespaceBreak: true,
    });

    const logoColored = logo.split("\n").map(line =>
      `${accent}${line}${reset}`
    ).join("\n");

    const modelLine = `${bold}${text}◇${reset}  ${primary}${model}${reset}              ${bold}${text}◇${reset}  ${text}${directory}${reset}         ${bold}${text}◇${reset}  ${muted}v${version}${reset}`;
    // 实现● online的闪烁效果
    const isOnlineVisible = frame !== undefined ? (frame % 2 === 0) : true;
    const onlineStatus = isOnlineVisible ? `${accent}● online${reset}` : `${muted}● online${reset}`;
    const separator = `${border}  ◇${reset} ${secondary}${"━".repeat(14)}${reset}   ${border}◇${reset} ${secondary}${"━".repeat(14)}${reset}       ${border}◇${reset}  ${onlineStatus}`;

    return `${logoColored}

${modelLine}
${separator}`;
  }

  renderFooter(): string {
    const { muted, reset, primary } = this.rawColors;
    return `${muted}  💡 ${reset}${primary}help${reset} 帮助  │  ${muted}PgUp/PgDn${reset} 滚动  │  ${muted}⌘C${reset} 退出  │  ${muted}Ctrl+L${reset} 清屏${reset}`;
  }

  renderHeader(title: string, mode?: string): string {
    const { border, reset, primary, bold, muted } = this.rawColors;
    const modeStr = mode ? ` - ${muted}${mode}${reset}` : "";
    const titleWithMode = `${bold}${primary}${title}${reset}${modeStr}`;

    return `\n${border}═════════════════════════════════════════════════════════════════════════════${reset}\n${titleWithMode}\n${border}═════════════════════════════════════════════════════════════════════════════${reset}\n`;
  }
}
