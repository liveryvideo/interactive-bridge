import { AbstractPlayerBridge } from './AbstractPlayerBridge';
import type { Feature, StreamPhase } from './InteractiveBridge';

/**
 * Mock player bridge for testing purposes; returning dummy values where real values are not available.
 * And with dummy support for custom command: `subscribeAuthToken` as used on the test page.
 */
export class MockPlayerBridge extends AbstractPlayerBridge {
  private latency?: number;

  constructor(
    target?: ConstructorParameters<typeof AbstractPlayerBridge>[0],
    options?: { latency?: number; ownWindow?: Window },
  ) {
    super(target, options?.ownWindow);
    this.latency = options?.latency;

    this.registerCustomCommand('subscribeAuthToken', (arg, listener) => {
      if (typeof arg !== 'string') {
        throw new Error(`Argument type: ${typeof arg}, should be: string`);
      }

      window.setTimeout(() => listener(`${arg}-test-token-2`), 3000);
      window.setTimeout(() => listener(`${arg}-test-token-3`), 10000);

      return `${arg}-test-token-1`;
    });
  }

  enterFullscreen() {
    this.onFullscreenChange(true);
  }

  exitFullscreen() {
    this.onFullscreenChange(false);
  }

  setQuality(value: string) {
    this.onQualitySet(value);
  }

  startLivePhase() {
    this.onStreamPhaseChange('LIVE');
  }

  startPostPhase() {
    this.onStreamPhaseChange('POST');
  }

  startPrePhase() {
    this.onStreamPhaseChange('PRE');
  }

  protected getCustomerId() {
    return 'dummy-customer-id';
  }

  protected getEndpointId() {
    return 'dummy-endpoint-id';
  }

  protected getFeatures(): Feature[] {
    return [
      'AIRPLAY',
      'CHROMECAST',
      'CONTACT',
      'FULLSCREEN',
      'PIP',
      'SCRUBBER',
    ];
  }

  protected getLatency() {
    return this.latency ?? Math.random() * 6;
  }

  protected getPlayerVersion() {
    return '1.0.0-dummy-version';
  }

  protected getStreamId() {
    return 'dummy-stream-id';
  }

  protected subscribeFullscreen(listener: (value: boolean) => void) {
    this.onFullscreenChange = listener;
    // Note: LiveryPlayer only listens to itself becoming fullscreen; not just anything
    document.addEventListener('fullscreenchange', () => {
      listener(!!document.fullscreenElement);
    });
    return !!document.fullscreenElement;
  }

  protected subscribeQuality(listener: (value: string) => void) {
    this.onQualitySet = listener;
    setTimeout(() => listener('dummy-quality-2'), 1500);
    setTimeout(() => listener('dummy-quality-3'), 3000);
    return 'dummy-quality-1';
  }

  protected subscribeStreamPhase(listener: (value: StreamPhase) => void) {
    this.onStreamPhaseChange = listener;
    setTimeout(() => listener('LIVE'), 1500);
    setTimeout(() => listener('POST'), 3000);
    return 'PRE';
  }

  private onFullscreenChange: (value: boolean) => void = () => {};

  private onQualitySet: (value: string) => void = () => {};

  private onStreamPhaseChange: (value: StreamPhase) => void = () => {};
}
