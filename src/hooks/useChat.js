/**
 * Chat hook for managing conversation state
 */

import { useState, useCallback, useRef } from 'react';
import api from '../utils/api.js';
import { generateId } from '../utils/helpers.js';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentToolCall, setCurrentToolCall] = useState(null);
  const abortControllerRef = useRef(null);

  /**
   * Add a message to the conversation
   */
  const addMessage = useCallback((role, content, metadata = {}) => {
    const message = {
      id: generateId(),
      role,
      content,
      timestamp: new Date().toISOString(),
      ...metadata,
    };
    setMessages(prev => [...prev, message]);
    return message;
  }, []);

  /**
   * Send a message and get AI response
   */
  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || isLoading) return;

    setError(null);

    // Add user message
    const userMessage = addMessage('user', content);

    // Create placeholder for assistant response
    const assistantMessageId = generateId();
    setMessages(prev => [...prev, {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      isLoading: true,
      timestamp: new Date().toISOString(),
    }]);

    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      // Prepare messages for API (only role and content)
      const apiMessages = messages
        .filter(m => !m.isLoading)
        .map(m => ({ role: m.role, content: m.content }))
        .concat([{ role: 'user', content }]);

      const result = await api.sendChat(apiMessages);

      if (result.success) {
        // Update assistant message with response
        setMessages(prev => prev.map(m =>
          m.id === assistantMessageId
            ? {
                ...m,
                content: result.response.content,
                isLoading: false,
                stats: result.stats,
                iterations: result.response.iterations,
              }
            : m
        ));
      } else {
        throw new Error(result.error || 'Failed to get response');
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        // Request was cancelled
        setMessages(prev => prev.filter(m => m.id !== assistantMessageId));
      } else {
        setError(err.message);
        // Update message with error
        setMessages(prev => prev.map(m =>
          m.id === assistantMessageId
            ? {
                ...m,
                content: `Sorry, I encountered an error: ${err.message}`,
                isLoading: false,
                isError: true,
              }
            : m
        ));
      }
    } finally {
      setIsLoading(false);
      setCurrentToolCall(null);
      abortControllerRef.current = null;
    }
  }, [messages, isLoading, addMessage]);

  /**
   * Cancel current request
   */
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  /**
   * Clear all messages
   */
  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setCurrentToolCall(null);
  }, []);

  /**
   * Update tool call status (for UI display)
   */
  const setToolCallStatus = useCallback((toolCall) => {
    setCurrentToolCall(toolCall);
  }, []);

  return {
    messages,
    isLoading,
    error,
    currentToolCall,
    sendMessage,
    cancelRequest,
    clearChat,
    setToolCallStatus,
    addMessage,
  };
}

export default useChat;
