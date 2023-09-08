import type { Controls } from './InteractiveBridge/ControlsSubscriber';
import { SubscribeCommandHandler } from './util/SubscribeCommandHandler';

export class SubscribeControlsCommandHandler extends SubscribeCommandHandler<Controls> {
  constructor(initialValue: Controls) {
    super('subscribeControls', initialValue);
  }
}
