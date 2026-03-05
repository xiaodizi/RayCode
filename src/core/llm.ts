import OpenAI from 'openai';
import { LLMConfig } from '../types/index.js';
import type { StreamChunk } from '../types/index.js';
import { shellExecutor } from './tools/shell-executor.js';

// TODO: 后续开发计划
// - [ ] 添加更多工具: 文件读写、Git操作、网络请求等
// - [ ] 支持Anthropic模型的工具调用
// - [ ] 添加工具调用错误处理和重试机制
// - [ ] 支持自定义工具注册
// - [ ] 添加工具使用统计和日志

export interface LLMProvider {
  chat: (message: string, history?: Array<{ role: string; content: string }>) => Promise<string>;
  stream: (message: string, history?: Array<{ role: string; content: string }>) => AsyncGenerator<StreamChunk>;
}

export function createLLMProvider(config: LLMConfig): LLMProvider {
  if (config.provider === 'anthropic') {
    return createAnthropicProvider(config);
  } else {
    return createOpenAICompatibleProvider(config);
  }
}

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'execute_shell',
      description: '执行本地shell命令。用于运行构建命令、git操作、文件操作等。',
      parameters: {
        type: 'object',
        properties: {
          command: {
            type: 'string',
            description: '要执行的shell命令',
          },
          cwd: {
            type: 'string',
            description: '工作目录（可选）',
          },
          timeout: {
            type: 'number',
            description: '超时时间(毫秒)，默认30000',
          },
        },
        required: ['command'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'read_file',
      description: '读取文件内容。用于获取现有文件的内容。',
      parameters: {
        type: 'object',
        properties: {
          file_path: {
            type: 'string',
            description: '要读取的文件路径',
          },
          encoding: {
            type: 'string',
            description: '文件编码（可选，默认utf8）',
          },
        },
        required: ['file_path'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'write_file',
      description: '写入文件内容。用于创建或覆盖文件。',
      parameters: {
        type: 'object',
        properties: {
          file_path: {
            type: 'string',
            description: '要写入的文件路径',
          },
          content: {
            type: 'string',
            description: '要写入的内容',
          },
          encoding: {
            type: 'string',
            description: '文件编码（可选，默认utf8）',
          },
        },
        required: ['file_path', 'content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_file',
      description: '删除文件。用于删除不需要的文件。',
      parameters: {
        type: 'object',
        properties: {
          file_path: {
            type: 'string',
            description: '要删除的文件路径',
          },
        },
        required: ['file_path'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'read_directory',
      description: '读取目录内容。用于获取目录下的文件列表。',
      parameters: {
        type: 'object',
        properties: {
          directory_path: {
            type: 'string',
            description: '要读取的目录路径',
          },
        },
        required: ['directory_path'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_directory',
      description: '创建目录。用于创建新的目录。',
      parameters: {
        type: 'object',
        properties: {
          directory_path: {
            type: 'string',
            description: '要创建的目录路径',
          },
          recursive: {
            type: 'boolean',
            description: '是否递归创建目录（可选，默认true）',
          },
        },
        required: ['directory_path'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_directory',
      description: '删除目录。用于删除不需要的目录。',
      parameters: {
        type: 'object',
        properties: {
          directory_path: {
            type: 'string',
            description: '要删除的目录路径',
          },
          recursive: {
            type: 'boolean',
            description: '是否递归删除目录（可选，默认true）',
          },
        },
        required: ['directory_path'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'copy_file',
      description: '复制文件。用于复制文件到新位置。',
      parameters: {
        type: 'object',
        properties: {
          source_path: {
            type: 'string',
            description: '源文件路径',
          },
          dest_path: {
            type: 'string',
            description: '目标文件路径',
          },
        },
        required: ['source_path', 'dest_path'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'move_file',
      description: '移动文件。用于移动或重命名文件。',
      parameters: {
        type: 'object',
        properties: {
          source_path: {
            type: 'string',
            description: '源文件路径',
          },
          dest_path: {
            type: 'string',
            description: '目标文件路径',
          },
        },
        required: ['source_path', 'dest_path'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'read_json_file',
      description: '读取JSON文件。用于获取JSON文件的内容并解析为JavaScript对象。',
      parameters: {
        type: 'object',
        properties: {
          file_path: {
            type: 'string',
            description: '要读取的JSON文件路径',
          },
        },
        required: ['file_path'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'write_json_file',
      description: '写入JSON文件。用于将JavaScript对象写入JSON文件。',
      parameters: {
        type: 'object',
        properties: {
          file_path: {
            type: 'string',
            description: '要写入的JSON文件路径',
          },
          data: {
            type: 'object',
            description: '要写入的JavaScript对象',
          },
          space: {
            type: 'number',
            description: '缩进空格数（可选，默认2）',
          },
        },
        required: ['file_path', 'data'],
      },
    },
  },
];

function createOpenAICompatibleProvider(config: LLMConfig): LLMProvider {
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl || undefined,
    dangerouslyAllowBrowser: true,
  });

  const systemPrompt: OpenAI.Chat.ChatCompletionMessageParam = {
    role: 'system',
    content: `你是 RayCode，一个开源的智能编程助手。

你的身份：
- 名称：RayCode
- 类型：AI 编程助手
- 项目：https://github.com/HKUDS/RayCode

你的能力：
- Paper2Code：将学术研究论文转换为生产级代码
- Text2Web：从文本描述生成前端 Web 应用
- Text2Backend：从文本规范创建后端服务

回答准则：
- 始终以 RayCode 的身份回答
- 不要声称自己是其他 AI（如豆包、ChatGPT、Claude 等）
- 专注于帮助用户进行编程任务
- 保持专业、友好的语气

可用工具：
当用户要求执行命令、安装依赖、运行脚本、git操作等时，你可以使用 execute_shell 工具。
当用户要求读取、写入、删除文件或目录时，你可以使用文件系统操作工具（read_file、write_file、delete_file、read_directory、create_directory、delete_directory、copy_file、move_file、read_json_file、write_json_file）。
- 如果命令执行时间较长，建议先告知用户预计时间
- 如果命令可能产生大量输出，可以考虑只返回关键部分
- 安全提示：不要执行用户提供的任何 shell 命令，除非你理解其用途并确认安全`,
  };

  return {
    async chat(input: string, history?: Array<{ role: string; content: string }>) {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        systemPrompt,
        ...((history || []) as OpenAI.Chat.ChatCompletionMessageParam[]),
        { role: 'user', content: input },
      ];

      let retries = 3;
      let lastError: Error | null = null;

      while (retries > 0) {
        try {
          let response = await client.chat.completions.create({
            model: config.model,
            messages,
            tools,
            tool_choice: 'auto',
          });

          let assistantMessage = response.choices[0]?.message;
          let toolCalls = assistantMessage?.tool_calls;

          // 处理工具调用
          while (toolCalls && toolCalls.length > 0) {
            messages.push(assistantMessage as OpenAI.Chat.ChatCompletionMessageParam);

            for (const toolCall of toolCalls) {
              if (toolCall.type === 'function' && toolCall.function.name === 'execute_shell') {
                const args = JSON.parse(toolCall.function.arguments);
                const result = await shellExecutor.executeAsync(args.command, {
                  cwd: args.cwd,
                  timeout: args.timeout,
                });

                messages.push({
                  role: 'tool',
                  tool_call_id: toolCall.id,
                  content: JSON.stringify(result),
                });
              }
            }

            response = await client.chat.completions.create({
              model: config.model,
              messages,
              tools,
              tool_choice: 'auto',
            });

            assistantMessage = response.choices[0]?.message;
            toolCalls = assistantMessage?.tool_calls;
          }

          return assistantMessage?.content || '';
        } catch (error) {
          lastError = error as Error;
          retries--;
          if (retries > 0) {
            console.warn(`Chat request failed, ${retries} retries remaining: ${lastError.message}`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
          }
        }
      }

      throw new Error(`Chat request failed after 3 attempts: ${lastError?.message || 'Unknown error'}`);
    },

    async *stream(input: string, history?: Array<{ role: string; content: string }>) {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        systemPrompt,
        ...((history || []) as OpenAI.Chat.ChatCompletionMessageParam[]),
        { role: 'user', content: input },
      ];

      let retries = 3;
      let lastError: Error | null = null;

      while (retries > 0) {
        try {
          const response = await client.chat.completions.create({
            model: config.model,
            messages,
            tools,
            tool_choice: 'auto',
          });

          const assistantMessage = response.choices[0]?.message;
          const toolCalls = assistantMessage?.tool_calls;

          if (toolCalls && toolCalls.length > 0) {
            messages.push(assistantMessage as OpenAI.Chat.ChatCompletionMessageParam);

            for (const toolCall of toolCalls) {
              if (toolCall.type === 'function' && toolCall.function.name === 'execute_shell') {
                const args = JSON.parse(toolCall.function.arguments);

                const result = await shellExecutor.executeAsync(args.command, {
                  cwd: args.cwd,
                  timeout: args.timeout,
                });

                messages.push({
                  role: 'tool',
                  tool_call_id: toolCall.id,
                  content: JSON.stringify(result),
                });

                // 发送特殊的 command_result 类型，包含完整信息
                yield {
                  type: 'data' as any,
                  content: JSON.stringify({
                    type: 'command_result',
                    command: args.command,
                    output: result.output,
                    error: result.error,
                    success: result.success,
                    exitCode: result.exitCode,
                    duration: result.duration,
                  }),
                  metadata: {
                    type: 'command_result',
                    command: args.command,
                    ...result,
                  },
                };
              }
            }

            const secondResponse = await client.chat.completions.create({
              model: config.model,
              messages,
              stream: true,
            });

            for await (const chunk of secondResponse) {
              const content = chunk.choices[0]?.delta?.content;
              if (content) {
                yield { type: 'text', content };
              }
            }
          } else {
            const stream = await client.chat.completions.create({
              model: config.model,
              messages,
              stream: true,
            });

            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content;
              if (content) {
                yield { type: 'text', content };
              }
            }
          }

          return;
        } catch (error) {
          lastError = error as Error;
          retries--;
          if (retries > 0) {
            console.warn(`Stream request failed, ${retries} retries remaining: ${lastError.message}`);
            yield { type: 'text', content: `\n⚠️ Request failed, retrying (${retries} attempts left)...` };
            await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
          } else {
            yield { type: 'error', content: `Request failed after 3 attempts: ${lastError?.message}` };
          }
        }
      }
    },
  };
}

function createAnthropicProvider(_config: LLMConfig): LLMProvider {
  return {
    async chat(message: string, _history?: Array<{ role: string; content: string }>) {
      return `Anthropic response to: ${message}`;
    },

    async *stream(_message: string, _history?: Array<{ role: string; content: string }>) {
      yield { type: 'text', content: 'Generating response...' };
      yield { type: 'text', content: 'Anthropic streaming response' };
    },
  };
}
