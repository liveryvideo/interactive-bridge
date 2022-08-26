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

  private static getAppName() {
    return window.location.hostname;
  }

  private static getCustomerId() {
    return 'dummy-customer-id';
  }

  private static getEndpointId() {
    return 'dummy-endpoint-id';
  }

  private static getLatency() {
    return Math.random() * 6;
  }

  private static getPlayerVersion() {
    return '1.0.0-dummy-version';
  }

  private static getStreamId() {
    return 'dummy-stream-id';
  }

  private static subscribeFullscreen(listener: (value: boolean) => void) {
    // Note: This is just an approximation of what the player does
    document.addEventListener('fullscreenchange', () => {
      listener(!!document.fullscreenElement);
    });
    return !!document.fullscreenElement;
  }

  private static subscribeOrientation(listener: (value: Orientation) => void) {
    MockPlayerBridge.portraitQuery.addEventListener('change', (event) => {
      listener(event.matches ? 'portrait' : 'landscape');
    });

    return MockPlayerBridge.portraitQuery.matches ? 'portrait' : 'landscape';
  }

  private static subscribeQuality(listener: (value: string) => void) {
    setTimeout(() => listener('dummy-quality-2'), 1500);
    setTimeout(() => listener('dummy-quality-3'), 3000);
    return 'dummy-quality-1';
  }

  private static subscribeStreamPhase(listener: (value: StreamPhase) => void) {
    setTimeout(() => listener('LIVE'), 1500);
    setTimeout(() => listener('POST'), 3000);
    return 'PRE';
  }

  /**
   * Register `handler` function to be called with `arg` and `listener` when sendPlayerCommand() is called
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
  sendInteractiveCommand<T>(
    name: string,
    arg?: unknown,
    listener?: (value: T) => void,
  ) {
    return this.sendCustomCommand(name, arg, listener);
  }

  /**
   * Unregister custom interactive command by name.
   */
  unregisterPlayerCommand(name: string) {
    return this.unregisterCustomCommand(name);
  }

  protected handleCommand(
    name: string,
    arg: unknown,
    listener: (value: unknown) => void,
  ) {
    if (name === 'getAppName') {
      return MockPlayerBridge.getAppName();
    }
    if (name === 'getCustomerId') {
      return MockPlayerBridge.getCustomerId();
    }
    if (name === 'getEndpointId') {
      return MockPlayerBridge.getEndpointId();
    }
    if (name === 'getLatency') {
      return MockPlayerBridge.getLatency();
    }
    if (name === 'getPlayerVersion') {
      return MockPlayerBridge.getPlayerVersion();
    }
    if (name === 'getStreamId') {
      return MockPlayerBridge.getStreamId();
    }
    if (name === 'subscribeFullscreen') {
      return MockPlayerBridge.subscribeFullscreen(listener);
    }
    if (name === 'subscribeOrientation') {
      return MockPlayerBridge.subscribeOrientation(listener);
    }
    if (name === 'subscribeQuality') {
      return MockPlayerBridge.subscribeQuality(listener);
    }
    if (name === 'subscribeStreamPhase') {
      return MockPlayerBridge.subscribeStreamPhase(listener);
    }

    return super.handleCommand(name, arg, listener);
  }
}
