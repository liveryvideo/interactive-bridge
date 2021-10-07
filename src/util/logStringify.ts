// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isSupported(value: any) {
  if (value === null) {
    return true;
  }

  if (value === undefined) {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const { name } = value.constructor;

  if (name === 'Number' && !Number.isFinite(value)) {
    return false;
  }

  return ['Array', 'Boolean', 'Date', 'Number', 'Object', 'String'].includes(
    name,
  );
}

/**
 * Returns a developer readable string for logging.
 *
 * In general this will return the `JSON.stringify()` return value,
 * allowing to distinguish between a string `"false"` and a boolean `false`.
 *
 * We replace (sub)values by `String(value)` when they are not well supported.
 * That is for `undefined` and non finite number values (e.g: Infinity, NaN, BigInt, ..).
 * And for values where their constructor name is not one of:
 * `Boolean`, `Number`, `String`, `Date`, `Object` or `Array`
 *
 * Finally, in case `JSON.stringify()` throws, this instead returns `String(error)`,
 * e.g: `TypeError: cyclic object value`.
 *
 * @param value Value to stringify
 */
export function logStringify(value: unknown, space = '') {
  try {
    return JSON.stringify(
      value,
      (key, subvalue) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        key === '' || isSupported(subvalue)
          ? subvalue
          : String(subvalue).toString(),
      space,
    );
  } catch (error) {
    return String(error);
  }
}
