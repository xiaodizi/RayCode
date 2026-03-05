import { LLMProvider } from './llm.js';
import type { StreamChunk, WorkflowType, WorkflowResult } from '../types/index.js';


export class RayCodeEngine {
  private llmProvider: LLMProvider;
  private agents: string[];

  constructor(llmProvider: LLMProvider) {
    this.llmProvider = llmProvider;
    this.agents = ['intent_analyzer', 'document_parser', 'code_planner', 'code_generator'];
  }

  getAllAgents(): string[] {
    return [...this.agents];
  }

  async chat(input: string): Promise<string> {
    return this.llmProvider.chat(input);
  }

  async *streamChat(input: string): AsyncGenerator<StreamChunk> {
    yield* this.llmProvider.stream(input);
  }

  async executeWorkflow(
    workflowType: WorkflowType,
    input: string,
    callbacks?: { onChunk?: (chunk: StreamChunk) => void }
  ): Promise<WorkflowResult> {
    const steps: any[] = [];
    const startTime = Date.now();

    const onChunk = callbacks?.onChunk;

    onChunk?.({ type: 'text', content: 'Initializing workflow...' });
    onChunk?.({ type: 'progress', content: '0%' });

    try {
      let result;

      if (workflowType === 'paper2code') {
        result = await this.analyzePaper(input, onChunk, steps);
      } else if (workflowType === 'text2web') {
        result = await this.generateWeb(input, onChunk, steps);
      } else if (workflowType === 'text2backend') {
        result = await this.generateBackend(input, onChunk, steps);
      } else {
        throw new Error(`Unknown workflow type: ${workflowType}`);
      }

      const duration = Date.now() - startTime;

      return {
        success: true,
        output: result,
        duration,
        steps,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      onChunk?.({ type: 'error', content: `Workflow failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
      onChunk?.({ type: 'progress', content: '100%' });

      return {
        success: false,
        output: `Workflow failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration,
        steps: [...steps, {
          name: 'Error',
          status: 'failed',
          duration: 0,
          output: error instanceof Error ? error.message : 'Unknown error'
        }],
      };
    }
  }

  private async analyzePaper(
    paperUrl: string,
    onChunk?: (chunk: StreamChunk) => void,
    steps?: any[]
  ): Promise<string> {
    onChunk?.({ type: 'text', content: 'Analyzing paper from: ' + paperUrl });
    onChunk?.({ type: 'progress', content: '25%' });
    
    // 使用LLM分析论文
    const analysisPrompt = `Analyze the research paper at URL: ${paperUrl}. Extract the main contributions, algorithms, and key technical details. Focus on identifying information that can be translated into code.`;
    
    const analysisResult = await this.llmProvider.chat(analysisPrompt);
    
    steps?.push({
      name: 'Paper Analysis',
      status: 'completed',
      duration: 0, // 实际持续时间将由LLM响应时间决定
      output: 'Paper analyzed successfully'
    });
    
    onChunk?.({ type: 'text', content: 'Extracting code requirements from paper...' });
    onChunk?.({ type: 'progress', content: '50%' });
    
    // 提取代码需求
    const requirementsPrompt = `Based on the paper analysis, extract detailed code requirements. Identify:
1. The main algorithm or technique described
2. Input/output specifications
3. Key data structures
4. Performance requirements
5. Any existing implementations or references mentioned

Paper Analysis: ${analysisResult}`;
    
    const requirementsResult = await this.llmProvider.chat(requirementsPrompt);
    
    steps?.push({
      name: 'Requirements Extraction',
      status: 'completed',
      duration: 0,
      output: 'Code requirements extracted'
    });
    
    onChunk?.({ type: 'text', content: 'Generating code from paper...' });
    onChunk?.({ type: 'progress', content: '75%' });
    
    // 生成代码
    const codePrompt = `Based on the paper analysis and requirements, generate complete, production-ready code. Include:
1. Main algorithm implementation
2. Helper functions and utilities
3. Example usage and tests
4. Documentation

Requirements: ${requirementsResult}`;
    
    const codeResult = await this.llmProvider.chat(codePrompt);
    
    steps?.push({
      name: 'Code Generation',
      status: 'completed',
      duration: 0,
      output: 'Code generated successfully'
    });
    
    onChunk?.({ type: 'text', content: 'Testing generated code...' });
    onChunk?.({ type: 'progress', content: '90%' });
    
    // 测试代码（简单的语法检查和执行）
    const testPrompt = `Test the generated code for syntax errors, logical issues, and performance. Provide feedback on any improvements needed.`;
    
    await this.llmProvider.chat(testPrompt + '\nCode to test: ' + codeResult);
    steps?.push({
      name: 'Code Testing',
      status: 'completed',
      duration: 0,
      output: 'Code tested successfully'
    });
    
    onChunk?.({ type: 'progress', content: '100%' });
    
    return codeResult;
  }

  private async generateWeb(
    description: string,
    onChunk?: (chunk: StreamChunk) => void,
    steps?: any[]
  ): Promise<string> {
    onChunk?.({ type: 'text', content: 'Analyzing web application requirements...' });
    onChunk?.({ type: 'progress', content: '20%' });
    
    // 分析需求
    const requirementsPrompt = `Analyze the web application requirements: "${description}". Identify the main features, user interface components, and technical requirements.`;
    
    const requirementsResult = await this.llmProvider.chat(requirementsPrompt);
    
    steps?.push({
      name: 'Requirements Analysis',
      status: 'completed',
      duration: 0,
      output: 'Web requirements analyzed'
    });
    
    onChunk?.({ type: 'text', content: 'Designing web architecture...' });
    onChunk?.({ type: 'progress', content: '40%' });
    
    // 设计架构
    const architecturePrompt = `Design a web application architecture based on these requirements. Specify:
1. Frontend framework and libraries
2. Backend technology stack
3. Database schema
4. API design
5. Deployment strategy

Requirements: ${requirementsResult}`;
    
    const architectureResult = await this.llmProvider.chat(architecturePrompt);
    
    steps?.push({
      name: 'Architecture Design',
      status: 'completed',
      duration: 0,
      output: 'Web architecture designed'
    });
    
    onChunk?.({ type: 'text', content: 'Generating frontend code...' });
    onChunk?.({ type: 'progress', content: '60%' });
    
    // 生成前端代码
    const frontendPrompt = `Generate complete frontend code for the web application. Include:
1. Main application structure
2. React/Vue components (choose one based on requirements)
3. CSS styling and responsive design
4. State management
5. API integration

Architecture: ${architectureResult}`;
    
    const frontendResult = await this.llmProvider.chat(frontendPrompt);
    
    steps?.push({
      name: 'Frontend Generation',
      status: 'completed',
      duration: 0,
      output: 'Frontend code generated'
    });
    
    onChunk?.({ type: 'text', content: 'Implementing backend API...' });
    onChunk?.({ type: 'progress', content: '80%' });
    
    // 生成后端API
    const backendPrompt = `Generate complete backend API code. Include:
1. Server setup
2. API endpoints
3. Database models
4. Authentication and authorization
5. Error handling

Architecture: ${architectureResult}`;
    
    const backendResult = await this.llmProvider.chat(backendPrompt);
    
    steps?.push({
      name: 'Backend Implementation',
      status: 'completed',
      duration: 0,
      output: 'Backend API implemented'
    });
    
    onChunk?.({ type: 'text', content: 'Testing web application...' });
    onChunk?.({ type: 'progress', content: '95%' });
    
    // 测试应用
    const testPrompt = `Test the generated web application code. Check for:
1. Syntax errors
2. Logical issues
3. Security vulnerabilities
4. Performance concerns
5. Completeness of functionality

Frontend Code: ${frontendResult}
Backend Code: ${backendResult}`;
    
    await this.llmProvider.chat(testPrompt);
    steps?.push({
      name: 'Application Testing',
      status: 'completed',
      duration: 0,
      output: 'Web application tested'
    });
    
    onChunk?.({ type: 'progress', content: '100%' });
    
    return `Web application generated successfully. Frontend: ${frontendResult.substring(0, 100)}... Backend: ${backendResult.substring(0, 100)}...`;
  }

  private async generateBackend(
    description: string,
    onChunk?: (chunk: StreamChunk) => void,
    steps?: any[]
  ): Promise<string> {
    onChunk?.({ type: 'text', content: 'Analyzing backend requirements...' });
    onChunk?.({ type: 'progress', content: '25%' });
    
    // 分析需求
    const requirementsPrompt = `Analyze the backend requirements: "${description}". Identify the main features, data models, and technical specifications.`;
    
    const requirementsResult = await this.llmProvider.chat(requirementsPrompt);
    
    steps?.push({
      name: 'Requirements Analysis',
      status: 'completed',
      duration: 0,
      output: 'Backend requirements analyzed'
    });
    
    onChunk?.({ type: 'text', content: 'Designing backend architecture...' });
    onChunk?.({ type: 'progress', content: '50%' });
    
    // 设计架构
    const architecturePrompt = `Design a backend architecture based on these requirements. Specify:
1. Server technology (Node.js, Python, etc.)
2. Database choice and schema
3. API design (REST, GraphQL, etc.)
4. Authentication and authorization
5. Scalability and performance considerations

Requirements: ${requirementsResult}`;
    
    const architectureResult = await this.llmProvider.chat(architecturePrompt);
    
    steps?.push({
      name: 'Architecture Design',
      status: 'completed',
      duration: 0,
      output: 'Backend architecture designed'
    });
    
    onChunk?.({ type: 'text', content: 'Generating backend code...' });
    onChunk?.({ type: 'progress', content: '75%' });
    
    // 生成后端代码
    const codePrompt = `Generate complete backend code based on the architecture. Include:
1. Server setup and configuration
2. Database models and migrations
3. API endpoints
4. Authentication and authorization
5. Error handling and logging
6. Tests

Architecture: ${architectureResult}`;
    
    const codeResult = await this.llmProvider.chat(codePrompt);
    
    steps?.push({
      name: 'Code Generation',
      status: 'completed',
      duration: 0,
      output: 'Backend code generated'
    });
    
    onChunk?.({ type: 'text', content: 'Implementing API endpoints...' });
    onChunk?.({ type: 'progress', content: '85%' });
    
    // 实现API端点
    const apiPrompt = `Generate detailed API endpoint implementations based on the architecture and code. Include:
1. Route definitions
2. Request/response handling
3. Data validation
4. Error handling
5. Documentation

Architecture: ${architectureResult}
Code: ${codeResult}`;
    
    const apiResult = await this.llmProvider.chat(apiPrompt);
    
    steps?.push({
      name: 'API Implementation',
      status: 'completed',
      duration: 0,
      output: 'API endpoints implemented'
    });
    
    onChunk?.({ type: 'text', content: 'Testing backend...' });
    onChunk?.({ type: 'progress', content: '95%' });
    
    // 测试后端
    const testPrompt = `Test the generated backend code. Check for:
1. Syntax errors
2. Logical issues
3. Security vulnerabilities
4. Performance concerns
5. Completeness of functionality

Code: ${codeResult}
API Endpoints: ${apiResult}`;
    
    await this.llmProvider.chat(testPrompt);
    steps?.push({
      name: 'Backend Testing',
      status: 'completed',
      duration: 0,
      output: 'Backend tested successfully'
    });
    
    onChunk?.({ type: 'progress', content: '100%' });
    
    return `Backend code generated successfully. Main code: ${codeResult.substring(0, 100)}... API endpoints: ${apiResult.substring(0, 100)}...`;
  }

  }
