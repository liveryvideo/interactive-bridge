import { SubscribeCommandHandler } from './util/SubscribeCommandHandler';

export class SubscribeUnmuteRequiresInteractionCommandHandler extends SubscribeCommandHandler<boolean> {
  constructor(initialValue: boolean) {
    super('subscribeUnmuteRequiresInteraction', initialValue);
  }
}
