import { Theme, ThemeType, ThemeColors } from "../../types/index.js";

export class CodexTheme implements Theme {
  name: ThemeType = "codex";
  displayName = "RayCode Style";
  description = "RayCode v0.80.0 style terminal interface";

  // 基于 UI/UX Pro Max 推荐的 Developer Tool / IDE 配色方案
  // Background: #0F172A, Primary: #1E293B, CTA: #22C55E
  private static readonly RAW_COLORS = {
    // 背景色
    bg: "\x1b[48;2;15;23;42m",            // #0F172A - 深蓝黑主背景
    userBg: "\x1b[48;2;30;41;59m",        // #1E293B - 用户消息背景
    assistantBg: "\x1b[48;2;30;41;59m",   // #1E293B - 助手消息背景
    cardBg: "\x1b[48;2;30;41;59m",        // #1E293B - 系统卡片背景
    activeBg: "\x1b[48;2;51;65;85m",      // #334155 - 活动输入背景

    // 前景色
    text: "\x1b[38;2;248;250;252m",       // #F8FAFC - 纯白主文本
    muted: "\x1b[38;2;148;163;184m",      // #94A3B8 - 次要文本 (slate-400)
    primary: "\x1b[38;2;34;197;94m",      // #22C55E - 成功绿 (路径/提示符高亮)
    accent: "\x1b[38;2;129;140;248m",     // #818CF8 - 紫蓝色 (模型名)

    // 状态色
    success: "\x1b[38;2;34;197;94m",      // #22C55E - 成功绿
    error: "\x1b[38;2;239;68;68m",        // #EF4444 - 警戒红
    warning: "\x1b[38;2;251;191;36m",     // #FBBF24 - 琥珀黄 (Tip)
    info: "\x1b[38;2;59;130;246m",        // #3B82F6 - 聚焦蓝 (快捷键)

    // 边框
    border: "\x1b[38;2;51;65;85m",        // #334155 - 卡片边框
    cardBorder: "\x1b[38;2;51;65;85m",    // 卡片边框

    // 样式
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    italic: "\x1b[3m",
    underline: "\x1b[4m",
  };

  readonly colors: ThemeColors = {
    primary: CodexTheme.RAW_COLORS.primary,
    secondary: CodexTheme.RAW_COLORS.muted,
    accent: CodexTheme.RAW_COLORS.accent,
    text: CodexTheme.RAW_COLORS.text,
    muted: CodexTheme.RAW_COLORS.muted,
    gray: CodexTheme.RAW_COLORS.muted,
    success: CodexTheme.RAW_COLORS.success,
    error: CodexTheme.RAW_COLORS.error,
    warning: CodexTheme.RAW_COLORS.warning,
    info: CodexTheme.RAW_COLORS.info,
    reset: CodexTheme.RAW_COLORS.reset,
    user: CodexTheme.RAW_COLORS.text,
    assistant: CodexTheme.RAW_COLORS.primary,
    thinking: CodexTheme.RAW_COLORS.muted,
    bold: CodexTheme.RAW_COLORS.bold,
    dim: CodexTheme.RAW_COLORS.dim,
    italic: CodexTheme.RAW_COLORS.italic,
    background: CodexTheme.RAW_COLORS.bg,
    border: CodexTheme.RAW_COLORS.border,
    codeBorder: CodexTheme.RAW_COLORS.border,
    codeBg: CodexTheme.RAW_COLORS.cardBg,
  };

  private get rawColors() {
    return CodexTheme.RAW_COLORS;
  }

  renderUserPrompt(): string {
    const { primary, reset } = this.colors;
    return `${primary}>${reset}`;
  }

  renderUserPromptWithCursor(): string {
    const { primary, reset } = this.colors;
    return `${primary}>${reset}`;
  }

  private highlightVariables(message: string): string {
    const { primary, accent, reset } = this.colors;
    // 先高亮 @ 变量（成功绿）
    let result = message.replace(/(@\S+)/g, `${primary}$1${reset}`);
    // 再高亮路径中的 / 和 ~（紫蓝色）
    result = result.replace(/([\/~])/g, `${accent}$1${reset}`);
    return result;
  }

  renderUserMessage(message: string, _width?: number): string {
    const { text, reset, primary } = this.colors;
    const highlightedMsg = this.highlightVariables(message);
    // 用户消息：> 前缀，无背景
    return `${primary}>${reset} ${text}${highlightedMsg}${reset}`;
  }

  renderAssistantMessage(message: string, _width?: number): string {
    const { text, reset, muted } = this.colors;
    const highlightedMsg = this.highlightVariables(message);
    // 助手消息：• 前缀，无背景
    return `${muted}•${reset} ${text}${highlightedMsg}${reset}`;
  }

  renderThinking(frameIndex = 0): string {
    const { text, muted, reset } = this.colors;
    const dots = ["", ".", "..", "..."];
    const state = dots[frameIndex % dots.length];
    return `${muted}•${reset} ${text}Thinking${muted}${state}${reset}`;
  }

  renderSuccess(message: string): string {
    const { success, reset } = this.colors;
    return `${success}✓${reset} ${message}`;
  }

  renderError(message: string): string {
    const { error, reset } = this.colors;
    return `${error}✗${reset} ${message}`;
  }

  renderWarning(message: string): string {
    const { warning, reset } = this.colors;
    return `${warning}⚠${reset} ${message}`;
  }

