/**
 * 命令执行 UI 组件 - 现代终端风格
 * 设计方案：现代终端风格 (Modern Terminal)
 */

export class CommandUI {
  static readonly COLORS = {
    // 主色调 - 青绿色系
    primary: "\x1b[38;2;16;163;127m",      // 主色：青绿色
    secondary: "\x1b[38;2;75;85;99m",       // 次要：深灰色
    accent: "\x1b[38;2;59;130;246m",         // 强调：蓝色
    success: "\x1b[38;2;34;197;94m",         // 成功：绿色
    error: "\x1b[38;2;239;68;68m",           // 错误：红色
    warning: "\x1b[38;2;245;158;11m",        // 警告：琥珀色
    output: "\x1b[38;2;156;163;175m",        // 输出：浅灰色
    border: "\x1b[38;2;75;85;99m",           // 边框：深灰色
    text: "\x1b[38;2;209;213;219m",          // 文本：亮灰色
    muted: "\x1b[38;2;107;114;128m",         // 弱化：灰色
    white: "\x1b[38;2;255;255;255m",
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    italic: "\x1b[3m",
    underline: "\x1b[4m",
  };

  static readonly BOX = {
    topLeft: "╭",
    topRight: "╮",
    bottomLeft: "╰",
    bottomRight: "╯",
    horizontal: "─",
    vertical: "│",
    leftT: "├",
    rightT: "┤",
    cross: "┼",
  };

  static readonly ICONS = {
    command: "🔧",
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
    time: "⏱️",
    folder: "📁",
    file: "📄",
  };

  /**
   * 获取终端宽度（默认 80）
   */
  private static getWidth(): number {
    return Math.min(process.stdout.columns || 80, 100);
  }


  /**
   * 截断文本以适应宽度
   */
  private static truncateText(text: string, maxWidth: number): string {
    if (text.length <= maxWidth) return text;
    return text.slice(0, maxWidth - 3) + "...";
  }

  /**
   * 将文本分成多行以适应宽度
   */
  private static wrapText(text: string, maxWidth: number): string[] {
    const lines: string[] = [];
    const paragraphs = text.split("\n");

    for (const paragraph of paragraphs) {
      if (paragraph.length === 0) {
        lines.push("");
        continue;
      }

      let currentLine = "";
      const words = paragraph.split(" ");

      for (const word of words) {
        if (currentLine.length === 0) {
          if (word.length > maxWidth) {
            // 单词本身就太长，强制截断
            lines.push(word.slice(0, maxWidth));
          } else {
            currentLine = word;
          }
        } else if (currentLine.length + 1 + word.length <= maxWidth) {
          currentLine += " " + word;
        } else {
          lines.push(currentLine);
          currentLine = word.length > maxWidth ? word.slice(0, maxWidth) : word;
        }
      }

      if (currentLine.length > 0) {
        lines.push(currentLine);
      }
    }

    return lines;
  }

  /**
   * 渲染带边框的头部
   */
  static renderHeader(title: string, icon?: string): string {
    const { border, primary, bold, reset } = this.COLORS;
    const { topLeft, topRight, horizontal } = this.BOX;
    const width = this.getWidth();
    const iconText = icon ? `${icon} ` : "";
    const fullTitle = `${iconText}${title}`;
    const padding = Math.max(0, width - 4 - fullTitle.length);

    return `${border}${topLeft}${horizontal.repeat(width - 2)}${topRight}${reset}\n${border}${this.BOX.vertical}${reset} ${primary}${bold}${fullTitle}${reset} ${" ".repeat(padding)}${border}${this.BOX.vertical}${reset}`;
  }

  /**
   * 渲染分割线
   */
  static renderDivider(): string {
    const { border, reset } = this.COLORS;
    const { leftT, rightT, horizontal } = this.BOX;
    const width = this.getWidth();

    return `${border}${leftT}${horizontal.repeat(width - 2)}${rightT}${reset}`;
  }

