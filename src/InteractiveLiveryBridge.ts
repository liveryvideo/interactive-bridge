import type { AbstractPlayerBridge } from './AbstractPlayerBridge';
import { LiveryBridge } from './LiveryBridge';

export class InteractiveLiveryBridge extends LiveryBridge {
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
   * Register `handler` function to be called with `arg` and `listener` when `sendInteractiveCommand()` is called
   * from the livery-player side with matching `name`.
   */
  registerInteractiveCommand(
    name: string,
    handler: (arg: unknown, listener: (value: unknown) => void) => unknown,
  ) {
    super.registerCustomCommand(name, handler);
  }

  override sendCommand<T>(
    name: string,
    arg?: unknown,
    listener?: ((value: T) => void) | undefined,
    custom?: boolean,
  ): Promise<T> {
    return super.sendCommand(name, arg, listener, custom);
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
   * Unregister custom interactive command by name.
   */
  unregisterInteractiveCommand(name: string) {
    return super.unregisterCustomCommand(name);
  }
}
