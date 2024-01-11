import type { AbstractPlayerBridge } from './AbstractPlayerBridge';
import { LiveryBridge } from './LiveryBridge';
import { stringify } from './util/stringify';

export type Orientation = 'landscape' | 'portrait';

export type StreamPhase = 'LIVE' | 'POST' | 'PRE';

export const features = [
  'airplay',
  'chromecast',
  'contact',
  'fullscreen',
  'pip',
  'scrubber',
] as const;

export type Feature = (typeof features)[number];

export type GetFeaturesReturn = Record<Feature, boolean>;

export const playbackDetails = [
  'buffer',
  'duration',
  'latency',
  'position',
] as const;

export type PlaybackDetails = (typeof playbackDetails)[number];

export type GetPlaybackReturn = Record<PlaybackDetails, number | undefined>;

export interface Quality {
  audio?: {
    bandwidth: number;
  };
  label: string;
  video?: {
    bandwidth: number;
    height: number;
    width: number;
  };
}

export type Qualities =
  | {
      active: number;
      list: Quality[];
      selected: number;
    }
  | undefined;

export const displayModes = [
  'AIRPLAY',
  'CHROMECAST',
  'FULLSCREEN',
  'DEFAULT',
  'PIP',
] as const;

export type DisplayMode = (typeof displayModes)[number];

export interface UserFeedbackPayload {
  comments: string;
  email: string;
  name: string;
}

export const controls = [
  'cast',
  'contact',
  'error',
  'fullscreen',
  'mute',
  'pip',
  'play',
  'quality',
  'scrubber',
] as const;

export type Control = (typeof controls)[number];

export type Config =
  | {
      controls: Record<Control, boolean>;
      customerId: string;
      streamPhase: StreamPhase;
      streamPhases: Record<number, StreamPhase>;
      tenantId: string;
    }
  | undefined;

export const playbackModes = ['CATCHUP', 'LIVE', 'UNKNOWN', 'VOD'] as const;

export type PlaybackMode = (typeof playbackModes)[number];

export const playbackStates = [
  'BUFFERING',
  'ENDED',
  'FAST_FORWARD',
  'PAUSED',
  'PLAYING',
  'REWIND',
  'SEEKING',
  'SLOW_MO',
] as const;

export type PlaybackState = (typeof playbackStates)[number];

/**
 * Can be used on Livery interactive layer pages to communicate with the surrounding Livery Player.
 */
export class InteractiveBridge extends LiveryBridge {
  /**
   * Constructs `InteractiveBridge` with specified `target: AbstractPlayerBridge` (i.e: `PlayerBridge`)
   * or with `window.parent` as target window and with specified `target: string` as origin.
   */
  constructor(target: AbstractPlayerBridge | string) {
    if (typeof target === 'string') {
      super({ window: window.parent, origin: target });
    } else {
      super(target);
    }
  }

  /**
   * Returns promise of LiveryPlayer application name.
   */
  getAppName() {
    return this.sendCommand('getAppName').then((value) => {
      if (typeof value !== 'string') {
        throw new Error(
          `getAppName value type: ${typeof value}, should be: string`,
        );
      }
      return value;
    });
  }

  /**
   * Returns promise of LiveryPlayer customer id.
   */
  getCustomerId() {
    return this.sendCommand('getCustomerId').then((value) => {
      if (typeof value !== 'string') {
        throw new Error(
          `getCustomerId value type: ${typeof value}, should be: string`,
        );
      }
      return value;
    });
  }

  /**
   * Returns promise of LiveryPlayer Pinpoint analytics endpoint id.
   */
  getEndpointId() {
    return this.sendCommand('getEndpointId').then((value) => {
      if (typeof value !== 'string') {
        throw new Error(
          `getEndpointId value type: ${typeof value}, should be: string`,
        );
      }
      return value;
    });
  }

