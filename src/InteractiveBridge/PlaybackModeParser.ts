import type { Parser } from '../util/Parser';
import { stringify } from '../util/stringify';

export const knownPlaybackModes = [
  'CATCHUP',
  'LIVE',
  'UNKNOWN',
  'VOD',
] as const;
export type PlaybackMode = (typeof knownPlaybackModes)[number];

export class PlaybackModeParser implements Parser<PlaybackMode> {
  parse(value: unknown) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!knownPlaybackModes.includes(value)) {
      const strValue = stringify(value);
      throw new Error(
        `subscribePlaybackMode value: ${strValue}, should be: ${knownPlaybackModes.join(
          ' | ',
        )}`,
      );
    }
    return value as PlaybackMode;
  }
}
