#!/usr/bin/env bun

// Simple test to verify basic functionality

import { createLLMProvider } from '../src/core/llm.js';
import { getConfig } from '../src/config/index.js';
import { ConversationUI } from '../src/cli/conversation-ui.js';

console.log('🧪 RayCode Functionality Test');
console.log('=============================');

try {
  console.log('1. Configuration...');
  const config = getConfig();
  console.log('✅ Config loaded');
  
  console.log('2. LLM Provider...');
  const llmProvider = createLLMProvider(config.llm);
  console.log('✅ LLM provider created');
  
  console.log('3. UI Rendering...');
  const userMessage = ConversationUI.renderUserMessage('test message');
  console.log(userMessage);
  
  const assistantMessage = ConversationUI.renderAssistantMessage('test response');
  console.log(assistantMessage);
  
  const thinking = ConversationUI.renderThinking();
  console.log(thinking);
  
  const prompt = ConversationUI.renderUserPrompt();
  console.log(`Prompt: ${prompt}`);
  
  console.log('\n4. Basic Chat...');
  const response = await llmProvider.chat('Hello world');
  console.log('✅ Chat response:', response);
  
  console.log('\n🎉 All tests passed!');
  
} catch (error) {
  console.error('\n❌ Test failed:');
  console.error(error);
}