  /**
   * Returns promise of LiveryPlayer features and whether or not they're enabled.
   */
  getFeatures(): Promise<GetFeaturesReturn> {
    return this.sendCommand('getFeatures').then((value) => {
      if (typeof value !== 'object') {
        throw new Error(
          `getFeatures value type: ${typeof value}, should be: object`,
        );
      }
      if (value === null) {
        throw new Error(`getFeatures value type: null, should be: object`);
      }
      return features.reduce((previous, feature) => {
        const typedValue = value as Record<string, unknown>;
        const typedFeatureValue = typedValue[feature as string];
        previous[feature] =
          typeof typedFeatureValue === 'boolean' ? typedFeatureValue : false;
        return previous;
      }, {} as GetFeaturesReturn);
    });
  }

  /**
   * Returns promise of current LiveryPlayer latency in seconds.
   */
  getLatency() {
    return this.sendCommand('getLatency').then((value) => {
      if (typeof value !== 'number') {
        throw new Error(
          `getLatency value type: ${typeof value}, should be: number`,
        );
      }
      return value;
    });
  }

  /**
   * Returns promise of an object of key-value string parameters from LiveryPlayer.
   *
   * Android and iOS players will call a callback and pass on the returned values.
   *
   * The web player will return all 'livery_' prefixed query parameters with:
   * - The prefix stripped from the names (snake_case will not be converted to camelCase)
   * - Parameter names and values URL decoded
   * - Empty string (not `null`) values for parameters without a value
   * - Only the first value of a repeated parameter (no multiple value array support)
   *
   * So given location.search: `'?foo&livery_foo%3Abar=hey+you&livery_no_val&livery_multi=1&livery_multi=2'`
   * this will return: `{ 'foo:bar': 'hey you', no_val: '', multi: '1' }`.
   */
  getLiveryParams(): Promise<Record<string, string>> {
    return this.sendCommand('getLiveryParams').then((value) => {
      if (typeof value !== 'object') {
        throw new Error(
          `getLiveryParams value type: ${typeof value}, should be: object`,
        );
      }
      if (value === null) {
        throw new Error(`getLiveryParams value type: null, should be: object`);
      }
      const dict: Record<string, string> = {};
      for (const [paramKey, paramValue] of Object.entries(value)) {
        if (typeof paramValue === 'string') {
          dict[paramKey] = paramValue;
        }
      }
      return dict;
    });
  }

  /**
   * Returns promise of LiveryPlayer playback details.
   */
  getPlayback(): Promise<GetPlaybackReturn> {
    return this.sendCommand('getPlayback').then((value) => {
      if (typeof value !== 'object') {
        throw new Error(
          `getPlayback value type: ${typeof value}, should be: object`,
        );
      }
      if (value === null) {
        throw new Error(`getPlayback value type: null, should be: object`);
      }
      return playbackDetails.reduce((previous, detail) => {
        const typedValue = value as Record<string, unknown>;
        const typedFeatureValue = typedValue[detail as string];

        previous[detail] =
          typeof typedFeatureValue === 'number' ? typedFeatureValue : undefined;
        return previous;
      }, {} as GetPlaybackReturn);
    });
  }

  /**
   * Returns promise of LiveryPlayer version.
   */
  getPlayerVersion() {
    return this.sendCommand('getPlayerVersion').then((value) => {
      if (typeof value !== 'string') {
        throw new Error(
          `getPlayerVersion value type: ${typeof value}, should be: string`,
        );
      }
      return value;
    });
  }

  /**
   * Returns promise of LiveryPlayer stream id.
   */
  getStreamId() {
    return this.sendCommand('getStreamId').then((value) => {
      if (typeof value !== 'string') {
        throw new Error(
          `getStreamId value type: ${typeof value}, should be: string`,
        );
      }
      return value;
    });
  }

  /**
   * Pauses LiveryPlayer playback.
   */
  pause() {
    return this.sendCommand('pause');
  }

  /**
   * Starts or resumes LiveryPlayer playback.
   */
  play() {
    return this.sendCommand('play');
  }

