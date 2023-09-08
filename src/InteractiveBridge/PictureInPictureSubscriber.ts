import { Subscriber } from '../util/Subscriber';
import { stringify } from '../util/stringify';

export class PictureInPictureSubscriber extends Subscriber<boolean, boolean> {
  protected command = 'subscribePictureInPicture';

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
