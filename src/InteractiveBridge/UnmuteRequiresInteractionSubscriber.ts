import { Subscriber } from '../util/Subscriber';
import { stringify } from '../util/stringify';

export class UnmuteRequiresInteractionSubscriber extends Subscriber<
  boolean,
  boolean
> {
  protected command = 'subscribeUnmuteRequiresInteraction';

  parse(value: unknown) {
    if (typeof value !== 'boolean') {
      const strValue = stringify(value);
      throw new Error(
        `subscribeUnmuteRequiresInteraction value: ${strValue}, should be: boolean`,
      );
    }
    return value;
  }
}
