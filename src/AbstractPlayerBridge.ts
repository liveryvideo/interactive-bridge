import type {
  Config,
  DisplayMode,
  GetFeaturesReturn,
  GetPlaybackReturn,
  Orientation,
  PlaybackMode,
  PlaybackState,
  Qualities,
  Quality,
  StreamPhase,
  UserFeedbackPayload,
} from './InteractiveBridge';
import { LiveryBridge } from './LiveryBridge';

/**
 * Abstract player bridge class which implements part of the player side API based on browser logic
 * and defines abstract methods to be implemented to complete support for all InteractiveBridge commands.
 */
export abstract class AbstractPlayerBridge extends LiveryBridge {
  protected portraitQuery = window.matchMedia('(orientation: portrait)');

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(target?: { origin: string; window: Window }) {
    super(target);
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

  protected override handleCommand(
    name: string,
    arg: unknown,
    listener: (value: unknown) => void,
  ) {
    if (name === 'getAppName') {
      return this.getAppName();
    }
    if (name === 'getCustomerId') {
      return this.getCustomerId();
    }
    if (name === 'getEndpointId') {
      return this.getEndpointId();
    }
    if (name === 'getFeatures') {
      return this.getFeatures();
    }
    if (name === 'getLatency') {
      return this.getLatency();
    }
    if (name === 'getLiveryParams') {
      return this.getLiveryParams();
    }
    if (name === 'getPlayback') {
      return this.getPlayback();
    }
    if (name === 'getPlayerVersion') {
      return this.getPlayerVersion();
    }
    if (name === 'getStreamId') {
      return this.getStreamId();
    }
    if (name === 'pause') {
      return this.pause();
    }
    if (name === 'play') {
      return this.play();
    }
    if (name === 'reload') {
      return this.reload();
    }
    if (name === 'seek') {
      return this.seek(arg as number);
    }
    if (name === 'selectQuality') {
      return this.selectQuality(arg as number);
    }
    if (name === 'setControlsDisabled') {
      return this.setControlsDisabled(arg as boolean);
    }
    if (name === 'setDisplay') {
      return this.setDisplay(arg as DisplayMode);
    }
    if (name === 'setMuted') {
      return this.setMuted(arg as boolean);
    }
    if (name === 'submitUserFeedback') {
      return this.submitUserFeedback(arg as UserFeedbackPayload);
    }
    if (name === 'subscribeConfig') {
      return this.subscribeConfig(listener);
    }
    if (name === 'subscribeDisplay') {
      return this.subscribeDisplay(listener);
    }
    if (name === 'subscribeError') {
      return this.subscribeError(listener);
    }
    if (name === 'subscribeFullscreen') {
      return this.subscribeFullscreen(listener);
    }
    if (name === 'subscribeMode') {
      return this.subscribeMode(listener);
    }
    if (name === 'subscribeMuted') {
      return this.subscribeMuted(listener);
    }
    if (name === 'subscribeOrientation') {
      return this.subscribeOrientation(listener);
    }
    if (name === 'subscribePaused') {
      return this.subscribePaused(listener);
    }
    if (name === 'subscribePlaybackState') {
      return this.subscribePlaybackState(listener);
    }
    if (name === 'subscribePlaying') {
      return this.subscribePlaying(listener);
    }
    if (name === 'subscribeQualities') {
      return this.subscribeQualities(listener);
    }
    if (name === 'subscribeQuality') {
      return this.subscribeQuality(listener);
    }
    if (name === 'subscribeStalled') {
      return this.subscribeStalled(listener);
    }
    if (name === 'subscribeStreamPhase') {
      return this.subscribeStreamPhase(listener);
    }

    return super.handleCommand(name, arg, listener);
  }

  private getAppName() {
    return window.location.hostname;
  }

  /**
   * @deprecated Instead use {@link subscribeConfig}.customerId
   */
  private getCustomerId() {
    return this.subscribeConfig(() => null)?.customerId;
  }

  /**
   * @deprecated Instead use {@link getPlayback}.latency
   */
  private getLatency() {
    return this.getPlayback().latency;
  }

  private getLiveryParams(queryString = window.location.search) {
    const urlParams = new URLSearchParams(queryString);
    const result: Record<string, string> = {};
    for (const [name, value] of urlParams.entries()) {
      if (name.startsWith('livery_')) {
        const key = name.substring(7);
        result[key] = result[key] ?? value;
      }
    }
    return result;
  }

  /**
   * @deprecated Instead use {@link subscribeDisplay}.display value "FULLSCREEN"
   */
  private subscribeFullscreen(listener: (value: boolean) => void) {
    return (
      this.subscribeDisplay((display) => listener(display === 'FULLSCREEN')) ===
      'FULLSCREEN'
    );
  }

  /**
   * @deprecated Will be removed in the next major version.
   */
  private subscribeOrientation(listener: (value: Orientation) => void) {
    // Prior to Safari 14, MediaQueryList is based on EventTarget, so you must use addListener()
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList/addListener
    if (this.portraitQuery.addEventListener === undefined) {
      // eslint-disable-next-line deprecation/deprecation -- For backwards compatibility
      this.portraitQuery.addListener((event) => {
        listener(event.matches ? 'portrait' : 'landscape');
      });
    } else {
      this.portraitQuery.addEventListener('change', (event) => {
        listener(event.matches ? 'portrait' : 'landscape');
      });
    }

    return this.portraitQuery.matches ? 'portrait' : 'landscape';
  }

  /**
   * Returns promise of current paused playbackState
   * and calls back `listener` with any subsequent state updates.
   */
  private subscribePaused(listener: (value: boolean) => void) {
    const pausedStates: PlaybackState[] = ['ENDED', 'PAUSED'];
    const playbackState = this.subscribePlaybackState((value) =>
      listener(pausedStates.includes(value)),
    );
    return pausedStates.includes(playbackState);
  }

  /**
   * Returns promise of current playing playbackState
   * and calls back `listener` with any subsequent state updates.
   */
  private subscribePlaying(listener: (value: boolean) => void) {
    const playingStates: PlaybackState[] = [
      'FAST_FORWARD',
      'PLAYING',
      'REWIND',
      'SLOW_MO',
    ];
    const playbackState = this.subscribePlaybackState((value) =>
      listener(playingStates.includes(value)),
    );
    return playingStates.includes(playbackState);
  }

  /**
   * @deprecated Instead use {@link subscribeQualities}.active
   */
  private subscribeQuality(listener: (quality: Quality | string) => void) {
    const getActiveQuality = (qualities: Qualities) => {
      const activeQualityIndex = qualities?.active;

      return (
        (activeQualityIndex !== undefined &&
          qualities?.list[activeQualityIndex]?.label) ||
        ''
      );
    };

    const qualities = this.subscribeQualities((value) => {
      listener(getActiveQuality(value));
    });

    return getActiveQuality(qualities);
  }

  /**
   * Returns promise of current stalled playbackState
   * and calls back `listener` with any subsequent state updates.
   */
  private subscribeStalled(listener: (value: boolean) => void) {
    const stalledStates: PlaybackState[] = ['BUFFERING', 'SEEKING'];
    const playbackState = this.subscribePlaybackState((value) =>
      listener(stalledStates.includes(value)),
    );
    return stalledStates.includes(playbackState);
  }

  /**
   * @deprecated Instead use {@link subscribeConfig}.streamPhase
   */
  private subscribeStreamPhase(listener: (streamPhase: StreamPhase) => void) {
    return this.subscribeConfig((config) =>
      listener(config?.streamPhase || 'PRE'),
    )?.streamPhase;
  }

  protected abstract getEndpointId(): string;

  protected abstract getFeatures(): GetFeaturesReturn;

  protected abstract getPlayback(): GetPlaybackReturn;

  protected abstract getPlayerVersion(): string;

  protected abstract getStreamId(): string;

  protected abstract pause(): void;

  protected abstract play(): void;

  protected abstract reload(): void;

  protected abstract seek(position: number): void;

  protected abstract selectQuality(index: number): void;

  protected abstract setControlsDisabled(disabled: boolean): void;

  protected abstract setDisplay(display: DisplayMode): void;

  protected abstract setMuted(muted: boolean): void;

  protected abstract submitUserFeedback(payload: UserFeedbackPayload): void;

  protected abstract subscribeConfig(listener: (value: Config) => void): Config;

  protected abstract subscribeDisplay(
    listener: (display: DisplayMode) => void,
  ): DisplayMode;

  protected abstract subscribeError(
    listener: (error: string | undefined) => void,
  ): string | undefined;

  protected abstract subscribeMode(
    listener: (mode: PlaybackMode) => void,
  ): PlaybackMode;

  protected abstract subscribeMuted(
    listener: (value: boolean) => void,
  ): boolean;

  protected abstract subscribePlaybackState(
    listener: (playbackState: PlaybackState) => void,
  ): PlaybackState;

  protected abstract subscribeQualities(
    listener: (qualities: Qualities) => void,
  ): Qualities;
}
