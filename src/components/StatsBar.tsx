import React from 'react';
import { formatByteSize, type JsonStats } from '../lib/json/parser';

interface StatsBarProps {
  isValid: boolean | null;
  stats?: JsonStats | null;
  cursorPos: { line: number; col: number };
  rawLength: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  isValid,
  stats,
  cursorPos,
  rawLength,
}) => {
  const dotColor =
    isValid === true  ? 'var(--state-valid)' :
    isValid === false ? 'var(--state-error)' :
    'var(--text-tertiary)';

  const statusText =
    isValid === true  ? 'valid' :
    isValid === false ? 'syntax error' :
    'ready';

  const statusColor =
    isValid === true  ? 'var(--text-secondary)' :
    isValid === false ? 'var(--state-error)' :
    'var(--text-tertiary)';

  return (
    <footer style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: '22px', padding: '0 12px',
      background: 'var(--bg-toolbar)',
      borderTop: '1px solid var(--sep-strong)',
      fontSize: '11px', fontFamily: 'var(--font-mono)',
      color: 'var(--text-tertiary)',
      userSelect: 'none', flexShrink: 0,
    }}>
      {/* Left — status dot + label + stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{
          width: '5px', height: '5px', borderRadius: '50%',
          background: dotColor, flexShrink: 0,
          transition: 'background 0.2s',
        }} />
        <span style={{ color: statusColor, transition: 'color 0.2s' }}>
          {statusText}
        </span>

        {stats && isValid && (
          <span className="hidden sm:inline" style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            color: 'var(--text-tertiary)', paddingLeft: '2px',
          }}>
            <span>·</span>
            <span>{formatByteSize(stats.byteSize)}</span>
            <span>·</span>
            <span>{stats.lineCount}L</span>
            <span>·</span>
            <span>{stats.keysCount} keys</span>
            <span>·</span>
            <span>depth {stats.maxDepth}</span>
          </span>
        )}
      </div>

      {/* Right — char count, cursor position, encoding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {rawLength > 0 && (
          <span className="hidden md:inline" style={{ color: 'var(--text-tertiary)' }}>
            {rawLength.toLocaleString()} chars
          </span>
        )}
        {rawLength > 0 && <span className="hidden md:inline">·</span>}
        <span style={{ color: 'var(--text-secondary)' }}>
          Ln {cursorPos.line}, Col {cursorPos.col}
        </span>
        <span className="hidden sm:inline">·</span>
        <span className="hidden sm:inline" style={{ color: 'var(--text-tertiary)' }}>UTF-8</span>
      </div>
    </footer>
  );
};
