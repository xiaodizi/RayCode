import dotenv from 'dotenv';
import { Config, LLMProvider, LLMConfig } from '../types/index.js';

dotenv.config();

export function getConfig(): Config {
  return {
    llm: {
      provider: (process.env.LLM_PROVIDER as LLMProvider) || 'openai',
      apiKey: process.env.LLM_API_KEY || '',
      baseUrl: process.env.LLM_BASE_URL || '',
      model: process.env.LLM_MODEL || 'gpt-4o',
    },
    api: {
      timeout: parseInt(process.env.API_TIMEOUT || '30000'),
      retryCount: parseInt(process.env.API_RETRY_COUNT || '3'),
      retryDelay: parseInt(process.env.API_RETRY_DELAY || '1000'),
    },
    workflow: {
      maxSteps: parseInt(process.env.WORKFLOW_MAX_STEPS || '20'),
      stepTimeout: parseInt(process.env.WORKFLOW_STEP_TIMEOUT || '60000'),
      enableParallelExecution: process.env.WORKFLOW_ENABLE_PARALLEL === 'true',
    },
    logging: {
      level: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
      enableFileLogging: process.env.LOG_ENABLE_FILE === 'true',
      logFile: process.env.LOG_FILE || 'raycode.log',
    },
    environment: {
      mode: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
    },
  };
}