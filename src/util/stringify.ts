/**
 * Exception safe JSON.stringify().
 *
 * @param value - A JavaScript value, usually an object or array, to be converted.
 * @param replacer - A function that transforms the results.
 * @param space - Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
 */
export function stringify(...args: Parameters<typeof JSON.stringify>) {
  try {
    return JSON.stringify(...args);
  } catch (error) {
    return `stringify failed: ${String(error)}`;
  }
}
