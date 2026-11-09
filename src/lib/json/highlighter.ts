export type TokenType =
  | 'key'
  | 'string'
  | 'number'
  | 'boolean'
  | 'null'
  | 'punctuation'
  | 'whitespace'
  | 'unknown';

export interface Token {
  type: TokenType;
  value: string;
}

export interface HighlightedLine {
  lineNumber: number;
  tokens: Token[];
}

/**
 * Tokenizes a JSON string into lines and tokens with restrained developer-tool styling types.
 */
export function tokenizeJson(jsonText: string): HighlightedLine[] {
  if (!jsonText) return [];

  const lines = jsonText.split('\n');
  const result: HighlightedLine[] = [];

  // Match:
  // 1. Strings: "([^"\\]|\\.)*"
  // 2. Numbers: -?\d+(\.\d+)?([eE][+-]?\d+)?
  // 3. Booleans: true|false
  // 4. Null: null
  // 5. Punctuation: [{}:[\],]
  // 6. Whitespace: \s+
  const tokenRegex = /"([^"\\]|\\.)*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|\btrue\b|\bfalse\b|\bnull\b|[{}\[\],:]|[^\s"{}\[\],:]+/g;

  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i];
    const tokens: Token[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    tokenRegex.lastIndex = 0;

    while ((match = tokenRegex.exec(lineText)) !== null) {
      // Any leading whitespace between tokens
      if (match.index > lastIndex) {
        tokens.push({
          type: 'whitespace',
          value: lineText.slice(lastIndex, match.index),
        });
      }

      const raw = match[0];
      let type: TokenType = 'unknown';

      if (raw.startsWith('"')) {
        // Lookahead to see if next non-whitespace char in this line is ':'
        const remainder = lineText.slice(tokenRegex.lastIndex);
        if (/^\s*:/.test(remainder)) {
          type = 'key';
        } else {
          type = 'string';
        }
      } else if (/^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(raw)) {
        type = 'number';
      } else if (raw === 'true' || raw === 'false') {
        type = 'boolean';
      } else if (raw === 'null') {
        type = 'null';
      } else if (/^[{}[\],:]$/.test(raw)) {
        type = 'punctuation';
      }

      tokens.push({ type, value: raw });
      lastIndex = tokenRegex.lastIndex;
    }

    // Trailing whitespace
    if (lastIndex < lineText.length) {
      tokens.push({
        type: 'whitespace',
        value: lineText.slice(lastIndex),
      });
    }

    // Handle empty line
    if (tokens.length === 0) {
      tokens.push({ type: 'whitespace', value: '' });
    }

    result.push({
      lineNumber: i + 1,
      tokens,
    });
  }

  return result;
}
