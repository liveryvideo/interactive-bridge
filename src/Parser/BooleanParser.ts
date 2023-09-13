import { stringify } from '../util/stringify';
import type { Parser } from './Parser';

export class BooleanParser implements Parser<boolean> {
  private label: string;

  constructor(label: string) {
    this.label = label;
  }

  parse(value: unknown) {
    if (typeof value !== 'boolean') {
      const strValue = stringify(value);
      throw new Error(`${this.label} value: ${strValue}, should be: boolean`);
    }
    return value;
  }
}
