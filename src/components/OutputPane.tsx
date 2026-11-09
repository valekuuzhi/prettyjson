import React, { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { tokenizeJson, type Token } from '../lib/json/highlighter';

interface OutputPaneProps {
  jsonText: string;
  onCopySuccess?: (msg: string) => void;
}

/**
 * Syntax-highlighted read-only code view for formatted JSON output.
 *
 * Design: Xcode source viewer — identical chrome as editor but read-only.
 * No additional decorative badges. Line numbers, code, done.
 */
export const OutputPane: React.FC<OutputPaneProps> = ({ jsonText, onCopySuccess }) => {
  const [copied, setCopied] = useState(false);
  const [wrapLines, setWrapLines] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  const lines = useMemo(() => tokenizeJson(jsonText), [jsonText]);

  const handleCopy = () => {
    if (!jsonText) return;
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    onCopySuccess?.('Copied formatted JSON');
  };

  const renderToken = (token: Token, idx: number) => (
    <span key={idx} className={`token-${token.type}`}>{token.value}</span>
  );

  if (!jsonText) {
    return (
      <div
        className="flex flex-col items-center justify-center h-full"
        style={{ background: 'var(--bg-content)' }}
      >
        <p style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
          No output
        </p>
      </div>
    );
  }

  const matchCount = filterQuery
    ? lines.filter(l => l.tokens.some(t => t.value.toLowerCase().includes(filterQuery.toLowerCase()))).length
    : 0;

  return (
    <div
      className="flex flex-col h-full select-text"
      style={{ background: 'var(--bg-content)' }}
    >
      {/* ── Pane tab / label bar ── */}
      <div
        className="flex items-center justify-between px-3 h-[27px] shrink-0"
        style={{
          background: 'var(--bg-toolbar)',
          borderBottom: '1px solid var(--sep-subtle)',
        }}
      >
        <span
          className="text-[11px] font-medium tracking-[0.02em]"
          style={{ color: 'var(--text-secondary)' }}
        >
          Formatted
        </span>

        <div className="flex items-center gap-1.5">
          {/* Find in output */}
          <div className="relative flex items-center">
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Find…"
              aria-label="Find in formatted JSON"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: '5px',
                padding: '1px 24px 1px 7px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                outline: 'none',
                width: filterQuery ? '120px' : '90px',
                transition: 'width 150ms ease',
              }}
            />
            {filterQuery && (
              <span
                className="absolute right-1.5 text-[10px] pointer-events-none"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {matchCount}
              </span>
            )}
          </div>

          {/* Wrap toggle */}
          <button
            onClick={() => setWrapLines(!wrapLines)}
            className="mac-btn"
            style={{
              padding: '1px 6px',
              fontSize: '11px',
              background: wrapLines ? 'var(--ctrl-bg-hover)' : undefined,
            }}
            title="Toggle soft wrap"
          >
            Wrap
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="mac-btn"
            style={{ padding: '1px 6px', fontSize: '11px' }}
            title="Copy to clipboard"
          >
            {copied ? (
              <><Check size={10} style={{ color: 'var(--state-valid)' }} /> Copied</>
            ) : 'Copy'}
          </button>
        </div>
      </div>

      {/* ── Code viewport with line numbers ── */}
      <div className="flex-1 overflow-auto" style={{ fontFamily: 'var(--font-mono)', fontSize: '12.5px', lineHeight: '20px' }}>
        <div className="flex min-w-fit">
          {/* Gutter */}
          <div
            className="shrink-0 select-none text-right overflow-hidden"
            style={{
              width: '44px',
              paddingTop: '8px',
              paddingRight: '10px',
              color: 'var(--text-tertiary)',
              borderRight: '1px solid var(--sep-hairline)',
              lineHeight: '20px',
            }}
          >
            {lines.map(l => (
              <div key={l.lineNumber} style={{ height: '20px' }}>{l.lineNumber}</div>
            ))}
          </div>

          {/* Token output */}
          <div
            className={`flex-1 pl-2.5 pr-4 ${wrapLines ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'}`}
            style={{ paddingTop: '8px' }}
          >
            {lines.map(line => {
              const isMatch = filterQuery && line.tokens.some(t => t.value.toLowerCase().includes(filterQuery.toLowerCase()));
              return (
                <div
                  key={line.lineNumber}
                  style={{
                    height: '20px',
                    lineHeight: '20px',
                    background: isMatch ? 'rgba(255,214,10,0.10)' : undefined,
                  }}
                >
                  {line.tokens.map((token, idx) => renderToken(token, idx))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
