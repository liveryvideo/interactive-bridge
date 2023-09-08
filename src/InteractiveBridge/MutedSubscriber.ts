import { Subscriber } from '../util/Subscriber';
import { stringify } from '../util/stringify';

export class MutedSubscriber extends Subscriber<boolean, boolean> {
  protected command = 'subscribeMuted';

  parse(value: unknown) {
    if (typeof value !== 'boolean') {
      const strValue = stringify(value);
      throw new Error(`subscribeMuted value: ${strValue}, should be: boolean`);
    }
    return value;
  }
}
