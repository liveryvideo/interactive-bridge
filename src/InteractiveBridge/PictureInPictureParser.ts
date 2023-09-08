import type { Parser } from '../util/Parser';
import { stringify } from '../util/stringify';

export class PictureInPictureParser implements Parser<boolean> {
  parse(value: unknown) {
    if (typeof value !== 'boolean') {
      const strValue = stringify(value);
      throw new Error(
        `subscribePictureInPicture value: ${strValue}, should be: boolean`,
      );
    }
    return value;
  }
}
