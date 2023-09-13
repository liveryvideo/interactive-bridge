import type { Parser } from '../util/Parser';

export class StringParser implements Parser<string> {
  private label: string;

  constructor(label: string) {
    this.label = label;
  }

  parse(value: unknown) {
    if (typeof value !== 'string') {
      throw new Error(
        `${this.label} value type: ${typeof value}, should be: string`,
      );
    }
    return value;
  }
}
