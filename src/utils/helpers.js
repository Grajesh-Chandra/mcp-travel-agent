/**
 * Utility functions for formatting and display
 */

/**
 * Format timestamp for display
 */
export function formatTimestamp(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }) + '.' + date.getMilliseconds().toString().padStart(3, '0');
}

/**
 * Format duration in milliseconds
 */
export function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

/**
 * Format number with commas
 */
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format currency
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str, maxLength = 100) {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Syntax highlight JSON
 */
export function highlightJson(json) {
  if (typeof json !== 'string') {
    json = JSON.stringify(json, null, 2);
  }

  return json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
    .replace(/: "([^"]*)"(,?)/g, ': <span class="json-string">"$1"</span>$2')
    .replace(/: (-?\d+\.?\d*)(,?)/g, ': <span class="json-number">$1</span>$2')
    .replace(/: (true|false)(,?)/g, ': <span class="json-boolean">$1</span>$2')
    .replace(/: (null)(,?)/g, ': <span class="json-null">$1</span>$2')
    .replace(/([{}\[\]])/g, '<span class="json-bracket">$1</span>');
}

/**
 * Parse and render markdown-like content (simple version)
 */
export function parseMarkdown(text) {
  if (!text) return '';

  return text
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Bullet lists
    .replace(/^\s*[-*]\s+(.+)$/gm, '<li>$1</li>')
    // Numbered lists
    .replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    // Line breaks
    .replace(/\n/g, '<br>');
}

/**
 * Generate unique ID
 */
export function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Deep clone object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounce function
 */
export function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  }
}

/**
 * Get log type configuration
 */
export const LOG_TYPE_CONFIG = {
  SYSTEM: { color: '#8b5cf6', bg: 'bg-purple-500/20', emoji: '🟣', label: 'SYSTEM' },
  REQUEST: { color: '#3b82f6', bg: 'bg-blue-500/20', emoji: '🔵', label: 'REQUEST' },
  TOOL_CALL: { color: '#eab308', bg: 'bg-yellow-500/20', emoji: '🟡', label: 'TOOL_CALL' },
  TOOL_RESULT: { color: '#22c55e', bg: 'bg-green-500/20', emoji: '🟢', label: 'TOOL_RESULT' },
  RESPONSE: { color: '#ffffff', bg: 'bg-white/10', emoji: '⚪', label: 'RESPONSE' },
  ERROR: { color: '#ef4444', bg: 'bg-red-500/20', emoji: '🔴', label: 'ERROR' },
};

/**
 * Quick prompt suggestions
 */
export const QUICK_PROMPTS = [
  { text: "Plan a 5-day Dubai trip from NYC in March", icon: "✈️" },
  { text: "Find business class to Tokyo under $3000", icon: "💺" },
  { text: "What's the weather in Paris in June?", icon: "🌤️" },
  { text: "Visa requirements for Japan with US passport", icon: "🛂" },
  { text: "Hotels in Bali under $150/night", icon: "🏨" },
  { text: "Create a full Rome itinerary for 4 people", icon: "🗺️" },
];

/**
 * Follow-up prompt suggestions shown after assistant responses
 * Provides contextual suggestions for continued MCP interaction testing
 */
export const FOLLOW_UP_PROMPTS = [
  { text: "Show me more options", icon: "🔍" },
  { text: "What about cheaper alternatives?", icon: "💰" },
  { text: "Add hotel recommendations", icon: "🏨" },
  { text: "Check visa requirements for this destination", icon: "🛂" },
  { text: "What's the weather like there?", icon: "🌤️" },
  { text: "Find nearby restaurants", icon: "🍽️" },
  { text: "Show available activities", icon: "🎭" },
  { text: "Create a daily itinerary", icon: "📅" },
  { text: "What are the must-see attractions?", icon: "🏛️" },
  { text: "Find local transportation options", icon: "🚕" },
];

/**
 * Get a randomized subset of follow-up prompts
 */
export function getRandomFollowUpPrompts(count = 3) {
  const shuffled = [...FOLLOW_UP_PROMPTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
