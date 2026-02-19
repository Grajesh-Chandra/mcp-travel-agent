/**
 * Typing Indicator Component
 * Animated dots showing AI is thinking
 */

import React from 'react';

function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1">
      <span className="text-xs text-gray-400 mr-2">Thinking</span>
      <div className="typing-dot w-2 h-2 bg-gold-500 rounded-full" />
      <div className="typing-dot w-2 h-2 bg-gold-500 rounded-full" />
      <div className="typing-dot w-2 h-2 bg-gold-500 rounded-full" />
    </div>
  );
}

export default TypingIndicator;
