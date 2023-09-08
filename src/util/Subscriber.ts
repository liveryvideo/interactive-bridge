// eslint-disable-next-line max-classes-per-file
import type { SendCommand } from '../types';
import type { Parser } from './Parser';
import { SubscriptionError } from './errors';

/**
 * Subscribe commands:
 * On sending the command a Promise is created that will resolve or reject when a response is received
 * The resolution of a subscribe command indicates the completion of two actions:
 * - The listener sent as an argument to the subscribe command has been registered
 * - The current state of the data structure to which the listener subscribes has been retrieved and is being passed in the resolution to the Promise.
 *
 * Whenever the data structure subscribed to changes, the listener will be called synchronously, and the new state of the data structure will be passed in.
 *
 * There is no inverse command (i.e. there is no 'unsubscribe' command)
 *
 * Listeners should throw if the passed data is invalid. This is usually handled by decorating the listener
 * with a validate function. E.g.:
 * ```
 * subscribeExample( listener: (str: String) => void ) {
 *  const validatingListener = (possStr: unknown) => {
 *    // throw if not valid
 *    if (typeof possStr !== 'string') { throw Error() }
 *    // invoke original function, with definitely valid data
 *    return listener(possStr)
 *  }
 *  // ask the other side to invoke the validatingListener
 *  return this.sendCommand('subscribeExample', undefined, validatingListener);
 * }
 * ```
 *
 * Within validation, when the type of the object returned is not valid, the listener should throw
 * If the data structure is a collection and the type of any optional member is not valid, that member
 * should be fixed if possible and purged if not.
 */

export class Subscriber<InType, OutType> {
  protected command: string;

  protected parser: Parser<OutType>;

  protected sendCommand: SendCommand<InType>;

  constructor(
    commandName: string,
    parser: Parser<OutType>,
    sendCommand: SendCommand<InType>,
  ) {
    this.sendCommand = sendCommand;
    this.command = commandName;
    this.parser = parser;
  }

  subscribe(listener: (value: OutType) => void) {
    return this.sendCommand(this.command, undefined, (value: InType) =>
      listener(this.parser.parse(value)),
    )
      .catch((error) => {
        throw new SubscriptionError(
          error instanceof Error
            ? error.message
            : `${this.command} failed for unknown reason.`,
        );
      })
      .then((value) => this.parser.parse(value));
  }
}
