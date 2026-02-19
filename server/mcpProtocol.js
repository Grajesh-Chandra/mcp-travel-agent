/**
 * MCP Protocol Handler
 * Simulates MCP (Model Context Protocol) JSON-RPC messages
 */

import { v4 as uuidv4 } from 'uuid';
import { toolRegistry } from './mcpTools.js';

// Protocol version
const MCP_PROTOCOL_VERSION = '2024-11-05';

// Server info
const SERVER_INFO = {
  name: 'travel-mcp-server',
  version: '1.0.0',
  capabilities: {
    tools: {
      listChanged: true,
    },
    resources: {
      subscribe: false,
      listChanged: false,
    },
    prompts: {
      listChanged: false,
    },
    logging: {},
  },
};

/**
 * Create MCP Initialize Request (Client → Server)
 */
export function createInitializeRequest() {
  return {
    jsonrpc: '2.0',
    id: uuidv4(),
    method: 'initialize',
    params: {
      protocolVersion: MCP_PROTOCOL_VERSION,
      capabilities: {
        roots: {
          listChanged: true,
        },
        sampling: {},
      },
      clientInfo: {
        name: 'voyager-ai-client',
        version: '1.0.0',
      },
    },
  };
}

/**
 * Create MCP Initialize Response (Server → Client)
 */
export function createInitializeResponse(requestId) {
  return {
    jsonrpc: '2.0',
    id: requestId,
    result: {
      protocolVersion: MCP_PROTOCOL_VERSION,
      capabilities: SERVER_INFO.capabilities,
      serverInfo: {
        name: SERVER_INFO.name,
        version: SERVER_INFO.version,
      },
    },
  };
}

/**
 * Create MCP Initialized Notification (Client → Server)
 */
export function createInitializedNotification() {
  return {
    jsonrpc: '2.0',
    method: 'notifications/initialized',
  };
}

/**
 * Create MCP Tools List Request
 */
export function createToolsListRequest() {
  return {
    jsonrpc: '2.0',
    id: uuidv4(),
    method: 'tools/list',
  };
}

/**
 * Create MCP Tools List Response
 */
export function createToolsListResponse(requestId) {
  const tools = toolRegistry.map(tool => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
  }));

  return {
    jsonrpc: '2.0',
    id: requestId,
    result: {
      tools,
    },
  };
}

/**
 * Create MCP Tool Call Request
 */
export function createToolCallRequest(toolName, args) {
  return {
    jsonrpc: '2.0',
    id: uuidv4(),
    method: 'tools/call',
    params: {
      name: toolName,
      arguments: args,
    },
  };
}

/**
 * Create MCP Tool Call Response
 */
export function createToolCallResponse(requestId, result, isError = false) {
  if (isError) {
    return {
      jsonrpc: '2.0',
      id: requestId,
      result: {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: result.message || result }, null, 2),
          },
        ],
        isError: true,
      },
    };
  }

  return {
    jsonrpc: '2.0',
    id: requestId,
    result: {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
      isError: false,
    },
  };
}

/**
 * Create MCP Error Response
 */
export function createErrorResponse(requestId, code, message) {
  return {
    jsonrpc: '2.0',
    id: requestId,
    error: {
      code,
      message,
    },
  };
}

/**
 * Simulate full MCP handshake sequence
 */
export function simulateMcpHandshake() {
  const initRequest = createInitializeRequest();
  const initResponse = createInitializeResponse(initRequest.id);
  const initializedNotification = createInitializedNotification();
  const toolsListRequest = createToolsListRequest();
  const toolsListResponse = createToolsListResponse(toolsListRequest.id);

  return {
    sequence: [
      { direction: 'client→server', message: initRequest, label: 'Initialize Request' },
      { direction: 'server→client', message: initResponse, label: 'Initialize Response' },
      { direction: 'client→server', message: initializedNotification, label: 'Initialized Notification' },
      { direction: 'client→server', message: toolsListRequest, label: 'Tools List Request' },
      { direction: 'server→client', message: toolsListResponse, label: 'Tools List Response' },
    ],
    serverInfo: SERVER_INFO,
    tools: toolRegistry.map(t => ({ name: t.name, description: t.description })),
  };
}

/**
 * Get server info
 */
export function getServerInfo() {
  return SERVER_INFO;
}

export default {
  createInitializeRequest,
  createInitializeResponse,
  createInitializedNotification,
  createToolsListRequest,
  createToolsListResponse,
  createToolCallRequest,
  createToolCallResponse,
  createErrorResponse,
  simulateMcpHandshake,
  getServerInfo,
  MCP_PROTOCOL_VERSION,
};
