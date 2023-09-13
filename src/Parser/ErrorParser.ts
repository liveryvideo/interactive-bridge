import type { Parser } from './Parser';

export class ErrorParser implements Parser<string | undefined> {
  parse(value: unknown) {
    if (value !== undefined && typeof value !== 'string') {
      throw new Error(
        `subscriberError value type: ${typeof value}, should be: string | undefined`,
      );
    }
    return value;
  }
}
