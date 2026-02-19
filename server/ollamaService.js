/**
 * Ollama Integration Service
 * Handles communication with Ollama local LLM
 */

import { getToolsForOllama, executeTool, toolRegistry } from './mcpTools.js';
import mcpProtocol from './mcpProtocol.js';
import {
  logApiRequest,
  logToolCall,
  logToolResult,
  logResponse,
  logError,
  logMcpInit,
  logToolRegistration,
} from './logger.js';

// Ollama configuration
const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3:8b';
const MAX_ITERATIONS = 8;

// System prompt for the travel agent
const SYSTEM_PROMPT = `You are Voyager AI, an expert travel concierge. Use your tools proactively to help users plan complete trips. When a user asks to plan a trip, automatically search flights AND hotels AND weather AND activities without being asked. Compare options and give specific recommendations with prices. Always be helpful, specific, and enthusiastic about travel.

When presenting results:
- Format prices clearly with currency
- Highlight the best value options
- Mention key amenities and features
- Give personalized recommendations based on the user's needs
- Be concise but thorough

Important: Use the tools available to you. Don't make up flight numbers, prices, or hotel names - always use the tools to get real data.`;

/**
 * Check if Ollama is running
 */
export async function checkOllamaHealth() {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!response.ok) throw new Error('Ollama not responding');
    const data = await response.json();
    const hasModel = data.models?.some(m => m.name.includes(OLLAMA_MODEL.split(':')[0]));
    return {
      healthy: true,
      url: OLLAMA_BASE_URL,
      model: OLLAMA_MODEL,
      modelAvailable: hasModel,
      models: data.models?.map(m => m.name) || [],
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      url: OLLAMA_BASE_URL,
      model: OLLAMA_MODEL,
    };
  }
}

/**
 * Initialize MCP session (returns log entries for frontend)
 */
export function initializeMcpSession() {
  const logs = [];

  // Log MCP initialization
  const serverInfo = mcpProtocol.getServerInfo();
  logs.push(logMcpInit(serverInfo));

  // Log tool registration
  logs.push(logToolRegistration(toolRegistry));

  // Get handshake sequence for display
  const handshake = mcpProtocol.simulateMcpHandshake();

  return {
    logs,
    handshake,
    serverInfo,
    tools: toolRegistry.map(t => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
      usageCount: t.usageCount,
    })),
  };
}

/**
 * Process a chat message through the agentic loop
 */
export async function processChat(messages, onLogEntry) {
  const logs = [];
  const addLog = (entry) => {
    logs.push(entry);
    if (onLogEntry) onLogEntry(entry);
  };

  // Prepare messages array with system prompt
  const conversationMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages,
  ];

  let iterations = 0;
  let finalResponse = null;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    // Build request payload
    const requestPayload = {
      model: OLLAMA_MODEL,
      messages: conversationMessages,
      tools: getToolsForOllama(),
      stream: false,
    };

    // Log API request
    addLog(logApiRequest({
      model: OLLAMA_MODEL,
      messages: conversationMessages.map(m => ({ role: m.role, contentLength: m.content?.length })),
      tools: requestPayload.tools.map(t => t.function.name),
      iteration: iterations,
    }));

    try {
      // Call Ollama API
      const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      // Check if we have tool calls
      if (data.message?.tool_calls && data.message.tool_calls.length > 0) {
        // Add assistant message with tool calls to conversation
        conversationMessages.push({
          role: 'assistant',
          content: data.message.content || '',
          tool_calls: data.message.tool_calls,
        });

        // Process each tool call
        for (const toolCall of data.message.tool_calls) {
          const toolName = toolCall.function.name;
          const toolArgs = toolCall.function.arguments;

          // Create MCP request
          const mcpRequest = mcpProtocol.createToolCallRequest(toolName, toolArgs);

          // Log tool call
          addLog(logToolCall(toolName, toolArgs, mcpRequest));

          const startTime = Date.now();

          try {
            // Execute the tool
            const toolResult = await executeTool(toolName, toolArgs);
            const durationMs = Date.now() - startTime;

            // Create MCP response
            const mcpResponse = mcpProtocol.createToolCallResponse(mcpRequest.id, toolResult);

            // Log tool result
            addLog(logToolResult(toolName, toolResult, mcpResponse, durationMs));

            // Add tool result to conversation
            conversationMessages.push({
              role: 'tool',
              content: JSON.stringify(toolResult),
              tool_call_id: toolCall.id || mcpRequest.id,
            });
          } catch (toolError) {
            const durationMs = Date.now() - startTime;
            const mcpResponse = mcpProtocol.createToolCallResponse(mcpRequest.id, toolError, true);

            addLog(logError(toolError, { toolName, mcpResponse }));

            conversationMessages.push({
              role: 'tool',
              content: JSON.stringify({ error: toolError.message }),
              tool_call_id: toolCall.id || mcpRequest.id,
            });
          }
        }

        // Continue the loop to get the next response
        continue;
      }

      // No tool calls - this is the final response
      finalResponse = {
        role: 'assistant',
        content: data.message?.content || '',
        done: true,
        iterations,
        model: OLLAMA_MODEL,
        eval_count: data.eval_count,
        eval_duration: data.eval_duration,
      };

      // Log final response
      addLog(logResponse(data));
      break;

    } catch (error) {
      addLog(logError(error, { iteration: iterations }));

      // Return error response
      finalResponse = {
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${error.message}. Please try again or check if Ollama is running with the ${OLLAMA_MODEL} model.`,
        error: true,
        iterations,
      };
      break;
    }
  }

  if (!finalResponse) {
    finalResponse = {
      role: 'assistant',
      content: 'I apologize, but I reached the maximum number of tool iterations. Please try a simpler request.',
      error: true,
      iterations,
    };
  }

  return {
    response: finalResponse,
    logs,
    stats: {
      iterations,
      toolCallsTotal: logs.filter(l => l.type === 'TOOL_CALL').length,
      totalDurationMs: logs.reduce((sum, l) => sum + (l.data?.durationMs || 0), 0),
    },
  };
}

/**
 * Get current tool stats
 */
export function getToolStats() {
  return toolRegistry.map(t => ({
    name: t.name,
    usageCount: t.usageCount,
  }));
}

/**
 * Reset tool usage counts
 */
export function resetToolStats() {
  toolRegistry.forEach(t => { t.usageCount = 0; });
}

export default {
  checkOllamaHealth,
  initializeMcpSession,
  processChat,
  getToolStats,
  resetToolStats,
  OLLAMA_MODEL,
};
