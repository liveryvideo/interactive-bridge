import type { AbstractPlayerBridge } from './AbstractPlayerBridge';
import { FullscreenSubscriber } from './InteractiveBridge/FullscreenSubscriber';
import { OrientationSubscriber } from './InteractiveBridge/OrientationSubscriber';
import { QualitySubscriber } from './InteractiveBridge/QualitySubscriber';
import type { StreamPhase } from './InteractiveBridge/StreamPhaseParser';
import { StreamPhaseSubscriber } from './InteractiveBridge/StreamPhaseSubscriber';
import type { Orientation, Quality } from './InteractiveBridge/VideoCommands';
import { VideoCommands } from './InteractiveBridge/VideoCommands';
import { LiveryBridge } from './LiveryBridge';

export type { StreamPhase } from './InteractiveBridge/StreamPhaseParser';
export type { StreamPhaseTimeline } from './InteractiveBridge/StreamPhaseTimelineParser';
export type {
  Feature,
  Orientation,
  PlaybackDetails,
} from './InteractiveBridge/VideoCommands';

/**
 * Can be used on Livery interactive layer pages to communicate with the surrounding Livery Player.
 */
export class InteractiveBridge extends LiveryBridge {
  video = new VideoCommands(this.sendCommand.bind(this));

  private fullscreenSubscriber = new FullscreenSubscriber(
    this.sendCommand.bind(this),
  );

  private orientationSubscriber = new OrientationSubscriber(
    this.sendCommand.bind(this),
  );

  private qualitySubscriber = new QualitySubscriber(
    this.sendCommand.bind(this),
  );

  private streamPhaseSubscriber = new StreamPhaseSubscriber(
    this.sendCommand.bind(this),
  );

  /**
   * Constructs `InteractiveBridge` with specified `target: AbstractPlayerBridge` (i.e: `PlayerBridge`)
   * or with `window.parent` as target window and with specified `target: string` as origin.
   */
  constructor(
    target: AbstractPlayerBridge | string,
    options: {
      ownWindow?: Window;
    } = {},
  ) {
    let superParameters: [
      target?: LiveryBridge['target'],
      options?: {
        ownWindow?: Window;
      },
    ];
    if (typeof target === 'string') {
      const ownWindow = options.ownWindow || window;
      superParameters = [
        { window: ownWindow.parent, origin: target },
        { ownWindow },
      ];
    } else {
      superParameters = [target];
    }
    super(...superParameters);
  }

  /**
   * Returns promise of LiveryPlayer application name.
   */
  getAppName() {
    return this.sendCommand('getAppName').then((value) => {
      if (typeof value !== 'string') {
        throw new Error(
          `getAppName value type: ${typeof value}, should be: string`,
        );
      }
      return value;
    });
  }

  /**
   * Returns promise of LiveryPlayer customer id.
   */
  getCustomerId() {
    return this.sendCommand('getCustomerId').then((value) => {
      if (typeof value !== 'string') {
        throw new Error(
          `getCustomerId value type: ${typeof value}, should be: string`,
        );
      }
      return value;
    });
  }

  /**
   * Returns promise of LiveryPlayer Pinpoint analytics endpoint id.
   */
  getEndpointId() {
    return this.sendCommand('getEndpointId').then((value) => {
      if (typeof value !== 'string') {
        throw new Error(
          `getEndpointId value type: ${typeof value}, should be: string`,
        );
      }
      return value;
    });
  }

  /**
   * Returns a list of features supported by the LiveryPlayer.
   * The list will be sanitized such that each entry will be unique
   * and unrecognized entries will be disregarded.
   */
  getFeatures() {
    return this.video.getFeatures();
  }

  /**
   * Returns promise of current LiveryPlayer latency in seconds.
   */
  getLatency() {
    return this.sendCommand('getLatency').then((value) => {
      if (typeof value !== 'number') {
        throw new Error(
          `getLatency value type: ${typeof value}, should be: number`,
        );
      }
      return value;
    });
  }

  /**
   * Returns promise of an object of key-value string parameters from LiveryPlayer.
   *
   * Android and iOS players will call a callback and pass on the returned values.
   *
   * The web player will return all 'livery_' prefixed query parameters with:
   * - The prefix stripped from the names (snake_case will not be converted to camelCase)
   * - Parameter names and values URL decoded
   * - Empty string (not `null`) values for parameters without a value
   * - Only the first value of a repeated parameter (no multiple value array support)
   *
   * So given location.search: `'?foo&livery_foo%3Abar=hey+you&livery_no_val&livery_multi=1&livery_multi=2'`
   * this will return: `{ 'foo:bar': 'hey you', no_val: '', multi: '1' }`.
   */
  getLiveryParams(): Promise<Record<string, string>> {
    return this.sendCommand('getLiveryParams').then((value) => {
      if (typeof value !== 'object') {
        throw new Error(
          `getLiveryParams value type: ${typeof value}, should be: object`,
        );
      }
      if (value === null) {
        throw new Error(`getLiveryParams value type: null, should be: object`);
      }
      const dict: Record<string, string> = {};
      for (const [paramKey, paramValue] of Object.entries(value)) {
        if (typeof paramValue === 'string') {
          dict[paramKey] = paramValue;
        }
      }
      return dict;
    });
  }

