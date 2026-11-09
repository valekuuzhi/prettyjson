import { describe, it, expect } from 'vitest';
import {
  parseAndValidateJson,
  getLineAndColumn,
  getErrorSnippet,
  analyzeDataStructure,
  formatByteSize,
} from '../parser';
import { formatJson, minifyJson } from '../formatter';
import { tokenizeJson } from '../highlighter';

describe('JSON Parser & Validator', () => {
  it('parses valid simple json object', () => {
    const raw = '{"name": "PrettyJSON", "version": 1}';
    const result = parseAndValidateJson(raw);
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.data).toEqual({ name: 'PrettyJSON', version: 1 });
      expect(result.stats.isObject).toBe(true);
      expect(result.stats.keysCount).toBe(2);
      expect(result.stats.maxDepth).toBe(2);
    }
  });

  it('parses valid array json', () => {
    const raw = '[1, 2, "three", true, null]';
    const result = parseAndValidateJson(raw);
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.stats.isArray).toBe(true);
      expect(result.stats.isObject).toBe(false);
    }
  });

  it('handles empty input gracefully', () => {
    const result = parseAndValidateJson('   ');
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.message).toContain('empty');
      expect(result.line).toBe(1);
      expect(result.column).toBe(1);
    }
  });

  it('provides line and column on syntax error', () => {
    const malformed = '{\n  "title": "Test"\n  "count": 42\n}';
    const result = parseAndValidateJson(malformed);
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.line).toBe(3);
      expect(result.column).toBeGreaterThan(0);
      expect(result.snippet).toBeDefined();
      expect(result.snippet?.errorLine.line).toBe(3);
    }
  });

  it('handles trailing commas in objects with clear error location', () => {
    const trailingComma = '{\n  "a": 1,\n}';
    const result = parseAndValidateJson(trailingComma);
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.line).toBe(3);
    }
  });

  it('handles unexpected end of input', () => {
    const unclosed = '{"user": {"name": "Alex"';
    const result = parseAndValidateJson(unclosed);
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.line).toBeGreaterThanOrEqual(1);
    }
  });

  it('calculates line and column correctly from string position', () => {
    const text = 'line1\nline2\nline3';
    // position of 'l' in line2 is 6
    const { line, column } = getLineAndColumn(text, 6);
    expect(line).toBe(2);
    expect(column).toBe(1);

    // position of 'n' in line3 is 14
    const { line: l3, column: c3 } = getLineAndColumn(text, 14);
    expect(l3).toBe(3);
    expect(c3).toBe(3);
  });

  it('generates error snippets with previous and next line context', () => {
    const text = 'line 1\nline 2 error here\nline 3';
    const snippet = getErrorSnippet(text, 2, 8);
    expect(snippet.errorLine.line).toBe(2);
    expect(snippet.errorLine.text).toBe('line 2 error here');
    expect(snippet.previousLine?.text).toBe('line 1');
    expect(snippet.nextLine?.text).toBe('line 3');
    expect(snippet.column).toBe(8);
  });

  it('correctly calculates deep nesting and keys count', () => {
    const nested = {
      user: {
        profile: {
          contacts: {
            emails: ['test@example.com'],
          },
        },
      },
    };
    const { keysCount, maxDepth } = analyzeDataStructure(nested);
    expect(keysCount).toBe(4);
    expect(maxDepth).toBe(6);
  });

  it('formats byte sizes into readable units', () => {
    expect(formatByteSize(512)).toBe('512 B');
    expect(formatByteSize(2048)).toBe('2.0 KB');
    expect(formatByteSize(2 * 1024 * 1024)).toBe('2.00 MB');
  });

  it('handles large inputs without crashing', () => {
    const largeArray = Array.from({ length: 5000 }, (_, i) => ({
      id: i,
      name: `User ${i}`,
      active: i % 2 === 0,
      tags: ['alpha', 'beta'],
    }));
    const raw = JSON.stringify(largeArray);
    const result = parseAndValidateJson(raw);
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.stats.isArray).toBe(true);
      expect(result.stats.keysCount).toBe(20000); // 4 keys * 5000
    }
  });
});

describe('JSON Formatter', () => {
  it('formats json with 2 spaces by default', () => {
    const raw = '{"a":1,"b":[2,3]}';
    const result = formatJson(raw);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output).toBe('{\n  "a": 1,\n  "b": [\n    2,\n    3\n  ]\n}');
    }
  });

  it('formats json with 4 spaces', () => {
    const raw = '{"a":1}';
    const result = formatJson(raw, '4');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output).toBe('{\n    "a": 1\n}');
    }
  });

  it('formats json with tab indentation', () => {
    const raw = '{"a":1}';
    const result = formatJson(raw, 'tab');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output).toBe('{\n\t"a": 1\n}');
    }
  });

  it('returns failure on invalid json', () => {
    const raw = '{"a": 1,';
    const result = formatJson(raw);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.isValid).toBe(false);
    }
  });
});

describe('JSON Minifier', () => {
  it('minifies multiline formatted json', () => {
    const formatted = '{\n  "name": "PrettyJSON",\n  "version": 1,\n  "tags": [\n    "tool",\n    "json"\n  ]\n}';
    const result = minifyJson(formatted);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output).toBe('{"name":"PrettyJSON","version":1,"tags":["tool","json"]}');
    }
  });

  it('handles already minified JSON without alteration', () => {
    const minified = '{"a":1,"b":[true,false,null]}';
    const result = minifyJson(minified);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output).toBe(minified);
    }
  });

  it('fails minifying malformed json', () => {
    const result = minifyJson('{ unquoted: 123 }');
    expect(result.success).toBe(false);
  });
});

describe('JSON Tokenizer & Highlighter', () => {
  it('tokenizes JSON elements accurately', () => {
    const json = '{\n  "key": "value",\n  "num": 42,\n  "active": true,\n  "empty": null\n}';
    const lines = tokenizeJson(json);
    expect(lines.length).toBe(6);

    // Line 2: "key": "value",
    const keyToken = lines[1].tokens.find((t) => t.type === 'key');
    expect(keyToken?.value).toBe('"key"');

    const strToken = lines[1].tokens.find((t) => t.type === 'string');
    expect(strToken?.value).toBe('"value"');

    // Line 3: "num": 42
    const numToken = lines[2].tokens.find((t) => t.type === 'number');
    expect(numToken?.value).toBe('42');

    // Line 4: "active": true
    const boolToken = lines[3].tokens.find((t) => t.type === 'boolean');
    expect(boolToken?.value).toBe('true');

    // Line 5: "empty": null
    const nullToken = lines[4].tokens.find((t) => t.type === 'null');
    expect(nullToken?.value).toBe('null');
  });

  it('tokenizes scientific notation numbers and negative numbers', () => {
    const json = '{\n  "sci": 1.23e+10,\n  "neg": -42.5\n}';
    const lines = tokenizeJson(json);
    const sciToken = lines[1].tokens.find((t) => t.type === 'number');
    expect(sciToken?.value).toBe('1.23e+10');

    const negToken = lines[2].tokens.find((t) => t.type === 'number');
    expect(negToken?.value).toBe('-42.5');
  });

  it('handles empty input cleanly', () => {
    const lines = tokenizeJson('');
    expect(lines).toEqual([]);
  });
});
