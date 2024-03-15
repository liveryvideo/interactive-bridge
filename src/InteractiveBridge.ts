import type { AbstractPlayerBridge } from './AbstractPlayerBridge';
import { LiveryBridge } from './LiveryBridge';
import { reducedSubscribe } from './util/reducedSubscribe';
import type {
  AuthClaims,
  Config,
  DisplayMode,
  Orientation,
  PlaybackMode,
  PlaybackState,
  Qualities,
  StreamPhase,
  UserFeedback,
  Volume,
} from './util/schema';
import {
  validateAuth,
  validateBoolean,
  validateConfig,
  validateDisplayMode,
  validateFeatures,
  validateInteractivePlayerOptions,
  validateNumberOrNan,
  validateOrientation,
  validatePlaybackDetails,
  validatePlaybackMode,
  validatePlaybackState,
  validateQualities,
  validateStreamPhase,
  validateString,
  validateStringOrUndefined,
  validateStringParams,
  validateVolume,
} from './util/schema';

// Note: We have to explicitly define return types for our named union return types to result in nice linked types
// When one of our named object types is returned this is not necessary however

/**
 * Can be used by a Livery interactive layer element or page to communicate with the surrounding Livery Player.
 *
 * @example
 * ```js
 * import { InteractiveBridge } from '@liveryvideo/interactive-bridge';
 *
 * // The `playerBridge` will be provided to you as interactive element
 * // Or, as interactive page, to prevent cross site security issues:
 * // https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#security_concerns
 * // replace `'*'` by the origin of the page that the player is expected to be on
 * const bridge = new InteractiveBridge(playerBridge || '*');
 *
 * bridge.getAppName().then(appName => window.alert(`appName: ${appName}`));
 * ```
 */
export class InteractiveBridge extends LiveryBridge {
  private options: NonNullable<
    ConstructorParameters<typeof InteractiveBridge>[1]
  >;

