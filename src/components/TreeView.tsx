import React, { useState, useMemo } from 'react';
import { Check } from 'lucide-react';

interface TreeViewProps {
  data: unknown;
  onCopySuccess?: (msg: string) => void;
}

interface TreeNodeProps {
  name: string | number;
  value: unknown;
  path: string;
  isLast: boolean;
  searchTerm: string;
  collapsedPaths: Set<string>;
  toggleCollapse: (path: string) => void;
  onCopySuccess?: (msg: string) => void;
  depth: number;
}

function getNodeType(v: unknown): 'string' | 'number' | 'boolean' | 'null' | 'array' | 'object' {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  const t = typeof v;
  if (t === 'string') return 'string';
  if (t === 'number') return 'number';
  if (t === 'boolean') return 'boolean';
  return 'object';
}

/**
 * Individual tree node — Finder sidebar list row style.
 *
 * Row height: 22px (Finder list view standard).
 * Disclosure triangle: 8px, flush with indent.
 * Key text: text-secondary; value: syntax-colored mono.
 * On hover: show ghost "path" and "copy" micro-actions.
 * Active / expanded state: subtle left accent line.
 */
export const TreeNode: React.FC<TreeNodeProps> = ({
  name,
  value,
  path,
  isLast,
  searchTerm,
  collapsedPaths,
  toggleCollapse,
  onCopySuccess,
  depth,
}) => {
  const [copiedPath, setCopiedPath] = useState(false);
  const [copiedVal, setCopiedVal] = useState(false);

  const type = getNodeType(value);
  const isExpandable = type === 'object' || type === 'array';
  const isCollapsed = collapsedPaths.has(path);

  const handleCopyPath = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(path || '$');
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 1500);
    onCopySuccess?.('Copied path');
  };

  const handleCopyVal = (e: React.MouseEvent) => {
    e.stopPropagation();
    const str = typeof value === 'object' && value !== null
      ? JSON.stringify(value, null, 2)
      : String(value);
    navigator.clipboard.writeText(str);
    setCopiedVal(true);
    setTimeout(() => setCopiedVal(false), 1500);
    onCopySuccess?.('Copied value');
  };

  const highlight = (text: string) => {
    if (!searchTerm) return <>{text}</>;
    const idx = text.toLowerCase().indexOf(searchTerm.toLowerCase());
    if (idx === -1) return <>{text}</>;
    return (
      <>
        {text.slice(0, idx)}
        <mark style={{ background: 'rgba(255,214,10,0.25)', color: 'rgba(255,214,10,0.95)', borderRadius: '2px' }}>
          {text.slice(idx, idx + searchTerm.length)}
        </mark>
        {text.slice(idx + searchTerm.length)}
      </>
    );
  };

  const renderValue = () => {
    switch (type) {
      case 'string':  return <span className="token-string">"{highlight(String(value))}"</span>;
      case 'number':  return <span className="token-number">{String(value)}</span>;
      case 'boolean': return <span className="token-boolean">{String(value)}</span>;
      case 'null':    return <span className="token-null">null</span>;
      default: return null;
    }
  };

  const keyLabel = typeof name === 'string'
    ? `"${highlight(name)}"`
    : String(name);

  // Disclosure triangle SVG
  const DisclosureIcon = ({ open }: { open: boolean }) => (
    <svg
      width="8" height="8" viewBox="0 0 8 8" fill="none"
      style={{
        transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 100ms ease',
        flexShrink: 0,
      }}
    >
      <path d="M2.5 1.5L5.5 4L2.5 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  if (!isExpandable) {
    return (
      <div
        className="group flex items-center gap-0 overflow-hidden"
        style={{ height: '22px', paddingLeft: `${8 + depth * 16}px` }}
      >
        <span style={{ width: '12px', flexShrink: 0 }} /> {/* triangle placeholder */}
        <span
          className="shrink-0 mr-0.5"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--token-key)',
            whiteSpace: 'nowrap',
          }}
        >
          {keyLabel}
        </span>
        <span style={{ color: 'var(--token-punctuation)', fontFamily: 'var(--font-mono)', fontSize: '12px', marginRight: '4px' }}>:</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {renderValue()}
        </span>
        {!isLast && <span style={{ color: 'var(--token-punctuation)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>,</span>}

        {/* Hover actions — appear only on hover */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 ml-auto pr-2 shrink-0 transition-opacity duration-75">
          <button
            onClick={handleCopyPath}
            title="Copy JSON path"
            style={{
              fontSize: '10px',
              padding: '1px 5px',
              borderRadius: '4px',
              color: 'var(--text-tertiary)',
              background: 'var(--ctrl-bg)',
              border: '1px solid var(--ctrl-border)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '2px',
            }}
          >
            {copiedPath ? <Check size={8} style={{ color: 'var(--state-valid)' }} /> : null}
            path
          </button>
          <button
            onClick={handleCopyVal}
            title="Copy value"
            style={{
              fontSize: '10px',
              padding: '1px 5px',
              borderRadius: '4px',
              color: 'var(--text-tertiary)',
              background: 'var(--ctrl-bg)',
              border: '1px solid var(--ctrl-border)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '2px',
            }}
          >
            {copiedVal ? <Check size={8} style={{ color: 'var(--state-valid)' }} /> : null}
            val
          </button>
        </div>
      </div>
    );
  }

  // Expandable container
  const isArray = type === 'array';
  const entries: [string | number, unknown][] = isArray
    ? (value as unknown[]).map((item, idx) => [idx, item])
    : Object.entries(value as Record<string, unknown>);
  const count = entries.length;
  const open = openBracket(isArray);
  const close = closeBracket(isArray);

  return (
    <div>
      {/* Header row */}
      <div
        className="group flex items-center gap-0 cursor-pointer overflow-hidden"
        style={{ height: '22px', paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => toggleCollapse(path)}
        role="button"
        aria-expanded={!isCollapsed}
      >
        <span style={{ width: '12px', flexShrink: 0, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center' }}>
          <DisclosureIcon open={!isCollapsed} />
        </span>

        {name !== '' && (
          <>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--token-key)', whiteSpace: 'nowrap' }}>
              {keyLabel}
            </span>
            <span style={{ color: 'var(--token-punctuation)', fontFamily: 'var(--font-mono)', fontSize: '12px', margin: '0 4px 0 0' }}>:</span>
          </>
        )}

        <span style={{ color: 'var(--token-punctuation)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{open}</span>

        {isCollapsed && (
          <>
            <span style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: '11px', margin: '0 2px' }}>
              {count} {isArray ? (count === 1 ? 'item' : 'items') : (count === 1 ? 'key' : 'keys')}
            </span>
            <span style={{ color: 'var(--token-punctuation)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{close}</span>
            {!isLast && <span style={{ color: 'var(--token-punctuation)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>,</span>}
          </>
        )}

        {/* Hover actions */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 ml-auto pr-2 shrink-0 transition-opacity duration-75">
          <button
            onClick={handleCopyPath}
            title="Copy path"
            style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '4px', color: 'var(--text-tertiary)', background: 'var(--ctrl-bg)', border: '1px solid var(--ctrl-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
          >
            {copiedPath ? <Check size={8} style={{ color: 'var(--state-valid)' }} /> : null}
            path
          </button>
          <button
            onClick={handleCopyVal}
            title="Copy value"
            style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '4px', color: 'var(--text-tertiary)', background: 'var(--ctrl-bg)', border: '1px solid var(--ctrl-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
          >
            {copiedVal ? <Check size={8} style={{ color: 'var(--state-valid)' }} /> : null}
            copy
          </button>
        </div>
      </div>

      {/* Children */}
      {!isCollapsed && (
        <>
          {entries.map(([childKey, childVal], index) => {
            const childPath = path
              ? isArray ? `${path}[${childKey}]` : `${path}.${childKey}`
              : isArray ? `[${childKey}]` : String(childKey);
            return (
              <TreeNode
                key={childKey}
                name={childKey}
                value={childVal}
                path={childPath}
                isLast={index === entries.length - 1}
                searchTerm={searchTerm}
                collapsedPaths={collapsedPaths}
                toggleCollapse={toggleCollapse}
                onCopySuccess={onCopySuccess}
                depth={depth + 1}
              />
            );
          })}
          {/* Closing bracket */}
          <div
            style={{
              height: '22px',
              paddingLeft: `${8 + depth * 16 + 12}px`,
              display: 'flex',
              alignItems: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--token-punctuation)',
            }}
          >
            {close}{!isLast && ','}
          </div>
        </>
      )}
    </div>
  );
};

function openBracket(isArray: boolean) { return isArray ? '[' : '{'; }
function closeBracket(isArray: boolean) { return isArray ? ']' : '}'; }

/**
 * Full tree view component with toolbar.
 * Design: Finder list view — compact 22px rows, disclosure triangles,
 * subtle separator between toolbar and content.
 */
export const TreeView: React.FC<TreeViewProps> = ({ data, onCopySuccess }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());

  const allExpandablePaths = useMemo(() => {
    const paths: string[] = [];
    function scan(node: unknown, p: string) {
      if (node !== null && typeof node === 'object') {
        paths.push(p);
        if (Array.isArray(node)) {
          node.forEach((item, idx) => scan(item, p ? `${p}[${idx}]` : `[${idx}]`));
        } else {
          Object.entries(node as Record<string, unknown>).forEach(([k, v]) =>
            scan(v, p ? `${p}.${k}` : k)
          );
        }
      }
    }
    scan(data, '');
    return paths;
  }, [data]);

  const toggleCollapse = (path: string) => {
    setCollapsedPaths(prev => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  };

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full" style={{ background: 'var(--bg-content)' }}>
        <p style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>No data</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-content)' }}>
      {/* ── Tree toolbar ── */}
      <div
        className="flex items-center justify-between px-3 h-[27px] shrink-0"
        style={{ background: 'var(--bg-toolbar)', borderBottom: '1px solid var(--sep-subtle)' }}
      >
        <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Tree</span>

        <div className="flex items-center gap-1.5">
          {/* Search input */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter…"
            aria-label="Filter tree"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '5px',
              padding: '1px 7px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-primary)',
              outline: 'none',
              width: '90px',
            }}
          />
          {/* Expand / Collapse all */}
          <button
            onClick={() => setCollapsedPaths(new Set())}
            className="mac-btn"
            style={{ padding: '1px 6px', fontSize: '11px' }}
          >
            Expand
          </button>
          <button
            onClick={() => setCollapsedPaths(new Set(allExpandablePaths))}
            className="mac-btn"
            style={{ padding: '1px 6px', fontSize: '11px' }}
          >
            Collapse
          </button>
        </div>
      </div>

      {/* ── Tree content ── */}
      <div
        className="flex-1 overflow-auto"
        style={{ paddingTop: '4px', paddingBottom: '16px' }}
      >
        <TreeNode
          name=""
          value={data}
          path=""
          isLast={true}
          searchTerm={searchTerm}
          collapsedPaths={collapsedPaths}
          toggleCollapse={toggleCollapse}
          onCopySuccess={onCopySuccess}
          depth={0}
        />
      </div>
    </div>
  );
};
