import { WorkflowType, StreamChunk } from '../types/index.js';
import { RayCodeEngine } from '../core/index.js';

export function createWorkflow(type: WorkflowType) {
  switch (type) {
    case 'text2web':
      return createText2WebWorkflow();
    case 'text2backend':
      return createText2BackendWorkflow();
    case 'paper2code':
      return createPaper2CodeWorkflow();
    default:
      throw new Error(`Unsupported workflow type: ${type}`);
  }
}

export function createText2WebWorkflow() {
  return async function runText2Web(
    engine: RayCodeEngine, 
    input: string, 
    callbacks?: { onChunk?: (chunk: StreamChunk) => void }
  ): Promise<string> {
    const result = await engine.executeWorkflow('text2web', input, {
      onChunk: callbacks?.onChunk
    });
    return result.output;
  };
}

export function createText2BackendWorkflow() {
  return async function runText2Backend(
    engine: RayCodeEngine, 
    input: string, 
    callbacks?: { onChunk?: (chunk: StreamChunk) => void }
  ): Promise<string> {
    const result = await engine.executeWorkflow('text2backend', input, {
      onChunk: callbacks?.onChunk
    });
    return result.output;
  };
}

export function createPaper2CodeWorkflow() {
  return async function runPaper2Code(
    engine: RayCodeEngine, 
    input: string, 
    callbacks?: { onChunk?: (chunk: StreamChunk) => void }
  ): Promise<string> {
    const result = await engine.executeWorkflow('paper2code', input, {
      onChunk: callbacks?.onChunk
    });
    return result.output;
  };
}