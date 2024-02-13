import type { AbstractPlayerBridge } from './AbstractPlayerBridge';
import { LiveryBridge } from './LiveryBridge';
import { reducedSubscribe } from './util/reducedSubscribe';
import type {
  Config,
  DisplayMode,
  Features,
  Orientation,
  PlaybackDetails,
  PlaybackMode,
  PlaybackState,
  Qualities,
  StreamPhase,
  UserFeedback,
  Volume,
} from './util/schema';
import {
  validateBoolean,
  validateConfig,
  validateDisplayMode,
  validateFeatures,
  validateLiveryParams,
  validateNumberOrNan,
  validateOrientation,
  validatePlaybackDetails,
  validatePlaybackMode,
  validatePlaybackState,
  validateQualities,
  validateStreamPhase,
  validateString,
  validateStringOrUndefined,
  validateVolume,
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
   * Constructs `InteractiveBridge` with specified `target` player bridge
   * or with `window.parent` as target window and with specified string as origin.
   */
  constructor(target: AbstractPlayerBridge | string) {
    if (typeof target === 'string') {
      super({ window: window.parent, origin: target });
    } else {
      super(target);
    }
  }

  /**
   * Returns promise of player application name.
   */
  getAppName() {
    return this.sendCommand('getAppName').then(validateString);
  }

  /**
   * Returns promise of player customer id.
   *
   * @deprecated Instead use {@link subscribeConfig}.customerId
   */
  getCustomerId() {
    return this.sendCommand('getCustomerId').then(validateString);
  }

  /**
   * Returns promise of player Pinpoint analytics endpoint id.
   */
  getEndpointId() {
    return this.sendCommand('getEndpointId').then(validateString);
  }

  /**
   * Returns promise of a registry of features supported by the player in general and under given circumstances.
   */
  getFeatures(): Promise<Features> {
    return this.sendCommand('getFeatures').then(validateFeatures);
  }

  /**
   * Returns promise of current player latency in seconds.
   *
   * @deprecated Instead use {@link getPlayback}.latency
   */
  getLatency() {
    return this.sendCommand('getLatency').then(validateNumberOrNan);
  }

  /**
   * Returns promise of an object of key-value string parameters from player.
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
  getPlayback(): Promise<PlaybackDetails> {
    return this.sendCommand('getPlayback').then(validatePlaybackDetails);
  }

  /**
   * Returns promise of player version.
   */
  getPlayerVersion() {
    return this.sendCommand('getPlayerVersion').then(validateString);
  }

  /**
   * Returns promise of player stream id.
   */
  getStreamId() {
    return this.sendCommand('getStreamId').then(validateString);
  }

  /**
   * Pause playback.
   */
  pause() {
    return this.sendCommand('pause');
  }

  /**
   * Attempt to start or resume playback.
   *
   * Can fail if not allowed by the browser, e.g: when not called directly from a click event listener.
   * In that case it can fall back to muted playback, changing {@link subscribeVolume}.muted to true.
   * Or if that also fails then {@link subscribePaused} will remain true.
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
   * from the player side with matching `name`.
   */
  registerInteractiveCommand(
    name: string,
    handler: (arg: unknown, listener: (value: unknown) => void) => unknown,
  ) {
    super.registerCustomCommand(name, handler);
  }

  /**
   * Reload player, e.g: to try to recover from an error.
   */
  reload() {
    return this.sendCommand('reload');
  }

  /**
   * Seek to specified `position` in seconds since start of stream/VOD.
   *
   * Where `position` needs to be within a `'LIVE'` interval of {@link subscribeConfig}.streamPhases
   * and the {@link getPlayback}.duration.
   *
   * Requires: {@link getFeatures}.scrubber.
   */
  seek(position: number) {
    return this.sendCommand('seek', position);
  }

  /**
   * Select quality at specified index of {@link subscribeQualities}.list or -1 to use ABR.
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
   * Returns promise of value returned by the player's custom command handler with matching `name` that is passed `arg`.
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
   * Change `disabled` to `true` to disable all default player controls and implement your own instead.
   */
  setControlsDisabled(disabled: boolean) {
    return this.sendCommand('setControlsDisabled', disabled);
  }

  /**
   * Attempt to change `display` mode to specified value.
   *
   * Can reject if not allowed by the browser, e.g: when not called directly from a click event listener.
   *
   * Requires related feature, i.e: {@link getFeatures}.airplay, chromecast or fullscreen.
   */
  setDisplay(display: DisplayMode) {
    return this.sendCommand('setDisplay', display);
  }

  /**
   * Attempt to change `muted` state to specified value.
   *
   * Unmuting can fail if not allowed by the browser, e.g: when not called directly from a click event listener.
   * The specified state is kept track of by the player though and respected on reload when possible.
   * Look at {@link subscribeVolume}.muted state to track actual unmuting.
   */
  setMuted(muted: boolean) {
    return this.sendCommand('setMuted', muted);
  }

  /**
   * Change `volume` to specified value.
   *
   * When a player starts unmuted at volume `0` and this is changed to a higher volume later,
   * that can be disallowed by the browser, e.g: when not called directly from a click event listener.
   * In that case the player will fall back to changing {@link subscribeVolume}.muted to `true`
   * to allow the volume change to persist.
   */
  setVolume(volume: number) {
    return this.sendCommand('setVolume', volume);
  }

  /**
   * Submit user feedback.
   *
   * Requires: {@link getFeatures}.contact.
   */
  submitUserFeedback(userFeedback: UserFeedback) {
    return this.sendCommand('submitUserFeedback', userFeedback);
  }

  /**
   * Returns promise of Livery stream config
   * and calls back `listener` with server side updates or when streamId is changed.
   */
  subscribeConfig(listener: (value?: Config) => void): Promise<Config> {
    return this.sendCommand('subscribeConfig', undefined, (value) =>
      listener(validateConfig(value)),
    ).then(validateConfig);
  }

  /**
   * Returns promise of current display mode
   * and calls back `listener` with any subsequent display mode changes.
   */
  subscribeDisplay(
    listener: (value: DisplayMode) => void,
  ): Promise<DisplayMode> {
    return this.sendCommand('subscribeDisplay', undefined, (value) =>
      listener(validateDisplayMode(value)),
    ).then(validateDisplayMode);
  }

  /**
   * Returns promise of current player error message or undefined
   * and calls back `listener` with any subsequent errors.
   */
  subscribeError(listener: (value: string | undefined) => void) {
    return this.sendCommand('subscribeError', undefined, (value) =>
      listener(validateStringOrUndefined(value)),
    ).then(validateStringOrUndefined);
  }

  /**
   * Returns promise of current player fullscreen state
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
  subscribeMode(listener: (mode: PlaybackMode) => void): Promise<PlaybackMode> {
    return this.sendCommand('subscribeMode', undefined, (mode) =>
      listener(validatePlaybackMode(mode)),
    ).then((mode) => validatePlaybackMode(mode));
  }

  /**
   * Returns promise of current player window orientation (`'landscape' \| 'portrait'`)
   * and calls back `listener` with any subsequent orientations.
   *
   * @deprecated Will be removed in the next major version.
   */
  subscribeOrientation(
    listener: (value: Orientation) => void,
  ): Promise<Orientation> {
    return this.sendCommand('subscribeOrientation', undefined, (value) =>
      listener(validateOrientation(value)),
    ).then(validateOrientation);
  }

  /**
   * Returns promise of current `paused` state and calls back `listener` with any subsequent `paused` state updates.
   *
   * Where `paused` is true if `playbackState` is `'PAUSED'` or `'ENDED'`.
   * I.e: Not playing as intended.
   */
  async subscribePaused(listener: (value: boolean) => void) {
    return reducedSubscribe<PlaybackState, boolean>(
      (unreducedListener) => this.subscribePlaybackState(unreducedListener),
      (value) => ['ENDED', 'PAUSED'].includes(value),
      listener,
    );
  }

  /**
   * Returns promise of current player playback state
   * and calls back `listener` with any subsequent state updates.
   */
  subscribePlaybackState(
    listener: (value: PlaybackState) => void,
  ): Promise<PlaybackState> {
    return this.sendCommand('subscribePlaybackState', undefined, (value) =>
      listener(validatePlaybackState(value)),
    ).then(validatePlaybackState);
  }

  /**
   * Returns promise of current `playing` state and calls back `listener` with any subsequent `playing` state updates.
   *
   * Where `playing` is true if `playbackState` is `'PLAYING'`, `'FAST_FORWARD'`, `'SLOW_MO'` or `'REWIND'`.
   * I.e: Playing as intended.
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
   * Returns promise of current player stream qualities
   * and calls back `listener` with any subsequent qualities changes.
   */
  subscribeQualities(
    listener: (value?: Qualities) => void,
  ): Promise<Qualities> {
    return this.sendCommand('subscribeQualities', undefined, (value) =>
      listener(validateQualities(value)),
    ).then(validateQualities);
  }

  /**
   * Returns promise of current player stream quality
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
   * Returns promise of current `stalled` state and calls back `listener` with any subsequent `stalled` state updates.
   *
   * Where `stalled` is true if `playbackState` is `'BUFFERING'` or `'SEEKING'`.
   * I.e: Not playing, but trying to.
   */
  async subscribeStalled(listener: (value: boolean) => void) {
    return reducedSubscribe<PlaybackState, boolean>(
      (unreducedListener) => this.subscribePlaybackState(unreducedListener),
      (value) => ['BUFFERING', 'SEEKING'].includes(value),
      listener,
    );
  }

  /**
   * Returns promise of current player stream phase (`'PRE' \| 'LIVE' \| 'POST'`)
   * and calls back `listener` with any subsequent phases.
   *
   * @deprecated Instead use {@link subscribeConfig}.streamPhase
   */
  subscribeStreamPhase(
    listener: (phase: StreamPhase) => void,
  ): Promise<StreamPhase> {
    return this.sendCommand('subscribeStreamPhase', undefined, (value) =>
      listener(validateStreamPhase(value)),
    ).then(validateStreamPhase);
  }

  /**
   * Returns promise of current player volume state
   * and calls back `listener` with any subsequent volume changes.
   */
  subscribeVolume(listener: (volume: Volume) => void) {
    return this.sendCommand('subscribeVolume', undefined, (value) =>
      listener(validateVolume(value)),
    ).then(validateVolume);
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
