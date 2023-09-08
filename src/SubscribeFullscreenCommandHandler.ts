import { SubscribeCommandHandler } from './util/SubscribeCommandHandler';

export class SubscribeFullscreenCommandHandler extends SubscribeCommandHandler<boolean> {
  constructor(initialValue: boolean) {
    super('subscribeFullscreen', initialValue);
  }
}
