#!/usr/bin/env bun

import { CodexTheme } from "../src/cli/themes/codex-theme.js";

const theme = new CodexTheme();

console.log("\n=== OpenAI Codex Theme Preview ===\n");

// 渲染 Banner
const banner = theme.renderBanner(
  "gpt-5.2-codex",
  "/Users/lei.fu/LLM/claude_code/deepcode",
  "0.80.0"
);
console.log(banner);

// 渲染用户消息
const userMsg = theme.renderUserMessage("improve documentation in @filename");
console.log(userMsg);
console.log();

// 渲染助手消息
const assistantMsg = theme.renderAssistantMessage("你好！需要我帮你做什么？");
console.log(assistantMsg);
console.log();

// 渲染代码块
const code = theme.renderCodeBlock(
  'function hello() {\n  console.log("Hello, World!");\n}',
  "typescript"
);
console.log(code);

// 渲染 Footer
const footer = theme.renderFooter();
console.log(footer);
console.log();

// 渲染不同上下文百分比的 Footer
console.log("不同上下文百分比的 Footer:");
console.log(theme.renderFooterWithContext(100));
console.log(theme.renderFooterWithContext(60));
console.log(theme.renderFooterWithContext(15));
console.log();

// 渲染状态消息
console.log("状态消息:");
console.log(theme.renderSuccess("操作成功完成"));
console.log(theme.renderError("发生错误"));
console.log(theme.renderWarning("警告信息"));
console.log(theme.renderInfo("提示信息"));
console.log();

console.log("=== Theme Colors ===");
console.log("Primary:", theme.colors.primary);
console.log("Accent:", theme.colors.accent);
console.log("Success:", theme.colors.success);
console.log("Warning:", theme.colors.warning);
console.log("Info:", theme.colors.info);
console.log();