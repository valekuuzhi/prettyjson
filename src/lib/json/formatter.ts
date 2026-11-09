import { parseAndValidateJson, type IndentType, type JsonParseError } from './parser';

export interface FormatResultSuccess {
  success: true;
  output: string;
}

export interface FormatResultFailure {
  success: false;
  error: JsonParseError;
}

export type FormatResult = FormatResultSuccess | FormatResultFailure;

/**
 * Returns indentation string based on IndentType.
 */
export function getIndentString(indent: IndentType): string | number {
  switch (indent) {
    case 'tab':
      return '\t';
    case '4':
      return 4;
    case '2':
    default:
      return 2;
  }
}

/**
 * Formats JSON string with chosen indentation.
 */
export function formatJson(raw: string, indent: IndentType = '2'): FormatResult {
  const result = parseAndValidateJson(raw);
  if (!result.isValid) {
    return {
      success: false,
      error: result,
    };
  }

  const space = getIndentString(indent);
  const output = JSON.stringify(result.data, null, space);
  return {
    success: true,
    output,
  };
}

/**
 * Minifies JSON string into a compact single-line representation.
 */
export function minifyJson(raw: string): FormatResult {
  const result = parseAndValidateJson(raw);
  if (!result.isValid) {
    return {
      success: false,
      error: result,
    };
  }

  const output = JSON.stringify(result.data);
  return {
    success: true,
    output,
  };
}
