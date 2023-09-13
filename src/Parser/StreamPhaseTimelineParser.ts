import { InvalidTypeError } from '../errors';
import type { Parser } from './Parser';
import { knownStreamPhases, type StreamPhase } from './StreamPhaseParser';

export type StreamPhaseTimeline = Record<number, StreamPhase>;

export class StreamPhaseTimelineParser implements Parser<StreamPhaseTimeline> {
  parse(value: unknown) {
    if (typeof value !== 'object') {
      throw new InvalidTypeError(
        value,
        `subscribeStreamPhaseTimeline value type: ${typeof value}, should be: object`,
      );
    }
    if (value === null) {
      throw new InvalidTypeError(
        value,
        `subscribeStreamPhaseTimeline value type: null, should be: object`,
      );
    }
    if (value instanceof Array) {
      throw new InvalidTypeError(
        value,
        `subscribeStreamPhaseTimeline value type: Array, should be: Object`,
      );
    }
    const output: Record<number, StreamPhase> = {};
    for (const [k, v] of Object.entries(value)) {
      const keyAsNum = Number(k);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      if (Number.isFinite(keyAsNum) && knownStreamPhases.includes(v)) {
        output[keyAsNum] = v as StreamPhase;
      }
    }
    return output as StreamPhaseTimeline;
  }
}
