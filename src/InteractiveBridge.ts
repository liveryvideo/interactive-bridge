import { LiveryBridge } from './LiveryBridge';

export type Orientation = 'landscape' | 'portrait';

export type StreamPhase = 'LIVE' | 'POST' | 'PRE';

/**
 * Can be used on Livery interactive layer pages to communicate with the surrounding Livery Player.
 */
export class InteractiveBridge extends LiveryBridge {
  /**
   * Constructs InteractiveBridge with `window.parent` as target window and with specified target origin.
   */
  constructor(targetOrigin: string) {
    super(window.parent, targetOrigin);
  }

  /**
   * Returns promise of LiveryPlayer application name.
   */
  public getAppName() {
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
  public getCustomerId() {
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
  public getEndpointId() {
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
   * Returns promise of current LiveryPlayer latency in seconds.
   */
  public getLatency() {
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
   * Returns promise of LiveryPlayer version.
   */
  public getPlayerVersion() {
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
  public getStreamId() {
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
   * Register `handler` function to be called with `arg` and `listener` when `sendCustomCommand()` is called on
   * other side with matching `name`.
   *
   * @deprecated Will be removed in the next major version. Use `registerPlayerCommand()` instead.
   */
  public registerCustomCommand(
    name: string,
    handler: (arg: unknown, listener: (value: unknown) => void) => unknown,
  ) {
    return super.registerCustomCommand(name, handler);
  }

  /**
   * Register `handler` function to be called with `arg` and `listener` when `sendInteractiveCommand()` is called
   * from the livery-player side with matching `name`.
   */
  public registerInteractiveCommand(
    name: string,
    handler: (arg: unknown, listener: (value: unknown) => void) => unknown,
  ) {
    super.registerCustomCommand(name, handler);
  }

  /**
   * Returns promise of value returned by other side's custom command handler with matching `name` that is passed `arg`.
   * Any `handler` `listener` calls will subsequently also be bridged to this `listener` callback.
   *
   * @deprecated Will be removed in the next major version. Use `sendPlayerCommand()` instead.
   */
  public sendCustomCommand<T>(
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
  public sendPlayerCommand<T>(
    name: string,
    arg?: unknown,
    listener?: (value: T) => void,
  ) {
    return this.sendCustomCommand(name, arg, listener);
  }

  /**
   * Returns promise of current LiveryPlayer fullscreen state
   * and calls back `listener` with any subsequent state changes.
   */
  public subscribeFullscreen(listener: (value: boolean) => void) {
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
   * Returns promise of current LiveryPlayer window orientation (`'landscape' \| 'portrait'`)
   * and calls back `listener` with any subsequent orientations.
   */
  public subscribeOrientation(listener: (orientation: Orientation) => void) {
    function validate(value: unknown) {
      if (value !== 'landscape' && value !== 'portrait') {
        const strValue = JSON.stringify(value);
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
   * Returns promise of current LiveryPlayer playback quality
   * and calls back `listener` with any subsequent quality changes.
   */
  public subscribeQuality(listener: (value: string) => void) {
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
   * Returns promise of current LiveryPlayer stream phase (`'PRE' \| 'LIVE' \| 'POST'`)
   * and calls back `listener` with any subsequent phases.
   */
  public subscribeStreamPhase(listener: (phase: StreamPhase) => void) {
    function validate(value: unknown) {
      if (value !== 'LIVE' && value !== 'POST' && value !== 'PRE') {
        const strValue = JSON.stringify(value);
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
  public unregisterCustomCommand(name: string) {
    super.unregisterCustomCommand(name);
  }

  /**
   * Unregister custom interactive command by name.
   */
  public unregisterInteractiveCommand(name: string) {
    return super.unregisterCustomCommand(name);
  }
}
