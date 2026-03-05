import express from 'express';
import cors from 'cors';
import { RayCodeEngine, createLLMProvider } from '../core/index.js';
import { getConfig } from '../config/index.js';
import type { WorkflowType } from '../types/index.js';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

const config = getConfig();
const llmProvider = createLLMProvider(config.llm);
const engine = new RayCodeEngine(llmProvider);

// 存储正在运行的工作流程
const runningWorkflows = new Map<string, any>();

app.get('/health', (_, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/v1/info', (_, res) => {
  res.json({
    name: 'RayCode',
    version: '1.0.0',
    status: 'running',
    agents: engine.getAllAgents(),
  });
});

// @ts-ignore: Not all code paths return a value (TypeScript analysis issue)
app.post('/api/v1/workflows', async (req, res) => {
  try {
    const { type, input } = req.body;
    const workflowId = 'exec_' + Date.now();
    
    // 验证工作流程类型
    const validTypes = ['paper2code', 'text2web', 'text2backend'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid workflow type' });
    }
    
    // 创建工作流程记录
    const workflowRecord: any = {
      id: workflowId,
      status: 'running',
      type,
      input,
      startTime: new Date(),
      steps: [],
      progress: '0%',
    };
    
    runningWorkflows.set(workflowId, workflowRecord);
    
    // 异步执行工作流程
    (async () => {
      try {
        const result = await engine.executeWorkflow(type as WorkflowType, input, {
          onChunk: (chunk) => {
            if (chunk.type === 'text' && !chunk.content.includes('Initializing workflow')) {
              workflowRecord.steps.push({ 
                timestamp: new Date(), 
                type: chunk.type, 
                content: chunk.content 
              });
            } else if (chunk.type === 'progress') {
              workflowRecord.progress = chunk.content;
            }
          }
        });
        
        workflowRecord.status = 'completed';
        workflowRecord.output = result.output;
        workflowRecord.duration = result.duration;
        workflowRecord.steps = result.steps;
        
      } catch (error) {
        workflowRecord.status = 'failed';
        workflowRecord.error = error instanceof Error ? error.message : 'Unknown error';
      }
    })();
    
    res.json(workflowRecord);
  } catch (error) {
    res.status(500).json({ error: 'Failed to start workflow' });
  }
});

app.get('/api/v1/workflows', (_, res) => {
  res.json({ 
    workflows: Array.from(runningWorkflows.values()), 
    count: runningWorkflows.size 
  });
});

// @ts-ignore: Not all code paths return a value (TypeScript analysis issue)
app.get('/api/v1/workflows/:id', (req, res) => {
  const { id } = req.params;
  const workflow = runningWorkflows.get(id);
  
  if (!workflow) {
    return res.status(404).json({ error: 'Workflow not found' });
  }
  
  res.json(workflow);
});

app.get('/api/v1/config', (_, res) => {
  res.json({ 
    llm: { 
      provider: config.llm.provider, 
      model: config.llm.model 
    }, 
    environment: config.environment
  });
});

app.post('/api/v1/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const response = await engine.chat(message);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: 'Chat request failed' });
  }
});

app.listen(PORT, () => {
  console.log(`RayCode server running on port ${PORT}`);
});