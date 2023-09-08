import type { Orientation } from '../InteractiveBridge';
import { Subscriber } from '../util/Subscriber';
import { stringify } from '../util/stringify';

export class OrientationSubscriber extends Subscriber<
  Orientation,
  Orientation
> {
  protected command = 'subscribeOrientation';

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
