import type { AbstractPlayerBridge } from './AbstractPlayerBridge';
import { CommandFactory } from './CommandFactory/CommandFactory';
import { InteractiveLiveryBridge } from './InteractiveBridge';
import type { Controls } from './Parser/ControlsParser';
import type { Feature } from './Parser/FeaturesParser';
import type { Orientation } from './Parser/OrientationParser';
import type { PlaybackMode } from './Parser/PlaybackModeParser';
import type { PlaybackState } from './Parser/PlaybackStateParser';
import type { Quality } from './Parser/QualitiesParser';
import type { StreamPhase } from './Parser/StreamPhaseParser';
import type { StreamPhaseTimeline } from './Parser/StreamPhaseTimelineParser';
import type { Command } from './types';

export type { Control, Controls } from './Parser/ControlsParser';
export type { Feature } from './Parser/FeaturesParser';
export type { Orientation } from './Parser/OrientationParser';
export type { PlaybackMode } from './Parser/PlaybackModeParser';
export type { PlaybackDetails } from './Parser/PlaybackParser';
export type { PlaybackState } from './Parser/PlaybackStateParser';
export type { Quality } from './Parser/QualitiesParser';
export type { StreamPhase } from './Parser/StreamPhaseParser';
export type { StreamPhaseTimeline } from './Parser/StreamPhaseTimelineParser';

/**
 * Can be used on Livery interactive layer pages to communicate with the surrounding Livery Player.
 */
export class InteractiveBridgeFacade {
  get handshakePromise() {
    return this.bridge.handshakePromise;
  }

  private bridge: InteractiveLiveryBridge;

  private commandFactory = new CommandFactory();

  /**
   * Constructs `InteractiveBridge` with specified `target: AbstractPlayerBridge` (i.e: `PlayerBridge`)
   * or with `window.parent` as target window and with specified `target: string` as origin.
   */
  constructor(
    target: AbstractPlayerBridge | string,
    options: {
      ownWindow?: Window;
    } = {},
  ) {
    this.bridge = new InteractiveLiveryBridge(target, options);
  }

  /**
   * Returns promise of LiveryPlayer application name.
   */
  getAppName() {
    const command = this.commandFactory.makeCommand('getAppName');
    return this.sendCommandObject(command);
  }

  /**
   * Returns promise of LiveryPlayer customer id.
   */
  getCustomerId() {
    const command = this.commandFactory.makeCommand('getCustomerId');
    return this.sendCommandObject(command);
  }

  /**
   * Returns promise of LiveryPlayer Pinpoint analytics endpoint id.
   */
  getEndpointId() {
    const command = this.commandFactory.makeCommand('getEndpointId');
    return this.sendCommandObject(command);
  }

  /**
   * Returns a list of features supported by the LiveryPlayer.
   * The list will be sanitized such that each entry will be unique
   * and unrecognized entries will be disregarded.
   */
  getFeatures() {
    const command = this.commandFactory.makeCommand<Feature[]>('getFeatures');
    return this.sendCommandObject(command);
  }

  /**
   * Returns promise of current LiveryPlayer latency in seconds.
   */
  getLatency() {
    const command = this.commandFactory.makeCommand('getLatency');
    return this.sendCommandObject(command);
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
    const command =
      this.commandFactory.makeCommand<Record<string, string>>(
        'getLiveryParams',
      );
    return this.sendCommandObject(command);
  }

  /**
   * Returns current playback:
   *  - buffer in seconds ahead of current position
   *  - duration in seconds from start to end of VOD or live stream (e.g: continuously increasing)
   *  - position in seconds since start of stream
   */
  getPlayback() {
    const command = this.commandFactory.makeCommand('getPlayback');
    return this.sendCommandObject(command);
  }

  /**
   * Returns promise of LiveryPlayer version.
   */
  getPlayerVersion() {
    const command = this.commandFactory.makeCommand('getPlayerVersion');
    return this.sendCommandObject(command);
  }

  /**
   * Returns promise of LiveryPlayer stream id.
   */
  getStreamId() {
    const command = this.commandFactory.makeCommand('getStreamId');
    return this.sendCommandObject(command);
  }

  /**
   *
   */
  pause() {
    const command = this.commandFactory.makeCommand<void>('pause');
    return this.sendCommandObject(command);
  }

  /**
   * Can require direct user interaction
   * If starting unmuted playback fails this will fall back to muted playback
   * and notify subscribeUnmuteRequiresInteraction listeners.
   */
  play() {
    const command = this.commandFactory.makeCommand<void>('play');
    return this.sendCommandObject(command);
  }

