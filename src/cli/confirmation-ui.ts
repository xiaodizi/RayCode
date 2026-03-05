/**
 * Enhanced Terminal Command Confirmation UI
 * Risk-based visual design with context-aware previews
 */

import type { ConfirmationRequest } from "../core/confirmation-guard.js";

export type RiskLevel = "high" | "medium" | "low";

export interface CommandAnalysis {
  risk: RiskLevel;
  reasons: string[];
  alternatives?: string[];
  affectedPaths?: string[];
}

export interface ConfirmationUIOptions {
  showDetails?: boolean;
  allowEdit?: boolean;
  terminalWidth?: number;
}

export class ConfirmationUI {
  private static readonly COLORS = {
    // Risk-based colors
    high: "\x1b[38;2;239;68;68m",        // Bright red
    highBg: "\x1b[48;2;127;29;29m",      // Dark red background
    medium: "\x1b[38;2;245;158;11m",     // Amber
    mediumBg: "\x1b[48;2;120;53;15m",    // Dark amber background
    low: "\x1b[38;2;34;197;94m",         // Green
    lowBg: "\x1b[48;2;20;83;45m",        // Dark green background
    
    // UI elements
    primary: "\x1b[38;2;139;92;246m",    // Purple
    accent: "\x1b[38;2;59;130;246m",     // Blue
    text: "\x1b[38;2;229;231;235m",      // Light gray
    muted: "\x1b[38;2;107;114;128m",     // Gray
    border: "\x1b[38;2;75;85;99m",       // Dark gray
    
    // Styles
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    italic: "\x1b[3m",
    underline: "\x1b[4m",
    inverse: "\x1b[7m",
  };

  private static readonly BOX = {
    topLeft: "╭",
    topRight: "╮",
    bottomLeft: "╰",
    bottomRight: "╯",
    horizontal: "─",
    vertical: "│",
    leftT: "├",
    rightT: "┤",
    heavyHorizontal: "━",
    heavyVertical: "┃",
  };

  private static readonly ICONS = {
    high: "⚠️",
    medium: "⚡",
    low: "✓",
    command: "❯",
    folder: "📁",
    file: "📄",
    arrow: "→",
    bullet: "•",
  };

  /**
   * Analyze command risk level and provide context
   */
  static analyzeCommand(command: string): CommandAnalysis {
    const cmd = command.toLowerCase().trim();
    
    // High risk patterns
    const highRiskPatterns = [
      { pattern: /rm\s+-rf\s+[~/]/, reason: "Recursive deletion of system directories" },
      { pattern: /rm\s+-rf\s+\*/, reason: "Recursive deletion with wildcard" },
      { pattern: /dd\s+if=/, reason: "Direct disk write operation" },
      { pattern: /mkfs\./, reason: "Filesystem formatting" },
      { pattern: />\s*\/dev\/sd/, reason: "Direct device write" },
      { pattern: /chmod\s+-R\s+777/, reason: "Dangerous permission change" },
      { pattern: /git\s+push\s+.*--force/, reason: "Force push to repository" },
      { pattern: /npm\s+publish/, reason: "Package publication" },
      { pattern: /docker\s+system\s+prune\s+-a/, reason: "Remove all Docker resources" },
      { pattern: /curl.*\|\s*bash/, reason: "Piping remote script to shell" },
      { pattern: /wget.*\|\s*sh/, reason: "Piping remote script to shell" },
    ];

    // Medium risk patterns
    const mediumRiskPatterns = [
      { pattern: /rm\s+-r/, reason: "Recursive file deletion" },
      { pattern: /git\s+reset\s+--hard/, reason: "Discarding uncommitted changes" },
      { pattern: /git\s+clean\s+-fd/, reason: "Removing untracked files" },
      { pattern: /npm\s+install\s+-g/, reason: "Global package installation" },
      { pattern: /sudo/, reason: "Elevated privileges required" },
      { pattern: /chmod\s+[0-7]{3}/, reason: "Permission modification" },
      { pattern: /chown/, reason: "Ownership change" },
      { pattern: /kill\s+-9/, reason: "Force killing process" },
      { pattern: /docker\s+rm/, reason: "Removing Docker containers" },
      { pattern: /brew\s+uninstall/, reason: "Uninstalling system package" },
    ];

    const reasons: string[] = [];
    const alternatives: string[] = [];
    const affectedPaths: string[] = [];

    // Check high risk
    for (const { pattern, reason } of highRiskPatterns) {
      if (pattern.test(cmd)) {
        reasons.push(reason);
        
        // Suggest alternatives for common dangerous commands
        if (cmd.includes("rm -rf")) {
          alternatives.push("Use 'rm -ri' for interactive deletion");
          alternatives.push("Move to trash instead of permanent deletion");
        }
        if (cmd.includes("git push") && cmd.includes("--force")) {
          alternatives.push("Use 'git push --force-with-lease' instead");
        }
        if (cmd.includes("curl") && cmd.includes("| bash")) {
          alternatives.push("Download script first, review it, then execute");
        }
        
        return { risk: "high", reasons, alternatives, affectedPaths };
      }
    }

    // Check medium risk
    for (const { pattern, reason } of mediumRiskPatterns) {
      if (pattern.test(cmd)) {
        reasons.push(reason);
        
        if (cmd.includes("git reset --hard")) {
          alternatives.push("Use 'git stash' to preserve changes");
        }
        if (cmd.includes("rm -r")) {
          alternatives.push("Use 'rm -ri' for interactive deletion");
        }
        
        return { risk: "medium", reasons, alternatives, affectedPaths };
      }
    }

    // Extract affected paths
    const pathMatch = command.match(/(?:rm|mv|cp|chmod|chown)\s+(?:-[a-z]+\s+)*([^\s]+)/);
    if (pathMatch) {
      affectedPaths.push(pathMatch[1]);
    }

    return { risk: "low", reasons: ["Standard command execution"], alternatives, affectedPaths };
  }

