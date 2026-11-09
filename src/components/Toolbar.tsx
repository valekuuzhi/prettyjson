import React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import type { IndentType } from '../lib/json/parser';

export type LayoutMode = 'split' | 'editor-only' | 'output-only';
export type OutputViewMode = 'code' | 'tree';

interface ToolbarProps {
  onPrettify: () => void;
  onMinify: () => void;
  onValidate: () => void;
  indent: IndentType;
  onChangeIndent: (indent: IndentType) => void;
  layoutMode: LayoutMode;
  onChangeLayout: (mode: LayoutMode) => void;
  outputViewMode: OutputViewMode;
  onChangeOutputView: (mode: OutputViewMode) => void;
  onCopyOutput: () => void;
  onDownload: () => void;
  onApplyToEditor: () => void;
  isValid: boolean;
  hasInput: boolean;
  copied: boolean;
}

/**
 * macOS-style secondary toolbar / action bar.
 *
 * Sits below the title bar and houses the primary JSON operations.
 * Design reference: Xcode toolbar, Finder path bar.
 *
 * Rules applied:
 * - 32px height (compact secondary toolbar)
 * - Controls use the mac-btn class (subtle filled bevel)
 * - Primary action (Format) uses mac-btn-primary (blue fill)
 * - Segmented controls for view/layout switching
 * - Separator dots between logical groups
 * - No icons on primary text actions (keeps readability)
 */
