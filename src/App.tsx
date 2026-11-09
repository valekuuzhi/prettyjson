import { useState, useEffect, useCallback, useTransition } from 'react';
import { Header } from './components/Header';
import { Toolbar, type LayoutMode, type OutputViewMode } from './components/Toolbar';
import { EditorPane } from './components/EditorPane';
import { OutputPane } from './components/OutputPane';
import { TreeView } from './components/TreeView';
import { ErrorBanner } from './components/ErrorBanner';
import { StatsBar } from './components/StatsBar';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import {
  parseAndValidateJson,
  type IndentType,
  type JsonParseError,
  type JsonStats,
} from './lib/json/parser';
import { formatJson, minifyJson } from './lib/json/formatter';
import { JSON_SAMPLES, type SampleItem } from './samples/jsonSamples';

export function App() {
  const [, startTransition] = useTransition();

  // ─── State ───────────────────────────────────────────────────────────────
  const [rawJson, setRawJson]           = useState<string>(JSON_SAMPLES[0].content);
  const [formattedJson, setFormattedJson] = useState<string>('');
  const [parsedData, setParsedData]     = useState<unknown>(null);
  const [error, setError]               = useState<JsonParseError | null>(null);
  const [stats, setStats]               = useState<JsonStats | null>(null);

  const [indent, setIndent]             = useState<IndentType>('2');
  const [layoutMode, setLayoutMode]     = useState<LayoutMode>('split');
  const [outputViewMode, setOutputViewMode] = useState<OutputViewMode>('code');
  const [cursorPos, setCursorPos]       = useState({ line: 1, col: 1 });
  const [copied, setCopied]             = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // ─── Window Management State ─────────────────────────────────────────────
  const [isMinimized, setIsMinimized]   = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // ─── Toast ───────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(current => (current === msg ? null : current));
    }, 2000);
  }, []);

  // ─── Window Controls ─────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    window.location.href = 'https://www.google.com';
  }, []);

  const handleToggleMinimize = useCallback(() => {
    setIsMinimized(prev => {
      const next = !prev;
      showToast(next ? 'Window minimized' : 'Window restored');
      return next;
    });
  }, [showToast]);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        showToast('Fullscreen mode toggled');
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, [showToast]);

  // ─── Actions ─────────────────────────────────────────────────────────────
  const handlePrettify = useCallback(() => {
    if (!rawJson.trim()) return;
    const result = formatJson(rawJson, indent);
    if (result.success) {
      setFormattedJson(result.output);
      setError(null);
      const val = parseAndValidateJson(result.output);
      if (val.isValid) { setParsedData(val.data); setStats(val.stats); }
      showToast(`Formatted (${indent === 'tab' ? 'tabs' : `${indent} spaces`})`);
    } else {
      setError(result.error);
      setParsedData(null);
    }
  }, [rawJson, indent, showToast]);

  const handleMinify = useCallback(() => {
    if (!rawJson.trim()) return;
    const result = minifyJson(rawJson);
    if (result.success) {
      setFormattedJson(result.output);
      setError(null);
      const val = parseAndValidateJson(result.output);
      if (val.isValid) { setParsedData(val.data); setStats(val.stats); }
      showToast('Minified JSON');
    } else {
      setError(result.error);
      setParsedData(null);
    }
  }, [rawJson, showToast]);

  const handleValidate = useCallback(() => {
    if (!rawJson.trim()) { showToast('Input is empty'); return; }
    const val = parseAndValidateJson(rawJson);
    if (val.isValid) {
      setError(null);
      setParsedData(val.data);
      setStats(val.stats);
      showToast('Valid JSON');
    } else {
      setError(val);
      setParsedData(null);
    }
  }, [rawJson, showToast]);

  const handleApplyToEditor = useCallback(() => {
    if (formattedJson) { setRawJson(formattedJson); showToast('Synced to editor'); }
  }, [formattedJson, showToast]);

  const handleCopyOutput = useCallback(() => {
    const textToCopy = formattedJson || rawJson;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast('Copied to clipboard');
    setTimeout(() => setCopied(false), 1500);
  }, [formattedJson, rawJson, showToast]);

  const handleDownload = useCallback(() => {
    const textToDownload = formattedJson || rawJson;
    if (!textToDownload) return;
    const blob = new Blob([textToDownload], { type: 'application/json;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'pretty-output.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded JSON');
  }, [formattedJson, rawJson, showToast]);

  const handleLoadSample = (sample: SampleItem) => {
    setRawJson(sample.content);
    showToast(`Loaded ${sample.name}`);
  };

  // ─── Continuous background validation ────────────────────────────────────
  useEffect(() => {
    startTransition(() => {
      if (!rawJson.trim()) {
        setError(null); setParsedData(null); setStats(null); setFormattedJson('');
        return;
      }
      const val = parseAndValidateJson(rawJson);
      if (val.isValid) {
        setError(null); setParsedData(val.data); setStats(val.stats);
        const res = formatJson(rawJson, indent);
        if (res.success) setFormattedJson(res.output);
      } else {
        setError(val); setParsedData(null);
      }
    });
  }, [rawJson, indent]);

  // ─── Global keyboard shortcuts ────────────────────────────────────────────
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key === 'Enter') {
        e.preventDefault(); handlePrettify();
      } else if (isMod && e.shiftKey && (e.key === 'M' || e.key === 'm')) {
        e.preventDefault(); handleMinify();
      } else if (isMod && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault(); handleCopyOutput();
      } else if (e.key === '?' && !['TEXTAREA', 'INPUT'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault(); setShortcutsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handlePrettify, handleMinify, handleCopyOutput]);

  const isValidState = !rawJson.trim() ? null : error === null;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden',
      background: 'var(--bg-window)', color: 'var(--text-primary)',
    }}>
      <Header
        onLoadSample={handleLoadSample}
        onOpenShortcuts={() => setShortcutsOpen(true)}
        onClose={handleClose}
        onMinimize={handleToggleMinimize}
        onToggleFullscreen={handleToggleFullscreen}
        isMinimized={isMinimized}
        isFullscreen={isFullscreen}
      />

      {isMinimized ? (
        /* Minimized window state */
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-content)',
          padding: '24px',
        }}>
          <div style={{
            maxWidth: '380px',
            width: '100%',
            padding: '24px',
            borderRadius: '12px',
            background: 'var(--bg-toolbar)',
            border: '1px solid var(--sep-strong)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '12px',
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'var(--ctrl-bg)',
              border: '1px solid var(--ctrl-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                PrettyJSON is Minimized
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Your JSON workspace and validation state remain preserved.
              </div>
            </div>
            <button
              onClick={() => setIsMinimized(false)}
              className="mac-btn mac-btn-primary"
              style={{ marginTop: '4px', padding: '5px 16px', fontSize: '12px' }}
            >
              Restore Window
            </button>
          </div>
        </main>
      ) : (
        <>
          <Toolbar
            onPrettify={handlePrettify}
            onMinify={handleMinify}
            onValidate={handleValidate}
            indent={indent}
            onChangeIndent={setIndent}
            layoutMode={layoutMode}
            onChangeLayout={setLayoutMode}
            outputViewMode={outputViewMode}
            onChangeOutputView={setOutputViewMode}
            onCopyOutput={handleCopyOutput}
            onDownload={handleDownload}
            onApplyToEditor={handleApplyToEditor}
            isValid={isValidState ?? false}
            hasInput={Boolean(rawJson.trim())}
            copied={copied}
          />

          {/* Central workspace */}
          <main style={{
            flex: 1, display: 'flex', overflow: 'hidden', position: 'relative',
            background: 'var(--bg-content)',
          }}>
            {/* Editor pane */}
            {(layoutMode === 'split' || layoutMode === 'editor-only') && (
              <div style={{
                display: 'flex', flexDirection: 'column', height: '100%',
                borderRight: '1px solid var(--sep-strong)',
                width: layoutMode === 'split' ? undefined : '100%',
                flex: layoutMode === 'split' ? '0 0 50%' : undefined,
              }} className={layoutMode === 'split' ? 'w-full md:w-1/2' : 'w-full'}>
                <EditorPane
                  value={rawJson}
                  onChange={setRawJson}
                  error={error}
                  onCursorChange={(line, col) => setCursorPos({ line, col })}
                />
              </div>
            )}

            {/* Output / tree pane */}
            {(layoutMode === 'split' || layoutMode === 'output-only') && (
              <div
                style={{
                  display: 'flex', flexDirection: 'column', height: '100%',
                  width: layoutMode === 'split' ? undefined : '100%',
                  flex: layoutMode === 'split' ? '0 0 50%' : undefined,
                }}
                className={layoutMode === 'split' ? 'hidden md:flex md:w-1/2' : 'w-full'}
              >
                {outputViewMode === 'code' ? (
                  <OutputPane
                    jsonText={formattedJson || (error ? rawJson : '')}
                    onCopySuccess={showToast}
                  />
                ) : (
                  <TreeView
                    data={parsedData}
                    onCopySuccess={showToast}
                  />
                )}
              </div>
            )}

            {/* Toast notification */}
            {toastMessage && (
              <div style={{
                position: 'absolute', bottom: '10px', right: '10px', zIndex: 40,
                display: 'flex', alignItems: 'center',
                padding: '4px 10px', borderRadius: '6px',
                background: '#2c2c2e',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.40)',
                fontSize: '11px', fontFamily: 'var(--font-mono)',
                color: 'var(--text-secondary)',
                pointerEvents: 'none',
              }}>
                {toastMessage}
              </div>
            )}
          </main>

          {/* Error diagnostic panel */}
          {error && <ErrorBanner error={error} />}

          {/* Status bar */}
          <StatsBar
            isValid={isValidState}
            stats={stats}
            cursorPos={cursorPos}
            rawLength={rawJson.length}
          />
        </>
      )}

      <KeyboardShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </div>
  );
}

export default App;
