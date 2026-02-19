/**
 * Demo Guide Component
 * Collapsible help panel for demo presenters
 */

import React, { useState } from 'react';

function DemoGuide({ onClose }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mx-4 mt-4 bg-gold-500/10 border border-gold-500/30 rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-gold-500/20 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <span>💡</span>
          <span className="text-sm font-semibold text-gold-400">Demo Guide</span>
        </div>
        <div className="flex items-center space-x-2">
          <svg
            className={`w-4 h-4 text-gold-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="text-gray-400 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="px-3 py-3 border-t border-gold-500/20 text-xs space-y-2">
          <GuideStep number={1} text="Click a quick-prompt below to start the demo" />
          <GuideStep number={2} text="Watch the MCP tool calls appear in real-time →" />
          <GuideStep number={3} text="Click any log entry to inspect full JSON" />
          <GuideStep number={4} text="Switch to Tool Registry tab to see all 7 MCP tools" />

          <div className="pt-2 border-t border-gold-500/20 mt-2">
            <p className="text-gray-400">
              <span className="text-gold-400">Pro tip:</span> Ask the AI to "plan a complete trip"
              to see multiple tool calls in action!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function GuideStep({ number, text }) {
  return (
    <div className="flex items-start space-x-2">
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gold-500/30 text-gold-400 flex items-center justify-center text-[10px] font-bold">
        {number}
      </span>
      <span className="text-gray-300">{text}</span>
    </div>
  );
}

export default DemoGuide;
