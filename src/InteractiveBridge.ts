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
   * Register `handler` function to be called with `arg` and `listener` when `sendCustomCommand()` is called on
   * other side with matching `name`.
   *
   * @deprecated Will become a protected member in LiveryBridge.ts in the next major version. Use registerPlayerCommand() instead.
   */
  public registerCustomCommand(
    name: string,
    handler: (arg: unknown, listener: (value: unknown) => void) => unknown,
  ) {
    return super.registerCustomCommand(name, handler);
  }

  /**
   * Register `handler` function to be called with `arg` and `listener` when a custom interactive command is sent on
   * other side with matching `name`.
   */
  public registerInteractiveCommand(
    name: string,
    handler: (arg: unknown, listener: (value: unknown) => void) => unknown,
  ) {
    this.registerCustomCommand(name, handler);
  }

  /**
   * Returns promise of value returned by other side's custom command handler with matching `name` that is passed `arg`.
   * Any `handler` `listener` calls will subsequently also be bridged to this `listener` callback.
   *
   * @deprecated Will become a protected member in LiveryBridge.ts in the next major version. Use sendPlayerCommand() instead.
   */
  public sendCustomCommand<T>(
    name: string,
    arg?: unknown,
    listener?: (value: T) => void,
  ) {
    return super.sendCustomCommand(name, arg, listener);
  }

  /**
   * Returns promise of value returned by other side's custom interactive command handler with matching `name` that is passed `arg`.
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
   * Returns promise of current LiveryPlayer window orientation (`'landscape' \| 'portrait'`)
   * and calls back `listener` with any subsequent orientations.
   */
  public subscribeOrientation(
    listener: (orientation: Orientation) => void,
  ): Promise<Orientation> {
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
   * Returns promise of current LiveryPlayer stream phase (`'PRE' \| 'LIVE' \| 'POST'`)
   * and calls back `listener` with any subsequent phases.
   */
  public subscribeStreamPhase(
    listener: (phase: StreamPhase) => void,
  ): Promise<StreamPhase> {
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
   * @deprecated Will become a protected member in LiveryBridge.ts in the next major version. Use unregisterInteractiveCommand() instead.
   */
  public unregisterCustomCommand(name: string) {
    super.unregisterCustomCommand(name);
  }

  /**
   * Unregister custom interactive command by name.
   */
  public unregisterInteractiveCommand(name: string) {
    return this.unregisterCustomCommand(name);
  }
}
