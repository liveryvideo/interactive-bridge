import type { Parser } from './Parser/Parser';

export type SendCommand<T> = (
  name: string,
  arg?: unknown,
  listener?: ((value: T) => void) | undefined,
  custom?: boolean,
) => Promise<T>;

export interface Command<T> {
  arg?: unknown;
  custom?: boolean;
  listener?: (value: T) => void;
  name: string;
  parser: Parser<T>;
}
