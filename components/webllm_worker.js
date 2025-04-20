// filepath: d:\\Projects\\ai-gallery\\components\\webllm_worker.js
import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

// Instantiate the handler
const handler = new WebWorkerMLCEngineHandler();

// We use `this` to refer to the worker context.
// eslint-disable-next-line no-restricted-globals
self.onmessage = (msg) => {
	handler.onmessage(msg);
};
