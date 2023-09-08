import { Subscriber } from '../util/Subscriber';
import { stringify } from '../util/stringify';

export class FullscreenSubscriber extends Subscriber<boolean, boolean> {
  protected command = 'subscribeFullscreen';

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
