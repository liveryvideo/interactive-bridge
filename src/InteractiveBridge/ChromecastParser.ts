import type { Parser } from '../util/Parser';

export class ChromecastParser implements Parser<string | undefined> {
  parse(value: unknown) {
    if (value !== undefined && typeof value !== 'string') {
      throw new Error(
        `subscribeChromecast value type: ${typeof value}, should be: string | undefined`,
      );
    }
    return value;
  }
}