  /**
   * Constructs `InteractiveBridge` with specified `target` player bridge
   * or with `window.parent` as target window and with specified string as origin.
   *
   * @param target - Player bridge or window origin to target
   * @param options - Options for this bridge and {@link InteractivePlayerOptions}
   */
  constructor(
    target: AbstractPlayerBridge | string,
    // !! This includes copies of all InteractivePlayerOptions from schema !!
    // Unfortunately TypeDoc does not properly support just referencing `& InteractivePlayerOptions`
    options: {
      /** True if default player controls should be disabled to use custom controls instead, false otherwise. */
      controlsDisabled?: boolean;
      /**
       * Handles authentication data coming from the player.
       *
       * @param tokenOrClaims - JWT token string or claims to authenticate with or undefined to logout
       */
      handleAuth?: (tokenOrClaims?: string | AuthClaims) => void;
    } = {},
  ) {
    if (typeof target === 'string') {
      super({ window: window.parent, origin: target });
    } else {
      super(target);
    }

    this.options = options;
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
  getFeatures() {
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
   *
   * - The prefix stripped from the names (snake_case will not be converted to camelCase)
   * - Parameter names and values URL decoded
   * - Empty string (not `null`) values for parameters without a value
   * - Only the first value of a repeated parameter (no multiple value array support)
   *
   * So given location.search: `'?foo&livery_foo%3Abar=hey+you&livery_no_val&livery_multi=1&livery_multi=2'`
   * this will return: `{ 'foo:bar': 'hey you', no_val: '', multi: '1' }`.
   */
  getLiveryParams() {
    return this.sendCommand('getLiveryParams').then(validateStringParams);
  }

  /**
   * Returns promise of current playback details, i.e: values that are continuously changing.
   */
  getPlayback() {
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
   * @deprecated Instead use {@link registerInteractiveCommand}
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
   *
   * @param name - Custom command name to listen to
   * @param handler - Function to handle those commands and whose value to return to it
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
   *
   * @param position - Position in seconds since start of stream/VOD to seek to
   */
  seek(position: number) {
    return this.sendCommand('seek', position);
  }

  /**
   * Select quality at specified index of {@link subscribeQualities}.list or -1 to use ABR.
   *
   * @param index - Index of quality to select
   */
  selectQuality(index: number) {
    return this.sendCommand('selectQuality', index);
  }

  /**
   * Returns promise of value returned by other side's custom command handler with matching `name` that is passed `arg`.
   * Any `handler` `listener` calls will subsequently also be bridged to this `listener` callback.
   *
   * @deprecated Instead use {@link sendPlayerCommand}
   */
  override sendCustomCommand(
    name: string,
    arg?: unknown,
    listener?: (value: unknown) => void,
  ) {
    return super.sendCustomCommand(name, arg, listener);
  }

  /**
   * Returns promise of value returned by the player's custom command handler with matching `name` that is passed `arg`.
   * Any `handler` `listener` calls will subsequently also be bridged to this `listener` callback.
   *
   * @param name - Name of custom command to send
   * @param arg - Optional argument to custom command to send
   * @param listener - Optional listener function to be called with custom command handler listener call values
   */
  sendPlayerCommand(
    name: string,
    arg?: unknown,
    listener?: (value: unknown) => void,
  ) {
    return super.sendCustomCommand(name, arg, listener);
  }

  /**
   * Attempt to change display mode to specified value.
   *
   * Can reject if not allowed by the browser, e.g: when not called directly from a click event listener.
   *
   * Requires related feature, i.e: {@link getFeatures}.airplay, chromecast or fullscreen.
   *
   * @param display - Display mode to attempt to change to
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
   *
   * @param muted - Muted state to attempt to change to
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
   *
   * Requires: {@link getFeatures}.volume.
   *
   * @param volume - Volume, between 0 and 1, to change to
   */
  setVolume(volume: number) {
    return this.sendCommand('setVolume', volume);
  }

  /**
   * Submit user feedback.
   *
   * Requires: {@link getFeatures}.contact.
   *
   * @param feedback - User feedback to submit
   */
  submitUserFeedback(feedback: UserFeedback) {
    return this.sendCommand('submitUserFeedback', feedback);
  }

  /**
   * Returns promise of Livery stream config
   * and calls back `listener` with server side updates or when streamId is changed.
   *
   * @param listener - Listener to call when value is changed
   */
  subscribeConfig(listener: (value: Config) => void) {
    return this.sendCommand('subscribeConfig', undefined, (value) =>
      listener(validateConfig(value)),
    ).then(validateConfig);
  }

  /**
   * Returns promise of current display mode
   * and calls back `listener` with any subsequent display mode changes.
   *
   * @param listener - Listener to call when value is changed
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
   *
   * @param listener - Listener to call when value is changed
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
   *
   * @param listener - Listener to call when value is changed
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
   *
   * @param listener - Listener to call when value is changed
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
   *
   * @param listener - Listener to call when value is changed
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
   *
   * @param listener - Listener to call when value is changed
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
   *
   * @param listener - Listener to call when value is changed
   */
  subscribeQualities(listener: (value: Qualities) => void) {
    return this.sendCommand('subscribeQualities', undefined, (value) =>
      listener(validateQualities(value)),
    ).then(validateQualities);
  }

  /**
   * Returns promise of current player stream quality
   * and calls back `listener` with any subsequent quality changes.
   *
   * @deprecated Instead use {@link subscribeQualities}.active
   *
   * @param listener - Listener to call when value is changed
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
   *
   * @param listener - Listener to call when value is changed
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
   *
   * @param listener - Listener to call when value is changed
   */
  subscribeVolume(listener: (volume: Volume) => void) {
    return this.sendCommand('subscribeVolume', undefined, (value) =>
      listener(validateVolume(value)),
    ).then(validateVolume);
  }

  /**
   * Unregister custom command by name.
   *
   * @deprecated Instead use {@link unregisterInteractiveCommand}
   */
  override unregisterCustomCommand(name: string) {
    super.unregisterCustomCommand(name);
  }

  /**
   * Unregister custom interactive command by name.
   *
   * @param name - Name of custom command handler to unregister
   */
  unregisterInteractiveCommand(name: string) {
    return super.unregisterCustomCommand(name);
  }

  protected override handleCommand(
    name: string,
    arg: unknown,
    listener: (value: unknown) => void,
  ) {
    if (name === 'authenticate') {
      return this.authenticate(validateAuth(arg));
    }
    /** @deprecated In the next major version options passing should be integrated into the LiveryBridge handshake. */
    if (name === 'options') {
      // Just return InteractivePlayerOptions, not handleAuth option
      return validateInteractivePlayerOptions(this.options);
    }
    return super.handleCommand(name, arg, listener);
  }

  private authenticate(tokenOrClaims?: string | AuthClaims) {
    if (!this.options.handleAuth) {
      throw new Error('handleAuth option undefined');
    }
    this.options.handleAuth(tokenOrClaims);
  }
}