  renderInfo(message: string): string {
    const { info, reset } = this.colors;
    return `${info}ℹ${reset} ${message}`;
  }

  renderCodeBlock(code: string, language?: string): string {
    const { text, muted, reset, success, border } = this.colors;
    const lines = code.split("\n");
    const maxDigits = lines.length.toString().length;

    const formatted = lines
      .map((line, idx) => {
        const lineNumber = (idx + 1).toString().padStart(maxDigits, " ");
        return `${muted}${lineNumber} │${reset} ${text}${line}${reset}`;
      })
      .join("\n");

    const langLabel = language || "code";
    const width = 60;
    const topBorder = `${border}┌${"─".repeat(width)}┐${reset}`;
    const bottomBorder = `${border}└${"─".repeat(width)}┘${reset}`;
    const langBar = `${border}│${reset} ${success}${langLabel}${reset}${" ".repeat(width - langLabel.length - 2)}${border}│${reset}`;
    const separator = `${border}├${"─".repeat(width)}┤${reset}`;

    return `\n${topBorder}\n${langBar}\n${separator}\n${formatted}\n${bottomBorder}\n`;
  }

  renderProgress(current: number, total: number, width = 40): string {
    const { primary, muted, reset } = this.colors;
    const percentage = Math.round((current / total) * 100);
    const filled = Math.round((current / total) * width);
    const empty = width - filled;
    const bar = "━".repeat(filled) + "─".repeat(empty);
    return `${primary}[${bar}]${reset} ${muted}${percentage}%${reset}`;
  }

  renderJSON(obj: any, indent = 2): string {
    const { text, primary, secondary, muted, reset } = this.colors;
    const jsonStr = JSON.stringify(obj, null, indent);

    return jsonStr
      .replace(/"([^"]*)"\s*:/g, `${primary}"$1"${reset}:`)
      .replace(/:\s*"([^"]*)"/g, `: "${text}$1${reset}"`)
      .replace(/:\s*(true|false|null)/g, `: ${secondary}$1${reset}`)
      .replace(/:\s*(\d+)/g, `: ${muted}$1${reset}`);
  }

  renderBanner(model: string, directory: string, version: string, _frame = 0): string {
    const { text, muted, reset, primary, accent, warning, bold } = this.colors;
    const { cardBg, cardBorder, italic } = this.rawColors;

    // 简化目录显示
    const home = process.env.HOME || '/';
    const dirDisplay = directory.replace(home, '~');
    const shortDir = dirDisplay.length > 35
      ? "..." + dirDisplay.substring(dirDisplay.length - 32)
      : dirDisplay;

    // 高亮路径中的分隔符
    const highlightedPath = shortDir.replace(/([\/~])/g, `${accent}$1${reset}`);

    // 计算填充长度（使用原始文本长度，不含颜色代码）
    const padding = " ".repeat(Math.max(0, 34 - shortDir.length));

    // RayCode 风格的系统信息卡片
    const card = [
      `${cardBorder}┌─────────────────────────────────────────────┐${reset}`,
      `${cardBorder}│${reset}${cardBg}  >_${reset}${cardBg} ${bold}${text}RayCode${reset}${cardBg} ${muted}(v${version})${reset}               ${cardBorder}│${reset}`,
      `${cardBorder}│${reset}${cardBg}  ${muted}model:${reset}${cardBg}    ${accent}${model}${reset}${cardBg}    ${primary}/model to change${reset}          ${cardBorder}│${reset}`,
      `${cardBorder}│${reset}${cardBg}  ${muted}directory:${reset}${cardBg} ${highlightedPath}${padding}${reset}  ${cardBorder}│${reset}`,
      `${cardBorder}└─────────────────────────────────────────────┘${reset}`,
    ].join('\n');

    // Tip 提示 - 使用琥珀色
    const tip = `${warning}Tip:${reset} ${muted}${italic}Paste an image with Ctrl+V to attach it to your next message.${reset}`;

    return `${card}\n\n${tip}\n`;
  }

  renderHeader(title: string, mode?: string): string {
    const { border, primary, muted, reset, bold } = this.colors;
    const modeText = mode ? ` (${mode})` : "";
    return `
${border}╭──────────────────────────────────────────────────────╮${reset}
${border}│${reset}  ${bold}${primary}${title}${reset}${muted}${modeText}${reset}${" ".repeat(50 - title.length - modeText.length)}${border}│${reset}
${border}╰──────────────────────────────────────────────────────╯${reset}
`;
  }

  renderFooter(): string {
    const { muted, reset, primary, dim, info } = this.colors;
    return `${primary}100% context left${reset} ${dim}·${reset} ${muted}? ${info}for shortcuts${reset}`;
  }

  renderFooterWithContext(contextPercent: number): string {
    const { reset, primary, muted, dim, warning, error, info } = this.colors;
    let contextColor: string;
    if (contextPercent > 50) {
      contextColor = primary; // 成功绿
    } else if (contextPercent > 20) {
      contextColor = warning; // 琥珀黄
    } else {
      contextColor = error; // 警戒红
    }
    // 快捷键提示使用靛蓝色高亮
    return `${contextColor}${contextPercent}% context left${reset} ${dim}·${reset} ${muted}? ${info}for shortcuts${reset}`;
  }
}
