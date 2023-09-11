import type { Parser } from '../util/Parser';
import { stringify } from '../util/stringify';

export interface PlaybackDetails {
  buffer: number;
  duration: number;
  position: number;
}

export class PlaybackParser implements Parser<PlaybackDetails> {
  parse(value: unknown) {
    if (
      !(value instanceof Object) ||
      !(typeof value === 'object') ||
      value === null
    ) {
      throw new Error(
        `getPlayback value type: ${typeof value}, should be: object`,
      );
    }
    if (
      !('buffer' in value) ||
      typeof value.buffer !== 'number' ||
      !('duration' in value) ||
      typeof value.duration !== 'number' ||
      !('position' in value) ||
      typeof value.position !== 'number'
    ) {
      throw new Error(
        `getPlayback value shape should be: {buffer: number, duration: number, position: number}, found:\n${stringify(
          value,
        )}`,
      );
    }
    return {
      position: value.position,
      buffer: value.buffer,
      duration: value.duration,
    } as PlaybackDetails;
  }
}
