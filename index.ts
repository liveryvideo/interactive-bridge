/**
 * Bridge for communicating between a Livery Video Player and the interactive layer page shown within that.
 *
 * Exports:
 *
 * - Class {@link InteractiveBridge} enables a Livery interactive layer element or page to communicate with
 *   the surrounding Livery Player
 * - Class {@link AbstractPlayerBridge} is used by LiveryPlayer for the `PlayerBridge` implementation
 *   (in the past: {@link LiveryBridge})
 * - Class {@link MockPlayerBridge} is a player bridge that returns mock data for testing
 * - Element {@link LiveryBridgeLog} logs messages posted to specified bridge or the window
 * - Element {@link LiveryBridgeMock} mocks a LiveryPlayer with an interactive child element or iframe for testing
 * - Element {@link LiveryBridgeInteractive} is an interactive element that enables testing all interactive commands
 * - Variable {@link version} specifies the version of this package
 * - Schema types:
 *   {@link AuthClaims}, {@link Config}, {@link DisplayMode}, {@link Features}, {@link InteractivePlayerOptions},
 *   {@link Orientation}, {@link PlaybackDetails}, {@link PlaybackMode}, {@link PlaybackState}, {@link Qualities},
 *   {@link Quality}, {@link StreamPhase}, {@link UserFeedback} and {@link Volume}.
 *
 * **Note:** When using the UMD bundle, the exports can be found as properties of `livery` in the global namespace,
 * e.g: `livery.version`.
 *
 * @packageDocumentation
 */

/**
 * Livery Interactive SDK version.
 */
export const version = __VERSION__;

export { AbstractPlayerBridge } from './src/AbstractPlayerBridge';
export { InteractiveBridge } from './src/InteractiveBridge';
export { LiveryBridge } from './src/LiveryBridge';
export { MockPlayerBridge } from './src/MockPlayerBridge';
export { LiveryBridgeInteractive } from './src/livery-bridge-interactive/LiveryBridgeInteractive';
export { LiveryBridgeLog } from './src/livery-bridge-log/LiveryBridgeLog';
export { LiveryBridgeMock } from './src/livery-bridge-mock/LiveryBridgeMock';
export type {
  AuthClaims,
  Config,
  DisplayMode,
  Features,
  InteractivePlayerOptions,
  Orientation,
  PlaybackDetails,
  PlaybackMode,
  PlaybackState,
  Qualities,
  Quality,
  StreamPhase,
  UserFeedback,
  Volume,
} from './src/util/schema';