  /**
   * Register `handler` function to be called with `arg` and `listener` when `sendCustomCommand()` is called on
   * other side with matching `name`.
   *
   * @deprecated Will be removed in the next major version. Use `registerPlayerCommand()` instead.
   */
  override registerCustomCommand(
    name: string,
    handler: (arg: unknown, listener: (value: unknown) => void) => unknown,
  ) {
    return super.registerCustomCommand(name, handler);
  }

  /**
   * Register `handler` function to be called with `arg` and `listener` when `sendInteractiveCommand()` is called
   * from the livery-player side with matching `name`.
   */
  registerInteractiveCommand(
    name: string,
    handler: (arg: unknown, listener: (value: unknown) => void) => unknown,
  ) {
    super.registerCustomCommand(name, handler);
  }

  /**
   * Reloads LiveryPlayer.
   */
  reload() {
    return this.sendCommand('reload');
  }

  /**
   * Seek to a specified LiveryPlayer position in seconds.
   */
  seek(position: number) {
    if (typeof position !== 'number') {
      throw new Error(
        `position arg value type: ${typeof position}, should be: number`,
      );
    }
    return this.sendCommand('seek', position);
  }

  /**
   * Select specified LiveryPlayer quality index or -1 for ABR.
   */
  selectQuality(index: number) {
    if (typeof index !== 'number') {
      throw new Error(
        `index arg value type: ${typeof index}, should be: number`,
      );
    }
    return this.sendCommand('selectQuality', index);
  }

  /**
   * Returns promise of value returned by other side's custom command handler with matching `name` that is passed `arg`.
   * Any `handler` `listener` calls will subsequently also be bridged to this `listener` callback.
   *
   * @deprecated Will be removed in the next major version. Use `sendPlayerCommand()` instead.
   */
  override sendCustomCommand<T>(
    name: string,
    arg?: unknown,
    listener?: (value: T) => void,
  ) {
    return super.sendCustomCommand(name, arg, listener);
  }

  /**
   * Returns promise of value returned by the livery-player's custom command handler with matching `name` that is passed `arg`.
   * Any `handler` `listener` calls will subsequently also be bridged to this `listener` callback.
   */
  sendPlayerCommand<T>(
    name: string,
    arg?: unknown,
    listener?: (value: T) => void,
  ) {
    return super.sendCustomCommand(name, arg, listener);
  }

  /**
   * Sets whether or not LiveryPlayer controls are disabled.
   */
  setControlsDisabled(disabled: boolean) {
    if (typeof disabled !== 'boolean') {
      throw new Error(
        `disabled arg value type: ${typeof disabled}, should be: boolean`,
      );
    }
    return this.sendCommand('setControlsDisabled', disabled);
  }

  /**
   * Change the LiveryPlayer display to the specified value.
   */
  setDisplay(display: DisplayMode) {
    if (!displayModes.includes(display)) {
      throw new Error(`display arg value: ${typeof display} is not supported`);
    }
    return this.sendCommand('setDisplay', display);
  }

  /**
   * Sets whether or not LiveryPlayer is muted.
   */
  setMuted(muted: boolean) {
    if (typeof muted !== 'boolean') {
      throw new Error(
        `muted arg value type: ${typeof muted}, should be: boolean`,
      );
    }
    return this.sendCommand('setMuted', muted);
  }

  /**
   * Uses LiveryPlayer's Sentry API to submit user feedback.
   */
  submitUserFeedback(payload: UserFeedbackPayload) {
    if (typeof payload !== 'object') {
      throw new Error(
        `payload arg value type: ${typeof payload}, should be: object`,
      );
    }
    return this.sendCommand('submitUserFeedback', payload);
  }

  /**
   * Returns promise of current LiveryPlayer fullscreen state
   * and calls back `listener` with any subsequent state changes.
   */
  subscribeConfig(listener: (value: Config) => void) {
    function validate(value: unknown) {
      if (typeof value !== 'object') {
        throw new Error(
          `subscribeConfig value type: ${typeof value}, should be: object`,
        );
      }
      return value as Config;
    }

    return this.sendCommand('subscribeConfig', undefined, (value) =>
      listener(validate(value)),
    ).then(validate);
  }

