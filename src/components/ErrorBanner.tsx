import React from 'react';
import type { JsonParseError } from '../lib/json/parser';

interface ErrorBannerProps {
  error: JsonParseError;
  onJumpToError?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ error, onJumpToError }) => {
  const { line, column, message, snippet } = error;

  const getHeuristicTip = () => {
    const msg = message.toLowerCase();
    if (msg.includes('trailing comma') || (msg.includes('unexpected token') && msg.includes('}'))) {
      return 'Possible trailing comma before the closing bracket or brace.';
    }
    if (msg.includes('single-quote') || msg.includes('quote') || msg.includes("'")) {
      return 'JSON strings and keys require standard double quotes (").';
    }
    if (msg.includes('unexpected token') && (msg.includes('token') || msg.includes('position'))) {
      return 'Missing comma between elements or an unquoted object key.';
    }
    if (msg.includes('unexpected end')) {
      return 'Incomplete payload. An opening brace "{" or bracket "[" was not closed.';
    }
    return null;
  };

  const tip = getHeuristicTip();

  return (
    <div style={{
      borderTop: '1px solid var(--sep-strong)',
      background: 'var(--bg-toolbar)',
      padding: '7px 12px 8px',
      fontSize: '11px',
      fontFamily: 'var(--font-mono)',
      userSelect: 'text',
    }}>
      {/* Primary diagnostic row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'var(--state-error)', flexShrink: 0,
          }} />
          <span style={{ color: 'var(--state-error)', fontWeight: 600, whiteSpace: 'nowrap' }}>
            Parse Error
          </span>
          <span style={{ color: 'var(--text-tertiary)' }}>·</span>
          <span style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            Ln {line}, Col {column}
          </span>
          <span style={{ color: 'var(--text-tertiary)' }} className="hidden sm:inline">·</span>
          <span style={{
            color: 'rgba(255,100,90,0.80)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }} className="hidden sm:inline">
            {message}
          </span>
        </div>

        {onJumpToError && (
          <button
            onClick={onJumpToError}
            style={{
              display: 'flex', alignItems: 'center', gap: '3px',
              padding: '2px 6px', borderRadius: '4px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', fontSize: '10px',
              fontFamily: 'var(--font-mono)', flexShrink: 0,
              transition: 'color 0.1s, background 0.1s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--state-error)';
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,69,58,0.08)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            <span>Jump to line {line}</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M2.5 7.5L7.5 2.5M7.5 2.5H4M7.5 2.5V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Mobile: message on its own line */}
      <div className="sm:hidden" style={{ color: 'rgba(255,100,90,0.80)', marginTop: '3px' }}>
        {message}
      </div>

      {/* Heuristic hint */}
      {tip && (
        <div style={{
          marginTop: '5px', fontSize: '11px',
          fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase',
            letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginRight: '5px',
          }}>Note</span>
          {tip}
        </div>
      )}

      {/* Snippet preview */}
      {snippet && (
        <div style={{
          marginTop: '8px', borderRadius: '5px',
          background: 'var(--bg-window)',
          border: '1px solid var(--sep-subtle)',
          fontFamily: 'var(--font-mono)', fontSize: '11px',
          lineHeight: '18px', overflowX: 'auto', padding: '4px 0',
        }}>
          {snippet.previousLine && (
            <div style={{ display: 'flex', color: 'var(--text-tertiary)' }}>
              <span style={{
                width: '36px', textAlign: 'right', paddingRight: '10px',
                flexShrink: 0, userSelect: 'none',
              }}>{snippet.previousLine.line}</span>
              <span style={{ whiteSpace: 'pre' }}>{snippet.previousLine.text}</span>
            </div>
          )}

          <div style={{
            display: 'flex',
            background: 'rgba(255,69,58,0.10)',
            color: 'rgba(255,160,150,0.90)',
          }}>
            <span style={{
              width: '36px', textAlign: 'right', paddingRight: '10px',
              flexShrink: 0, color: 'var(--state-error)', fontWeight: 700, userSelect: 'none',
            }}>{snippet.errorLine.line}</span>
            <span style={{ whiteSpace: 'pre' }}>{snippet.errorLine.text}</span>
          </div>

          {/* Caret */}
          <div style={{ display: 'flex', color: 'var(--state-error)' }}>
            <span style={{ width: '36px', flexShrink: 0, userSelect: 'none' }} />
            <span style={{ whiteSpace: 'pre', fontWeight: 700 }}>
              {' '.repeat(Math.max(0, column - 1))}^
            </span>
          </div>

          {snippet.nextLine && (
            <div style={{ display: 'flex', color: 'var(--text-tertiary)' }}>
              <span style={{
                width: '36px', textAlign: 'right', paddingRight: '10px',
                flexShrink: 0, userSelect: 'none',
              }}>{snippet.nextLine.line}</span>
              <span style={{ whiteSpace: 'pre' }}>{snippet.nextLine.text}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
