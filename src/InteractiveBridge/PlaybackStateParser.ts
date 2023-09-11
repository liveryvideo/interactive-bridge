import type { Parser } from '../util/Parser';
import { stringify } from '../util/stringify';

const knownPlaybackStates = [
  'BUFFERING',
  'ENDED',
  'FAST_FORWARD',
  'PAUSED',
  'PLAYING',
  'REWIND',
  'SEEKING',
  'SLOW_MO',
] as const;
export type PlaybackState = (typeof knownPlaybackStates)[number];

export class PlaybackStateParser implements Parser<PlaybackState> {
  parse(value: unknown) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!knownPlaybackStates.includes(value)) {
      const strValue = stringify(value);
      throw new Error(
        `subscribePlaybackMode value: ${strValue}, should be: ${knownPlaybackStates.join(
          ' | ',
        )}`,
      );
    }
    return value as PlaybackState;
  }
}
