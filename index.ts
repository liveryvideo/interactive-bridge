/**
 * Bridge for communicating between a Livery Video Player and the interactive layer page shown within that.
 *
 * @remarks
 * The main part of this package you are likely to use is the {@link InteractiveBridge} class.
 * For debugging you can also use the {@link LiveryBridgeLog}, {@link LiveryBridgeMock} and
 * {@link LiveryBridgeInteractive} elements.
 * There is also the {@link version} variable.
 * And the helper classes used to implement these and the web player:
 * {@link AbstractPlayerBridge}, {@link LiveryBridge} and {@link MockPlayerBridge}.
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
export type { Orientation, StreamPhase } from './src/InteractiveBridge';
export { LiveryBridge } from './src/LiveryBridge';
export { MockPlayerBridge } from './src/MockPlayerBridge';
export { LiveryBridgeInteractive } from './src/livery-bridge-interactive/LiveryBridgeInteractive';
export { LiveryBridgeLog } from './src/livery-bridge-log/LiveryBridgeLog';
export { LiveryBridgeMock } from './src/livery-bridge-mock/LiveryBridgeMock';
