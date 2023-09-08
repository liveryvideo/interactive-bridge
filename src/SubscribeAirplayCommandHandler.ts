import { SubscribeCommandHandler } from './util/SubscribeCommandHandler';

export class SubscribeAirplayCommandHandler extends SubscribeCommandHandler<boolean> {
  constructor(initialValue: boolean) {
    super('subscribeAirplay', initialValue);
  }
}
