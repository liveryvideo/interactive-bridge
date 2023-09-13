import { expect } from 'vitest';
import type { Parser } from '../../src/Parser/Parser';
import { InvalidTypeError } from '../../src/errors';

export class ParserTestApparatus<OutType> {
  private parser: Parser<OutType>;

  constructor(parser: Parser<OutType>) {
    this.parser = parser;
  }

  assertValueThrowsInvalidTypeError(value: unknown) {
    try {
      this.parser.parse(value);
    } catch (error) {
      expect(error instanceof InvalidTypeError);
      return;
    }
    expect.fail();
  }

  assertValueYieldsResult(value: unknown, expected: OutType) {
    expect(this.parser.parse(value)).toEqual(expected);
  }

  assertValueYieldsSameAsResult(value: OutType) {
    this.assertValueYieldsResult(value, value);
  }
}