  /**
   * Get terminal width with fallback
   */
  private static getWidth(options?: ConfirmationUIOptions): number {
    return options?.terminalWidth || Math.min(process.stdout.columns || 80, 100);
  }

  /**
   * Wrap text to fit terminal width
   */
  private static wrapText(text: string, maxWidth: number): string[] {
    const lines: string[] = [];
    const words = text.split(" ");
    let currentLine = "";

    for (const word of words) {
      if (currentLine.length === 0) {
        currentLine = word;
      } else if (currentLine.length + 1 + word.length <= maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Render risk badge with appropriate styling
   */
  private static renderRiskBadge(risk: RiskLevel): string {
    const { bold, reset } = this.COLORS;
    
    switch (risk) {
      case "high":
        return `${this.COLORS.highBg}${this.COLORS.text}${bold} ${this.ICONS.high} HIGH RISK ${reset}`;
      case "medium":
        return `${this.COLORS.mediumBg}${this.COLORS.text}${bold} ${this.ICONS.medium} MEDIUM RISK ${reset}`;
      case "low":
        return `${this.COLORS.lowBg}${this.COLORS.text}${bold} ${this.ICONS.low} LOW RISK ${reset}`;
    }
  }

  /**
   * Get risk color
   */
  private static getRiskColor(risk: RiskLevel): string {
    switch (risk) {
      case "high": return this.COLORS.high;
      case "medium": return this.COLORS.medium;
      case "low": return this.COLORS.low;
    }
  }

  /**
   * Render header with risk indicator
   */
  private static renderHeader(risk: RiskLevel, options?: ConfirmationUIOptions): string {
    const { border, text, bold, reset } = this.COLORS;
    const { topLeft, topRight, heavyHorizontal } = this.BOX;
    const width = this.getWidth(options);
    
    const badge = this.renderRiskBadge(risk);
    const title = "Command Confirmation Required";
    
    const line1 = `${border}${topLeft}${heavyHorizontal.repeat(width - 2)}${topRight}${reset}`;
    const line2 = `${border}${this.BOX.vertical}${reset} ${badge} ${text}${bold}${title}${reset}`;
    const padding = Math.max(0, width - 4 - title.length - 15); // 15 for badge length (approx)
    
    return `${line1}\n${line2}${" ".repeat(padding)} ${border}${this.BOX.vertical}${reset}`;
  }

  /**
   * Render command preview
   */
  private static renderCommand(command: string, risk: RiskLevel, options?: ConfirmationUIOptions): string {
    const { border, text, muted, bold, reset } = this.COLORS;
    const { vertical } = this.BOX;
    const width = this.getWidth(options);
    const riskColor = this.getRiskColor(risk);
    
    const lines: string[] = [];
    const maxWidth = width - 6;
    
    // Command label
    lines.push(`${border}${vertical}${reset} ${muted}Command:${reset}`);
    
    // Command text with wrapping
    const wrappedCmd = this.wrapText(command, maxWidth - 4);
    for (const line of wrappedCmd) {
      lines.push(`${border}${vertical}${reset}   ${riskColor}${bold}${this.ICONS.command}${reset} ${text}${line}${reset}`);
      lines.push(`${border}${vertical}${reset}   ${riskColor}${bold}${this.ICONS.command}${reset} ${text}${line}${reset}`);
    }
    
    return lines.join("\n");
  }

  /**
   * Render context information
   */
  private static renderContext(request: ConfirmationRequest): string {
    const { border, text, muted, reset } = this.COLORS;
    const { vertical } = this.BOX;
    
    const lines: string[] = [];
    
    if (request.cwd) {
      lines.push(`${border}${vertical}${reset} ${muted}Working Directory:${reset} ${text}${request.cwd}${reset}`);
    }
    
    if (request.env && Object.keys(request.env).length > 0) {
      const envCount = Object.keys(request.env).length;
      lines.push(`${border}${vertical}${reset} ${muted}Environment Variables:${reset} ${text}${envCount} custom${reset}`);
    }
    
    return lines.length > 0 ? lines.join("\n") : "";
  }

  /**
   * Render risk analysis details
   */
  private static renderAnalysis(analysis: CommandAnalysis, options?: ConfirmationUIOptions): string {
    const { border, text, muted, bold, reset } = this.COLORS;
    const { vertical } = this.BOX;
    const width = this.getWidth(options);
    const riskColor = this.getRiskColor(analysis.risk);
    
    const lines: string[] = [];
    const maxWidth = width - 8;
    
    // Reasons
    if (analysis.reasons.length > 0) {
      lines.push(`${border}${vertical}${reset} ${riskColor}${bold}Risk Factors:${reset}`);
      for (const reason of analysis.reasons) {
        const wrapped = this.wrapText(reason, maxWidth);
        for (const line of wrapped) {
          lines.push(`${border}${vertical}${reset}   ${riskColor}${this.ICONS.bullet}${reset} ${text}${line}${reset}`);
        }
      }
    }
    
    // Alternatives
    if (analysis.alternatives && analysis.alternatives.length > 0) {
      lines.push(`${border}${vertical}${reset}`);
      lines.push(`${border}${vertical}${reset} ${this.COLORS.accent}${bold}Suggested Alternatives:${reset}`);
      for (const alt of analysis.alternatives) {
        const wrapped = this.wrapText(alt, maxWidth);
        for (const line of wrapped) {
          lines.push(`${border}${vertical}${reset}   ${this.COLORS.accent}${this.ICONS.arrow}${reset} ${text}${line}${reset}`);
        }
      }
    }
    
    // Affected paths
    if (analysis.affectedPaths && analysis.affectedPaths.length > 0) {
      lines.push(`${border}${vertical}${reset}`);
      lines.push(`${border}${vertical}${reset} ${muted}Affected Paths:${reset}`);
      for (const path of analysis.affectedPaths) {
        lines.push(`${border}${vertical}${reset}   ${this.ICONS.file} ${text}${path}${reset}`);
      }
    }
    
    return lines.join("\n");
  }

  /**
   * Render divider
   */
  private static renderDivider(options?: ConfirmationUIOptions): string {
    const { border, reset } = this.COLORS;
    const { leftT, rightT, horizontal } = this.BOX;
    const width = this.getWidth(options);
    
    return `${border}${leftT}${horizontal.repeat(width - 2)}${rightT}${reset}`;
  }

  /**
   * Render action prompt
   */
  private static renderPrompt(risk: RiskLevel, options?: ConfirmationUIOptions): string {
    const { border, text, bold, reset, accent, lowBg, low } = this.COLORS;
    const { vertical } = this.BOX;
    const riskColor = this.getRiskColor(risk);

    const lines: string[] = [];

    lines.push(`${border}${vertical}${reset} ${bold}${text}Choose an action:${reset}`);
    lines.push(`${border}${vertical}${reset}`);
    // Highlight Yes button with green background
    lines.push(`${border}${vertical}${reset}   ${lowBg}${low}${bold}[Y] Yes, execute command${reset}`);
    lines.push(`${border}${vertical}${reset}   ${riskColor}[N]${reset} ${text}No, cancel${reset}`);

    if (options?.showDetails) {
      lines.push(`${border}${vertical}${reset}   ${accent}[D]${reset} ${text}Show detailed analysis${reset}`);
    }

    if (options?.allowEdit) {
      lines.push(`${border}${vertical}${reset}   ${accent}[E]${reset} ${text}Edit command${reset}`);
    }

    return lines.join("\n");
  }

  /**
   * Render footer
   */
  private static renderFooter(options?: ConfirmationUIOptions): string {
    const { border, reset } = this.COLORS;
    const { bottomLeft, bottomRight, heavyHorizontal } = this.BOX;
    const width = this.getWidth(options);
    
    return `${border}${bottomLeft}${heavyHorizontal.repeat(width - 2)}${bottomRight}${reset}`;
  }

  /**
   * Render complete confirmation UI
   */
  static render(
    request: ConfirmationRequest,
    analysis: CommandAnalysis,
    options?: ConfirmationUIOptions
  ): string {
    const parts: string[] = [];
    
    // Header with risk badge
    parts.push(this.renderHeader(analysis.risk, options));
    
    // Command preview
    parts.push(this.renderDivider(options));
    parts.push(this.renderCommand(request.command, analysis.risk, options));
    
    // Context information
    const context = this.renderContext(request);
    if (context) {
      parts.push(this.renderDivider(options));
      parts.push(context);
    }
    
    // Risk analysis
    parts.push(this.renderDivider(options));
    parts.push(this.renderAnalysis(analysis, options));
    
    // Action prompt
    parts.push(this.renderDivider(options));
    parts.push(this.renderPrompt(analysis.risk, options));
    
    // Footer
    parts.push(this.renderFooter(options));
    
    return parts.join("\n");
  }

  /**
   * Render detailed analysis view
   */
  static renderDetailedAnalysis(
    command: string,
    analysis: CommandAnalysis,
    options?: ConfirmationUIOptions
  ): string {
    const { border, text, muted, bold, reset, primary } = this.COLORS;
    const { vertical, topLeft, topRight, bottomLeft, bottomRight, horizontal } = this.BOX;
    const width = this.getWidth(options);
    const riskColor = this.getRiskColor(analysis.risk);
    
    const parts: string[] = [];
    
    // Header
    parts.push(`${border}${topLeft}${horizontal.repeat(width - 2)}${topRight}${reset}`);
    parts.push(`${border}${vertical}${reset} ${primary}${bold}Detailed Risk Analysis${reset}`);
    parts.push(`${border}${vertical}${reset}`);
    
    // Command breakdown
    parts.push(`${border}${vertical}${reset} ${muted}Command:${reset} ${text}${command}${reset}`);
    parts.push(`${border}${vertical}${reset} ${muted}Risk Level:${reset} ${riskColor}${bold}${analysis.risk.toUpperCase()}${reset}`);
    parts.push(`${border}${vertical}${reset}`);
    
    // Detailed reasons
    if (analysis.reasons.length > 0) {
      parts.push(`${border}${vertical}${reset} ${bold}Why this is ${analysis.risk} risk:${reset}`);
      for (const reason of analysis.reasons) {
        const wrapped = this.wrapText(reason, width - 8);
        for (const line of wrapped) {
          parts.push(`${border}${vertical}${reset}   ${this.ICONS.bullet} ${text}${line}${reset}`);
        }
      }
      parts.push(`${border}${vertical}${reset}`);
    }
    
    // Safety recommendations
    parts.push(`${border}${vertical}${reset} ${bold}Safety Recommendations:${reset}`);
    parts.push(`${border}${vertical}${reset}   ${this.ICONS.bullet} ${text}Review the command carefully before confirming${reset}`);
    parts.push(`${border}${vertical}${reset}   ${this.ICONS.bullet} ${text}Ensure you have backups of important data${reset}`);
    parts.push(`${border}${vertical}${reset}   ${this.ICONS.bullet} ${text}Consider testing in a safe environment first${reset}`);
    
    // Footer
    parts.push(`${border}${bottomLeft}${horizontal.repeat(width - 2)}${bottomRight}${reset}`);
    
    return parts.join("\n");
  }

  /**
   * Render cancellation message
   */
  static renderCancelled(): string {
    const { muted, reset } = this.COLORS;
    return `\n${muted}Command execution cancelled.${reset}\n`;
  }

  /**
   * Render confirmation message
   */
  static renderConfirmed(): string {
    const { low, bold, reset } = this.COLORS;
    return `\n${low}${bold}${this.ICONS.low} Command confirmed, executing...${reset}\n`;
  }
}
