import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { JSON_SAMPLES, type SampleItem } from '../samples/jsonSamples';

interface HeaderProps {
  onLoadSample: (sample: SampleItem) => void;
  onOpenShortcuts: () => void;
  onClose?: () => void;
  onMinimize?: () => void;
  onToggleFullscreen?: () => void;
  isMinimized?: boolean;
  isFullscreen?: boolean;
}

/**
 * macOS-style unified toolbar / title bar with functional traffic lights.
 *
 * Controls:
 * - Red (x): Closes / exits application, redirects to Google
 * - Yellow (-): Minimizes / restores window workspace
 * - Green (+): Toggles native full screen / zoom
 */
export const Header: React.FC<HeaderProps> = ({
  onLoadSample,
  onOpenShortcuts,
  onClose,
  onMinimize,
  onToggleFullscreen,
  isMinimized = false,
  isFullscreen = false,
}) => {
  const [samplesOpen, setSamplesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSamplesOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSamplesOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      window.location.href = 'https://www.google.com';
    }
  };

  const handleMinimize = () => {
    if (onMinimize) {
      onMinimize();
    }
  };

  const handleToggleFs = () => {
    if (onToggleFullscreen) {
      onToggleFullscreen();
    } else if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header
      className="flex items-center h-[38px] select-none"
      style={{
        background: 'var(--bg-toolbar)',
        borderBottom: '1px solid var(--sep-strong)',
      }}
    >
      {/* ── Interactive traffic lights ── */}
      <div className="group w-[72px] shrink-0 flex items-center pl-3 gap-2">
        {/* Red: Close / Exit (Redirects to Google) */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close window (Exit to Google)"
          title="Close (Exit to Google)"
          className="size-3 rounded-full bg-[#ff5f57] hover:bg-[#e0443e] active:bg-[#c63732] border border-black/20 flex items-center justify-center p-0 cursor-pointer transition-colors shadow-xs outline-none"
        >
          <svg
            viewBox="0 0 10 10"
            className="size-2 text-[#4d0000] opacity-0 group-hover:opacity-100 transition-opacity"
            aria-hidden="true"
          >
            <path
              d="M2 2L8 8M8 2L2 8"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Yellow: Minimize / Restore */}
        <button
          type="button"
          onClick={handleMinimize}
          aria-label={isMinimized ? 'Restore window' : 'Minimize window'}
          title={isMinimized ? 'Restore window' : 'Minimize window'}
          className="size-3 rounded-full bg-[#febc2e] hover:bg-[#d89e24] active:bg-[#ba831c] border border-black/20 flex items-center justify-center p-0 cursor-pointer transition-colors shadow-xs outline-none"
        >
          <svg
            viewBox="0 0 10 10"
            className="size-2 text-[#543600] opacity-0 group-hover:opacity-100 transition-opacity"
            aria-hidden="true"
          >
            <line
              x1="1.5"
              y1="5"
              x2="8.5"
              y2="5"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Green: Fullscreen / Zoom */}
        <button
          type="button"
          onClick={handleToggleFs}
          aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
          title={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
          className="size-3 rounded-full bg-[#28c840] hover:bg-[#20a734] active:bg-[#1a8829] border border-black/20 flex items-center justify-center p-0 cursor-pointer transition-colors shadow-xs outline-none"
        >
          <svg
            viewBox="0 0 10 10"
            className="size-2 text-[#024006] opacity-0 group-hover:opacity-100 transition-opacity"
            aria-hidden="true"
          >
            {isFullscreen ? (
              <path
                d="M1.5 4.5L4 2M1.5 4.5H4M1.5 4.5V2M8.5 5.5L6 8M8.5 5.5H6M8.5 5.5V8"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <path
                d="M2 4L5 1M2 4H5M2 4V1M8 6L5 9M8 6H5M8 6V9"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
        </button>
      </div>

      {/* ── Centered window title ── */}
      <div
        className="flex-1 flex items-center justify-center cursor-default"
        onDoubleClick={handleToggleFs}
        title="Double-click to toggle Fullscreen"
      >
        <span
          className="text-[13px] font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {isMinimized ? 'PrettyJSON — (Minimized)' : 'PrettyJSON'}
        </span>
      </div>

      {/* ── Right toolbar controls ── */}
      <div className="w-[72px] shrink-0 flex items-center justify-end pr-2 gap-0.5">
        {/* Samples picker */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setSamplesOpen(!samplesOpen)}
            aria-expanded={samplesOpen}
            aria-haspopup="true"
            title="Load sample JSON"
            className="mac-icon-btn"
            style={{ width: 'auto', paddingInline: '7px', gap: '4px', fontSize: '12px' }}
          >
            {/* SF Symbols "doc.text" proxy */}
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
              <rect x="2" y="1" width="9" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.1" />
              <line x1="4" y1="4.5" x2="9" y2="4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              <line x1="4" y1="6.5" x2="9" y2="6.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              <line x1="4" y1="8.5" x2="7" y2="8.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </svg>
            <span>Samples</span>
            <ChevronDown size={10} style={{ color: 'var(--text-tertiary)' }} />
          </button>

          {samplesOpen && (
            <div
              className="absolute right-0 mt-1 w-60 z-50 py-1 rounded-[10px] overflow-hidden"
              style={{
                background: '#2c2c2e',
                border: '1px solid rgba(255,255,255,0.14)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3)',
              }}
            >
              <div
                className="px-3 py-1 text-[10px] uppercase tracking-[0.08em] font-semibold"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Samples
              </div>
              {JSON_SAMPLES.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => { onLoadSample(sample); setSamplesOpen(false); }}
                  className="w-full text-left px-3 py-[7px] flex flex-col transition-colors duration-75"
                  style={{ color: 'var(--text-primary)', fontSize: '13px' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span className="font-medium leading-snug">{sample.name}</span>
                  <span
                    className="text-[11px] leading-snug mt-0.5 line-clamp-1"
                    style={{ color: 'rgba(255,255,255,0.45)' }}
                  >
                    {sample.description}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Keyboard shortcuts */}
        <button
          onClick={onOpenShortcuts}
          title="Keyboard shortcuts (?)"
          aria-label="View keyboard shortcuts"
          className="mac-icon-btn"
        >
          {/* SF Symbols "keyboard" proxy */}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.1" />
            <line x1="3.5" y1="6" x2="3.5" y2="6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <line x1="6" y1="6" x2="6" y2="6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <line x1="8" y1="6" x2="8" y2="6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <line x1="10.5" y1="6" x2="10.5" y2="6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <line x1="4.5" y1="8.5" x2="9.5" y2="8.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </header>
  );
};
