/**
 * Chat Panel Component
 * Main conversation interface with the AI travel agent
 */

import React, { useState, useRef, useEffect } from 'react';
import { parseMarkdown, QUICK_PROMPTS } from '../utils/helpers.js';
import ToolCallCard from './ToolCallCard.jsx';
import TypingIndicator from './TypingIndicator.jsx';

function ChatPanel({ messages, isLoading, onSendMessage, onClearChat, currentToolCall }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleQuickPrompt = (prompt) => {
    if (!isLoading) {
      onSendMessage(prompt);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-navy-900">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-navy-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-500 to-gold-300 flex items-center justify-center">
              <span className="text-navy-900 text-lg">✈</span>
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-white">VOYAGER AI</h1>
              <p className="text-xs text-gray-400">Your Intelligent Travel Concierge</p>
            </div>
          </div>
          <button
            onClick={onClearChat}
            className="px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-navy-700 rounded-lg transition-colors"
            title="Clear conversation"
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-300/10 flex items-center justify-center mb-4">
              <span className="text-4xl">🌍</span>
            </div>
            <h2 className="font-display text-2xl text-white mb-2">Welcome to Voyager AI</h2>
            <p className="text-gray-400 max-w-md mb-6">
              I'm your AI travel concierge. I can help you find flights, hotels, activities,
              check weather, visa requirements, and plan complete itineraries.
            </p>
            <p className="text-sm text-gold-500 mb-4">Try one of these to get started:</p>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            currentToolCall={message.isLoading ? currentToolCall : null}
          />
        ))}

        {isLoading && !messages.some(m => m.isLoading) && (
          <div className="flex items-start space-x-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center flex-shrink-0">
              <span className="text-sm">🤖</span>
            </div>
            <div className="bg-navy-800 rounded-2xl rounded-tl-sm px-4 py-3">
              <TypingIndicator />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length === 0 && (
        <div className="flex-shrink-0 px-6 pb-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickPrompt(prompt.text)}
                disabled={isLoading}
                className="px-4 py-2 bg-navy-800 hover:bg-navy-700 border border-navy-600 hover:border-gold-500/50 rounded-full text-sm text-gray-300 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>{prompt.icon}</span>
                <span>{prompt.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-navy-700">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about travel..."
              disabled={isLoading}
              rows={1}
              className="w-full px-4 py-3 bg-navy-800 border border-navy-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 resize-none disabled:opacity-50 transition-all"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <span>Send</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Quick prompts for non-empty chat */}
        {messages.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK_PROMPTS.slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickPrompt(prompt.text)}
                disabled={isLoading}
                className="px-3 py-1.5 bg-navy-800/50 hover:bg-navy-700 border border-navy-700 hover:border-gold-500/30 rounded-full text-xs text-gray-400 hover:text-gray-200 transition-all disabled:opacity-50"
              >
                {prompt.icon} {prompt.text.substring(0, 30)}...
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Message Bubble Component
 */
function MessageBubble({ message, currentToolCall }) {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div
      className={`flex items-start space-x-3 animate-slide-in-up ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser
          ? 'bg-gold-500'
          : isError
            ? 'bg-red-500/20'
            : 'bg-navy-700'
      }`}>
        <span className="text-sm">{isUser ? '👤' : isError ? '⚠️' : '🤖'}</span>
      </div>

      {/* Message Content */}
      <div className={`max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div className={`rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-gold-500/20 border border-gold-500/30 rounded-tr-sm'
            : isError
              ? 'bg-red-500/10 border border-red-500/30 rounded-tl-sm'
              : 'bg-navy-800 border border-navy-700 rounded-tl-sm'
        }`}>
          {message.isLoading ? (
            <div className="space-y-3">
              <TypingIndicator />
              {currentToolCall && (
                <ToolCallCard
                  toolName={currentToolCall.name}
                  status="running"
                  serverName="travel-mcp-server"
                />
              )}
            </div>
          ) : (
            <div
              className={`markdown-content text-sm ${isUser ? 'text-white' : 'text-gray-200'}`}
              dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
            />
          )}
        </div>

        {/* Message metadata */}
        {!message.isLoading && (
          <div className={`mt-1 text-xs text-gray-500 ${isUser ? 'text-right' : ''}`}>
            {new Date(message.timestamp).toLocaleTimeString()}
            {message.iterations && (
              <span className="ml-2 text-gold-500/70">
                ({message.iterations} iteration{message.iterations > 1 ? 's' : ''})
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatPanel;
