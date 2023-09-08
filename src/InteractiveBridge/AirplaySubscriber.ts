import { Subscriber } from '../util/Subscriber';
import { stringify } from '../util/stringify';

export class AirplaySubscriber extends Subscriber<boolean, boolean> {
  protected command = 'subscribeAirplay';

  parse(value: unknown) {
    if (typeof value !== 'boolean') {
      const strValue = stringify(value);
      throw new Error(
        `subscribeAirplay value: ${strValue}, should be: boolean`,
      );
    }
    return value;
  }
}
