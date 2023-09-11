import type { Parser } from '../util/Parser';
import { stringify } from '../util/stringify';

const orientations = ['landscape', 'portrait'] as const;
export type Orientation = (typeof orientations)[number];

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
