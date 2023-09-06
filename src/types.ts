export type SendCommand<T> = (
  name: string,
  arg?: unknown,
  listener?: ((value: T) => void) | undefined,
  custom?: boolean,
) => Promise<T>;
