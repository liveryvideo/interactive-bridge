export function parseToArray(value: unknown, label: string) {
  if (value === null) {
    throw new Error(`${label} value type: null, should be: Array`);
  }
  if (typeof value !== 'object') {
    throw new Error(
      `${label} value type: ${typeof value} (${String(
        value,
      )}), should be: Array`,
    );
  }
  if (!(value instanceof Array)) {
    throw new Error(`${label} value type: object, should be: Array`);
  }
  return value as Array<unknown>;
}
