/**
 * Request/Response Inspector Component
 * Split view showing full JSON payloads
 */

import React, { useState } from 'react';
import { highlightJson, copyToClipboard } from '../utils/helpers.js';

function RequestInspector({ selectedLog }) {
  const [copiedSide, setCopiedSide] = useState(null);

  if (!selectedLog) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4">
        <span className="text-4xl mb-2">🔍</span>
        <p className="text-sm text-center">Select a log entry to inspect</p>
        <p className="text-xs text-center mt-1">Click any log in the Live Logs tab</p>
      </div>
    );
  }

  const handleCopy = async (data, side) => {
    const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    await copyToClipboard(text);
    setCopiedSide(side);
    setTimeout(() => setCopiedSide(null), 2000);
  };

  // Determine request/response based on log type
  const getRequestResponse = () => {
    const data = selectedLog.data || {};

    switch (selectedLog.type) {
      case 'REQUEST':
        return {
          request: data.payload || data,
          response: null,
          requestLabel: 'API Request Payload',
          responseLabel: 'Response (pending...)',
        };
      case 'TOOL_CALL':
        return {
          request: data.mcpRequest || { name: data.toolName, arguments: data.arguments },
          response: null,
          requestLabel: 'MCP Tool Call Request',
          responseLabel: 'Tool Response (pending...)',
        };
      case 'TOOL_RESULT':
        return {
          request: { toolName: data.toolName },
          response: data.mcpResponse || data.result,
          requestLabel: 'Tool Call',
          responseLabel: 'MCP Tool Response',
        };
      case 'RESPONSE':
        return {
          request: null,
          response: data,
          requestLabel: 'Request',
          responseLabel: 'Final Response',
        };
      default:
        return {
          request: data,
          response: null,
          requestLabel: 'Data',
          responseLabel: 'Response',
        };
    }
  };

  const { request, response, requestLabel, responseLabel } = getRequestResponse();

  return (
    <div className="h-full flex flex-col">
      {/* Log type header */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-navy-700 bg-navy-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-gold-500">{selectedLog.typeConfig?.emoji || '📋'}</span>
            <span className="text-sm font-semibold text-white">{selectedLog.label}</span>
          </div>
          <span className="text-xs text-gray-500">{selectedLog.timestampShort}</span>
        </div>
      </div>

      {/* Split view */}
      <div className="flex-1 flex overflow-hidden">
        {/* Request side */}
        <div className="flex-1 flex flex-col border-r border-navy-700">
          <div className="flex-shrink-0 px-3 py-2 bg-navy-900/80 border-b border-navy-700 flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-400">{requestLabel}</span>
            {request && (
              <button
                onClick={() => handleCopy(request, 'request')}
                className="text-xs text-gray-400 hover:text-white transition-colors flex items-center space-x-1"
              >
                {copiedSide === 'request' ? (
                  <>
                    <span>✓</span>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <span>📋</span>
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>
          <div className="flex-1 overflow-auto p-3">
            {request ? (
              <pre
                className="text-xs font-mono whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: highlightJson(request) }}
              />
            ) : (
              <div className="text-gray-500 text-sm">No request data</div>
            )}
          </div>
        </div>

        {/* Response side */}
        <div className="flex-1 flex flex-col">
          <div className="flex-shrink-0 px-3 py-2 bg-navy-900/80 border-b border-navy-700 flex items-center justify-between">
            <span className="text-xs font-semibold text-green-400">{responseLabel}</span>
            {response && (
              <button
                onClick={() => handleCopy(response, 'response')}
                className="text-xs text-gray-400 hover:text-white transition-colors flex items-center space-x-1"
              >
                {copiedSide === 'response' ? (
                  <>
                    <span>✓</span>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <span>📋</span>
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>
          <div className="flex-1 overflow-auto p-3">
            {response ? (
              <pre
                className="text-xs font-mono whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: highlightJson(response) }}
              />
            ) : (
              <div className="text-gray-500 text-sm italic">Awaiting response...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequestInspector;
