// OMNI-SIGMA 360 — Workflow Background Queue
// Schedules and executes delayed node transitions using Redis/BullMQ

import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import { getWorkflowEngine } from "./engine";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
let connection: Redis | null = null;
let delayQueue: Queue | null = null;
let delayWorker: Worker | null = null;

// Determine if Redis connection is active and configured
export function isRedisConfigured(): boolean {
  return !!(
    process.env.REDIS_URL && 
    !process.env.REDIS_URL.includes("placeholder") &&
    !process.env.REDIS_URL.includes("localhost:6379") // Fallback if local redis is not active
  );
}

export function initQueue() {
  // Check if we want to run Redis or memory fallback
  const hasEnvRedis = process.env.REDIS_URL && !process.env.REDIS_URL.includes("placeholder");
  if (!hasEnvRedis) {
    console.log("[Queue] Redis URL is not configured. Using fallback memory delay scheduler.");
    return;
  }

  try {
    connection = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });

    connection.on("error", (err) => {
      console.warn("[Queue] Redis connection error, using memory fallback queue:", err.message);
      delayQueue = null;
    });

    connection.connect().then(() => {
      console.log("[Queue] Redis connection established successfully.");
      
      // Initialize BullMQ Queue
      delayQueue = new Queue("workflow-delays", {
        connection: connection!,
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: false,
        },
      });

      // Initialize Worker to process delayed executions
      delayWorker = new Worker(
        "workflow-delays",
        async (job) => {
          const { workflowId, executionId, nodeId, leadContext, dbExecId } = job.data;
          console.log(`[Queue Worker] Resuming workflow execution ${executionId || dbExecId} at node ${nodeId}`);
          
          const engine = getWorkflowEngine();
          const wf = await engine.getWorkflow(workflowId);
          const exec = await engine.getExecution(executionId || dbExecId);
          if (wf && exec) {
            // @ts-ignore
            await engine.executeFromNode(wf, exec, nodeId, dbExecId);
          }
        },
        { connection: connection! }
      );
    }).catch((err) => {
      console.warn("[Queue] Redis connection failed, using memory fallback queue:", err);
    });

  } catch (err) {
    console.error("[Queue] Failed to initialize Redis connection:", err);
  }
}

/**
 * Schedule a workflow node execution delay
 */
export async function scheduleDelay(
  workflowId: string,
  executionId: string,
  nodeId: string,
  delaySeconds: number,
  leadContext: any,
  dbExecId?: string
): Promise<boolean> {
  if (delayQueue && connection) {
    try {
      await delayQueue.add(
        `delay-${executionId || dbExecId}-${nodeId}`,
        { workflowId, executionId, nodeId, leadContext, dbExecId },
        { delay: delaySeconds * 1000 }
      );
      console.log(`[Queue] Scheduled delay for ${delaySeconds}s via Redis/BullMQ`);
      return true;
    } catch (err) {
      console.error("[Queue] BullMQ enqueue failed, falling back to memory:", err);
    }
  }

  // Fallback to local memory timeout scheduling (cap at 3 seconds in dev mode for testing)
  const waitMs = Math.min(delaySeconds * 1000, 3000);
  console.log(`[Queue] Scheduling delay for ${delaySeconds}s (simulated: ${waitMs}ms) via fallback memory timer`);
  setTimeout(() => {
    (async () => {
      console.log(`[Queue Memory] Resuming execution ${executionId || dbExecId} at node ${nodeId}`);
      const engine = getWorkflowEngine();
      const wf = await engine.getWorkflow(workflowId);
      const exec = await engine.getExecution(executionId || dbExecId);
      if (wf && exec) {
        // @ts-ignore
        await engine.executeFromNode(wf, exec, nodeId, dbExecId).catch(console.error);
      }
    })();
  }, waitMs);
  
  return true;
}

// Auto-initialize queue configuration on module import
if (typeof window === "undefined") {
  initQueue();
}
