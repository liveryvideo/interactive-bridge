import type {
  GetFeaturesReturn,
  GetPlaybackReturn,
  Orientation,
  StreamPhase,
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
    if (name === 'subscribeFullscreen') {
      return this.subscribeFullscreen(listener);
    }
    if (name === 'subscribeOrientation') {
      return this.subscribeOrientation(listener);
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

  protected abstract getCustomerId(): string;

  protected abstract getEndpointId(): string;

  protected abstract getFeatures(): GetFeaturesReturn;

  protected abstract getLatency(): number;

  protected abstract getPlayback(): GetPlaybackReturn;

  protected abstract getPlayerVersion(): string;

  protected abstract getStreamId(): string;

  protected abstract subscribeFullscreen(
    listener: (value: boolean) => void,
  ): boolean;

  protected abstract subscribeQuality(
    listener: (value: string) => void,
  ): string;

  protected abstract subscribeStreamPhase(
    listener: (value: StreamPhase) => void,
  ): string;
}
