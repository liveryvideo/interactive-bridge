import type { Parser } from '../util/Parser';
import { stringify } from '../util/stringify';

export class FullscreenParser implements Parser<boolean> {
  parse(value: unknown) {
    if (typeof value !== 'boolean') {
      const strValue = stringify(value);
      throw new Error(
        `subscribeFullscreen value: ${strValue}, should be: boolean`,
      );
    }
    return value;
  }
}
