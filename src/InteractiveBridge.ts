import type { AbstractPlayerBridge } from './AbstractPlayerBridge';
import { LiveryBridge } from './LiveryBridge';
import { reducedSubscribe } from './util/reducedSubscribe';
import type {
  Config,
  DisplayMode,
  Orientation,
  PlaybackMode,
  PlaybackState,
  Qualities,
  StreamPhase,
  UserFeedback,
} from './util/schema';
import {
  validateBoolean,
  validateConfig,
  validateDisplayMode,
  validateFeatures,
  validateLiveryParams,
  validateNumber,
  validateOrientation,
  validatePlaybackDetails,
  validatePlaybackMode,
  validatePlaybackState,
  validateQualities,
  validateStreamPhase,
  validateString,
  validateStringOrUndefined,
} from './util/schema';

/**
 * Can be used by a Livery interactive layer element or page to communicate with the surrounding Livery Player.
 *
 * @example
 * ```js
 * import { InteractiveBridge } from '@liveryvideo/interactive-bridge';
 * // The playerBridge will be provided to you as interactive element as interactive webview or iframe
 * const bridge = new InteractiveBridge(playerBridge || '*');
 * // To prevent cross site security issues:
 * // https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#security_concerns
 * // replace the `'*'` origin above with the origin of the page that the Livery Player is on
 * bridge.getAppName().then(appName => window.alert(`appName: ${appName}`));
 * ```
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
    return this.sendCommand('getAppName').then(validateString);
  }

  /**
   * Returns promise of LiveryPlayer customer id.
   *
   * @deprecated Instead use {@link subscribeConfig}.customerId
   */
  getCustomerId() {
    return this.sendCommand('getCustomerId').then(validateString);
  }

  /**
   * Returns promise of LiveryPlayer Pinpoint analytics endpoint id.
   */
  getEndpointId() {
    return this.sendCommand('getEndpointId').then(validateString);
  }

  /**
   * Returns promise of a registry of features supported by the player in general and under given circumstances.
   */
  getFeatures() {
    return this.sendCommand('getFeatures').then(validateFeatures);
  }

  /**
   * Returns promise of current LiveryPlayer latency in seconds.
   *
   * @deprecated Instead use {@link getPlayback}.latency
   */
  getLatency() {
    return this.sendCommand('getLatency').then(validateNumber);
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
  getLiveryParams() {
    return this.sendCommand('getLiveryParams').then(validateLiveryParams);
  }

  /**
   * Returns promise of current playback details, i.e: values that are continuously changing.
   */
  getPlayback() {
    return this.sendCommand('getPlayback').then(validatePlaybackDetails);
  }

  /**
   * Returns promise of LiveryPlayer version.
   */
  getPlayerVersion() {
    return this.sendCommand('getPlayerVersion').then(validateString);
  }

  /**
   * Returns promise of LiveryPlayer stream id.
   */
  getStreamId() {
    return this.sendCommand('getStreamId').then(validateString);
  }

  /**
   * Pauses playback.
   */
  pause() {
    return this.sendCommand('pause');
  }

  /**
   * Attempt to start or resume playback.
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
   * Reloads LiveryPlayer, e.g: to try to recover from an error.
   */
  reload() {
    return this.sendCommand('reload');
  }

  /**
   * Seek to specified `position` in seconds since start of stream/VOD.
   */
  seek(position: number) {
    return this.sendCommand('seek', position);
  }

  /**
   * Select quality at specified index of subscribeQualities() list or -1 to use ABR.
   */
  selectQuality(index: number) {
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
   * Change disabled to true to disable all default player controls and implement your own instead.
   */
  setControlsDisabled(disabled: boolean) {
    return this.sendCommand('setControlsDisabled', disabled);
  }

  /**
   * Attempt to change `display` mode to specified value.
   */
  setDisplay(display: DisplayMode) {
    return this.sendCommand('setDisplay', display);
  }

  /**
   * Attempt to change `muted` state to specified value.
   */
  setMuted(muted: boolean) {
    return this.sendCommand('setMuted', muted);
  }

  /**
   * Uses LiveryPlayer's Sentry API to submit user feedback.
   */
  submitUserFeedback(userFeedback: UserFeedback) {
    return this.sendCommand('submitUserFeedback', userFeedback);
  }

  /**
   * Returns promise of Livery stream config
   * and calls back `listener` with server side updates or when streamId is changed.
   */
  subscribeConfig(listener: (value?: Config) => void) {
    return this.sendCommand('subscribeConfig', undefined, (value) =>
      listener(validateConfig(value)),
    ).then(validateConfig);
  }

  /**
   * Returns promise of current display mode
   * and calls back `listener` with any subsequent display mode changes.
   */
  subscribeDisplay(listener: (value: DisplayMode) => void) {
    return this.sendCommand('subscribeDisplay', undefined, (value) =>
      listener(validateDisplayMode(value)),
    ).then(validateDisplayMode);
  }

  /**
   * Returns promise of current LiveryPlayer error message or undefined
   * and calls back `listener` with any subsequent errors.
   */
  subscribeError(listener: (value: string | undefined) => void) {
    return this.sendCommand('subscribeError', undefined, (value) =>
      listener(validateStringOrUndefined(value)),
    ).then(validateStringOrUndefined);
  }

  /**
   * Returns promise of current LiveryPlayer fullscreen state
   * and calls back `listener` with any subsequent state changes.
   *
   * @deprecated Instead use {@link subscribeDisplay}.display value "FULLSCREEN"
   */
  subscribeFullscreen(listener: (value: boolean) => void) {
    return this.sendCommand('subscribeFullscreen', undefined, (value) =>
      listener(validateBoolean(value)),
    ).then(validateBoolean);
  }

  /**
   * Returns promise of current mode of playback, e.g. how to buffer, sync, adapt quality, manage stalls, etc.
   * and calls back `listener` with any subsequent mode changes.
   */
  subscribeMode(listener: (mode: PlaybackMode) => void) {
    return this.sendCommand('subscribeMode', undefined, (mode) =>
      listener(validatePlaybackMode(mode)),
    ).then((mode) => validatePlaybackMode(mode));
  }

  /**
   * Returns promise of current LiveryPlayer muted state
   * and calls back `listener` with any subsequent muted changes.
   */
  subscribeMuted(listener: (muted: boolean) => void) {
    return this.sendCommand('subscribeMuted', undefined, (value) =>
      listener(validateBoolean(value)),
    ).then(validateBoolean);
  }

  /**
   * Returns promise of current LiveryPlayer window orientation (`'landscape' \| 'portrait'`)
   * and calls back `listener` with any subsequent orientations.
   *
   * @deprecated Will be removed in the next major version.
   */
  subscribeOrientation(listener: (value: Orientation) => void) {
    return this.sendCommand('subscribeOrientation', undefined, (value) =>
      listener(validateOrientation(value)),
    ).then(validateOrientation);
  }

  /**
   * Returns promise of current playback paused state
   * and calls back `listener` with any subsequent paused state updates.
   */
  async subscribePaused(listener: (value: boolean) => void) {
    return reducedSubscribe<PlaybackState, boolean>(
      (unreducedListener) => this.subscribePlaybackState(unreducedListener),
      (value) => ['ENDED', 'PAUSED'].includes(value),
      listener,
    );
  }

  /**
   * Returns promise of current LiveryPlayer playback state
   * and calls back `listener` with any subsequent state updates.
   */
  subscribePlaybackState(listener: (value: PlaybackState) => void) {
    return this.sendCommand('subscribePlaybackState', undefined, (value) =>
      listener(validatePlaybackState(value)),
    ).then(validatePlaybackState);
  }

  /**
   * Returns promise of current playback playing state
   * and calls back `listener` with any subsequent playing state updates.
   */
  async subscribePlaying(listener: (value: boolean) => void) {
    return reducedSubscribe<PlaybackState, boolean>(
      (unreducedListener) => this.subscribePlaybackState(unreducedListener),
      (value) =>
        ['FAST_FORWARD', 'PLAYING', 'REWIND', 'SLOW_MO'].includes(value),
      listener,
    );
  }

  /**
   * Returns promise of current LiveryPlayer playback qualities
   * and calls back `listener` with any subsequent qualities changes.
   */
  subscribeQualities(listener: (value?: Qualities) => void) {
    return this.sendCommand('subscribeQualities', undefined, (value) =>
      listener(validateQualities(value)),
    ).then(validateQualities);
  }

  /**
   * Returns promise of current LiveryPlayer playback quality
   * and calls back `listener` with any subsequent quality changes.
   *
   * @deprecated Instead use {@link subscribeQualities}.active
   */
  subscribeQuality(listener: (value: string) => void) {
    return this.sendCommand('subscribeQuality', undefined, (value) =>
      listener(validateString(value)),
    ).then(validateString);
  }

  /**
   * Returns promise of current playback stalled state
   * and calls back `listener` with any subsequent stalled state updates.
   */
  async subscribeStalled(listener: (value: boolean) => void) {
    return reducedSubscribe<PlaybackState, boolean>(
      (unreducedListener) => this.subscribePlaybackState(unreducedListener),
      (value) => ['BUFFERING, SEEKING'].includes(value),
      listener,
    );
  }

  /**
   * Returns promise of current LiveryPlayer stream phase (`'PRE' \| 'LIVE' \| 'POST'`)
   * and calls back `listener` with any subsequent phases.
   *
   * @deprecated Instead use {@link subscribeConfig}.streamPhase
   */
  subscribeStreamPhase(listener: (phase: StreamPhase) => void) {
    return this.sendCommand('subscribeStreamPhase', undefined, (value) =>
      listener(validateStreamPhase(value)),
    ).then(validateStreamPhase);
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