  /**
   * Register `handler` function to be called with `arg` and `listener` when `sendCustomCommand()` is called on
   * other side with matching `name`.
   *
   * @deprecated Will be removed in the next major version. Use `registerPlayerCommand()` instead.
   */
  registerCustomCommand(
    name: string,
    handler: (arg: unknown, listener: (value: unknown) => void) => unknown,
  ) {
    return this.bridge.registerCustomCommand(name, handler);
  }

  /**
   * Register `handler` function to be called with `arg` and `listener` when `sendInteractiveCommand()` is called
   * from the livery-player side with matching `name`.
   */
  registerInteractiveCommand(
    name: string,
    handler: (arg: unknown, listener: (value: unknown) => void) => unknown,
  ) {
    return this.bridge.registerCustomCommand(name, handler);
  }

  /**
   * Reloads player, e.g: to try to recover from an error
   */
  reload() {
    const command = this.commandFactory.makeCommand<void>('reload');
    return this.sendCommandObject(command);
  }

  /**
   *
   * Seek to specified position in seconds since start of stream/vod
   * If position is not within a LIVE stream phase period this will return an error
   */
  seek(position: number) {
    const command = this.commandFactory.makeCommand<void>('seek', {
      arg: position,
    });
    return this.sendCommandObject(command);
  }

  /**
   * Select index of quality to play, or -1 to use ABR
   */
  selectQuality(index: number) {
    const command = this.commandFactory.makeCommand<void>('selectQuality', {
      arg: index,
    });
    return this.sendCommandObject(command);
  }

  sendCommandObject<T>(command: Command<T>) {
    return this.bridge
      .sendCommand(command.name, command.arg, command.listener, command.custom)
      .then((value) => command.parser.parse(value));
  }

  /**
   * Returns promise of value returned by other side's custom command handler with matching `name` that is passed `arg`.
   * Any `handler` `listener` calls will subsequently also be bridged to this `listener` callback.
   *
   * @deprecated Will be removed in the next major version. Use `sendPlayerCommand()` instead.
   */
  sendCustomCommand<T>(
    name: string,
    arg?: unknown,
    listener?: (value: T) => void,
  ) {
    return this.bridge.sendPlayerCommand(name, arg, listener);
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
    return this.bridge.sendPlayerCommand(name, arg, listener);
  }

  /**
   *
   */
  setAirplay(active: boolean) {
    const command = this.commandFactory.makeCommand<void>('setAirplay', {
      arg: active,
    });
    return this.sendCommandObject(command);
  }

  /**
   *
   */
  setChromecast(active: boolean) {
    const command = this.commandFactory.makeCommand<void>('setChromecast', {
      arg: active,
    });
    return this.sendCommandObject(command);
  }

  /**
   * Can require direct user interaction
   */
  setFullscreen(active: boolean) {
    const command = this.commandFactory.makeCommand<void>('setFullscreen', {
      arg: active,
    });
    return this.sendCommandObject(command);
  }

  /**
   * Can require direct user interaction
   */
  setMuted(muted: boolean) {
    const command = this.commandFactory.makeCommand<void>('setMuted', {
      arg: muted,
    });
    return this.sendCommandObject(command);
  }

  /**
   * Can require direct user interaction
   */
  setPictureInPicture(active: boolean) {
    const command = this.commandFactory.makeCommand<void>(
      'setPictureInPicture',
      { arg: active },
    );
    return this.sendCommandObject(command);
  }

  /**
   *
   */
  submitUserFeedback(feedback: {
    comments: string;
    email: string;
    name: string;
  }) {
    const command = this.commandFactory.makeCommand('submitUserFeedback', {
      arg: feedback,
    });
    return this.sendCommandObject(command);
  }

  /**
   * Returns true when Airplay is being used, false otherwise
   */
  subscribeAirplay(listener: (value: boolean) => void) {
    const command = this.commandFactory.makeCommand<boolean>(
      'subscribeAirplay',
      { listener },
    );
    return this.sendCommandObject(command);
  }

  /**
   * Returns name of device that is being cast to or undefined
   */
  subscribeChromecast(listener: (value: string | undefined) => void) {
    const command = this.commandFactory.makeCommand<string | undefined>(
      'subscribeChromecast',
      { listener },
    );
    return this.sendCommandObject(command);
  }

  /**
   * Where Controls is an object with boolean properties:
   * cast, contact, error, fullscreen, mute, pip, play, quality, scrubber
   */
  subscribeControls(listener: (value: Controls) => void) {
    const command = this.commandFactory.makeCommand<Controls>(
      'subscribeControls',
      { listener },
    );
    return this.sendCommandObject(command);
  }

  /**
   * Current player error message or undefined if none
   */
  subscribeError(listener: (value: string | undefined) => void) {
    const command = this.commandFactory.makeCommand<string | undefined>(
      'subscribeError',
      { listener },
    );
    return this.sendCommandObject(command);
  }

