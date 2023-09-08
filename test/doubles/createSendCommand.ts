/* eslint-disable @typescript-eslint/require-await */
import type { SubscribeCommandHandler } from '../../src/util/SubscribeCommandHandler';

export function createSendCommand<T>(
  subscribeCommandHandler: SubscribeCommandHandler<T>,
) {
  const sendCommand = async (
    name: string,
    arg?: unknown,
    listener?: (value: T) => void,
  ) => {
    if (listener === undefined) {
      throw Error();
    }
    const result = subscribeCommandHandler.handleCommand(name, arg, listener);
    return result;
  };

  return sendCommand;
}
