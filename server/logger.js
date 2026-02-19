/**
 * Server Logger Utility
 * Winston-based logging with file rotation and console output
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.join(__dirname, '..', 'logs');

// Custom format for console output with colors
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  })
);

// JSON format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.json()
);

// Create file transport with daily rotation
const fileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'server-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: fileFormat,
});

// Error file transport
const errorFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  level: 'error',
  format: fileFormat,
});

// MCP-specific transport for debugging
const mcpFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'mcp-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '7d',
  format: fileFormat,
});

// Main logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    fileTransport,
    errorFileTransport,
  ],
});

// MCP-specific logger
const mcpLogger = winston.createLogger({
  level: 'debug',
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    mcpFileTransport,
  ],
});

// Log types for MCP debugging
export const LogType = {
  SYSTEM: 'SYSTEM',
  REQUEST: 'REQUEST',
  TOOL_CALL: 'TOOL_CALL',
  TOOL_RESULT: 'TOOL_RESULT',
  RESPONSE: 'RESPONSE',
  ERROR: 'ERROR',
};

// Log colors/badges for frontend
export const LogTypeConfig = {
  SYSTEM: { color: '#8b5cf6', emoji: '🟣', label: 'SYSTEM' },
  REQUEST: { color: '#3b82f6', emoji: '🔵', label: 'REQUEST' },
  TOOL_CALL: { color: '#eab308', emoji: '🟡', label: 'TOOL_CALL' },
  TOOL_RESULT: { color: '#22c55e', emoji: '🟢', label: 'TOOL_RESULT' },
  RESPONSE: { color: '#ffffff', emoji: '⚪', label: 'RESPONSE' },
  ERROR: { color: '#ef4444', emoji: '🔴', label: 'ERROR' },
};

/**
 * Create a structured log entry for MCP debugging
 */
export function createMcpLogEntry(type, label, data = {}) {
  const entry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    typeConfig: LogTypeConfig[type],
    timestamp: new Date().toISOString(),
    timestampShort: new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    }),
    label,
    data,
  };

  mcpLogger.info(label, { type, data });
  return entry;
}

/**
 * Log MCP protocol initialization
 */
export function logMcpInit(serverInfo) {
  return createMcpLogEntry(LogType.SYSTEM, 'MCP Session Initialized', {
    protocolVersion: '2024-11-05',
    serverName: serverInfo.name,
    serverVersion: serverInfo.version,
    capabilities: serverInfo.capabilities,
  });
}

/**
 * Log tool registration
 */
export function logToolRegistration(tools) {
  return createMcpLogEntry(LogType.SYSTEM, `Registered ${tools.length} MCP tools`, {
    tools: tools.map(t => ({ name: t.name, description: t.description })),
  });
}

/**
 * Log outgoing API request
 */
export function logApiRequest(requestData) {
  return createMcpLogEntry(LogType.REQUEST, '→ Ollama API Request', {
    model: requestData.model,
    messageCount: requestData.messages?.length,
    toolCount: requestData.tools?.length,
    payload: requestData,
  });
}

/**
 * Log tool invocation
 */
export function logToolCall(toolName, toolInput, mcpRequest) {
  return createMcpLogEntry(LogType.TOOL_CALL, `→ ${toolName} invoked`, {
    toolName,
    arguments: toolInput,
    mcpRequest,
  });
}

/**
 * Log tool result
 */
export function logToolResult(toolName, result, mcpResponse, durationMs) {
  return createMcpLogEntry(LogType.TOOL_RESULT, `← ${toolName} completed (${durationMs}ms)`, {
    toolName,
    result,
    mcpResponse,
    durationMs,
  });
}

/**
 * Log final response
 */
export function logResponse(response) {
  return createMcpLogEntry(LogType.RESPONSE, '← Final Response', {
    stopReason: response.done_reason || response.done ? 'end_turn' : 'tool_use',
    content: response.message?.content,
  });
}

/**
 * Log error
 */
export function logError(error, context = {}) {
  return createMcpLogEntry(LogType.ERROR, `Error: ${error.message}`, {
    message: error.message,
    stack: error.stack,
    ...context,
  });
}

export default logger;
