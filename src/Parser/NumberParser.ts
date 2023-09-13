import type { Parser } from './Parser';

export class NumberParser implements Parser<number> {
  private label: string;

  constructor(label: string) {
    this.label = label;
  }

  parse(value: unknown) {
    if (typeof value !== 'number') {
      throw new Error(
        `${this.label} value type: ${typeof value}, should be: number`,
      );
    }
    return value;
  }
}
