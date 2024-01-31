import { AbstractPlayerBridge } from './AbstractPlayerBridge';
import type {
  Config,
  DisplayMode,
  PlaybackMode,
  PlaybackState,
  Qualities,
  UserFeedback,
} from './util/schema';

const buildQuality = (index: number) => ({
  audio: {
    bandwidth: index,
  },
  label: `dummy-quality-${index}`,
  video: {
    bandwidth: index,
    height: index,
    width: index,
  },
});

/**
 * Mock player bridge for testing purposes; returning dummy values where real values are not available.
 * And with dummy support for custom command: `subscribeAuthToken` as used on the test page.
 */
export class MockPlayerBridge extends AbstractPlayerBridge {
  controlsDisabled = false;

  userFeedback: UserFeedback | null = null;

  private display: DisplayMode = 'DEFAULT';

  private displayListeners: ((value: DisplayMode) => void)[] = [];

  private muted = true;

  private mutedListeners: ((value: boolean) => void)[] = [];

  private playbackMode: PlaybackMode = 'LIVE';

  private playbackState: PlaybackState = 'PLAYING';

  private playbackStateListeners: ((value: PlaybackState) => void)[] = [];

  private qualities: Qualities = {
    active: 0,
    list: [buildQuality(1), buildQuality(2), buildQuality(3)],
    selected: 0,
  };

  private qualitiesListeners: ((value?: Qualities) => void)[] = [];

  private seekPosition = 0;

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

  protected getPlayback() {
    return {
      buffer: Math.random() * 6,
      duration: Math.random() * 6,
      latency: Math.random() * 6,
      position: this.seekPosition,
    };
  }

  protected getPlayerVersion() {
    return '1.0.0-dummy-version';
  }

  protected getStreamId() {
    return 'dummy-stream-id';
  }

  protected pause() {
    this.playbackState = 'PAUSED';
    this.playbackStateListeners.forEach((listener) =>
      listener(this.playbackState),
    );
  }

  protected play() {
    this.playbackState = 'PLAYING';
    this.playbackStateListeners.forEach((listener) =>
      listener(this.playbackState),
    );
  }

  protected reload() {
    this.playbackState = 'PLAYING';
    this.playbackStateListeners.forEach((listener) =>
      listener(this.playbackState),
    );
  }

  protected seek(position: number) {
    this.playbackState = 'SEEKING';
    this.seekPosition = position;
    this.playbackStateListeners.forEach((listener) =>
      listener(this.playbackState),
    );
  }

  protected selectQuality(index: number) {
    this.qualities.selected = index;
    this.qualitiesListeners.forEach((listener) => listener(this.qualities));
  }

  protected setControlsDisabled(disabled: boolean) {
    this.controlsDisabled = disabled;
  }

  protected setDisplay(display: DisplayMode) {
    this.display = display;
    this.displayListeners.forEach((listener) => listener(this.display));
  }

  protected setMuted(muted: boolean) {
    this.muted = muted;
    this.mutedListeners.forEach((listener) => listener(this.muted));
  }

  protected submitUserFeedback(value: UserFeedback) {
    this.userFeedback = value;
  }

  protected subscribeConfig(listener: (value?: Config) => void) {
    const config: Config = {
      controls: {
        cast: true,
        contact: true,
        error: true,
        fullscreen: true,
        mute: true,
        pip: true,
        play: true,
        quality: true,
        scrubber: true,
      },
      customerId: 'dummy-customer-id',
      streamPhase: 'PRE',
      streamPhases: {
        [Date.now() - 3600]: 'LIVE',
        [Date.now()]: 'POST',
        [Date.now() + 3600]: 'PRE',
      },
      tenantId: 'dummy-tenant-id',
    };

    setTimeout(() => {
      config.controls = {
        ...config.controls,
        cast: false,
        scrubber: false,
      };
      config.streamPhase = 'LIVE';
      listener(config);
    }, 1500);
    setTimeout(() => {
      config.controls = {
        ...config.controls,
        cast: true,
        scrubber: true,
      };
      listener(config);
    }, 3000);
    setTimeout(() => {
      config.streamPhase = 'POST';
      listener(config);
    }, 4500);
    return config;
  }

  protected subscribeDisplay(listener: (value: DisplayMode) => void) {
    this.displayListeners.push(listener);
    return this.display;
  }

  protected subscribeError(listener: (error: string | undefined) => void) {
    setTimeout(() => listener(''), 1500);
    return 'dummy-error';
  }

  protected subscribeMode(listener: (mode: PlaybackMode) => void) {
    setTimeout(() => {
      this.playbackMode = 'CATCHUP';
      listener(this.playbackMode);
    }, 1500);
    setTimeout(() => {
      this.playbackMode = 'LIVE';
      listener(this.playbackMode);
    }, 3000);
    setTimeout(() => {
      this.playbackMode = 'UNKNOWN';
      listener(this.playbackMode);
    }, 4500);
    setTimeout(() => {
      this.playbackMode = 'VOD';
      listener(this.playbackMode);
    }, 6000);

    return this.playbackMode;
  }

  protected subscribeMuted(listener: (value: boolean) => void) {
    this.mutedListeners.push(listener);
    return this.muted;
  }

  protected subscribePlaybackState(
    listener: (playbackState: PlaybackState) => void,
  ) {
    this.playbackStateListeners.push(listener);
    return this.playbackState;
  }

  protected subscribeQualities(listener: (value?: Qualities) => void) {
    this.qualitiesListeners.push(listener);
    return this.qualities;
  }
}
