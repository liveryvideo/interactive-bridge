/**
 * Recursion safe compact human readable stringify function.
 *
 * @param obj - Object to stringify
 * @param stack - Stack of objects that have been stringified already
 * @param quoteStr - If true then quote string value (`'value'`)
 */
export function humanStringify(
  obj: unknown,
  multiline = false,
  stack: unknown[] = [],
  quoteStr = false,
): string {
  if (stack.includes(obj)) {
    return '[circular reference]';
  }

  if (obj instanceof Array) {
    const recurseStack = stack.slice(0);
    recurseStack.push(obj);
    const arrayStr = obj
      .map((item) => humanStringify(item, multiline, recurseStack, true))
      .join(', ');
    return `[${arrayStr}]`;
  }

  if (obj instanceof Error) {
    return `${obj.name}: ${obj.message}`;
  }

  if (typeof obj === 'object' && obj !== null) {
    const recurseStack = stack.concat(obj);
    const newline = multiline ? '\n' : ' ';
    const indent = multiline ? '  '.repeat(recurseStack.length) : '';
    const objStr = Object.entries(obj)
      .map(
        ([key, value]) =>
          `${indent}${key}: ${humanStringify(value, multiline, recurseStack, true)}`,
      )
      .join(`,${newline}`);
    return `{${newline}${objStr}${newline}${multiline ? '  '.repeat(stack.length) : ''}}`;
  }

  if (typeof obj === 'function' || typeof obj === 'symbol') {
    return `[${typeof obj}]`;
  }

  if (typeof obj === 'string') {
    return quoteStr ? `'${obj}'` : obj;
  }

  // typeof obj === number | boolean
  return String(obj);
}
