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
  config: Config = {
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
    streamPhase: 'LIVE',
    streamPhases: [[Date.now(), 'LIVE']],
    tenantId: 'dummy-tenant-id',
  };

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

  private zeroTimestamp = Date.now();

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
    return this.playbackState === 'PLAYING'
      ? {
          buffer: 2.8,
          duration: Infinity,
          latency: 2.98,
          position: (Date.now() - this.zeroTimestamp - 2980) / 1000,
        }
      : {
          buffer: NaN,
          duration: Infinity,
          latency: NaN,
          position: 0,
        };
  }

  protected getPlayerVersion() {
    return '1.0.0-dummy-version';
  }

  protected getStreamId() {
    return 'dummy-stream-id';
  }

  protected pause() {
    this.setPlaybackState('PAUSED');
  }

  protected play() {
    this.setPlaybackState('BUFFERING');
    setTimeout(() => {
      this.setPlaybackState('PLAYING');
    }, 3000);
  }

  protected reload() {
    this.play();
  }

  protected seek(position: number) {
    this.zeroTimestamp = Date.now() - 1000 * position;
    this.setPlaybackState('SEEKING');
    setTimeout(() => {
      this.setPlaybackState('PLAYING');
    }, 3000);
  }

  protected selectQuality(index: number) {
    if (index === this.qualities.selected) {
      return;
    }
    if (!(index === -1 || !!this.qualities.list[index])) {
      throw new Error(`Invalid qualities index: ${index}`);
    }
    this.qualities.selected = index;
    this.qualitiesListeners.forEach((listener) => listener(this.qualities));
  }

  protected setControlsDisabled(disabled: boolean) {
    this.controlsDisabled = disabled;
  }

  protected setDisplay(display: DisplayMode) {
    if (display === this.display) {
      return;
    }
    this.display = display;
    this.displayListeners.forEach((listener) => listener(this.display));
  }

  protected setMuted(muted: boolean) {
    if (muted === this.muted) {
      return;
    }
    this.muted = muted;
    this.mutedListeners.forEach((listener) => listener(this.muted));
  }

  protected submitUserFeedback(value: UserFeedback) {
    this.userFeedback = value;
  }

  protected subscribeConfig(listener: (value?: Config) => void) {
    const changeConfig = (streamPhase: Config['streamPhase']) => {
      if (streamPhase !== this.config.streamPhase) {
        this.config.streamPhase = streamPhase;
        this.config.streamPhases.push([Date.now(), streamPhase]);
      }
    };

    changeConfig('POST');
    setTimeout(() => {
      changeConfig('PRE');
      listener(this.config);
    }, 3000);
    setTimeout(() => {
      changeConfig('LIVE');
      listener(this.config);
    }, 6000);

    return this.config;
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

  private setPlaybackState(playbackState: PlaybackState) {
    if (playbackState === this.playbackState) {
      return;
    }
    this.playbackState = playbackState;
    this.playbackStateListeners.forEach((listener) => listener(playbackState));
  }
}
