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
