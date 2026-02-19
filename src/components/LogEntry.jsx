/**
 * Log Entry Component
 * Individual log entry with expandable JSON view
 */

import React, { useState } from 'react';
import { LOG_TYPE_CONFIG, highlightJson, formatTimestamp } from '../utils/helpers.js';

function LogEntry({ log, onClick }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = LOG_TYPE_CONFIG[log.type] || LOG_TYPE_CONFIG.SYSTEM;

  const handleClick = () => {
    if (onClick) onClick(log);
  };

  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`border-l-2 rounded-r-lg bg-navy-900/50 cursor-pointer hover:bg-navy-700/50 transition-all animate-fade-in log-flash`}
      style={{ borderLeftColor: config.color }}
      onClick={handleClick}
    >
      <div className="px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Type Badge */}
            <span
              className="px-2 py-0.5 rounded text-xs font-mono font-semibold"
              style={{ backgroundColor: `${config.color}20`, color: config.color }}
            >
              {config.emoji} {config.label}
            </span>

            {/* Label */}
            <span className="text-sm text-gray-300 truncate max-w-[200px]">
              {log.label}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Timestamp */}
            <span className="text-xs text-gray-500 font-mono">
              {log.timestampShort || formatTimestamp(log.timestamp)}
            </span>

            {/* Expand button */}
            {log.data && Object.keys(log.data).length > 0 && (
              <button
                onClick={toggleExpand}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <svg
                  className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Expanded JSON view */}
        {isExpanded && log.data && (
          <div className="mt-2 pt-2 border-t border-navy-700">
            <pre
              className="text-xs font-mono overflow-x-auto max-h-60 overflow-y-auto p-2 bg-navy-900 rounded"
              dangerouslySetInnerHTML={{ __html: highlightJson(log.data) }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default LogEntry;