  /**
   * Returns promise of current LiveryPlayer display mode
   * and calls back `listener` with any subsequent display mode changes.
   */
  subscribeDisplay(listener: (value: DisplayMode) => void) {
    function validate(value: unknown) {
      const typedValue = value as DisplayMode;
      if (!displayModes.includes(typedValue)) {
        throw new Error(
          `subscribeDisplay arg value: ${typeof value} is not supported`,
        );
      }
      return typedValue;
    }

    return this.sendCommand('subscribeDisplay', undefined, (value) =>
      listener(validate(value)),
    ).then(validate);
  }

  /**
   * Returns promise of current LiveryPlayer error
   * and calls back `listener` with any subsequent errors.
   */
  subscribeError(listener: (error: string | undefined) => void) {
    function validate(error: unknown) {
      if (typeof error !== 'string' && typeof error !== 'undefined') {
        throw new Error(
          `subscribeError value type: ${typeof error}, should be: "string" | "undefined"`,
        );
      }
      return error;
    }

    return this.sendCommand('subscribeError', undefined, (error) =>
      listener(validate(error)),
    ).then(validate);
  }

  /**
   * Returns promise of current LiveryPlayer fullscreen state
   * and calls back `listener` with any subsequent state changes.
   */
  subscribeFullscreen(listener: (value: boolean) => void) {
    function validate(value: unknown) {
      if (typeof value !== 'boolean') {
        throw new Error(
          `subscribeFullscreen value type: ${typeof value}, should be: boolean`,
        );
      }
      return value;
    }

    return this.sendCommand('subscribeFullscreen', undefined, (value) =>
      listener(validate(value)),
    ).then(validate);
  }

  /**
   * Returns promise of current LiveryPlayer playback mode
   * and calls back `listener` with any subsequent mode changes.
   */
  subscribeMode(listener: (mode: PlaybackMode) => void) {
    function validate(mode: unknown) {
      const typedMode = mode as PlaybackMode;
      if (!playbackModes.includes(typedMode)) {
        throw new Error(
          `subscribeMode arg mode: ${typeof mode} is not supported`,
        );
      }
      return typedMode;
    }

    return this.sendCommand('subscribeMode', undefined, (mode) =>
      listener(validate(mode)),
    ).then(validate);
  }

  /**
   * Returns promise of current LiveryPlayer error
   * and calls back `listener` with any subsequent errors.
   */
  subscribeMuted(listener: (muted: boolean) => void) {
    function validate(value: unknown) {
      if (typeof value !== 'boolean') {
        throw new Error(
          `subscribeMuted value type: ${typeof value}, should be: boolean`,
        );
      }
      return value;
    }

    return this.sendCommand('subscribeMuted', undefined, (value) =>
      listener(validate(value)),
    ).then(validate);
  }

  /**
   * Returns promise of current LiveryPlayer window orientation (`'landscape' \| 'portrait'`)
   * and calls back `listener` with any subsequent orientations.
   */
  subscribeOrientation(listener: (orientation: Orientation) => void) {
    function validate(value: unknown) {
      if (value !== 'landscape' && value !== 'portrait') {
        const strValue = stringify(value);
        throw new Error(
          `subscribeOrientation value: ${strValue}, should be: "landscape" | "portrait"`,
        );
      }
      return value;
    }

    return this.sendCommand('subscribeOrientation', undefined, (value) =>
      listener(validate(value)),
    ).then(validate);
  }

  /**
   * Returns promise of current LiveryPlayer paused state
   * and calls back `listener` with any subsequent state updates.
   */
  subscribePaused(listener: (value: boolean) => void) {
    function validate(value: unknown) {
      if (typeof value !== 'boolean') {
        throw new Error(
          `subscribePaused value type: ${typeof value}, should be: boolean`,
        );
      }
      return value;
    }

    return this.sendCommand('subscribePaused', undefined, (value) =>
      listener(validate(value)),
    ).then(validate);
  }

