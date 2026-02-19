/**
 * Tool Registry Component
 * Shows all registered MCP tools with their schemas
 */

import React, { useState } from 'react';

function ToolRegistry({ tools }) {
  const [expandedTool, setExpandedTool] = useState(null);

  if (!tools || tools.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4">
        <span className="text-4xl mb-2">🔧</span>
        <p className="text-sm">Loading tools...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      <div className="text-xs text-gray-400 mb-4">
        {tools.length} MCP tools registered
      </div>

      {tools.map((tool) => (
        <ToolCard
          key={tool.name}
          tool={tool}
          isExpanded={expandedTool === tool.name}
          onToggle={() => setExpandedTool(expandedTool === tool.name ? null : tool.name)}
        />
      ))}
    </div>
  );
}

function ToolCard({ tool, isExpanded, onToggle }) {
  const hasUsage = tool.usageCount > 0;

  return (
    <div className="bg-navy-900/50 border border-navy-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="px-4 py-3 cursor-pointer hover:bg-navy-700/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-lg">🔧</span>
            <div>
              <h3 className="font-mono text-sm font-semibold text-gold-400">{tool.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{tool.description}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Usage badge */}
            <span className={`px-2 py-0.5 rounded text-xs ${
              hasUsage ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
            }`}>
              {hasUsage ? `×${tool.usageCount}` : 'idle'}
            </span>

            {/* Expand chevron */}
            <svg
              className={`w-4 h-4 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded schema view */}
      {isExpanded && tool.inputSchema && (
        <div className="px-4 py-3 border-t border-navy-700 bg-navy-900">
          <h4 className="text-xs font-semibold text-gray-400 mb-2">Input Schema</h4>
          <SchemaExplorer schema={tool.inputSchema} />
        </div>
      )}
    </div>
  );
}

function SchemaExplorer({ schema, depth = 0 }) {
  if (!schema) return null;

  const properties = schema.properties || {};
  const required = schema.required || [];

  return (
    <div className="space-y-1.5" style={{ marginLeft: depth * 12 }}>
      {Object.entries(properties).map(([name, prop]) => {
        const isRequired = required.includes(name);
        const isObject = prop.type === 'object' && prop.properties;
        const isArray = prop.type === 'array';

        return (
          <div key={name} className="text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-gold-400">{name}</span>
              <span className="text-gray-500">:</span>
              <span className={`px-1.5 py-0.5 rounded ${getTypeColor(prop.type)}`}>
                {prop.type}
                {isArray && prop.items && <span className="text-gray-400">{'<'}{prop.items.type}{'>'}</span>}
                {prop.enum && <span className="text-gray-400"> ({prop.enum.join('|')})</span>}
              </span>
              {isRequired && (
                <span className="text-red-400 text-[10px]">required</span>
              )}
            </div>
            {prop.description && (
              <p className="text-gray-500 ml-4 mt-0.5">{prop.description}</p>
            )}
            {isObject && (
              <div className="mt-1 ml-2 pl-2 border-l border-navy-700">
                <SchemaExplorer schema={prop} depth={depth + 1} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function getTypeColor(type) {
  switch (type) {
    case 'string':
      return 'bg-green-500/20 text-green-400';
    case 'number':
    case 'integer':
      return 'bg-cyan-500/20 text-cyan-400';
    case 'boolean':
      return 'bg-orange-500/20 text-orange-400';
    case 'array':
      return 'bg-purple-500/20 text-purple-400';
    case 'object':
      return 'bg-blue-500/20 text-blue-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
}

export default ToolRegistry;
