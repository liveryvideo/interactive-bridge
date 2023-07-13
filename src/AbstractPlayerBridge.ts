import type { Orientation, StreamPhase } from './InteractiveBridge';
import { LiveryBridge } from './LiveryBridge';

/**
 * Abstract player bridge class which implements part of the player side API based on browser logic
 * and defines abstract methods for to be implemented to complete support for all InteractiveBridge commands.
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
    if (name === 'getLatency') {
      return this.getLatency();
    }
    if (name === 'getLiveryParams') {
      return this.getLiveryParams();
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

  /**
   * Returns an object with all the 'livery_' prefixed query parameter names and values.
   * The prefix will be stripped from the names.
   * Parameter names and values will be URL decoded.
   * Parameters without a value will get an empty string value.
   * Only the first value of a repeated parameter will be returned.
   *
   * Notes:
   * - URLSearchParams.get(name) would return null instead of an empty string
   * - URLSearchParams.getAll(name) would return an array of values
   * - Query parameter names are not converted from snake_case to camelCase
   * - Query parameter values are not JSON parsed (only string values)
   *
   * @example
   * // Given location.search: '?foo&livery_foo%3Abar=hey+you&livery_no_val&livery_multi=1&livery_multi=2
   * liveryParams.all // => { 'foo:bar': 'hey you', no_val: '', multi: '1' }
   */
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

  private subscribeFullscreen(listener: (value: boolean) => void) {
    // Note: This is just an approximation of what the player does
    document.addEventListener('fullscreenchange', () => {
      listener(!!document.fullscreenElement);
    });
    return !!document.fullscreenElement;
  }

  private subscribeOrientation(listener: (value: Orientation) => void) {
    this.portraitQuery.addEventListener('change', (event) => {
      listener(event.matches ? 'portrait' : 'landscape');
    });

    return this.portraitQuery.matches ? 'portrait' : 'landscape';
  }

  protected abstract getCustomerId(): string;

  protected abstract getEndpointId(): string;

  protected abstract getLatency(): number;

  protected abstract getPlayerVersion(): string;

  protected abstract getStreamId(): string;

  protected abstract subscribeQuality(
    listener: (value: string) => void,
  ): string;

  protected abstract subscribeStreamPhase(
    listener: (value: StreamPhase) => void,
  ): string;
}