  /**
   * Returns promise of current LiveryPlayer playback state
   * and calls back `listener` with any subsequent state updates.
   */
  subscribePlaybackState(listener: (playbackState: PlaybackState) => void) {
    function validate(playbackState: unknown) {
      const typedPlaybackState = playbackState as PlaybackState;
      if (!playbackStates.includes(typedPlaybackState)) {
        throw new Error(
          `subscribePlaybackState arg playbackState: ${typeof playbackState} is not supported`,
        );
      }
      return typedPlaybackState;
    }

    return this.sendCommand(
      'subscribePlaybackState',
      undefined,
      (playbackState) => listener(validate(playbackState)),
    ).then(validate);
  }

  /**
   * Returns promise of current LiveryPlayer playing state
   * and calls back `listener` with any subsequent state updates.
   */
  subscribePlaying(listener: (value: boolean) => void) {
    function validate(value: unknown) {
      if (typeof value !== 'boolean') {
        throw new Error(
          `subscribePlaying value type: ${typeof value}, should be: boolean`,
        );
      }
      return value;
    }

    return this.sendCommand('subscribePlaying', undefined, (value) =>
      listener(validate(value)),
    ).then(validate);
  }

  /**
   * Returns promise of current LiveryPlayer qualities
   * and calls back `listener` with any subsequent changes.
   */
  subscribeQualities(listener: (value: Qualities) => void) {
    function validate(value: unknown) {
      if (typeof value !== 'object') {
        throw new Error(
          `subscribeQualities value type: ${typeof value}, should be: object`,
        );
      }
      return value as Qualities;
    }

    return this.sendCommand('subscribeQualities', undefined, (value) =>
      listener(validate(value)),
    ).then(validate);
  }

  /**
   * Returns promise of current LiveryPlayer playback quality
   * and calls back `listener` with any subsequent quality changes.
   */
  subscribeQuality(listener: (value: string) => void) {
    function validate(value: unknown) {
      if (typeof value !== 'string') {
        throw new Error(
          `subscribeQuality value type: ${typeof value}, should be: string`,
        );
      }
      return value;
    }

    return this.sendCommand('subscribeQuality', undefined, (value) =>
      listener(validate(value)),
    ).then(validate);
  }

  /**
   * Returns promise of current LiveryPlayer stalled state
   * and calls back `listener` with any subsequent state updates.
   */
  subscribeStalled(listener: (value: boolean) => void) {
    function validate(value: unknown) {
      if (typeof value !== 'boolean') {
        throw new Error(
          `subscribeStalled value type: ${typeof value}, should be: boolean`,
        );
      }
      return value;
    }

    return this.sendCommand('subscribeStalled', undefined, (value) =>
      listener(validate(value)),
    ).then(validate);
  }

  /**
   * Returns promise of current LiveryPlayer stream phase (`'PRE' \| 'LIVE' \| 'POST'`)
   * and calls back `listener` with any subsequent phases.
   */
  subscribeStreamPhase(listener: (phase: StreamPhase) => void) {
    function validate(value: unknown) {
      if (value !== 'LIVE' && value !== 'POST' && value !== 'PRE') {
        const strValue = stringify(value);
        throw new Error(
          `subscribeStreamPhase value: ${strValue}, should be: "LIVE" | "POST" | "PRE"`,
        );
      }
      return value;
    }

    return this.sendCommand('subscribeStreamPhase', undefined, (value) =>
      listener(validate(value)),
    ).then(validate);
  }

  /**
   * Unregister custom command by name.
   *
   * @deprecated Will be removed in the next major version. Use `unregisterInteractiveCommand()` instead.
   */
  override unregisterCustomCommand(name: string) {
    super.unregisterCustomCommand(name);
  }

  /**
   * Unregister custom interactive command by name.
   */
  unregisterInteractiveCommand(name: string) {
    return super.unregisterCustomCommand(name);
  }
}