export const Toolbar: React.FC<ToolbarProps> = ({
  onPrettify,
  onMinify,
  onValidate,
  indent,
  onChangeIndent,
  layoutMode,
  onChangeLayout,
  outputViewMode,
  onChangeOutputView,
  onCopyOutput,
  onDownload,
  onApplyToEditor,
  isValid,
  hasInput,
  copied,
}) => {
  return (
    <div
      className="flex items-center justify-between gap-2 px-3 h-[34px] shrink-0"
      style={{
        background: 'var(--bg-toolbar)',
        borderBottom: '1px solid var(--sep-strong)',
      }}
    >
      {/* ── LEFT: Primary JSON operations ── */}
      <div className="flex items-center gap-1.5">

        {/* Format — primary action */}
        <button
          onClick={onPrettify}
          disabled={!hasInput}
          className="mac-btn mac-btn-primary"
          title="Format JSON (⌘ Enter)"
        >
          Format
        </button>

        {/* Indent selector — inline popup */}
        <div className="relative flex items-center" style={{ color: 'var(--text-secondary)' }}>
          <select
            value={indent}
            onChange={(e) => onChangeIndent(e.target.value as IndentType)}
            aria-label="Indentation style"
            title="Indentation style"
            style={{
              appearance: 'none',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              paddingRight: '14px',
              paddingLeft: '0',
              outline: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <option value="2" style={{ background: '#2c2c2e' }}>2 sp</option>
            <option value="4" style={{ background: '#2c2c2e' }}>4 sp</option>
            <option value="tab" style={{ background: '#2c2c2e' }}>tab</option>
          </select>
          <ChevronDown
            size={9}
            className="absolute right-0 pointer-events-none"
            style={{ color: 'var(--text-tertiary)' }}
          />
        </div>

        {/* Thin separator */}
        <span className="mac-sep-v h-4" />

        {/* Minify */}
        <button
          onClick={onMinify}
          disabled={!hasInput}
          className="mac-btn"
          title="Minify JSON (⌘⇧M)"
        >
          Minify
        </button>

        {/* Validate */}
        <button
          onClick={onValidate}
          disabled={!hasInput}
          className="mac-btn"
          title="Validate JSON"
        >
          Validate
        </button>

        {/* Sync to editor — secondary, hidden on small screens */}
        <button
          onClick={onApplyToEditor}
          disabled={!hasInput || !isValid}
          className="mac-btn hidden md:inline-flex"
          title="Apply formatted output back to editor"
        >
          Sync
        </button>
      </div>

      {/* ── RIGHT: View toggles + clipboard ── */}
      <div className="flex items-center gap-1.5">

        {/* Code / Tree view segmented control */}
        <div className="mac-seg">
          <button
            onClick={() => onChangeOutputView('code')}
            className={`mac-seg-item mac-seg-item-icon ${outputViewMode === 'code' ? 'active' : ''}`}
            title="Formatted code view"
          >
            {/* SF Symbols "chevron.left.slash.chevron.right" proxy */}
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
              <path d="M4.5 3.5L2 6.5L4.5 9.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8.5 3.5L11 6.5L8.5 9.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Code</span>
          </button>
          <button
            onClick={() => onChangeOutputView('tree')}
            className={`mac-seg-item mac-seg-item-icon ${outputViewMode === 'tree' ? 'active' : ''}`}
            title="Interactive tree view"
          >
            {/* SF Symbols "list.bullet.indent" proxy */}
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
              <line x1="2" y1="3.5" x2="11" y2="3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
              <line x1="4" y1="6.5" x2="11" y2="6.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
              <line x1="4" y1="9.5" x2="11" y2="9.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
              <circle cx="2.5" cy="6.5" r="0.8" fill="currentColor" />
              <circle cx="2.5" cy="9.5" r="0.8" fill="currentColor" />
            </svg>
            <span>Tree</span>
          </button>
        </div>

        {/* Layout segmented control — hidden on narrow screens */}
        <div className="mac-seg hidden lg:inline-flex">
          <button
            onClick={() => onChangeLayout('split')}
            className={`mac-seg-item mac-seg-item-icon ${layoutMode === 'split' ? 'active' : ''}`}
            title="Split view"
            aria-label="Split view"
          >
            {/* SF Symbols "rectangle.split.2x1" proxy */}
            <svg width="14" height="11" viewBox="0 0 14 11" fill="none" aria-hidden="true">
              <rect x="0.75" y="0.75" width="12.5" height="9.5" rx="1.25" stroke="currentColor" strokeWidth="1.0" />
              <line x1="7" y1="0.75" x2="7" y2="10.25" stroke="currentColor" strokeWidth="1.0" />
            </svg>
          </button>
          <button
            onClick={() => onChangeLayout('editor-only')}
            className={`mac-seg-item mac-seg-item-icon ${layoutMode === 'editor-only' ? 'active' : ''}`}
            title="Editor only"
            aria-label="Editor only"
          >
            {/* Plain rectangle */}
            <svg width="14" height="11" viewBox="0 0 14 11" fill="none" aria-hidden="true">
              <rect x="0.75" y="0.75" width="12.5" height="9.5" rx="1.25" stroke="currentColor" strokeWidth="1.0" />
            </svg>
          </button>
          <button
            onClick={() => onChangeLayout('output-only')}
            className={`mac-seg-item mac-seg-item-icon ${layoutMode === 'output-only' ? 'active' : ''}`}
            title="Output only"
            aria-label="Output only"
          >
            {/* Code icon proxy */}
            <svg width="13" height="11" viewBox="0 0 13 11" fill="none" aria-hidden="true">
              <rect x="0.75" y="0.75" width="11.5" height="9.5" rx="1.25" stroke="currentColor" strokeWidth="1.0" />
              <line x1="3" y1="3.5" x2="8" y2="3.5" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
              <line x1="3" y1="5.5" x2="10" y2="5.5" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
              <line x1="3" y1="7.5" x2="6" y2="7.5" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <span className="mac-sep-v h-4 hidden sm:block" />

        {/* Copy */}
        <button
          onClick={onCopyOutput}
          disabled={!hasInput}
          className="mac-btn"
          title="Copy output (⌘⇧C)"
        >
          {copied ? (
            <>
              <Check size={11} style={{ color: 'var(--state-valid)' }} />
              Copied
            </>
          ) : (
            <>
              {/* SF Symbols "doc.on.doc" proxy */}
              <svg width="11" height="13" viewBox="0 0 11 13" fill="none" aria-hidden="true">
                <rect x="3" y="2" width="7" height="9" rx="1.2" stroke="currentColor" strokeWidth="1.0" />
                <path d="M1 4.5V10.5C1 11.05 1.45 11.5 2 11.5H7" stroke="currentColor" strokeWidth="1.0" strokeLinecap="round" />
              </svg>
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </button>

        {/* Download */}
        <button
          onClick={onDownload}
          disabled={!hasInput}
          className="mac-btn"
          title="Download JSON file"
        >
          {/* SF Symbols "arrow.down.circle" proxy */}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.0" />
            <path d="M6 3.5V7.5M4 5.5L6 7.5L8 5.5" stroke="currentColor" strokeWidth="1.0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="hidden sm:inline">Save</span>
        </button>
      </div>
    </div>
  );
};
