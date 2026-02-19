/**
 * Voyager AI - Travel Agent Demo Application
 * Main App Component
 */

import React, { useState, useEffect, useCallback } from 'react';
import ChatPanel from './components/ChatPanel.jsx';
import DebuggerPanel from './components/DebuggerPanel.jsx';
import { ToastContainer, useToast } from './components/Toast.jsx';
import useWebSocket from './hooks/useWebSocket.js';
import useChat from './hooks/useChat.js';
import api from './utils/api.js';

function App() {
  const [tools, setTools] = useState([]);
  const [showDebugger, setShowDebugger] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [serverHealth, setServerHealth] = useState(null);

  const { toasts, addToast, removeToast } = useToast();
  const { isConnected, logs, stats, error: wsError, clearLogs, reconnect } = useWebSocket();
  const {
    messages,
    isLoading,
    error: chatError,
    currentToolCall,
    sendMessage,
    clearChat
  } = useChat();

  // Initialize the app
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check server health
        const health = await api.checkHealth();
        setServerHealth(health);

        if (!health.ollama?.healthy) {
          addToast(
            `Ollama not available. Run: ollama serve && ollama pull ${health.ollama?.model || 'qwen3:8b'}`,
            'warning',
            10000
          );
        }

        // Get registered tools
        const toolsResponse = await api.getTools();
        setTools(toolsResponse.tools || []);

        // Initialize MCP session
        await api.initMcpSession();

        setIsInitialized(true);
        addToast('Voyager AI initialized successfully', 'success');
      } catch (err) {
        console.error('Initialization error:', err);
        addToast(`Initialization failed: ${err.message}`, 'error', 5000);
      }
    };

    initialize();
  }, []);

  // Update tools when logs indicate tool usage
  useEffect(() => {
    const updateToolStats = async () => {
      try {
        const toolsResponse = await api.getTools();
        setTools(toolsResponse.tools || []);
      } catch (err) {
        console.error('Failed to update tool stats:', err);
      }
    };

    // Check if any log is a TOOL_RESULT
    const hasToolResult = logs.some(l => l.type === 'TOOL_RESULT');
    if (hasToolResult) {
      updateToolStats();
    }
  }, [logs]);

  // Handle clear all (chat + logs + session)
  const handleClearAll = useCallback(async () => {
    clearChat();
    clearLogs();
    try {
      await api.resetSession();
      const toolsResponse = await api.getTools();
      setTools(toolsResponse.tools || []);
      addToast('Session cleared', 'info');
    } catch (err) {
      console.error('Failed to reset session:', err);
    }
  }, [clearChat, clearLogs, addToast]);

  // Handle WebSocket errors
  useEffect(() => {
    if (wsError) {
      addToast(wsError, 'error');
    }
  }, [wsError]);

  // Handle chat errors
  useEffect(() => {
    if (chatError) {
      addToast(chatError, 'error');
    }
  }, [chatError]);

  // Watch for itinerary creation to show toast
  useEffect(() => {
    const itineraryLog = logs.find(l =>
      l.type === 'TOOL_RESULT' &&
      l.data?.toolName === 'create_itinerary' &&
      l.data?.result?.itinerary_id
    );

    if (itineraryLog && !itineraryLog._toastShown) {
      itineraryLog._toastShown = true;
      addToast(`✓ Itinerary ${itineraryLog.data.result.itinerary_id} Created!`, 'success', 5000);
    }
  }, [logs, addToast]);

  return (
    <div className="h-screen flex flex-col bg-navy-900 overflow-hidden">
      {/* Connection Status Bar */}
      {!isConnected && (
        <div className="flex-shrink-0 bg-red-500/20 border-b border-red-500/50 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm text-red-400">Disconnected from server</span>
          </div>
          <button
            onClick={reconnect}
            className="px-3 py-1 text-xs bg-red-500/30 hover:bg-red-500/50 text-red-300 rounded transition-colors"
          >
            Reconnect
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel - Left side */}
        <div className={`flex-shrink-0 ${showDebugger ? 'w-[55%]' : 'w-full'} transition-all duration-300`}>
          <ChatPanel
            messages={messages}
            isLoading={isLoading}
            onSendMessage={sendMessage}
            onClearChat={clearChat}
            currentToolCall={currentToolCall}
          />
        </div>

        {/* Debugger Panel - Right side */}
        <div className={`flex-1 min-w-0 ${showDebugger ? '' : 'hidden'}`}>
          <DebuggerPanel
            logs={logs}
            stats={stats}
            tools={tools}
            isConnected={isConnected}
            onClearLogs={clearLogs}
            onResetSession={handleClearAll}
            isVisible={showDebugger}
            onToggleVisibility={() => setShowDebugger(!showDebugger)}
          />
        </div>

        {/* Toggle button when debugger is hidden */}
        {!showDebugger && (
          <button
            onClick={() => setShowDebugger(true)}
            className="fixed right-4 top-4 px-4 py-2 bg-navy-800 border border-gold-500/50 text-gold-500 rounded-lg hover:bg-navy-700 transition-all z-50 flex items-center space-x-2 animate-fade-in"
          >
            <span>🔧</span>
            <span>Show Debugger</span>
          </button>
        )}
      </div>

      {/* Loading overlay for initialization */}
      {!isInitialized && (
        <div className="fixed inset-0 bg-navy-900/90 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-500 to-gold-300 flex items-center justify-center mx-auto mb-4 animate-pulse-gold">
              <span className="text-navy-900 text-2xl">✈</span>
            </div>
            <h2 className="font-display text-2xl text-white mb-2">Initializing Voyager AI</h2>
            <p className="text-gray-400">Connecting to MCP server...</p>

            {serverHealth && !serverHealth.ollama?.healthy && (
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg max-w-md mx-auto">
                <p className="text-yellow-400 text-sm">
                  ⚠️ Ollama is not running. Please start it:
                </p>
                <code className="block mt-2 text-xs bg-navy-800 p-2 rounded text-gray-300">
                  ollama serve && ollama pull qwen3:8b
                </code>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default App;
