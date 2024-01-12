import { AbstractPlayerBridge } from './AbstractPlayerBridge';
import type {
  Config,
  DisplayMode,
  PlaybackMode,
  PlaybackState,
  Qualities,
  UserFeedbackPayload,
} from './InteractiveBridge';

// eslint-disable-next-line no-shadow
enum MockListenerEvents {
  DISPLAY = 'mock-display-change',
  MUTED = 'mock-muted-change',
  PLAYBACK = 'mock-playback-change',
}

/**
 * Mock player bridge for testing purposes; returning dummy values where real values are not available.
 * And with dummy support for custom command: `subscribeAuthToken` as used on the test page.
 */
export class MockPlayerBridge extends AbstractPlayerBridge {
  private display: DisplayMode = 'DEFAULT';

  private muted = true;

  private playbackState: PlaybackState = 'PLAYING';

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
      position: Math.random() * 6,
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
    this.setPlaybackState('PLAYING');
  }

  protected reload() {
    this.setPlaybackState('PLAYING');
  }

  protected seek(position: number) {
    this.setPlaybackState('SEEKING');
    return position;
  }

  protected selectQuality(index: number) {
    return index;
  }

  protected setControlsDisabled(disabled: boolean) {
    return disabled;
  }

  protected setDisplay(display: DisplayMode) {
    return this.setDisplayState(display);
  }

  protected setMuted(muted: boolean) {
    return this.setMutedState(muted);
  }

  protected submitUserFeedback(payload: UserFeedbackPayload) {
    return payload;
  }

  protected subscribeConfig(listener: (value: Config) => void) {
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
      customerId: 'id',
      streamPhase: 'PRE',
      streamPhases: ['LIVE', 'POST', 'PRE'],
      tenantId: 'id',
    };

    setTimeout(() => {
      const newConfig = { ...config };
      newConfig.controls = {
        ...newConfig.controls,
        cast: false,
        scrubber: false,
      };
      newConfig.streamPhase = 'LIVE';
      listener(newConfig);
    }, 1500);
    setTimeout(() => {
      const newConfig = { ...config };
      newConfig.controls = {
        ...newConfig.controls,
        cast: true,
        scrubber: true,
      };
      newConfig.streamPhase = 'POST';
      listener(newConfig);
    }, 3000);

    listener(config);
    return config;
  }

  protected subscribeDisplay(listener: (value: DisplayMode) => void) {
    document.addEventListener(MockListenerEvents.DISPLAY, () => {
      listener(this.display);
    });
    return this.display;
  }

  protected subscribeError(listener: (error: string | undefined) => void) {
    listener('error');
    return 'error';
  }

  protected subscribeMode(listener: (mode: PlaybackMode) => void) {
    listener('LIVE');
    return 'LIVE' as PlaybackMode;
  }

  protected subscribeMuted(listener: (value: boolean) => void) {
    document.addEventListener(MockListenerEvents.MUTED, () => {
      listener(this.muted);
    });
    return this.muted;
  }

  protected subscribePlaybackState(
    listener: (playbackState: PlaybackState) => void,
  ) {
    document.addEventListener(MockListenerEvents.PLAYBACK, () => {
      listener(this.playbackState);
    });
    return this.playbackState;
  }

  protected subscribeQualities(listener: (value: Qualities) => void) {
    const buildQuality = (index: number) => ({
      audio: {
        bandwidth: index,
      },
      label: `${index}`,
      video: {
        bandwidth: index,
        height: index,
        width: index,
      },
    });
    const buildQualities = (index: number) => ({
      active: index,
      list: [buildQuality(1), buildQuality(2), buildQuality(3)],
      selected: index,
    });
    const qualities = [1, 2, 3].map((index) => buildQualities(index));

    setTimeout(() => listener(qualities[1]), 1500);
    setTimeout(() => listener(qualities[2]), 3000);
    listener(qualities[0]);
    return qualities[0];
  }

  private setDisplayState(display: DisplayMode) {
    this.display = display;
    document.dispatchEvent(new Event(MockListenerEvents.DISPLAY));
  }

  private setMutedState(muted: boolean) {
    this.muted = muted;
    document.dispatchEvent(new Event(MockListenerEvents.MUTED));
  }

  private setPlaybackState(playbackState: PlaybackState) {
    this.playbackState = playbackState;
    document.dispatchEvent(new Event(MockListenerEvents.PLAYBACK));
  }
}
