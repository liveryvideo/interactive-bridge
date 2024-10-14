import { LiveryBridge } from './LiveryBridge.ts';
import { reducedSubscribe } from './util/reducedSubscribe.ts';
import type {
  AuthClaims,
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
} from './util/schema.ts';
import {
  validateBoolean,
  validateDisplayMode,
  validateInteractivePlayerOptions,
  validateNumber,
  validateUserFeedback,
} from './util/schema.ts';

// Not supported by TypeScript for strict reasons, but this should be fine here
// https://github.com/microsoft/TypeScript/issues/36275
function narrowIncludes<T extends string>(
  names: readonly T[],
  name: string,
): name is T {
  return (names as unknown as string[]).includes(name);
}

/**
 * Abstract player bridge class which implements part of the player side API based on browser logic
 * and defines abstract methods to be implemented to complete support for all InteractiveBridge commands.
 */
export abstract class AbstractPlayerBridge extends LiveryBridge {
  protected abstract config: Config;

  protected portraitQuery = window.matchMedia('(orientation: portrait)');

  /**
   * Authenticate user in interactive layer with specified token or claims,
   * or logout the user by passing an `undefined` value.
   *
   * @param tokenOrClaims - JWT token string or claims to authenticate with or undefined to logout
   */
  authenticate(tokenOrClaims?: AuthClaims | string) {
    return this.sendCommand('authenticate', tokenOrClaims);
  }

  /**
   * Returns promise of options from interactive layer for the player.
   * Or default options if the interactive bridge doesn't support this/these yet.
   *
   * Note: In the future this could also pass options from player to the interactive layer.
   *
   * @deprecated In the next major version options passing should be integrated into the LiveryBridge handshake.
   */
  options() {
    return this.sendCommand('options').then(
      (value) => validateInteractivePlayerOptions(value),
      () => validateInteractivePlayerOptions(undefined),
    );
  }

  /**
   * Register `handler` function to be called with `arg` and `listener` when `sendPlayerCommand()` is called
   * from the interactive layer side with matching `name`.
   */
  registerPlayerCommand(
    name: string,
    handler: (arg: unknown, listener: (value: unknown) => void) => unknown,
  ) {
    this.registerCustomCommand(name, handler);
  }

  /**
   * Returns promise of value returned by the interactive layer's custom command handler with matching `name` that is passed `arg`.
   * Any `handler` `listener` calls will subsequently also be bridged to this `listener` callback.
   */
  sendInteractiveCommand(
    name: string,
    arg?: unknown,
    listener?: (value: unknown) => void,
  ) {
    return this.sendCustomCommand(name, arg, listener);
  }

  /**
   * Unregister custom interactive command by name.
   */
  unregisterPlayerCommand(name: string) {
    return this.unregisterCustomCommand(name);
  }

  protected abstract getEndpointId(): string;

  protected abstract getFeatures(): Features;

  protected abstract getPlayback(): PlaybackDetails;

  protected abstract getPlayerVersion(): string;

  protected abstract getStreamId(): string;

  protected override handleCommand(
    name: string,
    arg: unknown,
    listener: (value: unknown) => void,
  ) {
    const simpleMethods = [
      'getAppName',
      'getCustomerId',
      'getEndpointId',
      'getFeatures',
      'getLatency',
      'getLiveryParams',
      'getPlayback',
      'getPlayerVersion',
      'getStreamId',
      'pause',
      'play',
      'reload',
    ] as const;
    if (narrowIncludes(simpleMethods, name)) {
      return this[name]();
    }

    if (name === 'seek') {
      return this.seek(validateNumber(arg));
    }
    if (name === 'selectQuality') {
      return this.selectQuality(validateNumber(arg));
    }
    if (name === 'setDisplay') {
      return this.setDisplay(validateDisplayMode(arg));
    }
    if (name === 'setMuted') {
      return this.setMuted(validateBoolean(arg));
    }
    if (name === 'setVolume') {
      return this.setVolume(validateNumber(arg));
    }
    if (name === 'submitUserFeedback') {
      return this.submitUserFeedback(validateUserFeedback(arg));
    }

    const subscribeMethods = [
      'subscribeConfig',
      'subscribeDisplay',
      'subscribeError',
      'subscribeFullscreen',
      'subscribeMode',
      'subscribeOrientation',
      'subscribePlaybackState',
      'subscribeQualities',
      'subscribeQuality',
      'subscribeStreamPhase',
      'subscribeVolume',
    ] as const;
    if (narrowIncludes(subscribeMethods, name)) {
      return this[name](listener);
    }

    return super.handleCommand(name, arg, listener);
  }

