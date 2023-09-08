import type { Orientation } from './InteractiveBridge';
import { SubscribeCommandHandler } from './util/SubscribeCommandHandler';

export class SubscribeOrientationCommandHandler extends SubscribeCommandHandler<Orientation> {
  constructor(initialValue: Orientation) {
    super('subscribeOrientation', initialValue);
  }
}
