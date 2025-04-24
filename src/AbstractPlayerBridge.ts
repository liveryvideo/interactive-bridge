import { LiveryBridge } from './LiveryBridge.ts';
import type {
  AuthClaims,
  Config,
  DisplayMode,
  Features,
  PlaybackDetails,
  PlaybackMode,
  PlaybackState,
  Qualities,
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

/**
 * Abstract player bridge class which implements part of the player side API based on browser logic
 * and defines abstract methods to be implemented to complete support for all InteractiveBridge commands.
 */
export abstract class AbstractPlayerBridge extends LiveryBridge {
  protected abstract config: Config;

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
   * TODO: Integrate options passing into LiveryBridge handshake
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
      'getEndpointId',
      'getFeatures',
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
      'subscribeMode',
      'subscribePlaybackState',
      'subscribeQualities',
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
}

// Not supported by TypeScript for strict reasons, but this should be fine here
// https://github.com/microsoft/TypeScript/issues/36275
function narrowIncludes<T extends string>(
  names: readonly T[],
  name: string,
): name is T {
  return (names as unknown as string[]).includes(name);
}