  protected abstract pause(): void;

  protected abstract play(): void;

  protected abstract reload(): void;

  protected abstract seek(position: number): void;

  protected abstract selectQuality(index: number): void;

  protected abstract setDisplay(display: DisplayMode): void;

  protected abstract setMuted(muted: boolean): void;

  protected abstract setVolume(volume: number): void;

  protected abstract submitUserFeedback(value: UserFeedback): void;

  protected abstract subscribeConfig(listener: (value: Config) => void): Config;

  protected abstract subscribeDisplay(
    listener: (display: DisplayMode) => void,
  ): DisplayMode;

  protected abstract subscribeError(
    listener: (error: string | undefined) => void,
  ): string | undefined;

  protected abstract subscribeMode(
    listener: (mode: PlaybackMode) => void,
  ): PlaybackMode;

  protected abstract subscribePlaybackState(
    listener: (playbackState: PlaybackState) => void,
  ): PlaybackState;

  protected abstract subscribeQualities(
    listener: (qualities: Qualities) => void,
  ): Qualities;

  protected abstract subscribeVolume(
    listener: (volume: Volume) => void,
  ): Volume;

  private getAppName() {
    return window.location.hostname;
  }

  /**
   * @deprecated Instead use {@link subscribeConfig}.customerId
   */
  private getCustomerId() {
    return this.config.customerId;
  }

  /**
   * @deprecated Instead use {@link getPlayback}.latency
   */
  private getLatency() {
    return this.getPlayback().latency;
  }

  private getLiveryParams(queryString = window.location.search) {
    const urlParams = new URLSearchParams(queryString);
    const result: Record<string, string> = {};
    for (const [name, value] of urlParams.entries()) {
      if (name.startsWith('livery_')) {
        const key = name.substring(7);
        result[key] = result[key] ?? value;
      }
    }
    return result;
  }

  /**
   * @deprecated Instead compare {@link subscribeDisplay} value to 'FULLSCREEN'
   */
  private subscribeFullscreen(listener: (value: boolean) => void) {
    return reducedSubscribe<DisplayMode, boolean>(
      (unreducedListener) => this.subscribeDisplay(unreducedListener),
      (display) => display === 'FULLSCREEN',
      listener,
    );
  }

  /**
   * @deprecated Will be removed in the next major version.
   */
  private subscribeOrientation(listener: (value: Orientation) => void) {
    // Prior to Safari 14, MediaQueryList is based on EventTarget, so you must use addListener()
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList/addListener
    if (this.portraitQuery.addEventListener === undefined) {
      // For backwards compatibility
      this.portraitQuery.addListener((event) => {
        listener(event.matches ? 'portrait' : 'landscape');
      });
    } else {
      this.portraitQuery.addEventListener('change', (event) => {
        listener(event.matches ? 'portrait' : 'landscape');
      });
    }

    return this.portraitQuery.matches ? 'portrait' : 'landscape';
  }

  /**
   * @deprecated Instead use {@link subscribeQualities}.active to get the active quality index
   * and use the index to get the active quality label from {@link subscribQualities}.list
   */
  private subscribeQuality(listener: (quality: string) => void) {
    return reducedSubscribe<Qualities, string>(
      (unreducedListener) => this.subscribeQualities(unreducedListener),
      (value) => value.list[value.active]?.label ?? '',
      listener,
    );
  }

  /**
   * @deprecated Instead use {@link subscribeConfig}.streamPhase
   */
  private subscribeStreamPhase(listener: (streamPhase: StreamPhase) => void) {
    return reducedSubscribe<Config, StreamPhase>(
      (unreducedListener) => this.subscribeConfig(unreducedListener),
      (config) => config.streamPhase,
      listener,
    );
  }
}
