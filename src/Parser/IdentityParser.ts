import type { Parser } from './Parser';

export class IdentityParser implements Parser<unknown> {
  parse(value: unknown) {
    return value;
  }
}
