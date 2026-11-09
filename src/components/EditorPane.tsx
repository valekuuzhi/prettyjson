import React, { useRef, useEffect, useState } from 'react';
import type { JsonParseError } from '../lib/json/parser';

interface EditorPaneProps {
  value: string;
  onChange: (value: string) => void;
  error?: JsonParseError | null;
  onCursorChange?: (line: number, col: number) => void;
  onPasteFormat?: () => void;
}

/**
 * Raw JSON editor — the visual hero of the application.
 *
 * Design reference: Xcode source editor, VS Code editor.
 * - No chrome, no extra decorations
 * - Line numbers match Xcode style: right-aligned, muted, same size as code
 * - Error line highlighted with a very subtle red left border + tint
 * - Gutter is narrower than VS Code (3-char wide for typical JSON files)
 * - 20px line height for comfortable reading
 * - Drag-and-drop target with clean overlay
 */
export const EditorPane: React.FC<EditorPaneProps> = ({
  value,
  onChange,
  error,
  onCursorChange,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const lines = value.split('\n');
  const lineCount = Math.max(1, lines.length);

  // Sync gutter scroll with textarea scroll
  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const updateCursorPosition = () => {
    if (!textareaRef.current) return;
    const before = value.slice(0, textareaRef.current.selectionStart);
    const line = before.split('\n').length;
    const lastNl = before.lastIndexOf('\n');
    const col = lastNl === -1 ? before.length + 1 : before.length - lastNl;
    onCursorChange?.(line, col);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      const ta = textareaRef.current;
      if (!ta) return;
      const { selectionStart: s, selectionEnd: en } = ta;
      const newVal = value.substring(0, s) + '  ' + value.substring(en);
      onChange(newVal);
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = s + 2;
        updateCursorPosition();
      }, 0);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content !== undefined) onChange(content);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content !== undefined) onChange(content);
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    if (error?.line && textareaRef.current) {
      const target = (error.line - 2) * 20;
      textareaRef.current.scrollTop = Math.max(0, target);
    }
  }, [error]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative flex flex-col h-full"
      style={{
        background: 'var(--bg-content)',
        outline: isDragging ? '2px solid var(--accent)' : 'none',
        outlineOffset: '-2px',
      }}
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
          Input
        </span>

        <div className="flex items-center gap-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json,application/json,text/plain"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mac-btn"
            style={{ padding: '1px 6px', fontSize: '11px' }}
            title="Open JSON file"
          >
            Open…
          </button>
          {value && (
            <button
              onClick={() => onChange('')}
              className="mac-btn"
              style={{ padding: '1px 6px', fontSize: '11px' }}
              title="Clear editor"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Editor body: gutter + textarea ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line number gutter — Xcode style */}
        <div
          ref={gutterRef}
          aria-hidden="true"
          className="shrink-0 overflow-hidden select-none text-right"
          style={{
            width: '44px',
            paddingTop: '8px',
            paddingRight: '10px',
            background: 'var(--bg-content)',
            borderRight: '1px solid var(--sep-hairline)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            lineHeight: '20px',
            color: 'var(--text-tertiary)',
          }}
        >
          {Array.from({ length: lineCount }, (_, i) => {
            const n = i + 1;
            const isErr = error?.line === n;
            return (
              <div
                key={n}
                style={{
                  height: '20px',
                  color: isErr ? 'var(--state-error)' : undefined,
                  fontWeight: isErr ? '600' : undefined,
                }}
              >
                {n}
              </div>
            );
          })}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => { onChange(e.target.value); updateCursorPosition(); }}
          onScroll={handleScroll}
          onKeyUp={updateCursorPosition}
          onClick={updateCursorPosition}
          onKeyDown={handleKeyDown}
          placeholder="Paste or type JSON…"
          spellCheck={false}
          aria-label="JSON input editor"
          style={{
            flex: 1,
            padding: '8px 16px 48px 10px',
            background: 'transparent',
            fontFamily: 'var(--font-mono)',
            fontSize: '12.5px',
            lineHeight: '20px',
            color: 'rgba(255,255,255,0.80)',
            resize: 'none',
            outline: 'none',
            border: 'none',
            overflow: 'auto',
          }}
        />

        {/* Drag overlay */}
        {isDragging && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{
              background: 'rgba(28,28,30,0.92)',
              border: '2px dashed var(--sep-strong)',
              zIndex: 20,
            }}
          >
            {/* SF Symbols "arrow.down.to.line" proxy */}
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <path d="M14 4V20M8 14L14 20L20 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="6" y1="24" x2="22" y2="24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
              Drop JSON file to open
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
