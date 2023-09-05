import type { LiveryBridge } from '../LiveryBridge';
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

const knownFeatures = [
  'AIRPLAY',
  'CHROMECAST',
  'CONTACT',
  'FULLSCREEN',
  'PIP',
  'SCRUBBER',
] as const;
export type Feature = (typeof knownFeatures)[number];

const orientations = ['landscape', 'portrait'] as const;
export type Orientation = (typeof orientations)[number];

const streamPhases = ['LIVE', 'POST', 'PRE'] as const;
export type StreamPhase = (typeof streamPhases)[number];

export interface PlaybackDetails {
  buffer: number;
  duration: number;
  position: number;
}

export interface Quality {
  audio?: {
    bandwidth: number;
  };
  index: number;
  label: string;
  video?: {
    bandwidth: number;
    height: number;
    width: number;
  };
}

function parseToArray(value: unknown, label: string) {
  if (value === null) {
    throw new Error(`${label} value type: null, should be: Array`);
  }
  if (typeof value !== 'object') {
    throw new Error(
      `${label} value type: ${typeof value} (${String(
        value,
      )}), should be: Array`,
    );
  }
  if (!(value instanceof Array)) {
    throw new Error(`${label} value type: object, should be: Array`);
  }
  return value as Array<unknown>;
}

function fieldFromIfTypeWithDefault<T>(
  field: string,
  obj: unknown,
  type: string,
  fallback: T,
): T {
  // eslint-disable-next-line valid-typeof
  if (
    obj instanceof Object &&
    field in obj &&
    // eslint-disable-next-line valid-typeof
    typeof Object.getOwnPropertyDescriptor(obj, field)?.value === type
  ) {
    return Object.getOwnPropertyDescriptor(obj, field)?.value as T;
  }
  return fallback;
}

export class VideoCommands {
  private sendCommand: LiveryBridge['sendCommand'];

  constructor(sendCommand: LiveryBridge['sendCommand']) {
    this.sendCommand = sendCommand;
  }

  /**
   * Returns a list of features supported by the video player
   */
  getFeatures(): Promise<Feature[]> {
    return this.sendCommand('getFeatures').then((value) => {
      parseToArray(value, 'getFeatures');
      const features = new Set<Feature>();
      for (const feature of value as Array<unknown>) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        if (knownFeatures.includes(feature as Feature)) {
          features.add(feature as Feature);
        }
      }
      const sanitizedFeatureList: Feature[] = Array.from(features);
      return sanitizedFeatureList;
    });
  }

  /**
   * Returns current playback:
   *  - buffer in seconds ahead of current position
   *  - duration in seconds from start to end of VOD or live stream (e.g: continuously increasing)
   *  - position in seconds since start of stream
   */
  getPlayback(): Promise<{
    buffer: number;
    duration: number;
    position: number;
  }> {
    return this.sendCommand('getPlayback').then((value) => {
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
    });
  }

  /**
   *
   */
  // pause(){}

  /**
   * Can require direct user interaction
   * If starting unmuted playback fails this will fall back to muted playback
   * and notify subscribeUnmuteRequiresInteraction listeners.
   */
  // play(){}

  /**
   * Reloads player, e.g: to try to recover from an error
   */
  // reload(){}

  /**
   *
   * Seek to specified position in seconds since start of stream/vod
   * If position is not within a LIVE stream phase period this will return an error
   */
  // seek(position: number){}

  /**
   * Select index of quality to play, or -1 to use ABR
   */
  // selectQuality(index: number){}

  /**
   *
   */
  // setAirplay(active: boolean){}

  /**
   *
   */
  // setChromecast(active: boolean){}

  /**
   * Can require direct user interaction
   */
  // setFullscreen(active: boolean){}

  /**
   * Can require direct user interaction
   */
  // setMuted(muted: boolean){}

  /**
   * Can require direct user interaction
   */
  // setPictureInPicture(active: boolean){}

  /**
   * Returns true when Airplay is being used, false otherwise
   */
  // subscribeAirplay(listener): boolean {}

  /**
   * Returns name of device that is being cast to or undefined
   */
  // subscribeChromecast(listener): string | undefined {}

  /**
   * Where Controls is an object with boolean properties:
   * cast, contact, error, fullscreen, mute, pip, play, quality, scrubber
   */
  // subscribeControls(listener): Controls {}

  /**
   * Current player error message or undefined
   */
  // subscribeError(listener): string | undefined {}

  // subscribeMuted(listener): boolean {}

  // subscribePictureInPicture(listener): boolean {}

  /**
   * Returns current mode of playback, e.g: buffering, syncing, ABR, stall management, etc.
   */
  // subscribePlaybackMode(listener): 'CATCHUP' | 'LIVE' | 'UNKNOWN' | 'VOD' {}

  /**
   * Stalled (loading) states are: 'BUFFERING', 'SEEKING'
   * Paused states are: 'ENDED', 'PAUSED'
   * Playing states are: 'FAST_FORWARD', 'PLAYING', 'REWIND', 'SLOW_MO'
   * Though practically we only use 'PLAYING' for now
   */
  // subscribePlaybackState(listener): PlaybackState {}

  /**
   * Note that the existing subscribeQuality method only returns the label
   * of the current playback quality. Assuming that that should be unique
   * I think it will already suffice to create a qualities list that shows
   * the currently active quality. Otherwise we’ll have to also add a
   * subscribeQualityIndex method or so that returns the index of the quality
   * in the list of qualities returned by subscribeQualities.
   */
  subscribeQualities(listener: (value: Quality[]) => void) {
    function parse(value: unknown) {
      const array = parseToArray(value, 'subscribeQualities');

      const qualityArray: Quality[] = [];
      for (let i = 0; i < array.length; i += 1) {
        if (array[i] === undefined) {
          continue;
        }
        const item = array[i];
        const label = fieldFromIfTypeWithDefault(
          'label',
          item,
          'string',
          String(i),
        );

        let audio: Quality['audio'];
        if (
          item instanceof Object &&
          'audio' in item &&
          item.audio instanceof Object
        ) {
          audio = {
            bandwidth: fieldFromIfTypeWithDefault(
              'bandwidth',
              item.audio,
              'number',
              NaN,
            ),
          };
        }

        let video: Quality['video'];
        if (
          item instanceof Object &&
          'video' in item &&
          item.video instanceof Object
        ) {
          video = {
            bandwidth: fieldFromIfTypeWithDefault(
              'bandwidth',
              item.video,
              'number',
              NaN,
            ),
            height: fieldFromIfTypeWithDefault(
              'height',
              item.video,
              'number',
              NaN,
            ),
            width: fieldFromIfTypeWithDefault(
              'width',
              item.video,
              'number',
              NaN,
            ),
          };
        }

        qualityArray.push({
          audio,
          index: i,
          label,
          video,
        });
      }
      return qualityArray;
    }

    return this.sendCommand('subscribeQualities', undefined, (value) =>
      listener(parse(value)),
    ).then(parse);
  }

  /**
   * This indicates the LIVE periods of the stream that can be seeked to
   * I.e: from the start of LIVE timestamp to the first non-LIVE timestamp
   */
  // subscribeStreamPhaseTimeline(listener): Record<number, StreamPhase> {}

  /**
   *
   * If true then unmuting playback requires user interaction,
   * e.g: setMuted() should be called directly from a 'click' event listener.
   * In this case the web player currently shows a special unmute button
   * to highlight this fact to users and facilitate unmuting.
   */
  // subscribeUnmuteRequiresInteraction(listener): boolean {}
}
