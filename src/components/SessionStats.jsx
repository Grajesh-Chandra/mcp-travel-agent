/**
 * Session Stats Component
 * Live counters and charts for session metrics
 */

import React from 'react';
import { formatDuration, formatNumber } from '../utils/helpers.js';

function SessionStats({ stats, tools }) {
  if (!stats) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4">
        <span className="text-4xl mb-2">📊</span>
        <p className="text-sm">Loading stats...</p>
      </div>
    );
  }

  // Calculate tool breakdown
  const toolBreakdown = tools?.filter(t => t.usageCount > 0) || [];
  const totalToolCalls = toolBreakdown.reduce((sum, t) => sum + t.usageCount, 0);
  const maxUsage = Math.max(...toolBreakdown.map(t => t.usageCount), 1);

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="API Calls"
          value={stats.totalApiCalls || 0}
          icon="🔵"
          color="blue"
        />
        <StatCard
          label="Tool Invocations"
          value={stats.totalToolInvocations || 0}
          icon="🔧"
          color="gold"
        />
        <StatCard
          label="Est. Tokens"
          value={formatNumber(stats.estimatedTokens || 0)}
          icon="📝"
          color="green"
        />
        <StatCard
          label="Avg Response"
          value={stats.avgResponseTime ? `${stats.avgResponseTime}ms` : '—'}
          icon="⏱️"
          color="purple"
        />
      </div>

      {/* Session Timer */}
      <div className="bg-navy-900/50 border border-navy-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Session Duration</span>
          <SessionTimer startTime={stats.sessionDuration} />
        </div>
      </div>

      {/* Tool Usage Breakdown */}
      <div className="bg-navy-900/50 border border-navy-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Tool Usage Breakdown</h3>

        {toolBreakdown.length === 0 ? (
          <p className="text-xs text-gray-500">No tools called yet</p>
        ) : (
          <div className="space-y-2">
            {toolBreakdown.map((tool) => (
              <div key={tool.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-gold-400">{tool.name}</span>
                  <span className="text-gray-400">{tool.usageCount} calls</span>
                </div>
                <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold-500 rounded-full transition-all duration-500"
                    style={{ width: `${(tool.usageCount / maxUsage) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {totalToolCalls > 0 && (
          <div className="mt-3 pt-3 border-t border-navy-700">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Total Tool Calls</span>
              <span className="font-semibold text-white">{totalToolCalls}</span>
            </div>
          </div>
        )}
      </div>

      {/* MCP Server Info */}
      <div className="bg-navy-900/50 border border-navy-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-3">MCP Server Info</h3>
        <div className="space-y-2 text-xs">
          <InfoRow label="Server" value="travel-mcp-server" />
          <InfoRow label="Protocol" value="2024-11-05" />
          <InfoRow label="Tools" value={`${tools?.length || 0} registered`} />
          <InfoRow label="Transport" value="HTTP + WebSocket" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/30',
    gold: 'bg-gold-500/10 border-gold-500/30',
    green: 'bg-green-500/10 border-green-500/30',
    purple: 'bg-purple-500/10 border-purple-500/30',
  };

  return (
    <div className={`rounded-lg border p-3 ${colorClasses[color] || colorClasses.blue}`}>
      <div className="flex items-center space-x-2 mb-1">
        <span>{icon}</span>
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  );
}

function SessionTimer({ startTime }) {
  const [duration, setDuration] = React.useState(startTime || 0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setDuration(prev => prev + 1000);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="font-mono text-lg text-gold-400">
      {formatDuration(duration)}
    </span>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-200 font-mono">{value}</span>
    </div>
  );
}

export default SessionStats;
