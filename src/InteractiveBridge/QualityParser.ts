import type { Parser } from '../util/Parser';

export class QualityParser implements Parser<string> {
  parse(value: unknown) {
    if (typeof value !== 'string') {
      throw new Error(
        `subscribeQuality value type: ${typeof value}, should be: string`,
      );
    }
    return value;
  }
}
