import type { LiveryBridge } from '../LiveryBridge';
import { SubscriptionError } from './errors';

export abstract class Subscription<InType, OutType> {
  protected abstract command: string;

  protected abstract sendCommand: LiveryBridge['sendCommand'];

  subscribe(listener: (value: OutType) => void) {
    return this.sendCommand(this.command, undefined, (value: InType) =>
      listener(this.parse(value)),
    )
      .catch((error) => {
        throw new SubscriptionError(
          error instanceof Error
            ? error.message
            : `${this.command} failed for unknown reason.`,
        );
      })
      .then(this.parse.bind(this));
  }

  protected abstract parse(value: unknown): OutType;
}
