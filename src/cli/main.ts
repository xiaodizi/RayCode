
import { confirmationGuard } from "../core/confirmation-guard.js";
import { RayCodeEngine, createLLMProvider } from "../core/index.js";
import { getConfig } from "../config/index.js";
import { generateId } from "../utils/helpers.js";
import { ConfirmationUI } from "./confirmation-ui.js";
import { getVersion } from "../config/version.js";
import { UIEngine } from "./ui-engine.js";
import { ThemeType } from "../types/index.js";
import { ChatMessage } from "../types/index.js";

export class CLI {
  private engine: RayCodeEngine;
  private sessionId: string;
  private config: ReturnType<typeof getConfig>;
  private uiEngine: UIEngine;
  private messages: ChatMessage[] = [];
  private terminalHeight: number = 24;
  private terminalWidth: number = 80;
  private inputBuffer: string = '';
  private messageScrollOffset: number = 0; // 消息滚动偏移量

  constructor() {
    this.config = getConfig();
    const llmProvider = createLLMProvider({
      provider: this.config.llm.provider,
      apiKey: this.config.llm.apiKey,
      baseUrl: this.config.llm.baseUrl,
      model: this.config.llm.model,
    });

    this.engine = new RayCodeEngine(llmProvider);
    this.sessionId = generateId("session");
    this.uiEngine = new UIEngine('elegant');

    this.updateTerminalSize();
    process.stdout.on('resize', () => {
      this.updateTerminalSize();
      this.messageScrollOffset = 0; // 重置滚动偏移
      this.render();
    });

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    process.stdin.on('data', (data) => this.handleKeypress(data));

    confirmationGuard.setHandler(async (request) => {
      return this.showConfirmationDialog(request);
    });
  }

  private updateTerminalSize(): void {
    this.terminalHeight = process.stdout.rows || 24;
    this.terminalWidth = process.stdout.columns || 80;
  }

  private async showConfirmationDialog(request: any): Promise<{ confirmed: boolean; reason?: string }> {
    return new Promise((resolve) => {
      const analysis = ConfirmationUI.analyzeCommand(request.command);
      const ui = ConfirmationUI.render(request, analysis, {
        showDetails: true,
        allowEdit: false,
      });

      process.stdout.write("\n" + ui + "\n");

      const { reset, bold, fgRed, fgLight, bgGreen, dim } = {
        reset: "\x1b[0m",
        bold: "\x1b[1m",
        dim: "\x1b[2m",
        fgRed: "\x1b[38;2;239;68;68m",
        fgLight: "\x1b[38;2;229;231;235m",
        bgGreen: "\x1b[48;2;20;83;45m",
      };

      process.stdout.write("\n");
      process.stdout.write(`${fgLight}${bold}Choose an action:${reset}\n`);
      process.stdout.write("\n");
      process.stdout.write(
        `${bgGreen}${fgLight}${bold}  [Y] Yes, execute  ${reset}   ${fgRed}[N] No, cancel${reset}\n`
      );
      process.stdout.write("\n");
      process.stdout.write(`${dim}Type Y for Yes, N for No, or D for Details${reset}\n`);

      const handleConfirmInput = (data: Buffer) => {
        const input = data.toString().toLowerCase().trim();

        if (input === 'y') {
          process.stdout.write(ConfirmationUI.renderConfirmed());
          process.stdin.off('data', handleConfirmInput);
          resolve({ confirmed: true });
        } else if (input === 'n') {
          process.stdout.write(ConfirmationUI.renderCancelled());
          process.stdin.off('data', handleConfirmInput);
          resolve({ confirmed: false, reason: "User declined" });
        } else if (input === 'd') {
          const detailed = ConfirmationUI.renderDetailedAnalysis(request.command, analysis);
          process.stdout.write("\n" + detailed + "\n");
        }
      };

      process.stdin.on('data', handleConfirmInput);
    });
  }

