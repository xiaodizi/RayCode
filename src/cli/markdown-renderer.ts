import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import python from 'highlight.js/lib/languages/python';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml';
import sql from 'highlight.js/lib/languages/sql';
import yaml from 'highlight.js/lib/languages/yaml';
import markdown from 'highlight.js/lib/languages/markdown';

import { CodexTheme } from './themes/codex-theme.js';

// Register languages for highlighting
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('python', python);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', html);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('markdown', markdown);

export interface MarkdownRendererOptions {
  theme?: CodexTheme;
  tabWidth?: number;
}

export class MarkdownRenderer {
  private theme: CodexTheme;
  private tabWidth: number;

  constructor(options: MarkdownRendererOptions = {}) {
    this.theme = options.theme || new CodexTheme();
    this.tabWidth = options.tabWidth || 2;
  }

  /**
   * Main entry point: parse and render markdown content
   */
  render(content: string): string {
    let result = content;

    // Process in order of precedence (blocks first, then inline)
    result = this.processCodeBlocks(result);
    result = this.processTables(result);
    result = this.processBlockquotes(result);
    result = this.processHeaders(result);
    result = this.processHorizontalRules(result);
    result = this.processTaskLists(result);
    result = this.processLists(result);
    result = this.processInlineElements(result);

    return result;
  }

  /**
   * Detect language from content or code block header
   */
  detectLanguage(content: string, hint?: string): string {
    if (hint) {
      const lowerHint = hint.toLowerCase();
      const langMap: Record<string, string> = {
        'ts': 'typescript',
        'tsx': 'typescript',
        'js': 'javascript',
        'jsx': 'javascript',
        'py': 'python',
        'sh': 'bash',
        'zsh': 'bash',
        'yml': 'yaml',
        'md': 'markdown',
        'html': 'xml',
        'htm': 'xml',
      };
      return langMap[lowerHint] || lowerHint;
    }

    // Try to detect from content
    if (content.includes('import ') || content.includes('export ') || content.includes('const ')) {
      return 'typescript';
    }
    if (content.includes('def ') || content.includes('class ')) {
      return 'python';
    }
    if (content.includes('{') && content.includes('}') && content.includes('"')) {
      return 'json';
    }
    if (content.startsWith('#!')) {
      if (content.includes('python')) return 'python';
      if (content.includes('node')) return 'javascript';
      if (content.includes('bash') || content.includes('sh')) return 'bash';
    }
    return 'text';
  }

  /**
   * Highlight code with syntax highlighting
   */
  highlightCode(code: string, language?: string): string {
    if (!language || language === 'text' || language === 'plain') {
      return code;
    }
    try {
      return hljs.highlight(code, { language }).value;
    } catch {
      try {
        return hljs.highlightAuto(code).value;
      } catch {
        return code;
      }
    }
  }

  /**
   * Process code blocks (```language)
   */
  private processCodeBlocks(content: string): string {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

    return content.replace(codeBlockRegex, (_match, lang, code) => {
      const language = this.detectLanguage(code, lang);
      const highlightedCode = this.highlightCode(code, language);
      return this.renderCodeBlock(highlightedCode, language);
    });
  }

  /**
   * Render a code block with line numbers and borders
   */
  private renderCodeBlock(code: string, language: string): string {
    const { muted, reset, codeBorder, success } = this.theme.colors;
    const lines = code.split('\n');

    // Remove trailing newline if present
    if (lines.length > 0 && lines[lines.length - 1] === '') {
      lines.pop();
    }

    const maxDigits = lines.length.toString().length;
    const terminalWidth = Math.min(process.stdout.columns || 80, 80);

    const formatted = lines
      .map((line, idx) => {
        const lineNumber = (idx + 1).toString().padStart(maxDigits, ' ');
        // Expand tabs
        const expandedLine = line.replace(/\t/g, ' '.repeat(this.tabWidth));
        return `${muted}${lineNumber} │${reset} ${expandedLine}`;
      })
      .join('\n');

    const langLabel = language || 'code';
    const width = terminalWidth - 2;
    const topBorder = `${codeBorder}┌${'─'.repeat(width)}┐${reset}`;
    const bottomBorder = `${codeBorder}└${'─'.repeat(width)}┘${reset}`;
    const langBar = `${codeBorder}│${reset} ${success}${langLabel}${reset}${' '.repeat(Math.max(0, width - langLabel.length - 2))}${codeBorder}│${reset}`;
    const separator = `${codeBorder}├${'─'.repeat(width)}┤${reset}`;

    return `\n${topBorder}\n${langBar}\n${separator}\n${formatted}\n${bottomBorder}\n`;
  }

