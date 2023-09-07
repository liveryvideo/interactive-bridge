import type { StreamPhase } from './InteractiveBridge/VideoCommands';
import { SubscribeCommandHandler } from './util/SubscribeCommandHandler';

export class SubscribeStreamPhaseCommandHandler extends SubscribeCommandHandler<StreamPhase> {
  constructor(initialValue: StreamPhase) {
    super('subscribeStreamPhase', initialValue);
  }
}