  getPlayback() {
    return this.video.getPlayback();
  }

  /**
   * Returns promise of LiveryPlayer version.
   */
  getPlayerVersion() {
    return this.sendCommand('getPlayerVersion').then((value) => {
      if (typeof value !== 'string') {
        throw new Error(
          `getPlayerVersion value type: ${typeof value}, should be: string`,
        );
      }
      return value;
    });
  }

  /**
   * Returns promise of LiveryPlayer stream id.
   */
  getStreamId() {
    return this.sendCommand('getStreamId').then((value) => {
      if (typeof value !== 'string') {
        throw new Error(
          `getStreamId value type: ${typeof value}, should be: string`,
        );
      }
      return value;
    });
  }

  /**
   * Register `handler` function to be called with `arg` and `listener` when `sendCustomCommand()` is called on
   * other side with matching `name`.
   *
   * @deprecated Will be removed in the next major version. Use `registerPlayerCommand()` instead.
   */
  override registerCustomCommand(
    name: string,
    handler: (arg: unknown, listener: (value: unknown) => void) => unknown,
  ) {
    return super.registerCustomCommand(name, handler);
  }

  /**
   * Register `handler` function to be called with `arg` and `listener` when `sendInteractiveCommand()` is called
   * from the livery-player side with matching `name`.
   */
  registerInteractiveCommand(
    name: string,
    handler: (arg: unknown, listener: (value: unknown) => void) => unknown,
  ) {
    super.registerCustomCommand(name, handler);
  }

  /**
   * Returns promise of value returned by other side's custom command handler with matching `name` that is passed `arg`.
   * Any `handler` `listener` calls will subsequently also be bridged to this `listener` callback.
   *
   * @deprecated Will be removed in the next major version. Use `sendPlayerCommand()` instead.
   */
  override sendCustomCommand<T>(
    name: string,
    arg?: unknown,
    listener?: (value: T) => void,
  ) {
    return super.sendCustomCommand(name, arg, listener);
  }

  /**
   * Returns promise of value returned by the livery-player's custom command handler with matching `name` that is passed `arg`.
   * Any `handler` `listener` calls will subsequently also be bridged to this `listener` callback.
   */
  sendPlayerCommand<T>(
    name: string,
    arg?: unknown,
    listener?: (value: T) => void,
  ) {
    return super.sendCustomCommand(name, arg, listener);
  }

  /**
   *
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  submitUserFeedback(_feedback: {
    comments: string;
    email: string;
    name: string;
  }) {}

  /**
   * Returns promise of current LiveryPlayer fullscreen state
   * and calls back `listener` with any subsequent state changes.
   */
  subscribeFullscreen(listener: (value: boolean) => void) {
    return this.fullscreenSubscriber.subscribe(listener);
  }

  /**
   * Returns promise of current LiveryPlayer window orientation (`'landscape' \| 'portrait'`)
   * and calls back `listener` with any subsequent orientations.
   */
  subscribeOrientation(listener: (orientation: Orientation) => void) {
    return this.orientationSubscriber.subscribe(listener);
  }

  subscribeQualities(listener: (value: Quality[]) => void) {
    return this.video.subscribeQualities(listener);
  }

  /**
   * Returns promise of current LiveryPlayer playback quality
   * and calls back `listener` with any subsequent quality changes.
   */
  subscribeQuality(listener: (value: string) => void) {
    return this.qualitySubscriber.subscribe(listener);
  }

  /**
   * Returns promise of current LiveryPlayer stream phase (`'PRE' \| 'LIVE' \| 'POST'`)
   * and calls back `listener` with any subsequent phases.
   */
  subscribeStreamPhase(listener: (phase: StreamPhase) => void) {
    return this.streamPhaseSubscriber.subscribe(listener);
  }

  /**
   * Unregister custom command by name.
   *
   * @deprecated Will be removed in the next major version. Use `unregisterInteractiveCommand()` instead.
   */
  override unregisterCustomCommand(name: string) {
    super.unregisterCustomCommand(name);
  }

  /**
   * Unregister custom interactive command by name.
   */
  unregisterInteractiveCommand(name: string) {
    return super.unregisterCustomCommand(name);
  }
}
