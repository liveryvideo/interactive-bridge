import { SubscribeCommandHandler } from './util/SubscribeCommandHandler';

export class SubscribeQualityCommandHandler extends SubscribeCommandHandler<string> {
  constructor(initialValue: string) {
    super('subscribeQuality', initialValue);
  }
}
