// eslint-disable-next-line @typescript-eslint/ban-types -- used to narrow down unknown object ({}) type
export function hasOwnProperty<X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y,
): obj is X & Record<Y, unknown> {
  return Object.hasOwnProperty.call(obj, prop);
}
