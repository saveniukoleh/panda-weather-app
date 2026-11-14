import { handleRequest, type WorkerEnv } from './proxy';

export type { WorkerEnv };

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    return handleRequest(request, env);
  },
};