  /**
   * 渲染内容行（带垂直边框）
   */
  static renderContentLine(content: string, color?: string): string {
    const { border, text, reset } = this.COLORS;
    const { vertical } = this.BOX;
    const width = this.getWidth();
    const contentColor = color || text;
    const maxContentWidth = width - 4; // 2 for borders, 2 for padding

    const lines = content.split("\n");
    const result: string[] = [];

    for (const line of lines) {
      const wrappedLines = this.wrapText(line, maxContentWidth);
      for (const wrapped of wrappedLines) {
        const padded = wrapped.padEnd(maxContentWidth);
        result.push(`${border}${vertical}${reset} ${contentColor}${padded}${reset} ${border}${vertical}${reset}`);
      }
    }

    return result.join("\n");
  }

  /**
   * 渲染命令行
   */
  static renderCommand(command: string): string {
    const { primary, bold, reset } = this.COLORS;
    return this.renderContentLine(`${primary}${bold}$${reset} ${command}`, primary);
  }

  /**
   * 渲染命令输出
   */
  static renderOutput(output: string): string {
    const { output: outputColor } = this.COLORS;
    if (!output || output.trim().length === 0) {
      return this.renderContentLine("(无输出)", this.COLORS.muted);
    }
    return this.renderContentLine(output, outputColor);
  }

  /**
   * 渲染底部
   */
  static renderFooter(): string {
    const { border, reset } = this.COLORS;
    const { bottomLeft, bottomRight, horizontal } = this.BOX;
    const width = this.getWidth();

    return `${border}${bottomLeft}${horizontal.repeat(width - 2)}${bottomRight}${reset}`;
  }

  /**
   * 渲染状态行（成功/失败）
   */
  static renderStatus(success: boolean, exitCode: number, duration: number): string {
    const { success: successColor, error: errorColor, muted, reset, bold } = this.COLORS;
    const width = this.getWidth();

    const icon = success ? this.ICONS.success : this.ICONS.error;
    const statusColor = success ? successColor : errorColor;
    const statusText = success ? "命令成功完成" : "命令执行失败";
    const durationText = `${duration}ms`;

    const content = `${icon} ${statusText}`;
    const rightContent = `(退出码: ${exitCode}, 耗时: ${durationText})`;
    const padding = Math.max(0, width - 4 - content.length - rightContent.length - 1);

    return `${this.COLORS.border}${this.BOX.vertical}${reset} ${statusColor}${bold}${content}${reset} ${muted}${rightContent}${reset} ${" ".repeat(padding)}${this.COLORS.border}${this.BOX.vertical}${reset}`;
  }

  /**
   * 渲染完整的命令执行结果
   */
  static renderCommandResult(command: string, output: string, success: boolean, exitCode: number, duration: number): string {
    const parts: string[] = [];

    // 头部
    parts.push(this.renderHeader("执行命令", this.ICONS.command));

    // 命令行
    parts.push(this.renderDivider());
    parts.push(this.renderCommand(command));

    // 输出
    if (output && output.trim().length > 0) {
      parts.push(this.renderDivider());
      parts.push(this.renderOutput(output));
    }

    // 状态
    parts.push(this.renderDivider());
    parts.push(this.renderStatus(success, exitCode, duration));

    // 底部
    parts.push(this.renderFooter());

    return parts.join("\n");
  }

  /**
   * 渲染执行中的提示（带动画帧）
   */
  static renderExecuting(command: string, frameIndex: number = 0): string {
    const { muted, primary, reset, bold } = this.COLORS;
    const spinners = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    const spinner = spinners[frameIndex % spinners.length];

    const truncatedCommand = this.truncateText(command, Math.max(20, this.getWidth() - 30));

    return `\r${muted}${spinner}${reset} ${primary}${bold}执行中${reset} ${muted}${truncatedCommand}...${reset}`;
  }

  /**
   * 渲染简单的错误消息
   */
  static renderSimpleError(message: string): string {
    const { error, reset } = this.COLORS;
    return `${error}${this.ICONS.error} ${message}${reset}`;
  }

  /**
   * 渲染简单的成功消息
   */
  static renderSimpleSuccess(message: string): string {
    const { success, reset } = this.COLORS;
    return `${success}${this.ICONS.success} ${message}${reset}`;
  }
}
