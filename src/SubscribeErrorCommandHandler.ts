import { SubscribeCommandHandler } from './util/SubscribeCommandHandler';

export class SubscribeErrorCommandHandler extends SubscribeCommandHandler<
  string | undefined
> {
  constructor(initialValue: string | undefined) {
    super('subscribeError', initialValue);
  }
}
