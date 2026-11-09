import React, { useEffect } from 'react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
  const modKey = isMac ? '⌘' : 'Ctrl';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { label: 'Format / Prettify',    keys: [modKey, 'Enter'] },
    { label: 'Minify / Compact',     keys: [modKey, 'Shift', 'M'] },
    { label: 'Copy Formatted Output',keys: [modKey, 'Shift', 'C'] },
    { label: 'Indent Line',          keys: ['Tab'] },
    { label: 'Keyboard Shortcuts',   keys: ['?'] },
    { label: 'Close Dialog',         keys: ['Esc'] },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.60)', padding: '16px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '340px',
          background: '#2c2c2e',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.60)',
          padding: '16px',
          fontFamily: 'var(--font-sans)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--sep-subtle)',
        }}>
          <h2 id="shortcuts-title" style={{
            fontSize: '13px', fontWeight: 600,
            color: 'var(--text-primary)', margin: 0,
          }}>
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            aria-label="Close shortcuts dialog"
            style={{
              background: 'var(--ctrl-bg)', border: '1px solid var(--ctrl-border)',
              borderRadius: '5px', cursor: 'pointer',
              color: 'var(--text-secondary)', padding: '3px 5px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.1s, color 0.1s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--ctrl-bg-hover)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--ctrl-bg)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
            }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
              <path d="M1.5 1.5L9.5 9.5M9.5 1.5L1.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Shortcut rows */}
        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {shortcuts.map(sc => (
            <div
              key={sc.label}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '5px 0',
                borderBottom: '1px solid var(--sep-hairline)',
              }}
            >
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{sc.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                {sc.keys.map(k => (
                  <kbd key={k}>{k}</kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '12px', paddingTop: '10px',
          borderTop: '1px solid var(--sep-subtle)',
          display: 'flex', justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '4px 12px', borderRadius: '6px',
              background: 'var(--ctrl-bg)',
              border: '1px solid var(--ctrl-border)',
              color: 'var(--text-primary)', fontSize: '12px',
              fontFamily: 'var(--font-sans)', fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--ctrl-bg-hover)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--ctrl-bg)';
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
