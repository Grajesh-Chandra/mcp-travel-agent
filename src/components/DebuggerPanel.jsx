/**
 * MCP Debugger Panel Component
 * Live log viewer with tabs for different views
 */

import React, { useState, useRef, useEffect } from 'react';
import LogEntry from './LogEntry.jsx';
import RequestInspector from './RequestInspector.jsx';
import ToolRegistry from './ToolRegistry.jsx';
import SessionStats from './SessionStats.jsx';
import DemoGuide from './DemoGuide.jsx';

const TABS = [
  { id: 'logs', label: 'Live Logs', icon: '📜' },
  { id: 'inspector', label: 'Request/Response', icon: '🔍' },
  { id: 'registry', label: 'Tool Registry', icon: '🔧' },
  { id: 'stats', label: 'Session Stats', icon: '📊' },
];

function DebuggerPanel({
  logs,
  stats,
  tools,
  isConnected,
  onClearLogs,
  onResetSession,
  isVisible,
  onToggleVisibility,
}) {
  const [activeTab, setActiveTab] = useState('logs');
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDemoGuide, setShowDemoGuide] = useState(true);
  const logsEndRef = useRef(null);

  // Auto-scroll logs
  useEffect(() => {
    if (activeTab === 'logs') {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, activeTab]);

  // When a log is selected, switch to inspector
  const handleLogSelect = (log) => {
    setSelectedLog(log);
    setActiveTab('inspector');
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggleVisibility}
        className="fixed right-4 top-4 px-4 py-2 bg-navy-800 border border-gold-500/50 text-gold-500 rounded-lg hover:bg-navy-700 transition-all z-50 flex items-center space-x-2"
      >
        <span>🔧</span>
        <span>Show Debugger</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col h-full bg-navy-800 border-l border-navy-700">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-navy-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <h2 className="font-semibold text-white">MCP Debugger</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClearLogs}
              className="px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-navy-700 rounded transition-colors"
              title="Clear logs"
            >
              Clear
            </button>
            <button
              onClick={onResetSession}
              className="px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-navy-700 rounded transition-colors"
              title="Reset session"
            >
              Reset
            </button>
            <button
              onClick={onToggleVisibility}
              className="px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-navy-700 rounded transition-colors"
              title="Hide debugger"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all flex items-center space-x-1 ${
                activeTab === tab.id
                  ? 'bg-gold-500 text-navy-900 font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-navy-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden lg:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Demo Guide */}
      {showDemoGuide && (
        <DemoGuide onClose={() => setShowDemoGuide(false)} />
      )}

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'logs' && (
          <div className="h-full overflow-y-auto p-4 space-y-2">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <span className="text-4xl mb-2">📋</span>
                <p className="text-sm">No logs yet</p>
                <p className="text-xs">Start a conversation to see MCP activity</p>
              </div>
            ) : (
              <>
                {logs.map((log, idx) => (
                  <LogEntry
                    key={log.id || idx}
                    log={log}
                    onClick={() => handleLogSelect(log)}
                  />
                ))}
                <div ref={logsEndRef} />
              </>
            )}
          </div>
        )}

        {activeTab === 'inspector' && (
          <RequestInspector selectedLog={selectedLog} />
        )}

        {activeTab === 'registry' && (
          <ToolRegistry tools={tools} />
        )}

        {activeTab === 'stats' && (
          <SessionStats stats={stats} tools={tools} />
        )}
      </div>
    </div>
  );
}

export default DebuggerPanel;
