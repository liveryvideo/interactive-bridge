/**
 * Bridge for communicating between a Livery Video Player and the interactive layer page shown within that.
 *
 * Exports:
 * - Class {@link InteractiveBridge} enables a Livery interactive layer element or page to communicate with
 *   the surrounding Livery Player
 * - Element: {@link LiveryBridgeLog} logs messages posted to specified bridge or the window
 * - Types: {@link Orientation}, {@link StreamPhase} are used throughout the package
 * - Variable: {@link version} specifies the version of this package
 * - Class {@link AbstractPlayerBridge} is used by LiveryPlayer for the `PlayerBridge` implementation
 *   (in the past: {@link LiveryBridge})
 * - Class {@link MockPlayerBridge} is a player bridge that returns mock data for testing
 * - Element {@link LiveryBridgeMock} mocks a LiveryPlayer with an interactive child element or iframe for testing
 * - Element {@link LiveryBridgeInteractive} is an interactive element that enables testing all interactive commands
 *
 * **Note:** If you are reading this at tsdocs.dev we recommend you to disable the `Inherited`
 * member visibility from `Settings` to make it easier to find our members.
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
  Config,
  Controls,
  DisplayMode,
  Features,
  Orientation,
  PlaybackDetails,
  PlaybackMode,
  PlaybackState,
  Qualities,
  StreamPhase,
  UserFeedback,
} from './src/util/schema';
