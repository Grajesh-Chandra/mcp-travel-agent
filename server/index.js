/**
 * Voyager AI - Travel Agent Demo Server
 * Express backend with WebSocket for real-time log streaming
 */

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

import logger from './logger.js';
import ollamaService from './ollamaService.js';
import { toolRegistry } from './mcpTools.js';
import mcpProtocol from './mcpProtocol.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

// Initialize Express app
const app = express();
const server = createServer(app);

// WebSocket server for real-time logs
const wss = new WebSocketServer({ server, path: '/ws' });

// Connected WebSocket clients
const wsClients = new Set();

// Session stats
let sessionStats = {
  startTime: Date.now(),
  totalApiCalls: 0,
  totalToolInvocations: 0,
  estimatedTokens: 0,
  responseTimes: [],
};

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')?.substring(0, 50),
  });
  next();
});

// Broadcast to all WebSocket clients
function broadcast(data) {
  const message = JSON.stringify(data);
  wsClients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(message);
    }
  });
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  logger.info('WebSocket client connected');
  wsClients.add(ws);

  // Send initial session info
  ws.send(JSON.stringify({
    type: 'session_init',
    data: {
      stats: sessionStats,
      serverInfo: mcpProtocol.getServerInfo(),
    },
  }));

  ws.on('close', () => {
    logger.info('WebSocket client disconnected');
    wsClients.delete(ws);
  });

  ws.on('error', (error) => {
    logger.error('WebSocket error', { error: error.message });
    wsClients.delete(ws);
  });
});

// ============================================
// API Routes
// ============================================

/**
 * Health check endpoint
 */
app.get('/api/health', async (req, res) => {
  const ollamaHealth = await ollamaService.checkOllamaHealth();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: {
      name: 'voyager-ai-server',
      version: '1.0.0',
      uptime: Math.floor((Date.now() - sessionStats.startTime) / 1000),
    },
    ollama: ollamaHealth,
    mcp: {
      serverName: mcpProtocol.getServerInfo().name,
      toolsRegistered: toolRegistry.length,
    },
  });
});

/**
 * Initialize MCP session
 */
app.post('/api/mcp/init', (req, res) => {
  try {
    const session = ollamaService.initializeMcpSession();

    // Broadcast initialization logs
    session.logs.forEach(log => {
      broadcast({ type: 'log', data: log });
    });

    res.json({
      success: true,
      ...session,
    });
  } catch (error) {
    logger.error('MCP init error', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get MCP handshake sequence
 */
app.get('/api/mcp/handshake', (req, res) => {
  const handshake = mcpProtocol.simulateMcpHandshake();
  res.json(handshake);
});

/**
 * Get all registered tools
 */
app.get('/api/tools', (req, res) => {
  const tools = toolRegistry.map(t => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema,
    usageCount: t.usageCount,
  }));
  res.json({ tools });
});

/**
 * Get tool stats
 */
app.get('/api/tools/stats', (req, res) => {
  const stats = ollamaService.getToolStats();
  res.json({ stats });
});

/**
 * Chat endpoint - main AI interaction
 */
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  const startTime = Date.now();
  sessionStats.totalApiCalls++;

  try {
    // Process chat with real-time log streaming
    const result = await ollamaService.processChat(messages, (logEntry) => {
      broadcast({ type: 'log', data: logEntry });

      // Update stats
      if (logEntry.type === 'TOOL_CALL') {
        sessionStats.totalToolInvocations++;
      }
    });

    const responseTime = Date.now() - startTime;
    sessionStats.responseTimes.push(responseTime);
    sessionStats.estimatedTokens += (result.response.content?.length || 0) / 4;

    // Broadcast updated stats
    broadcast({
      type: 'stats_update',
      data: getSessionStats(),
    });

    res.json({
      success: true,
      response: result.response,
      stats: result.stats,
    });
  } catch (error) {
    logger.error('Chat error', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get session statistics
 */
app.get('/api/stats', (req, res) => {
  res.json(getSessionStats());
});

/**
 * Reset session
 */
app.post('/api/session/reset', (req, res) => {
  sessionStats = {
    startTime: Date.now(),
    totalApiCalls: 0,
    totalToolInvocations: 0,
    estimatedTokens: 0,
    responseTimes: [],
  };
  ollamaService.resetToolStats();

  broadcast({ type: 'session_reset', data: getSessionStats() });

  res.json({ success: true, stats: getSessionStats() });
});

/**
 * Get session stats helper
 */
function getSessionStats() {
  const avgResponseTime = sessionStats.responseTimes.length > 0
    ? Math.round(sessionStats.responseTimes.reduce((a, b) => a + b, 0) / sessionStats.responseTimes.length)
    : 0;

  return {
    sessionDuration: Date.now() - sessionStats.startTime,
    totalApiCalls: sessionStats.totalApiCalls,
    totalToolInvocations: sessionStats.totalToolInvocations,
    estimatedTokens: Math.round(sessionStats.estimatedTokens),
    avgResponseTime,
    toolBreakdown: ollamaService.getToolStats(),
  };
}

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
server.listen(PORT, HOST, () => {
  logger.info(`🚀 Voyager AI Server running at http://${HOST}:${PORT}`);
  logger.info(`📡 WebSocket available at ws://${HOST}:${PORT}/ws`);
  logger.info(`🤖 Using Ollama model: ${ollamaService.OLLAMA_MODEL}`);
  logger.info(`🔧 ${toolRegistry.length} MCP tools registered`);

  // Check Ollama health on startup
  ollamaService.checkOllamaHealth().then(health => {
    if (health.healthy) {
      logger.info(`✅ Ollama connected at ${health.url}`);
      if (!health.modelAvailable) {
        logger.warn(`⚠️  Model ${ollamaService.OLLAMA_MODEL} not found. Run: ollama pull ${ollamaService.OLLAMA_MODEL}`);
      }
    } else {
      logger.error(`❌ Ollama not available: ${health.error}`);
      logger.error(`   Make sure Ollama is running: ollama serve`);
    }
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app;
