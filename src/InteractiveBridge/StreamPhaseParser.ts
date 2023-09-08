import type { Parser } from '../util/Parser';
import { stringify } from '../util/stringify';
import type { StreamPhase } from './VideoCommands';

export class StreamPhaseParser implements Parser<StreamPhase> {
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
