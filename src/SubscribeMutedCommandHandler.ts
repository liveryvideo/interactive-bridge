import { SubscribeCommandHandler } from './util/SubscribeCommandHandler';

export class SubscribeMutedCommandHandler extends SubscribeCommandHandler<boolean> {
  constructor(initialValue: boolean) {
    super('subscribeMuted', initialValue);
  }
}
