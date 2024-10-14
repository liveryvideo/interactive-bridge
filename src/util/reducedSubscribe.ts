/**
 * Subscribe to a value reduced from another value.
 *
 * Note: values are compared using basic strict equality (no deep object equality).
 *
 * @param subscribe - Unreduced subscribe method
 * @param reducer - Value reducer
 * @param listener - Reduced value change listener
 * @returns Initial reduced value
 */
export async function reducedSubscribe<T, R>(
  subscribe: (unreducedListener: (unreducedValue: T) => void) => Promise<T> | T,
  reducer: (unreducedValue: T) => R,
  listener: (value: R) => void,
) {
  let value = reducer(
    await subscribe((newUnreducedValue) => {
      const newValue = reducer(newUnreducedValue);
      if (newValue !== value) {
        value = newValue;
        listener(value);
      }
    }),
  );
  return value;
}
