/**
 * Tool Call Card Component
 * Shows status of MCP tool execution
 */

import React, { useState, useEffect } from 'react';

function ToolCallCard({ toolName, status, serverName, result, duration }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status === 'running') {
      const interval = setInterval(() => {
        setProgress(prev => (prev >= 90 ? 90 : prev + 10));
      }, 200);
      return () => clearInterval(interval);
    } else if (status === 'completed') {
      setProgress(100);
    }
  }, [status]);

  const getStatusIcon = () => {
    switch (status) {
      case 'running':
        return '⏳';
      case 'completed':
        return '✓';
      case 'error':
        return '✗';
      default:
        return '🔧';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'border-gold-500/50 bg-gold-500/10';
      case 'completed':
        return 'border-green-500/50 bg-green-500/10';
      case 'error':
        return 'border-red-500/50 bg-red-500/10';
      default:
        return 'border-navy-600 bg-navy-700/50';
    }
  };

  return (
    <div className={`rounded-lg border ${getStatusColor()} p-3 animate-fade-in`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getStatusIcon()}</span>
          <span className="text-xs text-gray-400">
            {status === 'running' ? 'Calling MCP Tool' : status === 'completed' ? 'Tool Completed' : 'MCP Tool'}
          </span>
        </div>
        {duration && (
          <span className="text-xs text-gray-500">{duration}ms</span>
        )}
      </div>

      <div className="flex items-center space-x-2 mb-2">
        <code className="text-sm font-mono text-gold-400">{toolName}</code>
        <span className="text-gray-500">·</span>
        <span className="text-xs text-gray-500">{serverName}</span>
      </div>

      {status === 'running' && (
        <div className="h-1.5 bg-navy-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold-500 rounded-full transition-all duration-200 progress-animate"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {status === 'running' && (
        <p className="text-xs text-gray-500 mt-2">Fetching results...</p>
      )}

      {status === 'completed' && result && (
        <div className="mt-2 pt-2 border-t border-navy-700">
          <p className="text-xs text-gray-400">
            {typeof result === 'object'
              ? `${Object.keys(result).length} fields returned`
              : result
            }
          </p>
        </div>
      )}
    </div>
  );
}

export default ToolCallCard;
