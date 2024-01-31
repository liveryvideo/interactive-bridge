import { LiveryBridge } from './LiveryBridge';
import type {
  Config,
  DisplayMode,
  Features,
  Orientation,
  PlaybackDetails,
  PlaybackMode,
  PlaybackState,
  Qualities,
  StreamPhase,
  UserFeedback,
} from './util/schema';
import {
  displayMode,
  userFeedback,
  validateBoolean,
  validateNumber,
} from './util/schema';

/**
 * Abstract player bridge class which implements part of the player side API based on browser logic
 * and defines abstract methods to be implemented to complete support for all InteractiveBridge commands.
 */
export abstract class AbstractPlayerBridge extends LiveryBridge {
  protected config?: Config;

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
      return this.seek(validateNumber(arg));
    }
    if (name === 'selectQuality') {
      return this.selectQuality(validateNumber(arg));
    }
    if (name === 'setControlsDisabled') {
      return this.setControlsDisabled(validateBoolean(arg));
    }
    if (name === 'setDisplay') {
      return this.setDisplay(displayMode.parse(arg));
    }
    if (name === 'setMuted') {
      return this.setMuted(validateBoolean(arg));
    }
    if (name === 'submitUserFeedback') {
      return this.submitUserFeedback(userFeedback.parse(arg));
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
    if (name === 'subscribePlaybackState') {
      return this.subscribePlaybackState(listener);
    }
    if (name === 'subscribeQualities') {
      return this.subscribeQualities(listener);
    }
    if (name === 'subscribeQuality') {
      return this.subscribeQuality(listener);
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
   * @deprecated Instead use {@link config}.customerId
   */
  private getCustomerId() {
    return this.config?.customerId;
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
   * @deprecated Instead use {@link subscribeQualities}.active
   */
  private subscribeQuality(listener: (quality: string) => void) {
    const getActiveQuality = (qualities?: Qualities) =>
      qualities?.list[qualities.active]?.label ?? '';

    const qualities = this.subscribeQualities((value) => {
      listener(getActiveQuality(value));
    });

    return getActiveQuality(qualities);
  }

  /**
   * @deprecated Instead use {@link subscribeConfig}.streamPhase
   */
  private subscribeStreamPhase(listener: (streamPhase: StreamPhase) => void) {
    let streamPhase: StreamPhase;

    streamPhase =
      this.subscribeConfig((config) => {
        const newStreamPhase = config?.streamPhase || 'PRE';

        if (newStreamPhase !== streamPhase) {
          listener(newStreamPhase);
          streamPhase = newStreamPhase;
        }
      })?.streamPhase || 'PRE';

    return streamPhase;
  }

  protected abstract getEndpointId(): string;

  protected abstract getFeatures(): Features;

  protected abstract getPlayback(): PlaybackDetails;

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

  protected abstract submitUserFeedback(value: UserFeedback): void;

  protected abstract subscribeConfig(
    listener: (value?: Config) => void,
  ): Config | undefined;

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
    listener: (qualities?: Qualities) => void,
  ): Qualities | undefined;
}
