import { SubscribeCommandHandler } from './util/SubscribeCommandHandler';

export class SubscribeChromecastCommandHandler extends SubscribeCommandHandler<
  string | undefined
> {
  constructor(initialValue: string | undefined) {
    super('subscribeChromecast', initialValue);
  }
}