  private handleKeypress(data: Buffer): void {
    const key = data.toString();

    if (key === '\x03') {
      this.exit();
      return;
    }

    // 检测回车或换行
    if (key === '\r' || key === '\n') {
      this.submitInput();
      return;
    }

    // 处理包含换行符的输入 (如 "hello\n")
    if (key.includes('\n') || key.includes('\r')) {
      const cleanInput = key.replace(/[\r\n]+$/, '');
      if (cleanInput) {
        this.inputBuffer += cleanInput;
      }
      this.submitInput();
      return;
    }

    // 退格键
    if (key === '\x7f' || key === '\b') {
      this.inputBuffer = this.inputBuffer.slice(0, -1);
      this.renderInputOnly();
      return;
    }

    // 向上滚动消息 (PageUp / Ctrl+U / ↑箭头)
    if (key === '\x1b[5~' || key === '\x1b[A' || (key === '\x15' && this.inputBuffer.length === 0)) {
      this.scrollMessages(1);
      return;
    }

    // 向下滚动消息 (PageDown / Ctrl+D / ↓箭头)
    if (key === '\x1b[6~' || key === '\x1b[B' || (key === '\x04' && this.inputBuffer.length === 0)) {
      this.scrollMessages(-1);
      return;
    }

    // 滚动到顶部 (Home / Ctrl+Home)
    if (key === '\x1b[H' || key === '\x1b[1~' || key === '\x1bOH') {
      this.scrollToTop();
      return;
    }

    // 滚动到底部 (End / Ctrl+End)
    if (key === '\x1b[F' || key === '\x1b[4~' || key === '\x1bOF') {
      this.scrollToBottom();
      return;
    }

    // 允许所有可打印字符（包括中文等多字节字符）
    // 排除控制字符（ASCII 0-31）
    const firstCharCode = key.charCodeAt(0);
    if (firstCharCode >= 32 || firstCharCode >= 128) {
      this.inputBuffer += key;
      this.renderInputOnly();
    }
  }

  // 滚动消息
  private scrollMessages(delta: number): void {
    const allMessageLines = this.getMessageLines();
    const maxScroll = Math.max(0, allMessageLines.length - this.getMessageAreaHeight());
    this.messageScrollOffset = Math.max(0, Math.min(this.messageScrollOffset + delta, maxScroll));
    this.render();
  }

  // 滚动到顶部
  private scrollToTop(): void {
    const allMessageLines = this.getMessageLines();
    this.messageScrollOffset = Math.max(0, allMessageLines.length - this.getMessageAreaHeight());
    this.render();
  }

  // 滚动到底部
  private scrollToBottom(): void {
    this.messageScrollOffset = 0;
    this.render();
  }

  // 获取消息区域高度
  private getMessageAreaHeight(): number {
    const allMessageLines = this.getMessageLines();
    return allMessageLines.length;
  }

  private submitInput(): void {
    const input = this.inputBuffer.trim();
    this.inputBuffer = '';

    if (!input) {
      this.renderInputOnly();
      return;
    }

    if (this.handleCommand(input)) {
      return;
    }

    this.messages.push({
      role: 'user',
      content: input,
      timestamp: new Date(),
    });
    this.render();
    this.processChat(input);
  }

  private handleCommand(input: string): boolean {
    const [command, ...args] = input.split(' ');
    const cmd = command.toLowerCase();

    if (cmd === 'exit' || cmd === 'quit' || cmd === 'q') {
      this.exit();
      return true;
    }

    if (cmd === 'clear' || cmd === 'cls') {
      this.messages = [];
      this.render();
      return true;
    }

    if (cmd === 'help' || cmd === '?') {
      this.showHelp();
      return true;
    }

    if (cmd === 'status' || cmd === 'stat') {
      this.showStatus();
      return true;
    }

    if (cmd === 'version' || cmd === 'v') {
      this.showVersion();
      return true;
    }

    if (cmd === 'theme') {
      if (args.length > 0) {
        this.setTheme(args.join(' '));
      } else {
        this.listThemes();
      }
      return true;
    }

    return false;
  }

  private clearScreen(): void {
    process.stdout.write('\x1b[2J');
    process.stdout.write('\x1b[3J');
    process.stdout.write('\x1b[H');
  }

  private renderLogo(): string {
    // 递增uiEngine的帧计数器以实现闪烁效果
    this.uiEngine.nextFrame();
    return this.uiEngine.renderBanner(
      this.config.llm.model || 'default',
      process.cwd(),
      getVersion()
    );
  }

  private render(): void {
    this.updateTerminalSize();
    this.clearScreen();

    // Logo 始终显示在最顶部
    const banner = this.renderLogo();
    process.stdout.write(banner + '\n\n');

    // 计算布局尺寸
    const bannerLines = this.countBannerLines(banner);
    const footerHeight = 1;
    const inputHeight = 1;
    const separatorLines = 1;

    // 获取所有消息行
    const allMessageLines = this.getMessageLines();

    // 动态消息区域高度
    const availableHeight = this.terminalHeight - bannerLines - footerHeight - inputHeight - separatorLines;

    // 计算可见消息范围（支持滚动）
    const totalMessages = allMessageLines.length;
    let visibleMessages: string[];
    let scrollOffset = 0;

    if (totalMessages > availableHeight) {
      const maxScroll = totalMessages - availableHeight;
      scrollOffset = Math.max(0, Math.min(this.messageScrollOffset, maxScroll));
      visibleMessages = allMessageLines.slice(scrollOffset, scrollOffset + availableHeight);
    } else {
      visibleMessages = allMessageLines;
    }

    // 渲染可见消息
    for (const line of visibleMessages) {
      process.stdout.write(line + '\n');
    }

    // 空行分隔
    process.stdout.write('\n');

    // Footer
    const footer = this.uiEngine.renderFooter();
    process.stdout.write(footer + '\n');

    // 移动光标到输入行末尾
    this.positionCursor(visibleMessages.length);
  }

