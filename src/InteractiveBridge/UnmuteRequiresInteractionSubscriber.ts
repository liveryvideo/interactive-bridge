// eslint-disable-next-line max-classes-per-file
import type { SendCommand } from '../types';
import { StrategicSubscriber } from '../util/Subscriber';
import { UnmuteRequiresInteractionParser } from './UnmuteRequiresInteractionParser';

export class UnmuteRequiresInteractionSubscriber extends StrategicSubscriber<
  boolean,
  boolean
> {
  constructor(sendCommand: SendCommand<boolean>) {
    super(
      'subscribeUnmuteRequiresInteraction',
      new UnmuteRequiresInteractionParser(),
      sendCommand,
    );
  }
}
