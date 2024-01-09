import { AbstractPlayerBridge } from './AbstractPlayerBridge';
import type { Qualities, Quality, StreamPhase } from './InteractiveBridge';

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

  protected getFeatures() {
    return {
      airplay: true,
      chromecast: true,
      contact: true,
      fullscreen: true,
      pip: true,
      scrubber: true,
    };
  }

  protected getLatency() {
    return Math.random() * 6;
  }

  protected getPlayback() {
    return {
      buffer: Math.random() * 6,
      duration: Math.random() * 6,
      latency: Math.random() * 6,
      position: Math.random() * 6,
    };
  }

  protected getPlayerVersion() {
    return '1.0.0-dummy-version';
  }

  protected getStreamId() {
    return 'dummy-stream-id';
  }

  protected pause() {}

  protected play() {}

  protected reload() {}

  protected seek(position: number) {
    return position;
  }

  protected selectQuality(index: number) {
    return index;
  }

  protected setControlsDisabled(disabled: boolean) {
    return disabled;
  }

  protected subscribeFullscreen(listener: (value: boolean) => void) {
    // Note: LiveryPlayer only listens to itself becoming fullscreen; not just anything
    document.addEventListener('fullscreenchange', () => {
      listener(!!document.fullscreenElement);
    });
    return !!document.fullscreenElement;
  }

  protected subscribeQualities(listener: (value: Qualities) => void) {
    const quality1: Quality = {
      audio: {
        bandwidth: 1,
      },
      label: '1',
      video: {
        bandwidth: 1,
        height: 1,
        width: 1,
      },
    };
    const quality2: Quality = {
      audio: {
        bandwidth: 2,
      },
      label: '2',
      video: {
        bandwidth: 2,
        height: 2,
        width: 2,
      },
    };
    const qualities1: Qualities = {
      active: 1,
      list: [quality1, quality2],
      selected: 1,
    };
    const qualities2: Qualities = {
      active: 2,
      list: [quality1, quality2],
      selected: 2,
    };
    setTimeout(() => listener(qualities2), 1500);
    setTimeout(() => listener(qualities1), 3000);
    return qualities1;
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
