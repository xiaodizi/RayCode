export type LLMProvider = 'openai' | 'anthropic' | 'litellm' | 'volcengine';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  baseUrl?: string;
  model: string;
}

export interface Config {
  llm: LLMConfig;
  api: APIConfig;
  workflow: WorkflowConfig;
  logging: LoggingConfig;
  environment: {
    mode: 'development' | 'production' | 'test';
  };
}

export interface APIConfig {
  timeout: number;
  retryCount: number;
  retryDelay: number;
}

export interface WorkflowConfig {
  maxSteps: number;
  stepTimeout: number;
  enableParallelExecution: boolean;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  enableFileLogging: boolean;
  logFile: string;
}

export interface StreamChunk {
  type: 'text' | 'code' | 'error' | 'progress' | 'data';
  content: string;
  metadata?: any;
}

export type WorkflowType = 'paper2code' | 'text2web' | 'text2backend';

export interface WorkflowResult {
  success: boolean;
  output: string;
  duration: number;
  steps: WorkflowStep[];
}

export interface WorkflowStep {
  name: string;
  status: 'running' | 'completed' | 'failed';
  duration: number;
  output?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ToolResult {
  success: boolean;
  output: string;
  error?: string;
  exitCode: number;
  duration: number;
}

// Theme System Types
export type ThemeType = 'aurora' | 'cyberpunk' | 'retro' | 'minimal' | 'codex' | 'elegant';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  muted: string;
  gray: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  reset: string;
  user: string;
  assistant: string;
  thinking: string;
  bold: string;
  dim: string;
  italic?: string;
  background?: string;
  border?: string;
  codeBorder?: string;
  codeBg?: string;
}

export interface Theme {
  name: ThemeType;
  displayName: string;
  description: string;
  colors: ThemeColors;
  bannerColors?: {
    top: string;
    middle: string;
    bottom: string;
    accent: string;
  };
  renderUserPrompt: () => string;
  renderUserMessage: (message: string, width?: number) => string;
  renderAssistantMessage: (message: string, width?: number) => string;
  renderThinking: (frameIndex?: number) => string;
  renderSuccess: (message: string) => string;
  renderError: (message: string) => string;
  renderWarning: (message: string) => string;
  renderInfo: (message: string) => string;
  renderCodeBlock: (code: string, language?: string) => string;
  renderProgress: (current: number, total: number, width?: number) => string;
  renderJSON: (obj: any, indent?: number) => string;
  renderBanner: (model: string, directory: string, version: string, frame?: number) => string;
  renderHeader?: (title: string, mode?: string) => string;
  renderFooter?: () => string;
}

export * from "../tools/types.js";
