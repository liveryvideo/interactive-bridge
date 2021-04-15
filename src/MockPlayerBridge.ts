import type { Orientation, StreamPhase } from './InteractiveBridge';
import { LiveryBridge } from './LiveryBridge';

export class MockPlayerBridge extends LiveryBridge {
  private static portraitQuery = window.matchMedia('(orientation: portrait)');

  constructor(targetWindow: Window, targetOrigin: string) {
    super(targetWindow, targetOrigin);

    this.registerCustomCommand('subscribeAuthToken', (arg, listener) => {
      if (typeof arg !== 'string') {
        throw new Error(`Argument type: ${typeof arg}, should be: string`);
      }

      window.setTimeout(() => listener(`${arg}-test-token-2`), 3000);
      window.setTimeout(() => listener(`${arg}-test-token-3`), 10000);

      return `${arg}-test-token-1`;
    });
  }

  private static getLatency() {
    return Math.random() * 6;
  }

  private static subscribeOrientation(
    listener: (value: Orientation) => void,
  ): Orientation {
    MockPlayerBridge.portraitQuery.addEventListener('change', (event) => {
      listener(event.matches ? 'portrait' : 'landscape');
    });

    return MockPlayerBridge.portraitQuery.matches ? 'portrait' : 'landscape';
  }

  private static subscribeStreamPhase(
    listener: (value: StreamPhase) => void,
  ): StreamPhase {
    setTimeout(() => listener('LIVE'), 1500);
    setTimeout(() => listener('POST'), 3000);
    return 'PRE';
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
   * Register `handler` function to be called with `arg` and `listener` when sendPlayerCommand() is called on
   * other side with matching `name`.
   */
  public registerPlayerCommand(
    name: string,
    handler: (arg: unknown, listener: (value: unknown) => void) => unknown,
  ) {
    this.registerCustomCommand(name, handler);
  }

  /**
   * Returns promise of value returned by other side's custom command handler with matching `name` that is passed `arg`.
   * Any `handler` `listener` calls will subsequently also be bridged to this `listener` callback.
   *
   * @deprecated Will become a protected member in LiveryBridge.ts in the next major version. Use sendInteractiveCommand() instead.
   */
  public sendCustomCommand<T>(
    name: string,
    arg?: unknown,
    listener?: (value: T) => void,
  ) {
    return super.sendCustomCommand(name, arg, listener);
  }

  /**
   * Returns promise of value returned by other side's custom command handler with matching `name` that is passed `arg`.
   * Any `handler` `listener` calls will subsequently also be bridged to this `listener` callback.
   */
  public sendInteractiveCommand<T>(
    name: string,
    arg?: unknown,
    listener?: (value: T) => void,
  ) {
    return this.sendCustomCommand(name, arg, listener);
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
  public unregisterPlayerCommand(name: string) {
    return this.unregisterCustomCommand(name);
  }

  protected handleCommand(
    name: string,
    arg: unknown,
    listener: (value: unknown) => void,
  ) {
    if (name === 'getLatency') {
      return MockPlayerBridge.getLatency();
    }
    if (name === 'subscribeOrientation') {
      return MockPlayerBridge.subscribeOrientation(listener);
    }
    if (name === 'subscribeStreamPhase') {
      return MockPlayerBridge.subscribeStreamPhase(listener);
    }

    return super.handleCommand(name, arg, listener);
  }
}