  /**
   * Process tables
   */
  private processTables(content: string): string {
    const { muted, text, reset, bold } = this.theme.colors;

    // Match table pattern: header row, separator row, data rows
    const tableRegex = /^\|(.+)\|\n\|[\s:-]+\|\n(?:\|.+\|\n?)*$/gm;

    return content.replace(tableRegex, (table) => {
      const lines = table.trim().split('\n').filter(line => line.trim());
      if (lines.length < 3) return table;

      const processedLines = lines.map((line, idx) => {
        if (idx === 1) {
          // Separator row
          return `${muted}${line}${reset}`;
        } else if (idx === 0) {
          // Header row
          return `${bold}${text}${line}${reset}`;
        } else {
          // Data rows
          return `${text}${line}${reset}`;
        }
      });

      return '\n' + processedLines.join('\n') + '\n';
    });
  }

  /**
   * Process blockquotes (> text)
   */
  private processBlockquotes(content: string): string {
    const { muted, text, reset, italic } = this.theme.colors;

    // Process multi-line blockquotes
    const blockquoteRegex = /^>([\s\S]*?)(?=\n\n|\n$|$)/gm;

    return content.replace(blockquoteRegex, (_match, quoteContent) => {
      const lines = quoteContent.split('\n').map((line: string) => line.replace(/^>\s?/, ''));
      const quotedText = lines.join('\n').trim();
      return `\n${muted}│${reset} ${italic}${text}${quotedText}${reset}\n`;
    });
  }

  /**
   * Process headers (# ## ###)
   */
  private processHeaders(content: string): string {
    const { primary, bold, reset, muted, accent } = this.theme.colors;

    // H1: # Header
    content = content.replace(/^#\s+(.+)$/gm, (_match, text) => {
      return `\n${bold}${primary}╔════════════════════════════════════════════════════════════╗${reset}
${bold}${primary}║${reset}  ${bold}${accent}${text}${reset}${' '.repeat(Math.max(0, 56 - text.length))}${bold}${primary}║${reset}
${bold}${primary}╚════════════════════════════════════════════════════════════╝${reset}\n`;
    });

