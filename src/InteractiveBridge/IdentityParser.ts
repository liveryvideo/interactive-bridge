import type { Parser } from '../util/Parser';

export class IdentityParser implements Parser<unknown> {
  parse(value: unknown) {
    return value;
  }
}
