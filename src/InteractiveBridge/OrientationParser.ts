import type { Orientation } from '../InteractiveBridge';
import type { Parser } from '../util/Parser';
import { stringify } from '../util/stringify';

export class OrientationParser implements Parser<Orientation> {
  parse(value: unknown) {
    if (value !== 'landscape' && value !== 'portrait') {
      const strValue = stringify(value);
      throw new Error(
        `subscribeOrientation value: ${strValue}, should be: "landscape" | "portrait"`,
      );
    }
    return value;
  }
}