  /**
   * Returns promise of current LiveryPlayer fullscreen state
   * and calls back `listener` with any subsequent state changes.
   */
  subscribeFullscreen(listener: (value: boolean) => void) {
    const command = this.commandFactory.makeCommand('subscribeFullscreen', {
      listener,
    });
    return this.sendCommandObject(command);
  }

  subscribeMuted(listener: (value: boolean) => void) {
    const command = this.commandFactory.makeCommand<boolean>('subscribeMuted', {
      listener,
    });
    return this.sendCommandObject(command);
  }

  /**
   * Returns promise of current LiveryPlayer window orientation (`'landscape' \| 'portrait'`)
   * and calls back `listener` with any subsequent orientations.
   */
  subscribeOrientation(listener: (orientation: Orientation) => void) {
    const command = this.commandFactory.makeCommand('subscribeOrientation', {
      listener,
    });
    return this.sendCommandObject(command);
  }

  subscribePictureInPicture(listener: (value: boolean) => void) {
    const command = this.commandFactory.makeCommand<boolean>(
      'subscribePictureInPicture',
      { listener },
    );
    return this.sendCommandObject(command);
  }

  /**
   * Returns current mode of playback, e.g: buffering, syncing, ABR, stall management, etc.
   */
  subscribePlaybackMode(listener: (value: PlaybackMode) => void) {
    const command = this.commandFactory.makeCommand<PlaybackMode>(
      'subscribePlaybackMode',
      { listener },
    );
    return this.sendCommandObject(command);
  }

  /**
   * Stalled (loading) states are: 'BUFFERING', 'SEEKING'
   * Paused states are: 'ENDED', 'PAUSED'
   * Playing states are: 'FAST_FORWARD', 'PLAYING', 'REWIND', 'SLOW_MO'
   * Though practically we only use 'PLAYING' for now
   */
  subscribePlaybackState(listener: (value: PlaybackState) => void) {
    const command = this.commandFactory.makeCommand<PlaybackState>(
      'subscribePlaybackState',
      { listener },
    );
    return this.sendCommandObject(command);
  }

  /**
   * Note that the existing subscribeQuality method only returns the label
   * of the current playback quality. Assuming that that should be unique
   * I think it will already suffice to create a qualities list that shows
   * the currently active quality. Otherwise we’ll have to also add a
   * subscribeQualityIndex method or so that returns the index of the quality
   * in the list of qualities returned by subscribeQualities.
   */
  subscribeQualities(listener: (value: Quality[]) => void) {
    const command = this.commandFactory.makeCommand('subscribeQualities', {
      listener,
    });
    return this.sendCommandObject(command);
  }

  /**
   * Returns promise of current LiveryPlayer playback quality
   * and calls back `listener` with any subsequent quality changes.
   */
  subscribeQuality(listener: (value: string) => void) {
    const command = this.commandFactory.makeCommand('subscribeQuality', {
      listener,
    });
    return this.sendCommandObject(command);
  }

  /**
   * Returns promise of current LiveryPlayer stream phase (`'PRE' \| 'LIVE' \| 'POST'`)
   * and calls back `listener` with any subsequent phases.
   */
  subscribeStreamPhase(listener: (phase: StreamPhase) => void) {
    const command = this.commandFactory.makeCommand('subscribeStreamPhase', {
      listener,
    });
    return this.sendCommandObject(command);
  }

  /**
   * This indicates the LIVE periods of the stream that can be seeked to
   * I.e: from the start of LIVE timestamp to the first non-LIVE timestamp
   */
  subscribeStreamPhaseTimeline(listener: (value: StreamPhaseTimeline) => void) {
    const command = this.commandFactory.makeCommand<StreamPhaseTimeline>(
      'subscribeStreamPhaseTimeline',
      { listener },
    );
    return this.sendCommandObject(command);
  }

  /**
   *
   * If true then unmuting playback requires user interaction,
   * e.g: setMuted() should be called directly from a 'click' event listener.
   * In this case the web player currently shows a special unmute button
   * to highlight this fact to users and facilitate unmuting.
   */
  subscribeUnmuteRequiresInteraction(listener: (value: boolean) => void) {
    const command = this.commandFactory.makeCommand<boolean>(
      'subscribeUnmuteRequiresInteraction',
      { listener },
    );
    return this.sendCommandObject(command);
  }

  /**
   * Unregister custom command by name.
   *
   * @deprecated Will be removed in the next major version. Use `unregisterInteractiveCommand()` instead.
   */
  unregisterCustomCommand(name: string) {
    this.bridge.unregisterInteractiveCommand(name);
  }

  /**
   * Unregister custom interactive command by name.
   */
  unregisterInteractiveCommand(name: string) {
    return this.bridge.unregisterInteractiveCommand(name);
  }
}
