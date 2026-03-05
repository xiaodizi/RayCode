/**
 * Quick preview of the Elegant Gradient theme
 */

import { ElegantGradientTheme } from "./src/cli/themes/elegant-gradient-theme.js";
import type { Theme } from "./src/types/index.js";

const theme: Theme = new ElegantGradientTheme();

console.clear();

// Display the theme
console.log("\n");
console.log("╔═════════════════════════════════════════════════════════════════════════════╗");
console.log("║                                                                           ║");
console.log("║  ✨ Elegant Gradient Theme Preview                                        ║");
console.log("║                                                                           ║");
console.log("╚═════════════════════════════════════════════════════════════════════════════╝");
console.log("\n");

// Banner
console.log(theme.renderBanner("gpt-4o", "/Users/lei.fu/claude_code/raycode", "0.80.0"));
console.log("\n");

// Conversation example
console.log(theme.renderUserMessage("帮我生成一个 React 组件,包含一个计数器"));
console.log("\n");

const assistantResponse = `好的,我来帮你创建一个包含计数器的 React 组件。这个组件将使用 React Hooks 来管理状态。

组件功能:
- 显示当前计数值
- 增加和减少按钮
- 重置按钮
- 响应式设计`;

console.log(theme.renderAssistantMessage(assistantResponse));

console.log("\n");

// Code block example
const code = `import React, { useState } from 'react';

interface CounterProps {
  initialValue?: number;
}

export const Counter: React.FC<CounterProps> = ({ initialValue = 0 }) => {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  const reset = () => setCount(initialValue);

  return (
    <div className="counter">
      <h2>计数器</h2>
      <p>当前值: <span className="count">{count}</span></p>
      <div className="buttons">
        <button onClick={decrement}>-1</button>
        <button onClick={reset}>重置</button>
        <button onClick={increment}>+1</button>
      </div>
    </div>
  );
};`;

console.log(theme.renderCodeBlock(code, "Counter Component"));

console.log("\n");

// Input area
console.log("▶ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("\n");

// Footer
console.log(theme.renderFooter());

console.log("\n");

// Color palette display
console.log("╔═════════════════════════════════════════════════════════════════════════════╗");
console.log("║  🎨 配色方案                                                                ║");
console.log("╚═════════════════════════════════════════════════════════════════════════════╝");
console.log("\n");
console.log("  主题色:");
console.log(`    ${theme.colors.primary}▇▇▇▇▇▇${theme.colors.reset} 暖橙色 (用户消息)     ${theme.colors.accent}▇▇▇▇▇▇${theme.colors.reset} 青蓝色 (助手消息)`);
console.log(`    ${theme.colors.secondary}▇▇▇▇▇▇${theme.colors.reset} 深青蓝              ${theme.colors.success}▇▇▇▇▇▇${theme.colors.reset} 成功绿`);
console.log(`    ${theme.colors.error}▇▇▇▇▇▇${theme.colors.reset} 错误红                ${theme.colors.warning}▇▇▇▇▇▇${theme.colors.reset} 警告黄`);
console.log(`    ${theme.colors.info}▇▇▇▇▇▇${theme.colors.reset} 信息蓝                ${theme.colors.border}▇▇▇▇▇▇${theme.colors.reset} 边框灰`);
console.log("\n");

// Features
console.log("  特性:");
console.log("    ✨ 优雅的双线边框设计");
console.log("    🎨 柔和的渐变配色");
console.log("    👁️ 清晰的视觉层次");
console.log("    💎 圆角卡片风格");
console.log("    🌈 丰富的色彩系统");
console.log("\n");

console.log("═════════════════════════════════════════════════════════════════════════════");
console.log("\n");
console.log("  运行 'bun run src/cli/main.ts' 体验完整界面!");
console.log("\n");
