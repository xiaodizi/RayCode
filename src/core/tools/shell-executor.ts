import { confirmationGuard } from "../confirmation-guard.js";
import { ToolResult } from "../../types/index.js";

// TODO: 后续开发计划
// - [ ] 添加命令历史记录功能
// - [ ] 支持交互式shell (PTY)
// - [ ] 添加输出流式返回 (实时显示命令输出)
// - [ ] 支持多命令管道执行
// - [ ] 添加执行日志和审计功能
// - [ ] 支持WebSocket实时输出

export interface ShellOptions {
  timeout?: number;
  cwd?: string;
  env?: Record<string, string>;
  allowedCommands?: string[];
  deniedPatterns?: string[];
}

const DEFAULT_DENIED_PATTERNS = [
  "rm -rf /",
  "rm -rf ~",
  "dd if=",
  ":\\(\\){:|:&};:",
  "curl.*\\|bash",
  "wget.*\\|bash",
  "mkfs\\.",
  ">\\/dev\\/sd",
  "chmod -R 777 /",
  "chown -R",
];

declare const Bun: {
  spawn(args: string[], options: {
    cwd?: string;
    env?: Record<string, string>;
    stdout?: "pipe" | "inherit";
    stderr?: "pipe" | "inherit";
  }): {
    readonly stdout: ReadableStream;
    readonly stderr: ReadableStream;
    readonly exited: Promise<number>;
  };
};

export class ShellExecutor {
  private defaultOptions: Required<ShellOptions> = {
    timeout: 30000,
    cwd: globalThis.process?.cwd() || "/",
    env: {},
    allowedCommands: [],
    deniedPatterns: DEFAULT_DENIED_PATTERNS,
  };

  async executeAsync(command: string, options?: ShellOptions): Promise<ToolResult> {
    const opts = { ...this.defaultOptions, ...options };
    const startTime = Date.now();

    const securityCheck = this.validateCommand(command, opts);
    if (!securityCheck.valid) {
      return {
        success: false,
        output: "",
        error: securityCheck.reason,
        exitCode: 1,
        duration: Date.now() - startTime,
      };
    }

    // Confirmation check
    const confirmation = await confirmationGuard.confirm({
      command,
      cwd: opts.cwd,
      env: opts.env,
    });
    if (!confirmation.confirmed) {
      return {
        success: false,
        output: "",
        error: confirmation.reason || "Command not confirmed",
        exitCode: 1,
        duration: Date.now() - startTime,
      };
    }

    try {
      // 通过 shell 执行命令以支持管道、重定向等特性
      const shell = process.env.SHELL || "/bin/bash";
      const cleanCommand = confirmationGuard.extractCleanCommand(command);
      const args = [shell, "-c", cleanCommand];
      const currentEnv = globalThis.process?.env || {};
      const filteredEnv: Record<string, string> = {};
      for (const key in currentEnv) {
        const value = currentEnv[key];
        if (value !== undefined) {
          filteredEnv[key] = value;
        }
      }
      const child = Bun.spawn(args, {
        cwd: opts.cwd,
        env: { ...filteredEnv, ...opts.env },
        stdout: "pipe",
        stderr: "pipe",
      });

      const [stdout, stderr] = await Promise.all([
        new Response(child.stdout).text(),
        new Response(child.stderr).text(),
      ]);

      const exitCode = await child.exited;

      return {
        success: exitCode === 0,
        output: stdout,
        error: stderr || undefined,
        exitCode,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        output: "",
        error: error instanceof Error ? error.message : "Unknown error",
        exitCode: 1,
        duration: Date.now() - startTime,
      };
    }
  }

  private validateCommand(
    command: string,
    opts: Required<ShellOptions>
  ): { valid: boolean; reason?: string } {
    for (const pattern of opts.deniedPatterns) {
      if (new RegExp(pattern, "i").test(command)) {
        return { valid: false, reason: `Command blocked: matches prohibited pattern "${pattern}"` };
      }
    }

    if (opts.allowedCommands.length > 0) {
      const cmdName = command.trim().split(/\s+/)[0];
      if (!opts.allowedCommands.includes(cmdName)) {
        return { valid: false, reason: `Command "${cmdName}" not in whitelist` };
      }
    }

    return { valid: true };
  }
}

export const shellExecutor = new ShellExecutor();
