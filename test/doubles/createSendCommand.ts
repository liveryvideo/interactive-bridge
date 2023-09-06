/* eslint-disable @typescript-eslint/require-await */
import type { SubscribeCommandHandler } from '../../src/util/SubscribeCommandHandler';
import { SubscriptionError } from '../../src/util/errors';

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
    if (result === undefined) {
      throw new SubscriptionError(`Could not subscribe with command '${name}'`);
    }
    return result;
  };

  return sendCommand;
}