  // 定位光标到输入行末尾
  private positionCursor(visibleMessageLines: number): void {
    const banner = this.renderLogo();
    const bannerLines = this.countBannerLines(banner);
    
    // 计算实际输出的行数
    const bannerWithNewlines = bannerLines + 1; // banner后有\n\n
    // 消息行 + 空行分隔 + footer + 输入行
    const inputLine = bannerWithNewlines + visibleMessageLines + 1 + 1 + 1;

    const inputPrompt = this.uiEngine.renderUserPrompt();
    const visiblePrompt = inputPrompt.replace(/\x1b\[[0-9;]*m/g, '');
    const cursorChar = '|';

    process.stdout.write(`\x1b[${inputLine};1H`);
    process.stdout.write('\x1b[K');
    process.stdout.write(inputPrompt + this.inputBuffer + cursorChar);

    const inputWidth = this.getDisplayWidth(this.inputBuffer);
    const visibleLength = visiblePrompt.length + inputWidth + 1;
    process.stdout.write(`\x1b[${inputLine};${visibleLength}H`);
  }

  private renderInputOnly(): void {
    // 使用完整 render 来确保布局正确
    this.render();
  }

  // 计算字符串的显示宽度（考虑宽字符如中文）
  private getDisplayWidth(str: string): number {
    let width = 0;
    for (const char of str) {
      const code = char.charCodeAt(0);
      // 中文字符、日文字符、韩文字符等宽字符
      if (
        (code >= 0x4e00 && code <= 0x9fff) ||   // 中文
        (code >= 0x3040 && code <= 0x30ff) ||   // 日文
        (code >= 0xac00 && code <= 0xd7af) ||   // 韩文
        (code >= 0xff00 && code <= 0xffef)      // 全角字符
      ) {
        width += 2;
      } else {
        width += 1;
      }
    }
    return width;
  }

  // 计算 banner 的实际行数(移除 ANSI 代码后计算)
  private countBannerLines(banner: string): number {
    const cleanBanner = banner.replace(/\x1b\[[0-9;]*m/g, '');
    return cleanBanner.split('\n').length;
  }

  private getMessageLines(): string[] {
    const lines: string[] = [];
    const theme = this.uiEngine;
    const userColor = theme.colors.primary || theme.colors.bold;
    const assistantColor = theme.colors.secondary || theme.colors.bold;

    let lastRole = '';

    for (let i = 0; i < this.messages.length; i++) {
      const msg = this.messages[i] as { role: string; content: string; isThinking?: boolean };

      if (msg.role === 'user') {
        if (lastRole === 'assistant') {
          lines.push(theme.colors.dim + '─'.repeat(30) + theme.colors.reset);
        }
        lines.push(userColor + '💬 You: ' + theme.colors.reset + msg.content);
      } else if (msg.role === 'assistant') {
        if (msg.isThinking) {
          lines.push(theme.colors.dim + msg.content + theme.colors.reset);
        } else {
          const msgLines = msg.content.split('\n');
          if (msgLines.length > 0) {
            msgLines[0] = assistantColor + '✨ RayCode: ' + theme.colors.reset + msgLines[0];
          }
          lines.push(...msgLines);
        }
      } else {
        lines.push(theme.colors.dim + '[system] ' + msg.content + theme.colors.reset);
      }

      lastRole = msg.role;
    }

    return lines;
  }

  private async processChat(input: string): Promise<void> {
    try {
      let fullResponse = '';
      let tokenCount = 0;
      let startTime = Date.now();
      let thinkingMessage = {
        role: 'assistant' as const,
        content: '',
        timestamp: new Date(),
        isThinking: true,
        tokenCount: 0,
        elapsedTime: 0,
      };
      this.messages.push(thinkingMessage);
      this.render();

      const spinChars = ['*', '+', 'x', '@', '#', '●'];
       const thinkingWords = ['Thinking', 'Thinking.', 'Thinking..', 'Thinking...'];
       let spinIndex = 0;
       let wordIndex = 0;

      const thinkingInterval = setInterval(() => {
        spinIndex = (spinIndex + 1) % spinChars.length;
        thinkingMessage.content = `${spinChars[spinIndex]} ${thinkingWords[wordIndex]} | ⏱️ ${thinkingMessage.elapsedTime}s | 💰 ${thinkingMessage.tokenCount} tokens`;
        
        // 每次更新都渲染，确保思考图标实时显示
        this.renderInputOnly();
        
        thinkingMessage.elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      }, 100);

      const wordInterval = setInterval(() => {
        wordIndex = (wordIndex + 1) % thinkingWords.length;
      }, 400);

      for await (const chunk of this.engine.streamChat(input)) {
        if (chunk.type === 'text') {
          fullResponse += chunk.content;
          tokenCount += chunk.content.split(/\s+/).length;
          thinkingMessage.tokenCount = tokenCount;
        }
      }

      clearInterval(thinkingInterval);
      clearInterval(wordInterval);

      if (fullResponse) {
        const totalTime = Math.floor((Date.now() - startTime) / 1000);
        thinkingMessage.content = `${fullResponse}\n\n${this.uiEngine.colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━${this.uiEngine.colors.reset}\n✅ 完成 | ⏱️ ${totalTime}s | 💰 ${tokenCount} tokens`;
        thinkingMessage.isThinking = false;
      } else {
        this.messages.pop();
      }
    } catch (error) {
      this.messages.push({
        role: 'assistant',
        content: this.uiEngine.renderError(error instanceof Error ? error.message : 'Unknown error'),
        timestamp: new Date(),
      });
    }

    this.render();
  }

  private showHelp(): void {
    const theme = this.uiEngine;
    const helpContent = `${theme.colors.bold}Commands${theme.colors.reset}
  ${theme.colors.primary}help${theme.colors.reset}      Show this help
  ${theme.colors.primary}exit${theme.colors.reset}      Exit the app
  ${theme.colors.primary}clear${theme.colors.reset}     Clear chat
  ${theme.colors.primary}status${theme.colors.reset}    Show status
  ${theme.colors.primary}theme${theme.colors.reset}     Change theme

${theme.colors.bold}Navigation${theme.colors.reset}
  ${theme.colors.primary}PageUp${theme.colors.reset}    Scroll messages up
  ${theme.colors.primary}PageDown${theme.colors.reset}  Scroll messages down
  ${theme.colors.primary}Home${theme.colors.reset}      Scroll to top
  ${theme.colors.primary}End${theme.colors.reset}       Scroll to bottom`;

    this.messages.push({
      role: 'assistant',
      content: helpContent,
      timestamp: new Date(),
    });
    this.render();
  }

  private showStatus(): void {
    const statusContent = `Session: ${this.sessionId.slice(0, 8)}
Provider: ${this.config.llm.provider}
Model: ${this.config.llm.model || 'default'}`;

    this.messages.push({
      role: 'assistant',
      content: statusContent,
      timestamp: new Date(),
    });
    this.render();
  }

  private showVersion(): void {
    const version = getVersion();
    this.messages.push({
      role: 'assistant',
      content: `RayCode v${version}`,
      timestamp: new Date(),
    });
    this.render();
  }

  private setTheme(themeName: string): void {
    const availableThemes = this.uiEngine.listAvailableThemes();
    const theme = availableThemes.find(t => t.type === themeName.toLowerCase() || t.name.toLowerCase() === themeName.toLowerCase());

    if (theme) {
      this.uiEngine.setTheme(theme.type as ThemeType);
      this.messages.push({
        role: 'assistant',
        content: this.uiEngine.renderSuccess(`Theme changed to: ${theme.name}`),
        timestamp: new Date(),
      });
    } else {
      this.messages.push({
        role: 'assistant',
        content: this.uiEngine.renderError(`Unknown theme: ${themeName}`),
        timestamp: new Date(),
      });
    }
    this.render();
  }

  private listThemes(): void {
    const themes = this.uiEngine.listAvailableThemes();
    const theme = this.uiEngine;

    let output = `${theme.colors.bold}Themes${theme.colors.reset}\n`;
    for (const t of themes) {
      const isCurrent = t.type === this.uiEngine.getThemeType();
      output += `  ${theme.colors.primary}${t.type}${theme.colors.reset}${isCurrent ? ' (current)' : ''}\n`;
    }

    this.messages.push({
      role: 'assistant',
      content: output,
      timestamp: new Date(),
    });
    this.render();
  }

  private exit(): void {
    // 先恢复终端模式
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }

    // 清屏并移动光标到左上角
    process.stdout.write('\x1b[2J');  // 清除整个屏幕
    process.stdout.write('\x1b[3J');  // 清除滚动缓冲区
    process.stdout.write('\x1b[H');   // 移动光标到左上角

    const theme = this.uiEngine;
    console.log(`${theme.colors.bold}${theme.colors.primary}Goodbye!${theme.colors.reset}`);
    process.exit(0);
  }

  async start(): Promise<void> {
    this.render();
    // Keep the process alive indefinitely to wait for user input
    return new Promise(() => {});
  }
}

export async function runCLI(): Promise<void> {
  const cli = new CLI();
  await cli.start();
}

runCLI();
