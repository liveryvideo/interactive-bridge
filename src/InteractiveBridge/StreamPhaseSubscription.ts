import { Subscription } from '../util/Subscription';
import { stringify } from '../util/stringify';
import type { StreamPhase } from './VideoCommands';

export class StreamPhaseSubscription extends Subscription<
  StreamPhase,
  StreamPhase
> {
  protected command = 'subscribeStreamPhase';

  parse(value: unknown) {
    if (value !== 'LIVE' && value !== 'POST' && value !== 'PRE') {
      const strValue = stringify(value);
      throw new Error(
        `subscribeStreamPhase value: ${strValue}, should be: "LIVE" | "POST" | "PRE"`,
      );
    }
    return value;
  }
}
