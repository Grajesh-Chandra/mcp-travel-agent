/**
 * API Service for communicating with the backend
 */

const API_BASE = '/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Check server health
 */
export async function checkHealth() {
  return fetchApi('/health');
}

/**
 * Initialize MCP session
 */
export async function initMcpSession() {
  return fetchApi('/mcp/init', { method: 'POST' });
}

/**
 * Get MCP handshake sequence
 */
export async function getMcpHandshake() {
  return fetchApi('/mcp/handshake');
}

/**
 * Get all registered tools
 */
export async function getTools() {
  return fetchApi('/tools');
}

/**
 * Get tool statistics
 */
export async function getToolStats() {
  return fetchApi('/tools/stats');
}

/**
 * Send chat message
 */
export async function sendChat(messages) {
  return fetchApi('/chat', {
    method: 'POST',
    body: JSON.stringify({ messages }),
  });
}

/**
 * Get session statistics
 */
export async function getSessionStats() {
  return fetchApi('/stats');
}

/**
 * Reset session
 */
export async function resetSession() {
  return fetchApi('/session/reset', { method: 'POST' });
}

export default {
  checkHealth,
  initMcpSession,
  getMcpHandshake,
  getTools,
  getToolStats,
  sendChat,
  getSessionStats,
  resetSession,
};
