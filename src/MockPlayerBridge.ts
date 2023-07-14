import { AbstractPlayerBridge } from './AbstractPlayerBridge';
import type { StreamPhase } from './InteractiveBridge';

/**
 * Mock player bridge for testing purposes; returning dummy values where real values are not available.
 * And with dummy support for custom command: `subscribeAuthToken` as used on the test page.
 */
export class MockPlayerBridge extends AbstractPlayerBridge {
  constructor(target?: ConstructorParameters<typeof AbstractPlayerBridge>[0]) {
    super(target);

    this.registerCustomCommand('subscribeAuthToken', (arg, listener) => {
      if (typeof arg !== 'string') {
        throw new Error(`Argument type: ${typeof arg}, should be: string`);
      }

      window.setTimeout(() => listener(`${arg}-test-token-2`), 3000);
      window.setTimeout(() => listener(`${arg}-test-token-3`), 10000);

      return `${arg}-test-token-1`;
    });
  }

  protected getCustomerId() {
    return 'dummy-customer-id';
  }

  protected getEndpointId() {
    return 'dummy-endpoint-id';
  }

  protected getLatency() {
    return Math.random() * 6;
  }

  protected getPlayerVersion() {
    return '1.0.0-dummy-version';
  }

  protected getStreamId() {
    return 'dummy-stream-id';
  }

  protected subscribeQuality(listener: (value: string) => void) {
    setTimeout(() => listener('dummy-quality-2'), 1500);
    setTimeout(() => listener('dummy-quality-3'), 3000);
    return 'dummy-quality-1';
  }

  protected subscribeStreamPhase(listener: (value: StreamPhase) => void) {
    setTimeout(() => listener('LIVE'), 1500);
    setTimeout(() => listener('POST'), 3000);
    return 'PRE';
  }
}
