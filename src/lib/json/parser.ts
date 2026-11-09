export interface JsonParseSuccess {
  isValid: true;
  data: unknown;
  stats: JsonStats;
}

export interface JsonParseError {
  isValid: false;
  message: string;
  line: number;
  column: number;
  position?: number;
  snippet?: ErrorSnippet;
}

export interface ErrorSnippet {
  previousLine?: { line: number; text: string };
  errorLine: { line: number; text: string };
  nextLine?: { line: number; text: string };
  column: number;
}

export interface JsonStats {
  byteSize: number;
  lineCount: number;
  characterCount: number;
  keysCount: number;
  maxDepth: number;
  isArray: boolean;
  isObject: boolean;
}

export type IndentType = '2' | '4' | 'tab';

/**
 * Calculates line number and column number from a 0-based character index in text.
 * Both line and column are 1-based.
 */
export function getLineAndColumn(text: string, position: number): { line: number; column: number } {
  const safePos = Math.max(0, Math.min(position, text.length));
  let line = 1;
  let column = 1;

  for (let i = 0; i < safePos; i++) {
    if (text[i] === '\n') {
      line++;
      column = 1;
    } else {
      column++;
    }
  }

  return { line, column };
}

/**
 * Generates a context snippet around the error line with a caret pointing to the column.
 */
export function getErrorSnippet(text: string, line: number, column: number): ErrorSnippet {
  const lines = text.split('\n');
  const errorLineIndex = Math.max(0, Math.min(line - 1, lines.length - 1));
  const errorLineText = lines[errorLineIndex] ?? '';

  const snippet: ErrorSnippet = {
    errorLine: {
      line: errorLineIndex + 1,
      text: errorLineText,
    },
    column,
  };

  if (errorLineIndex > 0) {
    snippet.previousLine = {
      line: errorLineIndex,
      text: lines[errorLineIndex - 1],
    };
  }

  if (errorLineIndex < lines.length - 1) {
    snippet.nextLine = {
      line: errorLineIndex + 2,
      text: lines[errorLineIndex + 1],
    };
  }

  return snippet;
}

/**
 * Computes deep stats (keys count, maximum nesting depth).
 */
export function analyzeDataStructure(data: unknown): { keysCount: number; maxDepth: number } {
  let keysCount = 0;
  let maxDepth = 0;

  function traverse(node: unknown, currentDepth: number) {
    if (currentDepth > maxDepth) {
      maxDepth = currentDepth;
    }

    if (node === null || typeof node !== 'object') {
      return;
    }

    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        traverse(node[i], currentDepth + 1);
      }
    } else {
      const keys = Object.keys(node as Record<string, unknown>);
      keysCount += keys.length;
      for (const key of keys) {
        traverse((node as Record<string, unknown>)[key], currentDepth + 1);
      }
    }
  }

  traverse(data, 1);
  return { keysCount, maxDepth };
}

/**
 * Formats byte sizes into human readable units (e.g. 1.2 KB, 450 B)
 */
export function formatByteSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Attempt to pinpoint exact error position from error message or fallback heuristic
 */
function extractPositionFromError(err: Error, text: string): { line: number; column: number; position?: number } {
  const msg = err.message || '';

  // 1. Check for standard V8 "line X column Y"
  const lineColMatch = msg.match(/line\s+(\d+)\s+column\s+(\d+)/i);
  if (lineColMatch) {
    const line = parseInt(lineColMatch[1], 10);
    const column = parseInt(lineColMatch[2], 10);
    return { line, column };
  }

  // 2. Check for "at position X"
  const posMatch = msg.match(/at\s+position\s+(\d+)/i);
  if (posMatch) {
    const position = parseInt(posMatch[1], 10);
    const { line, column } = getLineAndColumn(text, position);
    return { line, column, position };
  }

  // 3. Fallback heuristic: find unexpected end or unclosed tokens
  if (/unexpected end/i.test(msg)) {
    const lines = text.split('\n');
    const lastLineNum = lines.length;
    const lastCol = (lines[lastLineNum - 1]?.length || 0) + 1;
    return { line: lastLineNum, column: lastCol, position: text.length };
  }

  return { line: 1, column: 1 };
}

/**
 * Validates and parses JSON text with rich error diagnostics and structural statistics.
 */
export function parseAndValidateJson(raw: string): JsonParseSuccess | JsonParseError {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {
      isValid: false,
      message: 'JSON input is empty.',
      line: 1,
      column: 1,
    };
  }

  try {
    const parsed = JSON.parse(raw);
    const { keysCount, maxDepth } = analyzeDataStructure(parsed);

    // Calculate byte size (UTF-8)
    const byteSize = new TextEncoder().encode(raw).length;
    const lineCount = raw.split('\n').length;

    return {
      isValid: true,
      data: parsed,
      stats: {
        byteSize,
        lineCount,
        characterCount: raw.length,
        keysCount,
        maxDepth,
        isArray: Array.isArray(parsed),
        isObject: typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed),
      },
    };
  } catch (e) {
    const error = e as Error;
    const { line, column, position } = extractPositionFromError(error, raw);
    const snippet = getErrorSnippet(raw, line, column);

    // Clean up error message for display
    let cleanMessage = error.message.replace(/^JSON\.parse:\s*/, '');

    return {
      isValid: false,
      message: cleanMessage,
      line,
      column,
      position,
      snippet,
    };
  }
}
