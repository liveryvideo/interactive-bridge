export function fieldFromIfTypeWithDefault<T>(
  field: string,
  obj: unknown,
  type: string,
  fallback: T,
): T {
  // eslint-disable-next-line valid-typeof
  if (
    obj instanceof Object &&
    field in obj &&
    // eslint-disable-next-line valid-typeof
    typeof Object.getOwnPropertyDescriptor(obj, field)?.value === type
  ) {
    return Object.getOwnPropertyDescriptor(obj, field)?.value as T;
  }
  return fallback;
}
