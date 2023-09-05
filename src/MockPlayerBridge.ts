import { AbstractPlayerBridge } from './AbstractPlayerBridge';
import type { Feature, StreamPhase } from './InteractiveBridge';
import type { Quality } from './InteractiveBridge/VideoCommands';

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

  setQualities(value: Array<Quality | undefined>) {
    this.onQualitiesSet(value);
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

  protected getPlayback() {
    return { buffer: 0, duration: 0, position: 0 };
  }

  protected getPlayerVersion() {
    return '1.0.0-dummy-version';
  }

  protected getStreamId() {
    return 'dummy-stream-id';
  }

  protected onQualitiesSet: (value: Array<Quality | undefined>) => void =
    () => {};

  protected subscribeFullscreen(listener: (value: boolean) => void) {
    this.onFullscreenChange = listener;
    // Note: LiveryPlayer only listens to itself becoming fullscreen; not just anything
    document.addEventListener('fullscreenchange', () => {
      listener(!!document.fullscreenElement);
    });
    return !!document.fullscreenElement;
  }

  protected override subscribeQualities(
    listener: (value: Array<Quality | undefined>) => void,
  ): Array<Quality | undefined> {
    const lowQuality = {
      audio: {
        bandwidth: 24_000,
      },
      index: NaN,
      label: '270p',
      video: {
        bandwidth: 500_000,
        height: 270,
        width: 480,
      },
    };

    const medLowQuality = {
      audio: {
        bandwidth: 48_000,
      },
      index: NaN,
      label: '540p',
      video: {
        bandwidth: 1_500_000,
        height: 540,
        width: 960,
      },
    };

    const medQuality = {
      audio: {
        bandwidth: 96_000,
      },
      index: NaN,
      label: '720p',
      video: {
        bandwidth: 3_000_000,
        height: 720,
        width: 1280,
      },
    };

    const medHighQuality = {
      audio: {
        bandwidth: 96_000,
      },
      index: NaN,
      label: '1080p',
      video: {
        bandwidth: 5_000_000,
        height: 1080,
        width: 1920,
      },
    };

    const highQuality = {
      audio: {
        bandwidth: 96_000,
      },
      index: NaN,
      label: '4K',
      video: {
        bandwidth: 12_000_000,
        height: 2160,
        width: 3840,
      },
    };

    this.onQualitiesSet = listener;
    setTimeout(
      () => listener([lowQuality, medLowQuality, medQuality, medHighQuality]),
      1500,
    );
    setTimeout(
      () => listener([medLowQuality, medHighQuality, highQuality]),
      3000,
    );
    return [lowQuality, medQuality, medHighQuality];
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