    // H2: ## Header
    content = content.replace(/^##\s+(.+)$/gm, (_match, text) => {
      return `\n${muted}┌──────────────────────────────────────────────────────────────┐${reset}
${muted}│${reset}  ${bold}${primary}${text}${reset}${' '.repeat(Math.max(0, 56 - text.length))}${muted}│${reset}
${muted}└──────────────────────────────────────────────────────────────┘${reset}\n`;
    });

    // H3: ### Header
    content = content.replace(/^###\s+(.+)$/gm, (_match, text) => {
      return `\n${bold}${primary}◆ ${text}${reset}\n`;
    });

    // H4-H6: #### Header
    content = content.replace(/^(####+)\s+(.+)$/gm, (_match, hashes, text) => {
      const depth = hashes.length;
      const indent = '  '.repeat(depth - 3);
      return `${indent}${muted}•${reset} ${text}`;
    });

    return content;
  }

  /**
   * Process horizontal rules (---, ***, ___)
   */
  private processHorizontalRules(content: string): string {
    const { muted, reset } = this.theme.colors;
    const hrRegex = /^[\s]*([-*_])\1{2,}[\s]*$/gm;
    const width = Math.min(process.stdout.columns || 80, 80);

    return content.replace(hrRegex, () => {
      return `\n${muted}${'─'.repeat(width)}${reset}\n`;
    });
  }

  /**
   * Process task lists ([ ] [x])
   */
  private processTaskLists(content: string): string {
    const { muted, reset, success, text } = this.theme.colors;

    // Match task list items: - [ ] task or - [x] task
    const taskListRegex = /^(\s*)-\s*\[([ xX])\]\s+(.+)$/gm;

    return content.replace(taskListRegex, (_match, indent, checked, task) => {
      const isChecked = checked.toLowerCase() === 'x';
      const checkbox = isChecked
        ? `${success}[✓]${reset}`
        : `${muted}[ ]${reset}`;
      const taskText = isChecked
        ? `${muted}${task}${reset}`
        : `${text}${task}${reset}`;
      return `${indent}${checkbox} ${taskText}`;
    });
  }

  /**
   * Process bullet lists and numbered lists
   */
  private processLists(content: string): string {
    const { muted, reset, text, primary } = this.theme.colors;

    // Bullet lists: - item or * item
    const bulletListRegex = /^(\s*)[-*]\s+(.+)$/gm;
    content = content.replace(bulletListRegex, (_match, indent, item) => {
      return `${indent}${muted}•${reset} ${text}${item}${reset}`;
    });

    // Numbered lists: 1. item
    const numberedListRegex = /^(\s*)(\d+)\.\s+(.+)$/gm;
    content = content.replace(numberedListRegex, (_match, indent, num, item) => {
      return `${indent}${primary}${num}.${reset} ${text}${item}${reset}`;
    });

    return content;
  }

  /**
   * Process inline elements: links, images, bold, italic, strikethrough, inline code
   */
  private processInlineElements(content: string): string {
    const { muted, reset, bold, italic, codeBg, primary, text, dim } = this.theme.colors;

    // First, protect code spans from other processing
    const codeSpans: string[] = [];
    content = content.replace(/`([^`]+)`/g, (_match, code) => {
      codeSpans.push(code);
      return `__CODE_SPAN_${codeSpans.length - 1}__`;
    });

    // Images: ![alt](url)
    content = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt, url) => {
      const altText = alt || 'image';
      return `${muted}🖼 ${altText}${reset} ${dim}(${url})${reset}`;
    });

    // Links: [text](url)
    content = content.replace(/\[([^\]]*)\]\(([^)]+)\)/g, (_match, linkText, url) => {
      return `${primary}${linkText}${reset} ${muted}→ ${url}${reset}`;
    });

    // Strikethrough: ~~text~~
    content = content.replace(/~~([^~]+)~~/g, (_match, strikeText) => {
      return `${dim}${strikeText}${reset}`;
    });

    // Bold: **text**
    content = content.replace(/\*\*([^*]+)\*\*/g, (_match, boldText) => {
      return `${bold}${text}${boldText}${reset}`;
    });

    // Bold: __text__ (but not part of links)
    content = content.replace(/(?<!\[)__([^_]+)__(?!\])/g, (_match, boldText) => {
      return `${bold}${text}${boldText}${reset}`;
    });

    // Italic: *text* (avoiding bold)
    content = content.replace(/(?!\*)\*([^*]+)\*(?!\*)/g, (_match, italicText) => {
      return `${italic}${text}${italicText}${reset}`;
    });

    // Italic: _text_ (avoiding bold and links)
    content = content.replace(/(?<!\[)(?<!_)_([^_]+)_(?!_)(?!\])/g, (_match, italicText) => {
      return `${italic}${text}${italicText}${reset}`;
    });

    // Restore code spans
    content = content.replace(/__CODE_SPAN_(\d+)__/g, (_match, index) => {
      const code = codeSpans[parseInt(index)];
      return `${codeBg}${code}${reset}`;
    });

    return content;
  }
}

export default MarkdownRenderer;
