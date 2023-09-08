import { Subscriber } from '../util/Subscriber';

export class QualitySubscriber extends Subscriber<string, string> {
  protected command = 'subscribeQuality';

  parse(value: unknown) {
    if (typeof value !== 'string') {
      throw new Error(
        `subscribeQuality value type: ${typeof value}, should be: string`,
      );
    }
    return value;
  }
}
